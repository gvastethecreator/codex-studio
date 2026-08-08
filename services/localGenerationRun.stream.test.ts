import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';

const mocks = vi.hoisted(() => {
  const stream = {
    onJobUpdate: vi.fn(),
    onAssetAdded: vi.fn(),
    onCatalogChanged: vi.fn(),
    onLogAdded: vi.fn(),
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
    createStudioJob: vi.fn(async () => ({
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
    cancelStudioJob: vi.fn(async () => ({ status: 'cancelled' })),
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

vi.mock('./studioEventSource', () => ({
  createStudioEventStream: mocks.createStudioEventStream,
  watchJob: mocks.watchJob,
}));

vi.mock('./studio-api/jobs', () => ({
  cancelStudioJob: mocks.cancelStudioJob,
  createStudioJob: mocks.createStudioJob,
}));

vi.mock('./studio-api/settings', () => ({
  getEditableStudioSettings: vi.fn(),
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

describe('runSingleCodexImagegenJob stream ownership', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('closes the event stream it creates', async () => {
    const { runSingleCodexImagegenJob } = await import('./localGenerationRun');

    await runSingleCodexImagegenJob({
      config: DEFAULT_GENERATION_CONFIG,
      batchId: 'batch-1',
      batchIndex: 1,
      batchCount: 1,
      workspaceId: 'workspace-1',
      providerId: 'codex',
    });

    expect(mocks.createStudioEventStream).toHaveBeenCalledTimes(1);
    expect(mocks.stream.close).toHaveBeenCalledTimes(1);
  }, 60_000);

  it('does not close an injected event stream', async () => {
    const { runSingleCodexImagegenJob } = await import('./localGenerationRun');
    const injectedStream = {
      onJobUpdate: vi.fn(),
      onAssetAdded: vi.fn(),
      onCatalogChanged: vi.fn(),
      onLogAdded: vi.fn(),
      onConnectionChange: vi.fn(),
      close: vi.fn(),
    };

    await runSingleCodexImagegenJob({
      config: DEFAULT_GENERATION_CONFIG,
      batchId: 'batch-1',
      batchIndex: 1,
      batchCount: 1,
      workspaceId: 'workspace-1',
      providerId: 'codex',
      stream: injectedStream,
    });

    expect(mocks.createStudioEventStream).not.toHaveBeenCalled();
    expect(injectedStream.close).not.toHaveBeenCalled();
  }, 60_000);

  it('cancels a backend job linked after the caller already aborted', async () => {
    let resolveCreatedJob!: (job: Awaited<ReturnType<typeof mocks.createStudioJob>>) => void;
    mocks.createStudioJob.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCreatedJob = resolve;
        }),
    );
    const abortController = new AbortController();
    const { runSingleCodexImagegenJob } = await import('./localGenerationRun');

    const run = runSingleCodexImagegenJob({
      config: DEFAULT_GENERATION_CONFIG,
      batchId: 'batch-late-cancel',
      batchIndex: 1,
      batchCount: 1,
      workspaceId: 'workspace-1',
      providerId: 'codex',
      signal: abortController.signal,
    });

    await vi.waitFor(() => expect(mocks.createStudioJob).toHaveBeenCalledTimes(1));
    abortController.abort();
    resolveCreatedJob({
      id: 'job-late',
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
    });

    await expect(run).rejects.toMatchObject({ name: 'AbortError' });
    expect(mocks.cancelStudioJob).toHaveBeenCalledWith('job-late');
    expect(mocks.watchJob).not.toHaveBeenCalled();
  });
});
