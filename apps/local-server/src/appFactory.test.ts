import { describe, expect, it, vi } from 'vite-plus/test';

import type {
  CodexModelCatalogResponse,
  LocalCodexSessionResponse,
} from '../../../packages/shared/src';
import type { StudioCatalogStore } from './catalogStore';
import type { StudioDbStore } from './dbStore';
import { createStudioApp } from './appFactory';
import type { WorkerController } from './worker';

vi.mock('./db', () => ({
  getSettingValue: vi.fn(() => null),
  setSettingValue: vi.fn(() => null),
}));

vi.mock('./logger', () => ({
  log: vi.fn(),
}));

function createFakeDbStore(overrides?: Partial<StudioDbStore>): StudioDbStore {
  const defaultProject = {
    id: 'project-default',
    name: 'Default Studio Project',
    description: null,
    createdAt: '2026-05-31T00:00:00.000Z',
    updatedAt: '2026-05-31T00:00:00.000Z',
  };

  const store: StudioDbStore = {
    ensureDefaultProject: vi.fn(() => defaultProject),
    createProject: vi.fn((name: string, description?: string | null) => ({
      id: 'project-created',
      name,
      description: description ?? null,
      createdAt: '2026-05-31T00:00:00.000Z',
      updatedAt: '2026-05-31T00:00:00.000Z',
    })),
    listProjects: vi.fn(() => [defaultProject]),
    createJob: vi.fn(() => {
      throw new Error('not used in appFactory composition test');
    }),
    updateJobFinalPrompt: vi.fn(() => null),
    getJob: vi.fn(() => null),
    listJobs: vi.fn(() => []),
    listAssets: vi.fn(() => []),
    listLogs: vi.fn(() => []),
  };

  return { ...store, ...overrides };
}

function createFakeCatalogStore(overrides?: Partial<StudioCatalogStore>): StudioCatalogStore {
  const image = {
    id: 'catalog-image-1',
    libraryId: 'library-1',
    filePath: 'D:/library/outputs/image.png',
    thumbnailPath: null,
    publicUrl: '/library/outputs/image.png',
    thumbnailUrl: null,
    prompt: 'Prompt',
    negativePrompt: null,
    aspectRatio: '1:1',
    imageSize: '1K',
    width: null,
    height: null,
    mimeType: 'image/png',
    fileSizeBytes: null,
    jobId: null,
    workspaceId: 'default',
    batchId: 'batch-1',
    recipeId: null,
    isFavorite: false,
    isDeleted: false,
    deletedAt: null,
    tags: [],
    generationConfig: null,
    createdAt: '2026-05-31T00:00:00.000Z',
  };

  const store: StudioCatalogStore = {
    getCatalogImage: vi.fn((id: string) => (id === image.id ? image : null)),
    queryCatalog: vi.fn(() => ({ images: [image], total: 1, hasMore: false })),
    registerCatalogImage: vi.fn(() => image),
    updateCatalogImage: vi.fn(() => image),
    softDeleteCatalogImage: vi.fn((id: string) => (id === image.id ? image : null)),
    restoreCatalogImage: vi.fn(() => image),
    purgeCatalogImage: vi.fn((id: string) => (id === image.id ? image : null)),
  };

  return { ...store, ...overrides };
}

function createWorkerDependency(): Pick<
  WorkerController,
  'cancelQueuedOrRunningJob' | 'enqueueJob' | 'getWorkerStatus' | 'resetWorkerState'
> {
  return {
    cancelQueuedOrRunningJob: vi.fn(() => null),
    enqueueJob: vi.fn(),
    getWorkerStatus: vi.fn(() => ({
      maxConcurrentJobs: 2,
      activeWorkerCount: 0,
      queuedJobs: 0,
      trackedJobs: 0,
    })),
    resetWorkerState: vi.fn(async () => {}),
  };
}

describe('createStudioApp', () => {
  it('wires injected codex and project adapters through mounted routes', async () => {
    const dbStore = createFakeDbStore();
    const catalogStore = createFakeCatalogStore();
    const worker = createWorkerDependency();
    const logger = vi.fn();

    const codexCatalogFixture: CodexModelCatalogResponse = {
      models: [
        {
          id: 'gpt-image-1',
          model: 'gpt-image-1',
          displayName: 'GPT Image',
          description: null,
          hidden: false,
          defaultReasoningEffort: null,
          supportedReasoningEfforts: [],
          additionalSpeedTiers: [],
          inputModalities: ['text'],
          supportsPersonality: false,
          isDefault: true,
        },
      ],
      authMode: 'chatgpt',
      planType: 'pro',
      recommendedDefaultModel: 'gpt-image-1',
      source: 'fallback',
      fetchedAt: '2026-05-31T00:00:00.000Z',
      error: null,
    };

    const localSessionFixture: LocalCodexSessionResponse = {
      authMode: 'chatgpt',
      planType: 'pro',
      usage: null,
      source: 'fallback',
      fetchedAt: '2026-05-31T00:00:00.000Z',
      error: null,
      authLabel: 'ChatGPT',
      state: 'ready',
      reason: null,
      isChatgptLogin: true,
      isSupportedAuthMode: true,
      canRunLocalJobs: true,
    };

    const readCodexModelCatalog = vi.fn(async () => codexCatalogFixture);
    const readLocalCodexSession = vi.fn(async () => localSessionFixture);

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore,
        catalogStore,
        worker,
        logger,
        readCodexModelCatalog,
        readLocalCodexSession,
      },
    });

    const modelsResponse = await studio.app.request('/api/codex/models');
    expect(modelsResponse.status).toBe(200);
    await expect(modelsResponse.json()).resolves.toEqual(codexCatalogFixture);
    expect(readCodexModelCatalog).toHaveBeenCalledTimes(1);

    const sessionResponse = await studio.app.request('/api/codex/session');
    expect(sessionResponse.status).toBe(200);
    await expect(sessionResponse.json()).resolves.toEqual(localSessionFixture);
    expect(readLocalCodexSession).toHaveBeenCalledTimes(1);

    const listProjectsResponse = await studio.app.request('/api/projects');
    expect(listProjectsResponse.status).toBe(200);
    await expect(listProjectsResponse.json()).resolves.toEqual([
      {
        id: 'project-default',
        name: 'Default Studio Project',
        description: null,
        createdAt: '2026-05-31T00:00:00.000Z',
        updatedAt: '2026-05-31T00:00:00.000Z',
      },
    ]);

    const createProjectResponse = await studio.app.request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Seam Project', description: 'composition test' }),
    });
    expect(createProjectResponse.status).toBe(201);
    await expect(createProjectResponse.json()).resolves.toEqual({
      id: 'project-created',
      name: 'Seam Project',
      description: 'composition test',
      createdAt: '2026-05-31T00:00:00.000Z',
      updatedAt: '2026-05-31T00:00:00.000Z',
    });
    expect(logger).toHaveBeenCalledWith('info', 'api', 'Project created: Seam Project');
  });

  it('wires catalog command routes through the injected Catalog Entry store', async () => {
    const softDeleteCatalogImage = vi.fn((id: string) =>
      id === 'catalog-image-1'
        ? {
            id: 'catalog-image-1',
            libraryId: 'library-1',
            filePath: 'D:/library/outputs/image.png',
            thumbnailPath: null,
            publicUrl: '/library/outputs/image.png',
            thumbnailUrl: null,
            prompt: 'Prompt',
            negativePrompt: null,
            aspectRatio: '1:1',
            imageSize: '1K',
            width: null,
            height: null,
            mimeType: 'image/png',
            fileSizeBytes: null,
            jobId: null,
            workspaceId: 'default',
            batchId: 'batch-1',
            recipeId: null,
            isFavorite: false,
            isDeleted: true,
            deletedAt: '2026-05-31T00:00:00.000Z',
            tags: [],
            generationConfig: null,
            createdAt: '2026-05-31T00:00:00.000Z',
          }
        : null,
    );

    const catalogStore = createFakeCatalogStore({
      softDeleteCatalogImage,
    });

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore: createFakeDbStore(),
        catalogStore,
        worker: createWorkerDependency(),
      },
    });

    const response = await studio.app.request('/api/catalog/catalog-image-1', {
      method: 'DELETE',
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ id: 'catalog-image-1', isDeleted: true }),
    );
    expect(softDeleteCatalogImage).toHaveBeenCalledWith('catalog-image-1');
  });

  it('surfaces codex route failures through the composition seam', async () => {
    const readCodexModelCatalog = vi.fn(async () => {
      throw new Error('catalog unavailable');
    });

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore: createFakeDbStore(),
        catalogStore: createFakeCatalogStore(),
        worker: createWorkerDependency(),
        readCodexModelCatalog,
      },
    });

    const modelsResponse = await studio.app.request('/api/codex/models');

    expect(modelsResponse.status).toBeGreaterThanOrEqual(500);
    expect(readCodexModelCatalog).toHaveBeenCalledTimes(1);
  });

  it('wires app-server start route to injected runtime dependencies', async () => {
    const ensureAppServer = vi.fn();
    const isAppServerRunning = vi.fn(() => true);
    const getAppServerDiagnostics = vi.fn(() => ({
      pid: 4242,
      lastStartError: null,
      lastEnsureAt: null,
      lastEnsureReason: null,
      lastExitCode: null,
      lastExitAt: null,
      lastInvocation: null,
      lastStartAt: null,
    }));

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore: createFakeDbStore(),
        catalogStore: createFakeCatalogStore(),
        worker: createWorkerDependency(),
        ensureAppServer,
        isAppServerRunning,
        getAppServerDiagnostics,
      },
    });

    const response = await studio.app.request('/api/app-server/start', {
      method: 'POST',
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      running: true,
      wsUrl: expect.any(String),
      pid: 4242,
      lastStartError: null,
    });
    expect(ensureAppServer).toHaveBeenCalledWith('user');
    expect(isAppServerRunning).toHaveBeenCalled();
    expect(getAppServerDiagnostics).toHaveBeenCalled();
  });
});
