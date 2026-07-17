import { describe, expect, it, vi } from 'vite-plus/test';

import type { Job } from '../../../packages/shared/src';
import type { GenerationProvider } from './providers/types';

vi.mock('./catalog', () => ({
  getCatalogImageByJobId: vi.fn(() => null),
  registerCatalogImage: vi.fn(() => null),
}));

vi.mock('./db', () => ({
  addAsset: vi.fn(() => null),
  addJobEvent: vi.fn(),
  getAssetByJobId: vi.fn(() => null),
  getJob: vi.fn(() => null),
  getSettingValue: vi.fn(() => null),
  setSettingValue: vi.fn(),
  updateJobFinalization: vi.fn(() => null),
  updateJobStatus: vi.fn(() => null),
  upsertCodexTurn: vi.fn(() => 'turn-record-default'),
}));

import { createWorkerController } from './worker';

function createJob(id: string): Job {
  return {
    id,
    projectId: 'project-1',
    kind: 'image_generate',
    providerId: null,
    sourceSpec: null,
    status: 'queued',
    execution: null,
    originalPrompt: 'prompt',
    expandedPrompt: null,
    finalPromptUsed: 'prompt',
    error: null,
    createdAt: '2026-07-14T00:00:00.000Z',
    updatedAt: '2026-07-14T00:00:00.000Z',
    completedAt: null,
  };
}

function createDeferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

function createWorkerHarness(jobList: Job[]) {
  const jobs = new Map(jobList.map((job) => [job.id, job]));
  const providerStarted = createDeferred();
  const provider: GenerationProvider = {
    id: 'codex',
    run: ({ signal }) =>
      new Promise((_, reject) => {
        providerStarted.resolve();
        const rejectAsAborted = () => {
          const error = new Error('worker interrupted');
          error.name = 'AbortError';
          reject(error);
        };
        if (signal?.aborted) rejectAsAborted();
        else signal?.addEventListener('abort', rejectAsAborted, { once: true });
      }),
  };
  const addJobEvent = vi.fn();
  const updateJobStatus = vi.fn((id: string, status: Job['status'], error?: string | null) => {
    const current = jobs.get(id);
    if (!current) return null;
    const updated = { ...current, status, error: error ?? null };
    jobs.set(id, updated);
    return updated;
  });
  const controller = createWorkerController({
    createGenerationProvider: () => provider,
    createExternalProvider: () => provider,
    getSettings: () => ({ codexMaxConcurrentJobs: 1 }) as never,
    addJobEvent,
    getJob: (id) => jobs.get(id) ?? null,
    updateJobStatus,
    upsertCodexTurn: vi.fn(() => 'turn-record-1'),
    publishEvent: vi.fn(),
    logger: vi.fn(),
  });

  return { addJobEvent, controller, jobs, providerStarted };
}

describe('worker shutdown', () => {
  it('requeues active work and leaves queued work recoverable for the next startup', async () => {
    const first = createJob('job-active');
    const second = createJob('job-queued');
    const { addJobEvent, controller, jobs, providerStarted } = createWorkerHarness([first, second]);

    controller.enqueueJob(first);
    controller.enqueueJob(second);
    await providerStarted.promise;

    await Promise.all([controller.shutdown(), controller.shutdown()]);

    expect(jobs.get(first.id)?.status).toBe('queued');
    expect(jobs.get(second.id)?.status).toBe('queued');
    expect(addJobEvent).toHaveBeenCalledWith(
      first.id,
      'job.interrupted',
      'Studio shutdown interrupted this job.',
    );
    expect(addJobEvent).not.toHaveBeenCalledWith(
      expect.anything(),
      'job.cancelled',
      expect.anything(),
    );
    expect(controller.getWorkerStatus()).toEqual({
      maxConcurrentJobs: 1,
      activeWorkerCount: 0,
      queuedJobs: 0,
      trackedJobs: 0,
    });

    controller.enqueueJob(createJob('job-after-shutdown'));
    expect(controller.getWorkerStatus().trackedJobs).toBe(0);
  });

  it('preserves an explicit user cancellation when shutdown follows immediately', async () => {
    const job = createJob('job-user-cancelled');
    const { addJobEvent, controller, jobs, providerStarted } = createWorkerHarness([job]);

    controller.enqueueJob(job);
    await providerStarted.promise;
    controller.cancelQueuedOrRunningJob(job.id);
    await controller.shutdown();

    expect(jobs.get(job.id)?.status).toBe('cancelled');
    expect(addJobEvent).toHaveBeenCalledWith(job.id, 'job.cancelled', 'Job cancelled by user.');
    expect(addJobEvent).not.toHaveBeenCalledWith(job.id, 'job.interrupted', expect.anything());
  });
});
