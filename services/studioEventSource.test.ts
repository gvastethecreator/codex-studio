import { describe, expect, it, vi } from 'vite-plus/test';
import type { Job } from '../packages/shared/src';
import {
  JobWatchCancelledError,
  JobWatchTimeoutError,
  createJobTerminalStatusError,
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

describe('studioEventSource', () => {
  it('normalizes reconnect policy bounds', () => {
    expect(normalizeStudioEventReconnectPolicy({ initialDelayMs: 0, maxDelayMs: 50 })).toEqual({
      initialDelayMs: 100,
      maxDelayMs: 100,
    });
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
      createJob({ id: 'job-1', status: 'completed' }),
    ]);
    const stream = {
      onJobUpdate: () => () => {},
      onAssetAdded: () => () => {},
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
