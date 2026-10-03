import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  createGenerationTaskSpec,
  type CodexRuntimeDoctorReport,
  type CodexModelCatalogResponse,
  type Job,
  type LocalCodexSessionResponse,
} from '../../../packages/shared/src';
import type { StudioCatalogStore } from './catalogStore';
import { createAnimationSequenceService } from './animationSequenceService';
import { createAnimationSequenceRunParticipant } from './animationSequenceRunReconciler';
import { publishEvent } from './events';
import { createSpriteAtlasService } from './spriteAtlasService';
import { createSpriteAtlasRunParticipant } from './spriteAtlasRunReconciler';
import { readAntigravityRuntimeDoctor } from './antigravityRuntimeDoctor';
import { readGrokRuntimeDoctor } from './grokRuntimeDoctor';
import {
  createStudioApp,
  type StudioAssetStore,
  type StudioJobStore,
  type StudioLogStore,
} from './appFactory';
import type { WorkerController } from './worker';

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

vi.mock('./db/settings', () => ({
  getSettingValue: vi.fn(() => null),
  setSettingValue: vi.fn(() => null),
}));

vi.mock('./db/workspaces', () => ({
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

vi.mock('./spriteAtlasService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./spriteAtlasService')>();
  return { ...actual, createSpriteAtlasService: vi.fn(actual.createSpriteAtlasService) };
});

vi.mock('./animationSequenceService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./animationSequenceService')>();
  return {
    ...actual,
    createAnimationSequenceService: vi.fn(actual.createAnimationSequenceService),
  };
});

vi.mock('./spriteAtlasRunReconciler', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./spriteAtlasRunReconciler')>();
  return { createSpriteAtlasRunParticipant: vi.fn(actual.createSpriteAtlasRunParticipant) };
});

vi.mock('./animationSequenceRunReconciler', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./animationSequenceRunReconciler')>();
  return {
    createAnimationSequenceRunParticipant: vi.fn(actual.createAnimationSequenceRunParticipant),
  };
});

vi.mock('./grokRuntimeDoctor', () => ({
  readGrokRuntimeDoctor: vi.fn(() => ({
    status: 'ready',
    canRunJobs: true,
    checkedAt: '2026-08-08T00:00:00.000Z',
    selectedExecutable: 'grok',
    selectedVersion: 'grok 1.0.0',
    selectedVersionNumber: '1.0.0',
    defaultModel: 'grok-4.5',
    availableModels: ['grok-4.5'],
    headlessSupported: true,
    imagineAvailable: true,
    recommendedAction: 'Grok Imagine is ready.',
    issues: [],
    candidates: [],
  })),
}));

vi.mock('./antigravityRuntimeDoctor', () => ({
  readAntigravityRuntimeDoctor: vi.fn(() => ({
    status: 'blocked',
    canRunJobs: false,
    checkedAt: '2026-09-02T00:00:00.000Z',
    selectedExecutable: 'agy',
    selectedVersion: null,
    selectedVersionNumber: null,
    defaultModel: null,
    availableModels: [],
    headlessSupported: false,
    generateImageSupported: false,
    recommendedAction: 'Install Antigravity CLI.',
    issues: [
      {
        code: 'antigravity_cli_unavailable',
        message: 'Antigravity CLI is missing.',
        action: 'Install Antigravity CLI.',
      },
    ],
    candidates: [],
  })),
}));

type StudioStoreOverrides = Partial<StudioJobStore & StudioAssetStore & StudioLogStore>;

function createFakeStores(overrides?: StudioStoreOverrides) {
  const jobStore: StudioJobStore = {
    createJob: vi.fn(() => {
      throw new Error('not used in appFactory composition test');
    }),
    updateJobFinalPrompt: vi.fn(() => null),
    requeueJob: vi.fn(() => null),
    getJob: vi.fn(() => null),
    getJobStatus: vi.fn(() => null),
    listJobSummaries: vi.fn(() => emptyJobPage),
    ...overrides,
  };
  const assetStore: StudioAssetStore = {
    listAssets: vi.fn(() => []),
    ...overrides,
  };
  const logStore: StudioLogStore = {
    listLogs: vi.fn(() => []),
    ...overrides,
  };

  return { jobStore, assetStore, logStore };
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
      providerLimits: {},
      activeByProvider: {},
      waiting: [],
      stopping: false,
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

afterEach(() => vi.unstubAllEnvs());

describe('createStudioApp', () => {
  it('wires injected codex and project adapters through mounted routes', async () => {
    const stores = createFakeStores();
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
        ...stores,
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

    const removedProjectsResponse = await studio.app.request('/api/projects');
    expect(removedProjectsResponse.status).toBe(404);
  });

  it('allows configured local UI origins through the local API guard', async () => {
    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        ...createFakeStores(),
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

  it('closes the routes of a turned-off workflow module', async () => {
    const settings = new Map<string, string>();
    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        ...createFakeStores(),
        catalogStore: createFakeCatalogStore(),
        worker: createWorkerDependency(),
        settingsStorage: {
          getSetting: (key) => settings.get(key) ?? null,
          setSetting: (key, value) => void settings.set(key, value),
        },
      },
    });
    const probe = () => studio.app.request('/api/sprite-atlas/projects');

    expect(await (await probe()).text()).not.toContain('workflow_module_disabled');
    await studio.app.request('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabledWorkflowModules: ['sprite-atlas'] }),
    });
    const closed = await probe();
    expect(closed.status).toBe(404);
    await expect(closed.json()).resolves.toMatchObject({
      code: 'workflow_module_disabled',
      moduleId: 'sprite-atlas',
    });
    expect((await studio.app.request('/api/health')).status).toBe(200);
  });

  it('rejects browser requests from foreign origins before mounted routes run', async () => {
    const listJobSummaries = vi.fn(() => emptyJobPage);
    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        ...createFakeStores({
          listJobSummaries,
        }),
        catalogStore: createFakeCatalogStore(),
        worker: createWorkerDependency(),
      },
    });

    const listResponse = await studio.app.request('/api/jobs', {
      headers: { Origin: 'https://example.test' },
    });
    expect(listResponse.status).toBe(403);
    await expect(listResponse.json()).resolves.toEqual({
      error: 'Forbidden origin',
      code: 'forbidden_origin',
    });
    expect(listJobSummaries).not.toHaveBeenCalled();
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
      filter: { favorite: true },
      sortOrder: 'newest' as const,
      createdAt: '2026-05-31T00:00:00.000Z',
      updatedAt: '2026-05-31T00:00:00.000Z',
    };
    const listLibrariesRoute = vi.fn(() => [injectedLibrary]);
    const listWorkspacesRoute = vi.fn(() => [injectedWorkspace]);

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        ...createFakeStores(),
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
        ...createFakeStores(),
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
        ...createFakeStores(),
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
        ...createFakeStores(),
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
      providerLimits: {},
      activeByProvider: {},
      waiting: [],
      stopping: false,
    };
    const worker = createWorkerDependency();
    worker.getWorkerStatus = vi.fn(() => workerStatus);
    // The health route reads the dispatch hold from the environment; keep the local .env out.
    vi.stubEnv('STUDIO_HOLD_PROVIDER_DISPATCH', '');

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        ...createFakeStores(),
        catalogStore: createFakeCatalogStore(),
        worker,
      },
    });

    const response = await studio.app.request('/api/health');
    expect(response.status).toBe(200);

    const payload = (await response.json()) as {
      worker: typeof workerStatus;
      providerDispatch: { hold: boolean };
      subscriptionHttp: { revision: string };
    };
    expect(payload.worker).toEqual(workerStatus);
    expect(payload.providerDispatch).toEqual({ hold: false });
    expect(payload.subscriptionHttp).toEqual({ revision: 'named_seconds_v1' });
    expect(worker.getWorkerStatus).toHaveBeenCalledTimes(2);
  });

  it('blocks Codex job creation before persistence when Runtime Doctor fails', async () => {
    const createJob = vi.fn(() => {
      throw new Error('job should not be persisted');
    });
    const stores = createFakeStores({
      createJob: createJob as unknown as StudioJobStore['createJob'],
    });
    const worker = createWorkerDependency();

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        ...stores,
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

    const grokReadsBeforeJob = vi.mocked(readGrokRuntimeDoctor).mock.calls.length;
    const antigravityReadsBeforeJob = vi.mocked(readAntigravityRuntimeDoctor).mock.calls.length;

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
    expect(vi.mocked(readGrokRuntimeDoctor).mock.calls.length - grokReadsBeforeJob).toBe(1);
    expect(
      vi.mocked(readAntigravityRuntimeDoctor).mock.calls.length - antigravityReadsBeforeJob,
    ).toBe(1);
  });

  it('surfaces runtime start failures through the composition seam', async () => {
    const ensureAppServer = vi.fn(() => {
      throw new Error('unable to start app-server');
    });

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        ...createFakeStores(),
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
    const getJobMock: StudioJobStore['getJob'] = (id: string) => getJobSpy(id);
    const stores = createFakeStores({ getJob: getJobMock });
    const worker = createWorkerDependency();
    const cancelQueuedOrRunningJobMock = vi.fn(() => null);
    worker.cancelQueuedOrRunningJob = cancelQueuedOrRunningJobMock;

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        ...stores,
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
        ...createFakeStores(),
        catalogStore: createFakeCatalogStore(),
        worker: createWorkerDependency(),
        readCodexRuntimeDoctor,
      },
    });

    await vi.waitFor(() => expect(readCodexRuntimeDoctor).toHaveBeenCalledTimes(1));
    const probeCountAfterStartup = readCodexRuntimeDoctor.mock.calls.length;

    expect((await studio.app.request('/api/providers')).status).toBe(200);
    expect((await studio.app.request('/api/providers/preflight')).status).toBe(200);
    const auth = await studio.app.request('/api/auth/codex');
    expect(auth.status).toBe(200);
    const authBody = await auth.json();
    expect(JSON.stringify(authBody)).not.toMatch(
      /accessToken|refreshToken|access_token|refresh_token/,
    );
    expect(readCodexRuntimeDoctor).toHaveBeenCalledTimes(probeCountAfterStartup);
    await studio.shutdown();
  });

  it('shares one service per workflow between its routes and its run participant', async () => {
    vi.mocked(createSpriteAtlasService).mockClear();
    vi.mocked(createAnimationSequenceService).mockClear();
    vi.mocked(createSpriteAtlasRunParticipant).mockClear();
    vi.mocked(createAnimationSequenceRunParticipant).mockClear();

    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        ...createFakeStores(),
        catalogStore: createFakeCatalogStore(),
        worker: createWorkerDependency(),
      },
    });
    const presets = await studio.app.request('/api/sprite-atlas/presets');
    await studio.shutdown();

    expect(presets.status).toBe(200);
    expect(createSpriteAtlasService).toHaveBeenCalledTimes(1);
    expect(createAnimationSequenceService).toHaveBeenCalledTimes(1);
    expect(createSpriteAtlasRunParticipant).toHaveBeenCalledWith(
      vi.mocked(createSpriteAtlasService).mock.results[0]!.value,
    );
    expect(createAnimationSequenceRunParticipant).toHaveBeenCalledWith(
      vi.mocked(createAnimationSequenceService).mock.results[0]!.value,
    );
  });

  it('stops observing jobs on shutdown and drains run settles after the worker stops', async () => {
    let releaseSettle!: () => void;
    const settle = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          releaseSettle = () => resolve(false);
        }),
    );
    vi.mocked(createSpriteAtlasRunParticipant).mockImplementationOnce(() => ({
      recipeId: 'sprite-atlas',
      recordDispatch: async () => {},
      settle,
      recover: async () => {},
      reconcileRun: async () => null,
    }));
    const worker = createWorkerDependency();
    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        ...createFakeStores(),
        catalogStore: createFakeCatalogStore(),
        worker,
      },
    });
    const job: Job = {
      id: 'sprite-job',
      workspaceId: 'default',
      kind: 'image_generate',
      providerId: 'chatgpt',
      sourceSpec: createGenerationTaskSpec({
        id: 'sprite-spec',
        task: 'image_generate',
        prompt: 'walk cycle row',
        recipeId: 'sprite-atlas',
        recipeParams: { runId: 'run-1' },
      }),
      status: 'completed',
      execution: null,
      originalPrompt: 'walk cycle row',
      expandedPrompt: null,
      finalPromptUsed: 'walk cycle row',
      error: null,
      createdAt: '2026-10-02T00:00:00.000Z',
      updatedAt: '2026-10-02T00:00:00.000Z',
      completedAt: '2026-10-02T00:00:00.000Z',
    };

    publishEvent('job.completed', job);
    await vi.waitFor(() => expect(settle).toHaveBeenCalledTimes(1));
    let stopped = false;
    const shutdown = studio.shutdown().then(() => {
      stopped = true;
    });
    publishEvent('job.completed', { ...job, id: 'late-job' });
    await vi.waitFor(() => expect(worker.shutdown).toHaveBeenCalledTimes(1));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(stopped).toBe(false);

    releaseSettle();
    await shutdown;
    expect(settle).toHaveBeenCalledTimes(1);
  });

  it('stops the managed app-server once when shutdown is requested repeatedly', async () => {
    const stopAppServer = vi.fn(async () => {});
    const worker = createWorkerDependency();
    const studio = await createStudioApp({
      runInit: false,
      dependencies: {
        ...createFakeStores(),
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
        ...createFakeStores(),
        catalogStore: createFakeCatalogStore(),
        worker,
        stopAppServer,
      },
    });

    await expect(studio.shutdown()).rejects.toThrow('Studio shutdown did not complete cleanly');
    expect(stopAppServer).toHaveBeenCalledTimes(1);
  });

  it('serves the built UI and health from one origin when dist is present', async () => {
    const uiDistDir = mkdtempSync(path.join(os.tmpdir(), 'studio-app-ui-'));
    writeFileSync(path.join(uiDistDir, 'index.html'), '<html>one-origin</html>', 'utf8');
    mkdirSync(path.join(uiDistDir, 'assets'), { recursive: true });
    writeFileSync(path.join(uiDistDir, 'assets', 'app.js'), 'export {}', 'utf8');

    try {
      const studio = await createStudioApp({
        runInit: false,
        dependencies: {
          ...createFakeStores(),
          catalogStore: createFakeCatalogStore(),
          worker: createWorkerDependency(),
          uiDistDir,
          readCodexRuntimeDoctor: () => createCodexRuntimeReport(),
        },
      });

      const health = await studio.app.request('/api/health');
      expect(health.status).toBe(200);

      const ui = await studio.app.request('/');
      expect(ui.status).toBe(200);
      expect(await ui.text()).toContain('one-origin');

      const asset = await studio.app.request('/assets/app.js');
      expect(asset.status).toBe(200);

      const fileOrigin = await studio.app.request('/', {
        headers: { Origin: 'file://' },
      });
      expect(fileOrigin.status).toBe(403);

      await studio.shutdown();
    } finally {
      rmSync(uiDistDir, { recursive: true, force: true });
    }
  });
});
