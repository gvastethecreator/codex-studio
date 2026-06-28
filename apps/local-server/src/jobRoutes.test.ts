import { describe, expect, it, vi } from 'vite-plus/test';
import {
  createGenerationTaskSpec,
  type GenerationTaskSpec,
  type Job,
  type JobDetailResponse,
  type StudioEvent,
  type UnknownStudioEvent,
} from '../../../packages/shared/src';
import { createJobRoutes } from './jobRoutes';

function isReferenceProcessingError(
  error: unknown,
): error is { message: string; referenceName: string | null; reason: string } {
  void error;
  return false;
}

function publishEvent(type: string, payload: unknown): StudioEvent | UnknownStudioEvent {
  return {
    type,
    payload,
    createdAt: '2026-05-29T00:00:00.000Z',
  };
}

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: overrides.id ?? 'job-1',
    projectId: overrides.projectId ?? 'project-1',
    kind: overrides.kind ?? 'codex_imagegen',
    providerId: overrides.providerId ?? 'codex',
    sourceSpec: overrides.sourceSpec ?? null,
    status: overrides.status ?? 'queued',
    execution: overrides.execution ?? null,
    originalPrompt: overrides.originalPrompt ?? 'orig',
    expandedPrompt: overrides.expandedPrompt ?? null,
    finalPromptUsed: overrides.finalPromptUsed ?? 'orig',
    error: overrides.error ?? null,
    createdAt: overrides.createdAt ?? '2026-05-29T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-05-29T00:00:00.000Z',
    completedAt: overrides.completedAt ?? null,
  };
}

type CreateJobInput = {
  id: string;
  projectId: string;
  kind: Job['kind'];
  providerId: Job['providerId'];
  sourceSpec: GenerationTaskSpec | null;
  prompt: string;
  execution: Job['execution'];
};

function createSourceSpec(overrides: Partial<GenerationTaskSpec> = {}): GenerationTaskSpec {
  return createGenerationTaskSpec({
    id: overrides.id ?? 'spec-1',
    task: overrides.task ?? 'image_generate',
    providerId: overrides.providerId ?? 'codex',
    prompt: overrides.prompt ?? 'draw a lighthouse',
    negativePrompt: overrides.negativePrompt,
    recipeId: overrides.recipeId,
    recipeParams: overrides.recipeParams,
    stylePresetId: overrides.stylePresetId,
    assets: overrides.assets,
    output: overrides.output,
    metadata: overrides.metadata,
  });
}

function createJobDetail(job: Job): JobDetailResponse {
  return {
    job,
    events: [],
    turn: null,
    transcriptEntries: [],
    catalogImages: [],
    metrics: {
      timings: [],
      tokenUsage: null,
      estimatedPromptTokens: 0,
    },
    traceSummary: {
      providerId: job.providerId,
      model: job.execution?.model ?? null,
      task: job.kind,
      status: job.status,
      durationMs: null,
      assetCount: 0,
      tokenUsage: null,
      transcriptPath: null,
      completedAt: job.completedAt,
    },
  };
}

describe('jobRoutes', () => {
  it('lists jobs and returns detail when found', async () => {
    const job = createJob({ id: 'job-1' });
    const routes = createJobRoutes({
      listJobs: () => [job],
      getJob: () => null,
      getJobDetail: async (jobId) => (jobId === 'job-1' ? createJobDetail(job) : null),
      cancelQueuedOrRunningJob: () => null,
      ensureDefaultProjectId: () => 'project-1',
      createJobId: () => 'job-new',
      createJob: () => job,
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({ augmentedPrompt: 'x', persistedRefs: [] }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,
      readLibraryDir: () => 'D:/library',
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError,
      publishEvent,
      logJobCreated: () => {},
      enqueueJob: () => {},
    });

    const listResponse = await routes.request('/');
    expect(listResponse.status).toBe(200);
    await expect(listResponse.json()).resolves.toEqual([job]);

    const detailResponse = await routes.request('/job-1');
    expect(detailResponse.status).toBe(200);
    await expect(detailResponse.json()).resolves.toEqual(expect.objectContaining({ job }));

    const missingResponse = await routes.request('/missing');
    expect(missingResponse.status).toBe(404);
  });

  it('cancels queued jobs and keeps terminal jobs unchanged', async () => {
    const queued = createJob({ id: 'job-q', status: 'queued' });
    const cancelled = createJob({ id: 'job-q', status: 'cancelled' });
    const completed = createJob({ id: 'job-done', status: 'completed' });

    const getJob = vi.fn<(...args: [string]) => Job | null>().mockImplementation((jobId) => {
      if (jobId === 'job-q') return queued;
      if (jobId === 'job-done') return completed;
      return null;
    });

    const cancelQueuedOrRunningJob = vi
      .fn<(...args: [string]) => Job | null>()
      .mockImplementation((jobId) => (jobId === 'job-q' ? cancelled : null));

    const routes = createJobRoutes({
      listJobs: () => [],
      getJob,
      getJobDetail: async () => null,
      cancelQueuedOrRunningJob,
      ensureDefaultProjectId: () => 'project-1',
      createJobId: () => 'job-new',
      createJob: () => queued,
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({ augmentedPrompt: 'x', persistedRefs: [] }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,
      readLibraryDir: () => 'D:/library',
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError,
      publishEvent,
      logJobCreated: () => {},
      enqueueJob: () => {},
    });

    const cancelledResponse = await routes.request('/job-q/cancel', { method: 'POST' });
    expect(cancelledResponse.status).toBe(200);
    await expect(cancelledResponse.json()).resolves.toEqual(cancelled);

    const terminalResponse = await routes.request('/job-done/cancel', { method: 'POST' });
    expect(terminalResponse.status).toBe(200);
    await expect(terminalResponse.json()).resolves.toEqual(completed);

    const missingResponse = await routes.request('/missing/cancel', { method: 'POST' });
    expect(missingResponse.status).toBe(404);
  });

  it('creates jobs with reference processing and provider blocker checks', async () => {
    const publishEvent = vi.fn();
    const enqueueJob = vi.fn();
    const logJobCreated = vi.fn();
    const createJobFn = vi.fn((input: CreateJobInput) =>
      createJob({
        id: input.id,
        projectId: input.projectId,
        kind: input.kind,
        providerId: input.providerId,
        sourceSpec: input.sourceSpec,
        originalPrompt: input.prompt,
        finalPromptUsed: input.prompt,
      }),
    );
    const created = createJob({ id: 'job-new', kind: 'image_generate' });

    const routes = createJobRoutes({
      listJobs: () => [],
      getJob: () => null,
      getJobDetail: async () => null,
      cancelQueuedOrRunningJob: () => null,
      ensureDefaultProjectId: () => 'project-default',
      createJobId: () => 'job-new',
      createJob: createJobFn,
      updateJobFinalPrompt: () => created,
      processReferences: async () => ({
        augmentedPrompt: 'draw a lighthouse with refs',
        persistedRefs: [{ id: 'ref-1' }],
      }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,
      readLibraryDir: () => 'D:/library',
      resolveProviderExecutionBlocker: (providerId) =>
        providerId === 'blocked' ? { error: 'provider_blocked' } : null,
      isReferenceProcessingError: (
        error,
      ): error is { message: string; referenceName: string | null; reason: string } =>
        typeof error === 'object' && error !== null && 'reason' in error,
      publishEvent,
      logJobCreated,
      enqueueJob,
    });

    const blockedResponse = await routes.request('/', {
      method: 'POST',
      body: JSON.stringify({ kind: 'codex_imagegen', prompt: 'x', providerId: 'blocked' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(blockedResponse.status).toBe(400);

    const createResponse = await routes.request('/', {
      method: 'POST',
      body: JSON.stringify({
        kind: 'codex_imagegen',
        prompt: 'draw a lighthouse',
        sourceSpec: createSourceSpec(),
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(createResponse.status).toBe(201);
    await expect(createResponse.json()).resolves.toEqual(created);
    expect(createJobFn).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'image_generate', providerId: 'codex' }),
    );
    expect(publishEvent).toHaveBeenCalledWith('job.created', created);
    expect(logJobCreated).toHaveBeenCalledWith('image_generate', 'job-new');
    expect(enqueueJob).toHaveBeenCalledWith(created);

    const invalidPromptResponse = await routes.request('/', {
      method: 'POST',
      body: JSON.stringify({ kind: 'codex_imagegen', prompt: '   ' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(invalidPromptResponse.status).toBe(400);
  });

  it('rejects invalid local queued batch ids before enqueue', async () => {
    const enqueueJob = vi.fn();
    const routes = createJobRoutes({
      listJobs: () => [],
      getJob: () => null,
      getJobDetail: async () => null,
      cancelQueuedOrRunningJob: () => null,
      ensureDefaultProjectId: () => 'project-default',
      createJobId: () => 'job-new',
      createJob: () => createJob({ id: 'job-new' }),
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({
        augmentedPrompt: 'draw a lighthouse',
        persistedRefs: [],
      }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,
      readLibraryDir: () => 'D:/library',
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError,
      publishEvent,
      logJobCreated: () => {},
      enqueueJob,
    });

    const response = await routes.request('/', {
      method: 'POST',
      body: JSON.stringify({
        kind: 'image_generate',
        prompt: 'draw a lighthouse',
        sourceSpec: createSourceSpec({
          id: 'spec-legacy',
          metadata: { workspaceId: 'workspace-1', batchId: '1234-invalid' },
        }),
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: 'invalid_spec_id',
      error: 'Invalid Generation Task Spec',
      issues: expect.arrayContaining([expect.objectContaining({ code: 'invalid_batch_id' })]),
    });
    expect(enqueueJob).not.toHaveBeenCalled();
  });

  it('rejects provider mismatch between job request and source spec', async () => {
    const enqueueJob = vi.fn();
    const routes = createJobRoutes({
      listJobs: () => [],
      getJob: () => null,
      getJobDetail: async () => null,
      cancelQueuedOrRunningJob: () => null,
      ensureDefaultProjectId: () => 'project-default',
      createJobId: () => 'job-new',
      createJob: () => createJob({ id: 'job-new' }),
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({
        augmentedPrompt: 'draw a lighthouse',
        persistedRefs: [],
      }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,
      readLibraryDir: () => 'D:/library',
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError,
      publishEvent,
      logJobCreated: () => {},
      enqueueJob,
    });

    const response = await routes.request('/', {
      method: 'POST',
      body: JSON.stringify({
        kind: 'image_generate',
        providerId: 'google',
        prompt: 'draw a lighthouse',
        sourceSpec: createSourceSpec({ providerId: 'codex' }),
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: 'invalid_provider',
      field: 'sourceSpec.providerId',
    });
    expect(enqueueJob).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON and invalid boundary payloads', async () => {
    const enqueueJob = vi.fn();
    const routes = createJobRoutes({
      listJobs: () => [],
      getJob: () => null,
      getJobDetail: async () => null,
      cancelQueuedOrRunningJob: () => null,
      ensureDefaultProjectId: () => 'project-default',
      createJobId: () => 'job-new',
      createJob: () => createJob({ id: 'job-new' }),
      updateJobFinalPrompt: () => null,
      processReferences: async () => ({
        augmentedPrompt: 'draw a lighthouse',
        persistedRefs: [],
      }),
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,
      readLibraryDir: () => 'D:/library',
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError,
      publishEvent,
      logJobCreated: () => {},
      enqueueJob,
    });

    const malformedJson = await routes.request('/', {
      method: 'POST',
      body: '{"kind":"codex_imagegen",',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(malformedJson.status).toBe(400);
    await expect(malformedJson.json()).resolves.toMatchObject({
      code: 'invalid_json',
    });

    const invalidPayload = await routes.request('/', {
      method: 'POST',
      body: JSON.stringify({ kind: 123, prompt: 'draw a lighthouse' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(invalidPayload.status).toBe(400);
    await expect(invalidPayload.json()).resolves.toMatchObject({
      code: 'invalid_request_body',
    });
    expect(enqueueJob).not.toHaveBeenCalled();
  });

  it('returns structured 400 for malformed source specs without enqueue', async () => {
    const enqueueJob = vi.fn();
    const processReferences = vi.fn(async () => ({
      augmentedPrompt: 'draw',
      persistedRefs: [],
    }));
    const routes = createJobRoutes({
      listJobs: () => [],
      getJob: () => null,
      getJobDetail: async () => null,
      cancelQueuedOrRunningJob: () => null,
      ensureDefaultProjectId: () => 'project-default',
      createJobId: () => 'job-new',
      createJob: () => createJob({ id: 'job-new' }),
      updateJobFinalPrompt: () => null,
      processReferences,
      hydrateSourceSpecAssetPaths: (sourceSpec) => sourceSpec,
      readLibraryDir: () => 'D:/library',
      resolveProviderExecutionBlocker: () => null,
      isReferenceProcessingError,
      publishEvent,
      logJobCreated: () => {},
      enqueueJob,
    });

    const response = await routes.request('/', {
      method: 'POST',
      body: JSON.stringify({
        kind: 'image_generate',
        prompt: 'draw a lighthouse',
        sourceSpec: {},
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Invalid Generation Task Spec',
      code: 'invalid_task_spec',
    });
    expect(processReferences).not.toHaveBeenCalled();
    expect(enqueueJob).not.toHaveBeenCalled();
  });
});
