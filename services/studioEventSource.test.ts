import { describe, expect, it, vi } from 'vite-plus/test';
import type { Job, JobSummary } from '../packages/shared/src';
import {
  JobWatchCancelledError,
  JobWatchTimeoutError,
  createJobTerminalStatusError,
  createStudioEventStream,
  isTerminalStudioJobStatus,
  normalizeStudioEventReconnectPolicy,
  watchJob,
} from './studioEventSource';

vi.mock('./localStudioService', () => ({
  getStudioApiBase: () => 'http://127.0.0.1:4317',
  listStudioJobs: vi.fn(async () => []),
}));

const { listStudioJobs } = await import('./localStudioService');

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: overrides.id ?? 'job-1',
    projectId: overrides.projectId ?? 'project-1',
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

function createJobSummary(overrides: Partial<Job> = {}): JobSummary {
  const job = createJob(overrides);
  return {
    ...job,
    sourceSpec: null,
    promptPreview: job.finalPromptUsed || job.originalPrompt,
  };
}

describe('studioEventSource', () => {
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

  it('dispatches catalog events through the shared stream', () => {
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
      stream.onCatalogChanged((image) => seen.push(image.id));
      for (const type of ['catalog.created', 'catalog.updated', 'catalog.deleted']) {
        sources[0]?.onmessage?.({
          data: JSON.stringify({
            type,
            payload: { id: type },
            createdAt: '2026-06-21T00:00:00.000Z',
          }),
        } as MessageEvent);
      }

      expect(seen).toEqual(['catalog.created', 'catalog.updated', 'catalog.deleted']);
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
    vi.mocked(listStudioJobs).mockResolvedValueOnce([
      createJobSummary({ id: 'job-1', status: 'completed' }),
    ]);
    const stream = {
      onJobUpdate: () => () => {},
      onAssetAdded: () => () => {},
      onCatalogChanged: () => () => {},
      onLogAdded: () => () => {},
      onConnectionChange: () => () => {},
      close: () => {},
    };

    await expect(watchJob(stream, 'job-1')).resolves.toMatchObject({ status: 'completed' });
  });

  it('rejects on timeout when job never reaches terminal status', async () => {
    vi.mocked(listStudioJobs).mockResolvedValueOnce([]);
    const stream = {
      onJobUpdate: () => () => {},
      onAssetAdded: () => () => {},
      onCatalogChanged: () => () => {},
      onLogAdded: () => () => {},
      onConnectionChange: () => () => {},
      close: () => {},
    };

    await expect(watchJob(stream, 'job-timeout', undefined, 20)).rejects.toBeInstanceOf(
      JobWatchTimeoutError,
    );
  });

  it('rejects with AbortError when signal aborts while watching', async () => {
    vi.mocked(listStudioJobs).mockResolvedValueOnce([]);
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
    vi.mocked(listStudioJobs).mockResolvedValueOnce([]);
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
    vi.mocked(listStudioJobs).mockImplementationOnce(async () => {
      const emitCallback = emit;
      if (!emitCallback) {
        throw new Error('Expected watchJob to subscribe before loading the initial snapshot');
      }
      emitCallback(createJob({ id: 'job-race', status: 'completed' }));
      return [];
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
