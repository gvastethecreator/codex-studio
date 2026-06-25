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
      projectId: 'project-1',
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
      projectId: 'project-1',
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

vi.mock('./localStudioService', () => ({
  createStudioJob: mocks.createStudioJob,
  getEditableStudioSettings: vi.fn(),
  listProjects: vi.fn(async () => [{ id: 'project-1', name: 'Default', createdAt: 1 }]),
  queryCatalog: mocks.queryCatalog,
  toStudioAssetUrl: (url: string) => `http://127.0.0.1:17223${url}`,
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
  });

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
  });
});
