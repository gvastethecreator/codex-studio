import { describe, expect, it, vi } from 'vite-plus/test';

import type { Job } from '../../../packages/shared/src';
import type { GenerationProvider } from './providers/types';
import { ProviderExecutionUncertainError } from './workerErrors';
import { createJobRoutes } from './jobRoutes';
import { createCodexResponsesImageExecutor } from './providers/codexResponsesImageExecutor';
import {
  CODEX_HTTP_EXECUTION_DEFAULTS,
  resolveCodexExecutionPolicy,
} from '../../../packages/shared/src/codexExecutionContract';

const emptyJobPage = {
  open: [],
  history: [],
  nextCursor: null,
  globalOpenCount: 0,
  workspaces: [],
  counts: {
    queued: 0,
    running: 0,
    needs_review: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    open: 0,
    history: 0,
    total: 0,
  },
};

vi.mock('./catalog', () => ({
  getCatalogImageByJobId: vi.fn(() => null),
  registerCatalogImage: vi.fn(() => null),
}));

vi.mock('./db/assets', () => ({
  addAsset: vi.fn(() => null),
  getAssetByJobId: vi.fn(() => null),
}));

vi.mock('./db/events', () => ({
  addJobEvent: vi.fn(),
}));

vi.mock('./db/jobs', () => ({
  getJob: vi.fn(() => null),
  updateJobFinalization: vi.fn(() => null),
  updateJobStatus: vi.fn(() => null),
  updateJobRemoteExecution: vi.fn(),
}));

vi.mock('./db/settings', () => ({
  getSettingValue: vi.fn(() => null),
  setSettingValue: vi.fn(),
}));

vi.mock('./db/codexTurns', () => ({
  upsertCodexTurn: vi.fn(() => 'turn-record-default'),
}));

import { createWorkerController } from './worker';

function createJob(id: string): Job {
  return {
    id,
    workspaceId: 'default',
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

function createWorkerHarness(jobList: Job[], run?: GenerationProvider['run']) {
  const jobs = new Map(jobList.map((job) => [job.id, job]));
  const providerStarted = createDeferred();
  const provider: GenerationProvider = {
    id: 'codex',
    run:
      run ??
      (({ signal }) =>
        new Promise((_, reject) => {
          providerStarted.resolve();
          const rejectAsAborted = () => {
            const error = new Error('worker interrupted');
            error.name = 'AbortError';
            reject(error);
          };
          if (signal?.aborted) rejectAsAborted();
          else signal?.addEventListener('abort', rejectAsAborted, { once: true });
        })),
  };
  const addJobEvent = vi.fn();
  const publishEvent = vi.fn();
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
    updateJobRemoteExecution: (id, checkpoint) => {
      jobs.set(id, { ...jobs.get(id)!, remoteExecution: structuredClone(checkpoint) });
    },
    upsertCodexTurn: vi.fn(() => 'turn-record-1'),
    publishEvent,
    logger: vi.fn(),
  });

  return { addJobEvent, controller, jobs, providerStarted, publishEvent };
}

describe('worker shutdown', () => {
  it('persists an HTTP marker before POST and does not resend recovered running work', async () => {
    const job = createJob('http-restart');
    job.execution = {
      ...CODEX_HTTP_EXECUTION_DEFAULTS,
      providerOptions: {
        codex: resolveCodexExecutionPolicy(
          CODEX_HTTP_EXECUTION_DEFAULTS,
          null,
          'subscription_http',
        ),
      },
    };
    const fetch = vi.fn(async () => {
      expect(first.jobs.get(job.id)?.remoteExecution).toMatchObject({
        providerId: 'codex',
        phase: 'submitting',
      });
      throw new Error('connection lost');
    });
    const run = createCodexResponsesImageExecutor({
      fetch,
      getAccessToken: async () => 'test-token',
    });
    const first = createWorkerHarness([job], run);
    first.controller.enqueueJob(job);
    await vi.waitFor(() => expect(first.jobs.get(job.id)?.status).toBe('needs_review'));
    await first.controller.shutdown();
    const recovered = { ...structuredClone(first.jobs.get(job.id)!), status: 'queued' as const };
    const restarted = createWorkerHarness([recovered], run);
    restarted.controller.enqueueJob(recovered);
    await vi.waitFor(() => expect(restarted.jobs.get(job.id)?.status).toBe('needs_review'));
    expect(fetch).toHaveBeenCalledTimes(1);
    await restarted.controller.shutdown();
  });
  it('does not confirm cancellation of a recovered remote execution waiting for local capacity', async () => {
    const active = createJob('active');
    const remote = {
      ...createJob('remote'),
      providerId: 'comfy' as const,
      remoteExecution: {
        providerId: 'comfy' as const,
        runtimeIdentity: 'runtime-a',
        promptId: 'remote-id',
        phase: 'accepted' as const,
        startedAt: 1,
      },
    };
    const { controller, jobs, providerStarted } = createWorkerHarness([active, remote]);
    controller.enqueueJob(active);
    await providerStarted.promise;
    controller.enqueueJob(remote);
    expect(controller.cancelQueuedOrRunningJob(remote.id)).toMatchObject({
      status: 'needs_review',
      remoteExecution: remote.remoteExecution,
    });
    expect(jobs.get(remote.id)?.error).toContain('may still be running');
    await controller.shutdown();
  });
  it('persists uncertain provider acceptance as review and blocks duplicate retry or false cancellation after reload', async () => {
    const job = { ...createJob('job-uncertain'), providerId: 'comfy' as const };
    const run = vi.fn(async () => {
      throw new ProviderExecutionUncertainError('Provider acceptance unknown');
    });
    const { controller, jobs, publishEvent } = createWorkerHarness([job], run);
    controller.enqueueJob(job);
    await vi.waitFor(() => expect(jobs.get(job.id)?.status).toBe('needs_review'));
    expect(publishEvent).toHaveBeenCalledWith(
      'job.progress',
      expect.objectContaining({ status: 'needs_review', error: 'Provider acceptance unknown' }),
    );
    const retry = vi.fn(() => jobs.get(job.id)!);
    const cancel = vi.fn(() => jobs.get(job.id)!);
    const routes = createJobRoutes({
      listJobs: () => emptyJobPage,
      getJob: (id) => jobs.get(id) ?? null,
      getJobDetail: async () => null,
      requeueJob: retry,
      cancelQueuedOrRunningJob: cancel,
      createJobId: () => 'unused',
      createJob: () => job,
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({ augmentedPrompt: 'prompt', persistedRefs: [] }),
      hydrateSourceSpecAssetPaths: (spec) => spec,
      readCodexTransport: () => 'codex_app_server',
      readLibraryDir: () => 'unused',
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError: (
        _error,
      ): _error is { message: string; referenceName: string | null; reason: string } => false,
      publishEvent: (type, payload) => ({ type, payload, createdAt: new Date().toISOString() }),
      logJobCreated: () => {},
      enqueueJob: (next) => controller.enqueueJob(next),
    });
    const snapshot = await routes.request(`/${job.id}/status`);
    expect(await snapshot.json()).toEqual({
      id: job.id,
      status: 'needs_review',
      error: 'Provider acceptance unknown',
      updatedAt: job.updatedAt,
    });
    expect((await routes.request(`/${job.id}/retry`, { method: 'POST' })).status).toBe(409);
    expect((await routes.request(`/${job.id}/cancel`, { method: 'POST' })).status).toBe(409);
    expect(retry).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
    expect(run).toHaveBeenCalledTimes(1);
    await controller.shutdown();
  });
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
