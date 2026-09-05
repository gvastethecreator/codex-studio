import { describe, expect, it, vi } from 'vite-plus/test';
import type { Job } from '../packages/shared/src';
import {
  JobWatchCancelledError,
  JobWatchTimeoutError,
  JobNeedsReviewError,
  JobObservationError,
  type StudioEventStream,
  createJobTerminalStatusError,
  createStudioEventStream,
  isTerminalStudioJobStatus,
  normalizeStudioEventReconnectPolicy,
  watchJob,
} from './studioEventSource';

vi.mock('./studio-api/http', () => ({
  getStudioApiBase: () => 'http://127.0.0.1:4317',
}));

vi.mock('./studio-api/jobs', () => ({
  getStudioJobStatus: vi.fn(async (id: string) => ({
    id,
    status: 'running',
    error: null,
    updatedAt: '2026-05-31T00:00:00.000Z',
  })),
}));

const { getStudioJobStatus } = await import('./studio-api/jobs');

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: overrides.id ?? 'job-1',
    workspaceId: overrides.workspaceId ?? 'default',
    kind: overrides.kind ?? 'image_generate',
    providerId: overrides.providerId ?? 'codex',
    sourceSpec: overrides.sourceSpec ?? null,
    status: overrides.status ?? 'queued',
    execution: overrides.execution ?? null,
    originalPrompt: overrides.originalPrompt ?? 'prompt',
    expandedPrompt: overrides.expandedPrompt ?? null,
    finalPromptUsed: overrides.finalPromptUsed ?? 'prompt',
    error: overrides.error ?? null,
    createdAt: overrides.createdAt ?? '2026-05-31T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-05-31T00:00:00.000Z',
    completedAt: overrides.completedAt ?? null,
  };
}

function createWatchStream() {
  const jobs = new Set<(job: Job) => void>();
  const connections = new Set<(connected: boolean) => void>();
  const gaps = new Set<() => void>();
  const stream: StudioEventStream = {
    onJobUpdate: (_id, listener) => {
      jobs.add(listener);
      return () => {
        jobs.delete(listener);
      };
    },
    onConnectionChange: (listener) => {
      connections.add(listener);
      return () => {
        connections.delete(listener);
      };
    },
    onRevisionGap: (listener) => {
      gaps.add(listener);
      return () => {
        gaps.delete(listener);
      };
    },
    onAssetAdded: () => () => {},
    onCatalogChanged: () => () => {},
    onLogAdded: () => () => {},
    onOnboardingStage: () => () => {},
    onOnboardingProbe: () => () => {},
    onAuthUpdated: () => () => {},
    close: () => {},
  };
  return { stream, jobs, connections, gaps };
}

describe('studioEventSource', () => {
  it('keeps long-running jobs alive and reconciles a missed completion once for shared observers', async () => {
    vi.useFakeTimers();
    const { stream, jobs, connections, gaps } = createWatchStream();
    const cancelled = new AbortController();
    const first = watchJob(stream, 'long-job', cancelled.signal);
    const firstResult = expect(first).rejects.toBeInstanceOf(JobWatchCancelledError);
    const second = watchJob(stream, 'long-job');
    let completed = false;
    void second.then(() => {
      completed = true;
    });
    try {
      await vi.advanceTimersByTimeAsync(300_000);
      expect(completed).toBe(false);
      expect(jobs.size).toBe(1);
      cancelled.abort();
      await firstResult;
      expect(jobs.size).toBe(1);
      const snapshot = Promise.withResolvers<Job>();
      vi.mocked(getStudioJobStatus).mockClear().mockReturnValueOnce(snapshot.promise);
      connections.forEach((listener) => listener(true));
      gaps.forEach((listener) => listener());
      expect(getStudioJobStatus).toHaveBeenCalledTimes(1);
      snapshot.resolve(createJob({ id: 'long-job', status: 'completed' }));
      await expect(second).resolves.toMatchObject({ id: 'long-job', status: 'completed' });
      expect(jobs.size + connections.size + gaps.size).toBe(0);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores a stale snapshot received after a newer event', async () => {
    vi.useFakeTimers();
    const snapshot = Promise.withResolvers<Job>();
    vi.mocked(getStudioJobStatus).mockReturnValueOnce(snapshot.promise);
    const { stream, jobs } = createWatchStream();
    let completed = false;
    const waiting = watchJob(stream, 'stale-job').then((job) => {
      completed = true;
      return job;
    });
    try {
      jobs.forEach((listener) => listener(createJob({ id: 'stale-job', status: 'running' })));
      snapshot.resolve(createJob({ id: 'stale-job', status: 'completed' }));
      await vi.advanceTimersByTimeAsync(0);
      expect(completed).toBe(false);
      vi.mocked(getStudioJobStatus).mockResolvedValueOnce(
        createJob({ id: 'stale-job', status: 'completed' }),
      );
      await vi.advanceTimersByTimeAsync(30_000);
      await expect(waiting).resolves.toMatchObject({ status: 'completed' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores an old terminal event delivered after a newer running snapshot', async () => {
    vi.useFakeTimers();
    const { stream, jobs } = createWatchStream();
    vi.mocked(getStudioJobStatus).mockResolvedValueOnce(
      createJob({ id: 'recovered-job', status: 'running', updatedAt: '2026-06-01T00:00:00.000Z' }),
    );
    let completed = false;
    const waiting = watchJob(stream, 'recovered-job').then((job) => {
      completed = true;
      return job;
    });
    try {
      await vi.advanceTimersByTimeAsync(0);
      jobs.forEach((listener) =>
        listener(createJob({ id: 'recovered-job', status: 'needs_review' })),
      );
      expect(completed).toBe(false);
      expect(jobs.size).toBe(1);
      jobs.forEach((listener) =>
        listener(
          createJob({
            id: 'recovered-job',
            status: 'completed',
            updatedAt: '2026-06-01T00:00:01.000Z',
          }),
        ),
      );
      await expect(waiting).resolves.toMatchObject({ status: 'completed' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('reconciles an old terminal event received before the initial snapshot', async () => {
    vi.useFakeTimers();
    const { stream, jobs } = createWatchStream();
    const snapshot = Promise.withResolvers<Job>();
    vi.mocked(getStudioJobStatus).mockReturnValueOnce(snapshot.promise);
    const waiting = watchJob(stream, 'attachment-job');
    try {
      jobs.forEach((listener) =>
        listener(createJob({ id: 'attachment-job', status: 'needs_review' })),
      );
      snapshot.resolve(
        createJob({
          id: 'attachment-job',
          status: 'running',
          updatedAt: '2026-06-01T00:00:00.000Z',
        }),
      );
      await vi.advanceTimersByTimeAsync(0);
      expect(jobs.size).toBe(1);
      jobs.forEach((listener) =>
        listener(
          createJob({
            id: 'attachment-job',
            status: 'completed',
            updatedAt: '2026-06-01T00:00:01.000Z',
          }),
        ),
      );
      await expect(waiting).resolves.toMatchObject({ status: 'completed' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('reports provider review separately from completed and stops retrying unavailable observation', async () => {
    const review = createWatchStream();
    vi.mocked(getStudioJobStatus).mockResolvedValueOnce(
      createJob({ id: 'review-job', status: 'needs_review' }),
    );
    await expect(watchJob(review.stream, 'review-job')).rejects.toBeInstanceOf(JobNeedsReviewError);
    expect(review.jobs.size + review.connections.size + review.gaps.size).toBe(0);
    vi.useFakeTimers();
    const offline = createWatchStream();
    for (let i = 0; i < 5; i++)
      vi.mocked(getStudioJobStatus).mockRejectedValueOnce(new Error('offline'));
    const failure = expect(watchJob(offline.stream, 'offline-job')).rejects.toBeInstanceOf(
      JobObservationError,
    );
    try {
      await vi.advanceTimersByTimeAsync(16_000);
      await failure;
      expect(offline.jobs.size + offline.connections.size + offline.gaps.size).toBe(0);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('normalizes reconnect policy bounds', () => {
    expect(normalizeStudioEventReconnectPolicy({ initialDelayMs: 0, maxDelayMs: 50 })).toEqual({
      initialDelayMs: 100,
      maxDelayMs: 100,
    });
  });

  it('shares one browser EventSource until all leases close', () => {
    const previousEventSource = globalThis.EventSource;
    const sources: Array<{ close: ReturnType<typeof vi.fn>; url: string }> = [];

    class FakeEventSource {
      static OPEN = 1;
      close = vi.fn();
      onopen: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;
      readyState = FakeEventSource.OPEN;

      constructor(public readonly url: string) {
        sources.push(this);
      }
    }

    Object.defineProperty(globalThis, 'EventSource', {
      configurable: true,
      value: FakeEventSource,
    });

    try {
      const first = createStudioEventStream();
      const second = createStudioEventStream();

      expect(sources).toHaveLength(1);
      expect(sources[0]?.url).toBe('http://127.0.0.1:4317/api/events');

      first.close();
      expect(sources[0]?.close).not.toHaveBeenCalled();

      second.close();
      expect(sources[0]?.close).toHaveBeenCalledTimes(1);

      const third = createStudioEventStream();
      expect(sources).toHaveLength(2);
      third.close();
      expect(sources[1]?.close).toHaveBeenCalledTimes(1);
    } finally {
      if (previousEventSource) {
        Object.defineProperty(globalThis, 'EventSource', {
          configurable: true,
          value: previousEventSource,
        });
      } else {
        Reflect.deleteProperty(globalThis, 'EventSource');
      }
    }
  });

  it('accepts new events after a backend revision reset', () => {
    const previousEventSource = globalThis.EventSource;
    const sources: Array<{
      close: ReturnType<typeof vi.fn>;
      onopen: (() => void) | null;
      onmessage: ((event: MessageEvent) => void) | null;
    }> = [];

    class FakeEventSource {
      static OPEN = 1;
      close = vi.fn();
      onopen: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;
      readyState = FakeEventSource.OPEN;

      constructor() {
        sources.push(this);
      }
    }

    Object.defineProperty(globalThis, 'EventSource', {
      configurable: true,
      value: FakeEventSource,
    });

    try {
      const stream = createStudioEventStream();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      stream.onJobUpdate('*', () => {
        throw new Error('Broken consumer');
      });
      const seen: string[] = [];
      let reconciliationCount = 0;
      stream.onJobUpdate('*', (job) => seen.push(job.id));
      stream.onRevisionGap?.(() => {
        reconciliationCount += 1;
      });
      const send = (event: unknown) =>
        sources[0]?.onmessage?.({ data: JSON.stringify(event) } as MessageEvent);

      send({
        type: 'server.connected',
        payload: { ok: true, revision: 50, reconciled: true },
        revision: 50,
        createdAt: '2026-07-10T00:00:00.000Z',
      });
      send({
        type: 'job.progress',
        payload: createJob({ id: 'before-restart' }),
        revision: 51,
        createdAt: '2026-07-10T00:00:01.000Z',
      });
      send({
        type: 'server.connected',
        payload: { ok: true, revision: 0, reconciled: false },
        revision: 0,
        createdAt: '2026-07-10T00:00:02.000Z',
      });
      send({
        type: 'job.progress',
        payload: createJob({ id: 'after-restart' }),
        revision: 1,
        createdAt: '2026-07-10T00:00:03.000Z',
      });

      expect(seen).toEqual(['before-restart', 'after-restart']);
      expect(reconciliationCount).toBe(1);
      expect(consoleError).toHaveBeenCalledTimes(2);
      consoleError.mockRestore();
      stream.close();
    } finally {
      if (previousEventSource) {
        Object.defineProperty(globalThis, 'EventSource', {
          configurable: true,
          value: previousEventSource,
        });
      } else {
        Reflect.deleteProperty(globalThis, 'EventSource');
      }
    }
  });

  it('dispatches catalog events through the shared stream', () => {
    const previousEventSource = globalThis.EventSource;
    const sources: Array<{
      close: ReturnType<typeof vi.fn>;
      onopen: (() => void) | null;
      onmessage: ((event: MessageEvent) => void) | null;
    }> = [];

    class FakeEventSource {
      static OPEN = 1;
      close = vi.fn();
      onopen: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;
      readyState = FakeEventSource.OPEN;

      constructor() {
        sources.push(this);
      }
    }

    Object.defineProperty(globalThis, 'EventSource', {
      configurable: true,
      value: FakeEventSource,
    });

    try {
      const stream = createStudioEventStream();
      const seen: string[] = [];
      const connections: boolean[] = [];
      stream.onConnectionChange((connected) => connections.push(connected));
      expect(connections).toEqual([]);
      sources[0]?.onopen?.();
      expect(connections).toEqual([true]);
      stream.onCatalogChanged((event) =>
        seen.push(
          event.type === 'catalog.batch_changed'
            ? `${event.type}:${event.batch.changedCount}`
            : `${event.type}:${event.image.id}`,
        ),
      );
      for (const type of ['catalog.created', 'catalog.updated', 'catalog.deleted']) {
        sources[0]?.onmessage?.({
          data: JSON.stringify({
            type,
            payload: { id: type },
            createdAt: '2026-06-21T00:00:00.000Z',
          }),
        } as MessageEvent);
      }
      sources[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'catalog.batch_changed',
          payload: { action: 'archive', changedCount: 200, scope: { kind: 'selection' } },
          createdAt: '2026-06-21T00:00:00.000Z',
        }),
      } as MessageEvent);

      expect(seen).toEqual([
        'catalog.created:catalog.created',
        'catalog.updated:catalog.updated',
        'catalog.deleted:catalog.deleted',
        'catalog.batch_changed:200',
      ]);
      stream.close();
    } finally {
      if (previousEventSource) {
        Object.defineProperty(globalThis, 'EventSource', {
          configurable: true,
          value: previousEventSource,
        });
      } else {
        Reflect.deleteProperty(globalThis, 'EventSource');
      }
    }
  });

  it('ignores empty job event payloads', () => {
    const previousEventSource = globalThis.EventSource;
    const sources: Array<{
      close: ReturnType<typeof vi.fn>;
      onmessage: ((event: MessageEvent) => void) | null;
    }> = [];

    class FakeEventSource {
      static OPEN = 1;
      close = vi.fn();
      onopen: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;
      readyState = FakeEventSource.OPEN;

      constructor() {
        sources.push(this);
      }
    }

    Object.defineProperty(globalThis, 'EventSource', {
      configurable: true,
      value: FakeEventSource,
    });

    try {
      const stream = createStudioEventStream();
      const seen: string[] = [];
      stream.onJobUpdate('*', (job) => seen.push(job.id));
      sources[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'job.completed',
          payload: null,
          createdAt: '2026-06-21T00:00:00.000Z',
        }),
      } as MessageEvent);

      expect(seen).toEqual([]);
      stream.close();
    } finally {
      if (previousEventSource) {
        Object.defineProperty(globalThis, 'EventSource', {
          configurable: true,
          value: previousEventSource,
        });
      } else {
        Reflect.deleteProperty(globalThis, 'EventSource');
      }
    }
  });

  it('dispatches onboarding stage, probe, and onboarding-scoped logs', () => {
    const previousEventSource = globalThis.EventSource;
    const sources: Array<{
      onmessage: ((event: MessageEvent) => void) | null;
    }> = [];

    class FakeEventSource {
      static OPEN = 1;
      close = vi.fn();
      onopen: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;
      readyState = FakeEventSource.OPEN;
      constructor() {
        sources.push(this);
      }
    }

    Object.defineProperty(globalThis, 'EventSource', {
      configurable: true,
      value: FakeEventSource,
    });

    try {
      const stream = createStudioEventStream();
      const stages: string[] = [];
      const ctas: string[] = [];
      const logs: string[] = [];
      stream.onOnboardingStage((payload) => stages.push(payload.stage));
      stream.onOnboardingProbe((probe) => ctas.push(probe.primaryCta));
      stream.onLogAdded((entry) => logs.push(`${entry.scope}:${entry.message}`));
      const authUpdates: string[] = [];
      stream.onAuthUpdated((payload) =>
        authUpdates.push(`${payload.providerId}:${payload.status}`),
      );
      const send = (event: unknown) =>
        sources[0]?.onmessage?.({ data: JSON.stringify(event) } as MessageEvent);

      send({
        type: 'onboarding.stage',
        payload: {
          action: 'setup',
          stage: 'write_bootstrap',
          message: 'Writing Bootstrap Configuration.',
        },
        revision: 1,
        createdAt: '2026-08-26T00:00:00.000Z',
      });
      send({
        type: 'log.created',
        payload: {
          id: 0,
          level: 'info',
          scope: 'onboarding',
          message: 'Wrote STUDIO_LIBRARY_DIR into .env.local.',
          jobId: null,
          createdAt: '2026-08-26T00:00:01.000Z',
        },
        revision: 2,
        createdAt: '2026-08-26T00:00:01.000Z',
      });
      send({
        type: 'onboarding.probe',
        payload: {
          primaryCta: 'start_app_server',
          checks: [],
          facts: {},
          studioLibraryPath: 'D:/lib',
          grok: {},
        },
        revision: 3,
        createdAt: '2026-08-26T00:00:02.000Z',
      });

      send({
        type: 'auth.updated',
        payload: { providerId: 'codex', status: 'logged_in', accountLabel: 'user@example.com' },
        revision: 4,
        createdAt: '2026-08-26T00:00:03.000Z',
      });

      expect(stages).toEqual(['write_bootstrap']);
      expect(logs).toEqual(['onboarding:Wrote STUDIO_LIBRARY_DIR into .env.local.']);
      expect(ctas).toEqual(['start_app_server']);
      expect(authUpdates).toEqual(['codex:logged_in']);
      expect(JSON.stringify(authUpdates)).not.toMatch(/accessToken|refreshToken/);
      stream.close();
    } finally {
      if (previousEventSource) {
        Object.defineProperty(globalThis, 'EventSource', {
          configurable: true,
          value: previousEventSource,
        });
      } else {
        Reflect.deleteProperty(globalThis, 'EventSource');
      }
    }
  });

  it('identifies terminal job statuses', () => {
    expect(isTerminalStudioJobStatus('completed')).toBe(true);
    expect(isTerminalStudioJobStatus('failed')).toBe(true);
    expect(isTerminalStudioJobStatus('cancelled')).toBe(true);
    expect(isTerminalStudioJobStatus('needs_review')).toBe(true);
    expect(isTerminalStudioJobStatus('running')).toBe(false);
  });

  it('creates typed terminal status errors', () => {
    const cancelled = createJobTerminalStatusError(createJob({ status: 'cancelled' }));
    expect(cancelled).toBeInstanceOf(JobWatchCancelledError);
    expect(cancelled.message).toBe('Operation cancelled by user');

    const failed = createJobTerminalStatusError(
      createJob({ status: 'failed', error: 'provider failure' }),
    );
    expect(failed.message).toBe('provider failure');
  });

  it('returns already-terminal completed job from initial snapshot', async () => {
    const completed = createJob({ id: 'job-1', status: 'completed' });
    vi.mocked(getStudioJobStatus).mockResolvedValueOnce(completed);
    const stream = {
      onJobUpdate: () => () => {},
      onAssetAdded: () => () => {},
      onCatalogChanged: () => () => {},
      onLogAdded: () => () => {},
      onOnboardingStage: () => () => {},
      onOnboardingProbe: () => () => {},
      onAuthUpdated: () => () => {},
      onConnectionChange: () => () => {},
      close: () => {},
    };

    await expect(watchJob(stream, 'job-1')).resolves.toMatchObject({ status: 'completed' });
  });

  it('rejects on timeout when job never reaches terminal status', async () => {
    const stream = {
      onJobUpdate: () => () => {},
      onAssetAdded: () => () => {},
      onCatalogChanged: () => () => {},
      onLogAdded: () => () => {},
      onOnboardingStage: () => () => {},
      onOnboardingProbe: () => () => {},
      onAuthUpdated: () => () => {},
      onConnectionChange: () => () => {},
      close: () => {},
    };

    await expect(watchJob(stream, 'job-timeout', undefined, 20)).rejects.toBeInstanceOf(
      JobWatchTimeoutError,
    );
  });

  it('rejects with AbortError when signal aborts while watching', async () => {
    let emit: ((job: Job) => void) | null = null;
    const stream = {
      onJobUpdate: (_jobId: string, callback: (job: Job) => void) => {
        emit = callback;
        return () => {
          emit = null;
        };
      },
      onAssetAdded: () => () => {},
      onCatalogChanged: () => () => {},
      onLogAdded: () => () => {},
      onOnboardingStage: () => () => {},
      onOnboardingProbe: () => () => {},
      onAuthUpdated: () => () => {},
      onConnectionChange: () => () => {},
      close: () => {},
    };

    const controller = new AbortController();
    const waiting = watchJob(stream, 'job-abort', controller.signal, 5000);
    await Promise.resolve();
    controller.abort();

    await expect(waiting).rejects.toBeInstanceOf(JobWatchCancelledError);
    expect(emit).toBeNull();
  });

  it('resolves when watcher receives terminal completed update', async () => {
    let emit: ((job: Job) => void) | null = null;
    const stream = {
      onJobUpdate: (_jobId: string, callback: (job: Job) => void) => {
        emit = callback;
        return () => {
          emit = null;
        };
      },
      onAssetAdded: () => () => {},
      onCatalogChanged: () => () => {},
      onLogAdded: () => () => {},
      onOnboardingStage: () => () => {},
      onOnboardingProbe: () => () => {},
      onAuthUpdated: () => () => {},
      onConnectionChange: () => () => {},
      close: () => {},
    };

    const waiting = watchJob(stream, 'job-complete', undefined, 5000);
    await Promise.resolve();
    const emitCallback = emit;
    if (!emitCallback) {
      throw new Error('Expected watchJob to register onJobUpdate callback');
    }
    (emitCallback as (job: Job) => void)(createJob({ id: 'job-complete', status: 'completed' }));

    await expect(waiting).resolves.toMatchObject({ id: 'job-complete', status: 'completed' });
  });

  it('does not miss terminal updates emitted while the initial snapshot is loading', async () => {
    let emit: ((job: Job) => void) | null = null;
    vi.mocked(getStudioJobStatus).mockImplementationOnce(async () => {
      const emitCallback = emit;
      if (!emitCallback) {
        throw new Error('Expected watchJob to subscribe before loading the initial snapshot');
      }
      emitCallback(createJob({ id: 'job-race', status: 'completed' }));
      return createJob({ id: 'job-race', status: 'completed' });
    });
    const stream = {
      onJobUpdate: (_jobId: string, callback: (job: Job) => void) => {
        emit = callback;
        return () => {
          emit = null;
        };
      },
      onAssetAdded: () => () => {},
      onCatalogChanged: () => () => {},
      onLogAdded: () => () => {},
      onOnboardingStage: () => () => {},
      onOnboardingProbe: () => () => {},
      onAuthUpdated: () => () => {},
      onConnectionChange: () => () => {},
      close: () => {},
    };

    await expect(watchJob(stream, 'job-race', undefined, 5000)).resolves.toMatchObject({
      id: 'job-race',
      status: 'completed',
    });
    expect(emit).toBeNull();
  });
});
