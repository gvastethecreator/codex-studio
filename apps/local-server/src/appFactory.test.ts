import { describe, expect, it, vi } from 'vite-plus/test';

import type {
  CodexRuntimeDoctorReport,
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
  ensureDefaultWorkspace: vi.fn(() => ({
    id: 'default',
    name: 'Default',
    libraryId: null,
    filter: {},
    sortOrder: 'newest',
    createdAt: '2026-05-31T00:00:00.000Z',
    updatedAt: '2026-05-31T00:00:00.000Z',
  })),
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
    requeueJob: vi.fn(() => null),
    getJob: vi.fn(() => null),
    listJobSummaries: vi.fn(() => []),
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
    queryWorkspaceSummaries: vi.fn(() => [
      {
        workspaceId: image.workspaceId ?? 'default',
        imageCount: 1,
        totalFileSizeBytes: 0,
        knownFileSizeCount: 0,
        libraryIds: [image.libraryId],
        firstCreatedAt: image.createdAt,
        latestCreatedAt: image.createdAt,
        sampleFilePath: image.filePath,
        lastImage: image,
      },
    ]),
    listCatalogImageIds: vi.fn(() => [image.id]),
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
  'cancelQueuedOrRunningJob' | 'enqueueJob' | 'getWorkerStatus' | 'resetWorkerState' | 'shutdown'
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
    shutdown: vi.fn(async () => {}),
  };
}

function createCodexRuntimeReport(
  overrides: Partial<CodexRuntimeDoctorReport> = {},
): CodexRuntimeDoctorReport {
  return {
    status: 'ready',
    canRunJobs: true,
    checkedAt: '2026-05-31T00:00:00.000Z',
    selectedExecutable: 'codex',
    selectedCommand: 'codex --version',
    selectedVersion: 'codex-cli 1.0.0',
    selectedVersionNumber: '1.0.0',
    appServerSupported: true,
    recommendedAction: 'Codex Product Runtime is ready.',
    issues: [],
    candidates: [],
    ...overrides,
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
    expect(listProjectsResponse.status).toBe(410);
    await expect(listProjectsResponse.json()).resolves.toMatchObject({
      code: 'projects_retired',
    });

    const createProjectResponse = await studio.app.request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Seam Project', description: 'composition test' }),
    });
    expect(createProjectResponse.status).toBe(410);
    await expect(createProjectResponse.json()).resolves.toMatchObject({
      code: 'projects_retired',
    });
  });

  it('allows configured local UI origins through the local API guard', async () => {
    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore: createFakeDbStore(),
        catalogStore: createFakeCatalogStore(),
        worker: createWorkerDependency(),
      },
    });

    const response = await studio.app.request('/api/health', {
      headers: { Origin: 'http://localhost:17222' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:17222');
  });

  it('rejects browser requests from foreign origins before mounted routes run', async () => {
    const listProjects = vi.fn(() => []);
    const createProject = vi.fn();
    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore: createFakeDbStore({
          listProjects,
          createProject: createProject as unknown as StudioDbStore['createProject'],
        }),
        catalogStore: createFakeCatalogStore(),
        worker: createWorkerDependency(),
      },
    });

    const listResponse = await studio.app.request('/api/projects', {
      headers: { Origin: 'https://example.test' },
    });
    expect(listResponse.status).toBe(403);
    await expect(listResponse.json()).resolves.toEqual({
      error: 'Forbidden origin',
      code: 'forbidden_origin',
    });
    expect(listProjects).not.toHaveBeenCalled();

    const createResponse = await studio.app.request('/api/projects', {
      method: 'POST',
      headers: { Origin: 'https://example.test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Blocked' }),
    });
    expect(createResponse.status).toBe(403);
    expect(createProject).not.toHaveBeenCalled();
  });

  it('wires library and workspace route dependencies through the factory seam', async () => {
    const injectedLibrary = {
      id: 'library-injected',
      name: 'Injected Library',
      path: 'D:/studio/library',
      isDefault: true,
      createdAt: '2026-05-31T00:00:00.000Z',
    };
    const injectedWorkspace = {
      id: 'workspace-injected',
      name: 'Injected Workspace',
      libraryId: 'library-injected',
      filterJson: { favorite: true },
      sortOrder: 'newest',
      createdAt: '2026-05-31T00:00:00.000Z',
      updatedAt: '2026-05-31T00:00:00.000Z',
    };
    const listLibrariesRoute = vi.fn(() => [injectedLibrary]);
    const listWorkspacesRoute = vi.fn(() => [injectedWorkspace]);

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore: createFakeDbStore(),
        catalogStore: createFakeCatalogStore(),
        worker: createWorkerDependency(),
        libraryRoutes: {
          listLibraries: listLibrariesRoute,
        },
        workspaceRoutes: {
          listCatalogWorkspaces: listWorkspacesRoute,
        },
      },
    });

    const librariesResponse = await studio.app.request('/api/libraries');
    expect(librariesResponse.status).toBe(200);
    await expect(librariesResponse.json()).resolves.toEqual([injectedLibrary]);
    expect(listLibrariesRoute).toHaveBeenCalledTimes(1);

    const workspacesResponse = await studio.app.request('/api/workspaces');
    expect(workspacesResponse.status).toBe(200);
    await expect(workspacesResponse.json()).resolves.toEqual([injectedWorkspace]);
    expect(listWorkspacesRoute).toHaveBeenCalledTimes(1);
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
        readCodexRuntimeDoctor: () => createCodexRuntimeReport(),
      },
    });

    const response = await studio.app.request('/api/app-server/start', {
      method: 'POST',
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      running: true,
      wsUrl: expect.any(String),
      pid: 4242,
      lastStartError: null,
      codexRuntime: expect.objectContaining({ canRunJobs: true }),
    });
    expect(ensureAppServer).toHaveBeenCalledWith('user');
    expect(isAppServerRunning).toHaveBeenCalled();
    expect(getAppServerDiagnostics).toHaveBeenCalled();
  }, 20_000);

  it('wires runtime health worker status through the injected worker dependency', async () => {
    const workerStatus = {
      maxConcurrentJobs: 9,
      activeWorkerCount: 3,
      queuedJobs: 4,
      trackedJobs: 7,
    };
    const worker = createWorkerDependency();
    worker.getWorkerStatus = vi.fn(() => workerStatus);

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore: createFakeDbStore(),
        catalogStore: createFakeCatalogStore(),
        worker,
      },
    });

    const response = await studio.app.request('/api/health');
    expect(response.status).toBe(200);

    const payload = (await response.json()) as { worker: typeof workerStatus };
    expect(payload.worker).toEqual(workerStatus);
    expect(worker.getWorkerStatus).toHaveBeenCalledTimes(2);
  });

  it('blocks Codex job creation before persistence when Runtime Doctor fails', async () => {
    const createJob = vi.fn(() => {
      throw new Error('job should not be persisted');
    });
    const dbStore = createFakeDbStore({
      createJob: createJob as unknown as StudioDbStore['createJob'],
    });
    const worker = createWorkerDependency();

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore,
        catalogStore: createFakeCatalogStore(),
        worker,
        readCodexRuntimeDoctor: () =>
          createCodexRuntimeReport({
            status: 'blocked',
            canRunJobs: false,
            appServerSupported: false,
            recommendedAction: 'Use the OpenAI Codex desktop CLI binary.',
            issues: [
              {
                code: 'codex_cli_legacy',
                severity: 'error',
                message: 'Selected Codex CLI looks legacy.',
                action: 'Use the OpenAI Codex desktop CLI binary.',
              },
            ],
          }),
      },
    });

    const response = await studio.app.request('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'codex_imagegen', prompt: 'draw a lighthouse' }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: 'provider_runtime_blocked',
      providerId: 'codex',
      diagnostics: expect.arrayContaining([expect.stringContaining('legacy')]),
    });
    expect(createJob).not.toHaveBeenCalled();
    expect(worker.enqueueJob).not.toHaveBeenCalled();
  });

  it('surfaces runtime start failures through the composition seam', async () => {
    const ensureAppServer = vi.fn(() => {
      throw new Error('unable to start app-server');
    });

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore: createFakeDbStore(),
        catalogStore: createFakeCatalogStore(),
        worker: createWorkerDependency(),
        ensureAppServer,
        readCodexRuntimeDoctor: () => createCodexRuntimeReport(),
      },
    });

    const response = await studio.app.request('/api/app-server/start', {
      method: 'POST',
    });

    expect(response.status).toBeGreaterThanOrEqual(500);
    expect(ensureAppServer).toHaveBeenCalledWith('user');
  });

  it('wires cancel conflict path through injected worker dependency', async () => {
    const activeJob = {
      id: 'job-active',
      projectId: 'project-default',
      workspaceId: 'default',
      kind: 'dry_run' as const,
      providerId: null,
      sourceSpec: null,
      status: 'running' as const,
      execution: null,
      originalPrompt: 'hello',
      expandedPrompt: null,
      finalPromptUsed: 'hello',
      error: null,
      createdAt: '2026-05-31T00:00:00.000Z',
      updatedAt: '2026-05-31T00:00:00.000Z',
      completedAt: null,
    };

    const getJobSpy = vi.fn((id: string) => (id === activeJob.id ? activeJob : null));
    const getJobMock: StudioDbStore['getJob'] = (id: string) => getJobSpy(id);
    const dbStore = createFakeDbStore({ getJob: getJobMock });
    const worker = createWorkerDependency();
    const cancelQueuedOrRunningJobMock = vi.fn(() => null);
    worker.cancelQueuedOrRunningJob = cancelQueuedOrRunningJobMock;

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore,
        catalogStore: createFakeCatalogStore(),
        worker,
      },
    });

    const response = await studio.app.request(`/api/jobs/${activeJob.id}/cancel`, {
      method: 'POST',
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: 'Job cannot be cancelled right now' });
    expect(getJobSpy).toHaveBeenCalledWith(activeJob.id);
    expect(cancelQueuedOrRunningJobMock).toHaveBeenCalledWith(activeJob.id);
  });

  it('serves provider snapshots without triggering another Runtime Doctor probe', async () => {
    const readCodexRuntimeDoctor = vi.fn(() => createCodexRuntimeReport());
    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore: createFakeDbStore(),
        catalogStore: createFakeCatalogStore(),
        worker: createWorkerDependency(),
        readCodexRuntimeDoctor,
      },
    });

    await vi.waitFor(() => expect(readCodexRuntimeDoctor).toHaveBeenCalledTimes(1));
    const probeCountAfterStartup = readCodexRuntimeDoctor.mock.calls.length;

    expect((await studio.app.request('/api/providers')).status).toBe(200);
    expect((await studio.app.request('/api/providers/preflight')).status).toBe(200);
    expect(readCodexRuntimeDoctor).toHaveBeenCalledTimes(probeCountAfterStartup);
    await studio.shutdown();
  });

  it('stops the managed app-server once when shutdown is requested repeatedly', async () => {
    const stopAppServer = vi.fn(async () => {});
    const worker = createWorkerDependency();
    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore: createFakeDbStore(),
        catalogStore: createFakeCatalogStore(),
        worker,
        stopAppServer,
      },
    });

    await Promise.all([studio.shutdown(), studio.shutdown()]);

    expect(worker.shutdown).toHaveBeenCalledTimes(1);
    expect(stopAppServer).toHaveBeenCalledTimes(1);
  });

  it('still stops the managed app-server when worker shutdown rejects', async () => {
    const stopAppServer = vi.fn(async () => {});
    const worker = createWorkerDependency();
    worker.shutdown = vi.fn(async () => {
      throw new Error('worker shutdown failed');
    });
    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        dbStore: createFakeDbStore(),
        catalogStore: createFakeCatalogStore(),
        worker,
        stopAppServer,
      },
    });

    await expect(studio.shutdown()).rejects.toThrow('Studio shutdown did not complete cleanly');
    expect(stopAppServer).toHaveBeenCalledTimes(1);
  });
});
