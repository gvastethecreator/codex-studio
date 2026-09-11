import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { Job } from '../packages/shared/src';

const mocks = vi.hoisted(() => {
  const stream = {
    onJobUpdate: vi.fn(),
    onAssetAdded: vi.fn(),
    onCatalogChanged: vi.fn(),
    onLogAdded: vi.fn(),
    onOnboardingStage: vi.fn(),
    onOnboardingProbe: vi.fn(),
    onAuthUpdated: vi.fn(),
    onConnectionChange: vi.fn(),
    close: vi.fn(),
  };

  return {
    stream,
    createStudioEventStream: vi.fn(() => stream),
    watchJob: vi.fn(async () => ({
      id: 'job-1',
      workspaceId: 'default',
      kind: 'image_generate',
      providerId: 'codex',
      sourceSpec: null,
      status: 'completed',
      execution: null,
      originalPrompt: 'prompt',
      expandedPrompt: null,
      finalPromptUsed: 'prompt',
      error: null,
      createdAt: '2026-06-19T00:00:00.000Z',
      updatedAt: '2026-06-19T00:00:00.000Z',
      completedAt: '2026-06-19T00:00:01.000Z',
    })),
    createJobFixture: vi.fn(async (): Promise<Job> => ({
      id: 'job-1',
      workspaceId: 'default',
      kind: 'image_generate',
      providerId: 'codex',
      sourceSpec: null,
      status: 'queued',
      execution: null,
      originalPrompt: 'prompt',
      expandedPrompt: null,
      finalPromptUsed: 'prompt',
      error: null,
      createdAt: '2026-06-19T00:00:00.000Z',
      updatedAt: '2026-06-19T00:00:00.000Z',
      completedAt: null,
    })),
    createStudioJobBatch: vi.fn(),
    getStudioJobBatchSummary: vi.fn(),
    cancelStudioJob: vi.fn(async (_jobId: string) => ({ status: 'cancelled' })),
    queryCatalog: vi.fn(async () => ({
      images: [
        {
          id: 'asset-1',
          libraryId: 'library-1',
          filePath: 'outputs/asset-1.webp',
          thumbnailPath: 'outputs/thumbs/asset-1.webp',
          publicUrl: '/library/asset-1.webp',
          thumbnailUrl: '/library/thumbs/asset-1.webp',
          prompt: 'prompt',
          negativePrompt: null,
          aspectRatio: '1:1',
          imageSize: '1K',
          width: 1024,
          height: 1024,
          mimeType: 'image/webp',
          fileSizeBytes: 1024,
          jobId: 'job-1',
          workspaceId: 'workspace-1',
          batchId: 'batch-1',
          recipeId: null,
          isFavorite: false,
          isDeleted: false,
          deletedAt: null,
          tags: [],
          generationConfig: null,
          createdAt: '2026-06-19T00:00:01.000Z',
        },
      ],
      total: 1,
      hasMore: false,
    })),
  };
});

vi.mock('./studioEventSource', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./studioEventSource')>()),
  createStudioEventStream: mocks.createStudioEventStream,
  watchJob: mocks.watchJob,
}));

vi.mock('./studio-api/jobs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./studio-api/jobs')>()),
  cancelStudioJob: mocks.cancelStudioJob,
  createStudioJobBatch: mocks.createStudioJobBatch,
  getStudioJobBatchSummary: mocks.getStudioJobBatchSummary,
}));

vi.mock('./studio-api/settings', () => ({
  getEditableStudioSettings: vi.fn(async () => ({ defaultProviderId: 'codex' })),
}));

vi.mock('./studio-api/catalog', () => ({
  queryCatalog: mocks.queryCatalog,
}));

vi.mock('../lib/recipeModules', () => ({
  buildGenerationTaskSpecFromRecipe: vi.fn(({ id, providerId, task, config }) => ({
    id,
    providerId,
    task: task ?? 'image_generate',
    config,
    metadata: {},
  })),
}));

describe('accepted batch observation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('closes an owned stream and leaves an injected stream open', async () => {
    const { observeAcceptedGenerationJob } = await import('./localGenerationRun');
    const job = await mocks.createJobFixture();
    await observeAcceptedGenerationJob({ job, batchId: 'batch-1' });
    expect(mocks.createStudioEventStream).toHaveBeenCalledTimes(1);
    expect(mocks.stream.close).toHaveBeenCalledTimes(1);
    mocks.stream.close.mockClear();
    await observeAcceptedGenerationJob({ job, batchId: 'batch-1', stream: mocks.stream });
    expect(mocks.createStudioEventStream).toHaveBeenCalledTimes(1);
    expect(mocks.stream.close).not.toHaveBeenCalled();
  });

  it('cancels every accepted member when the acknowledgement arrives after abort', async () => {
    const job = await mocks.createJobFixture();
    let accept!: (value: unknown) => void;
    mocks.createStudioJobBatch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          accept = resolve;
        }),
    );
    const controller = new AbortController();
    const { runLocalGeneration } = await import('./localGenerationRun');
    const run = runLocalGeneration({
      config: { ...DEFAULT_GENERATION_CONFIG, batchCount: 2 },
      workspaceId: 'default',
      signal: controller.signal,
    });
    await vi.waitFor(() => expect(mocks.createStudioJobBatch).toHaveBeenCalledTimes(1));
    controller.abort();
    accept({ id: 'batch-late', jobs: [job, { ...job, id: 'job-2' }] });
    await expect(run).rejects.toMatchObject({ name: 'AbortError' });
    expect(mocks.cancelStudioJob.mock.calls.map(([id]) => id)).toEqual(['job-1', 'job-2']);
    expect(mocks.watchJob).not.toHaveBeenCalled();
  });

  it('keeps every batch member in the requested workspace and retains partial success', async () => {
    const job = await mocks.createJobFixture();
    mocks.createStudioJobBatch.mockResolvedValueOnce({
      id: 'batch-partial',
      jobs: [job, { ...job, id: 'job-2' }],
    });
    mocks.watchJob.mockRejectedValueOnce(new Error('Provider rejected one item'));
    mocks.getStudioJobBatchSummary.mockResolvedValueOnce({
      id: 'batch-partial',
      requestedCount: 2,
      status: 'partial',
      counts: { completed: 1, failed: 1, queued: 0, running: 0, cancelled: 0, needs_review: 0 },
    });
    const { runLocalGenerationWithLifecycle } = await import('./localGenerationRun');
    const outcome = await runLocalGenerationWithLifecycle({
      config: { ...DEFAULT_GENERATION_CONFIG, batchCount: 2 },
      workspaceId: 'workspace-selected',
    });
    expect(outcome).toMatchObject({
      status: 'partial',
      result: {
        batchId: 'batch-partial',
        generatedCount: 1,
        batch: { requestedCount: 2, counts: { completed: 1, failed: 1 } },
        images: [{ id: 'asset-1' }],
      },
    });
    const request = mocks.createStudioJobBatch.mock.calls[0][0];
    expect(request.items).toHaveLength(2);
    for (const item of request.items) {
      expect(item.workspaceId).toBe('workspace-selected');
      expect(item).not.toHaveProperty('projectId');
    }
    expect(request.requestId).toMatch(/^batch-/);
    expect(mocks.createStudioJobBatch).toHaveBeenCalledTimes(1);
  });
});
