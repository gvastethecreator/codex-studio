import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { getCodexWsUrl, getEnvLocalPath, getSettings, hasEnvLocalFile } from './config';
import { readCodexRuntimeDoctor } from './codexRuntimeDoctor';
import { createCatalogCommands } from './catalogCommands';
import { createCatalogRoutes } from './catalogRoutes';
import { createDefaultCatalogStore, type StudioCatalogStore } from './catalogStore';
import { createDefaultDbStore, type StudioDbStore } from './dbStore';
import { ensureDefaultWorkspace, getSettingValue, setSettingValue } from './db';
import { getCurrentEventRevision, publishEvent, subscribeEvents } from './events';
import { initStudio } from './init';
import { inspectLibrary, resolvePublicLibraryPath, toPublicAssetUrl } from './library';
import {
  getDefaultLibrary,
  listLibraries,
  registerLibrary,
  removeLibrary,
  resolvePublicLibraryAssetRequest,
  setDefaultLibrary,
} from './libraries';
import { log } from './logger';
import {
  readEditableStudioSettings,
  updateEditableStudioSettings,
  type StudioSettingsStorage,
} from './studioSettingsStore';
import { createWorkerController, type WorkerController, type WorkerStatus } from './worker';
import { resolveJobCatalogContext } from './workerCatalogContext';
import { resolveWorkerRuntimeTarget } from './workerRouting';
import {
  ensureAppServer,
  getAppServerDiagnostics,
  isAppServerRunning,
  stopAppServer,
} from './codex/processSupervisor';
import { getCodexModelCatalog } from './codex/modelCatalog';
import { getLocalCodexSession } from './codex/localCodexSession';
import { embedMetadata } from './metadataEmbedder';
import { getJobDetail } from './jobDetails';
import {
  hydrateSourceSpecAssetPaths,
  processReferences,
  type ProcessedReference,
  ReferenceProcessingError,
} from './referenceManager';
import { createWorkspaceRoutes, type WorkspaceRoutesDependencies } from './workspaceRoutes';
import { resetStudioData } from './reset';
import {
  buildLibraryAssetHeaders,
  ensureThumbnailVariant,
  resolveAssetCacheSeconds,
  resolveThumbnailMaxEdge,
} from './libraryAssetVariants';
import { getProviderExecutionBlocker, readProviderCapabilities } from './providerCapabilities';
import {
  getExternalProviderRuntimePreflight,
  readGenerationProviderRuntimePreflights,
} from './providers/runtimeConfig';
import { createOutputSourceRoutes } from './outputSourceRoutes';
import { createProviderRoutes } from './providerRoutes';
import { createSettingsRoutes } from './settingsRoutes';
import { createCodexRoutes } from './codexRoutes';
import { createLibrariesRoutes, type LibrariesRoutesDependencies } from './librariesRoutes';

import { createJobRoutes } from './jobRoutes';
import { createAssetLogRoutes } from './assetLogRoutes';
import { createCheckingRuntimeReport, createRuntimeRoutes } from './runtimeRoutes';
import { createStudioControlRoutes } from './studioControlRoutes';
import { createMaintenanceRoutes } from './maintenanceRoutes';
import { createEventStreamRoutes } from './eventStreamRoutes';
import { createLibraryRoutes } from './libraryRoutes';
import { createReferenceRoutes } from './referenceRoutes';
import { createUserStyleRoutes } from './userStyleRoutes';
import { createSpriteAtlasRoutes } from './spriteAtlasRoutes';
import { createAnimationSequenceRoutes } from './animationSequenceRoutes';
import { createStudioReadinessLifecycle } from './studioReadinessLifecycle';
import { createDefaultUserStyleStore } from './sqliteUserStyles';
import type { UserStyleStore } from './userStyles';
import { createLocalApiSecurityMiddleware } from './localApiSecurity';
import type {
  AppServerEnsureReason,
  CodexModelCatalogResponse,
  LocalCodexSessionResponse,
} from '../../../packages/shared/src';

export interface StudioAppInstance {
  app: Hono;
  config: ReturnType<typeof getSettings>;
  initResult: ReturnType<typeof initStudio>;
  worker: WorkerStatus;
  workerController: WorkerController;
  shutdown(): Promise<void>;
}

export interface CreateStudioAppOptions {
  runInit?: boolean;
  dependencies?: {
    readLocalCodexSession?: () => Promise<LocalCodexSessionResponse>;
    readCodexModelCatalog?: () => Promise<CodexModelCatalogResponse>;
    readCodexRuntimeDoctor?: typeof readCodexRuntimeDoctor;
    ensureAppServer?: (reason?: AppServerEnsureReason) => void;
    stopAppServer?: typeof stopAppServer;
    getAppServerDiagnostics?: typeof getAppServerDiagnostics;
    isAppServerRunning?: typeof isAppServerRunning;
    allowedOrigins?: string[];
    libraryRoutes?: Partial<LibrariesRoutesDependencies>;
    workspaceRoutes?: Partial<WorkspaceRoutesDependencies>;
    catalogStore?: StudioCatalogStore;
    dbStore?: StudioDbStore;
    userStyleStore?: UserStyleStore;
    settingsStorage?: StudioSettingsStorage;
    worker?: Pick<
      WorkerController,
      | 'cancelQueuedOrRunningJob'
      | 'enqueueJob'
      | 'getWorkerStatus'
      | 'resetWorkerState'
      | 'shutdown'
    >;
    logger?: typeof log;
  };
}

export async function createStudioApp(
  options: CreateStudioAppOptions = {},
): Promise<StudioAppInstance> {
  const initResult = options.runInit === false ? null : initStudio();
  const app = new Hono();
  const readLocalCodexSession = options.dependencies?.readLocalCodexSession ?? getLocalCodexSession;
  const readCodexModelCatalog = options.dependencies?.readCodexModelCatalog ?? getCodexModelCatalog;
  const readCodexRuntimeDoctorFn =
    options.dependencies?.readCodexRuntimeDoctor ?? readCodexRuntimeDoctor;
  const ensureLocalAppServer = options.dependencies?.ensureAppServer ?? ensureAppServer;
  const stopLocalAppServer = options.dependencies?.stopAppServer ?? stopAppServer;
  const readAppServerDiagnostics =
    options.dependencies?.getAppServerDiagnostics ?? getAppServerDiagnostics;
  const isLocalAppServerRunning = options.dependencies?.isAppServerRunning ?? isAppServerRunning;
  const readiness = createStudioReadinessLifecycle({
    isAppServerRunning: isLocalAppServerRunning,
    readLocalCodexSession,
    probeCodexRuntime: options.dependencies?.readCodexRuntimeDoctor
      ? async () => readCodexRuntimeDoctorFn()
      : undefined,
  });
  const dbStore = options.dependencies?.dbStore ?? (await createDefaultDbStore());
  const catalogStore = options.dependencies?.catalogStore ?? (await createDefaultCatalogStore());
  const userStyleStore = options.dependencies?.userStyleStore ?? createDefaultUserStyleStore();
  const appLogger = options.dependencies?.logger ?? log;
  const settingsStorage = options.dependencies?.settingsStorage ?? {
    getSetting: getSettingValue,
    setSetting: setSettingValue,
  };
  const workerController =
    options.dependencies?.worker ??
    createWorkerController({
      logger: appLogger,
      readEditableStudioSettings,
      resolveJobCatalogContext,
      resolveWorkerRuntimeTarget,
    });
  const catalogCommands = createCatalogCommands({
    listCatalogImageIds: (...args) => catalogStore.listCatalogImageIds(...args),
    updateCatalogImage: (...args) => catalogStore.updateCatalogImage(...args),
    softDeleteCatalogImage: (...args) => catalogStore.softDeleteCatalogImage(...args),
    restoreCatalogImage: (...args) => catalogStore.restoreCatalogImage(...args),
    purgeCatalogImage: (...args) => catalogStore.purgeCatalogImage(...args),
    publishEvent,
  });

  app.use(
    '*',
    createLocalApiSecurityMiddleware({ allowedOrigins: options.dependencies?.allowedOrigins }),
  );

  app.route(
    '/api',
    createRuntimeRoutes({
      readSettings: getSettings,
      inspectLibrary,
      readCodexRuntimeDoctor: readCodexRuntimeDoctorFn,
      getCodexWsUrl,
      getEnvLocalPath,
      hasEnvLocalFile,
      ensureAppServer: ensureLocalAppServer,
      readAppServerDiagnostics,
      isAppServerRunning: isLocalAppServerRunning,
      readWorkerStatus: () => workerController.getWorkerStatus(),
      readiness,
    }),
  );

  app.route(
    '/api/settings',
    createSettingsRoutes({
      readSettings: () => readEditableStudioSettings(settingsStorage),
      updateSettings: (patch) => updateEditableStudioSettings(settingsStorage, patch),
    }),
  );

  app.route(
    '/api/providers',
    createProviderRoutes({
      readSettings: () => readEditableStudioSettings(settingsStorage),
      readCodexRuntimeDoctor: () =>
        readiness.readSnapshot().codexRuntime ?? createCheckingRuntimeReport(),
    }),
  );

  app.route(
    '/api/output-sources',
    createOutputSourceRoutes({
      settingsStorage,
      readSettings: () => readEditableStudioSettings(settingsStorage),
      readConfig: getSettings,
      registerCatalogImage: (...args) => catalogStore.registerCatalogImage(...args),
      ensureThumbnailVariant,
      publishEvent,
    }),
  );

  app.route(
    '/api/codex',
    createCodexRoutes({
      readCodexModelCatalog,
      readLocalCodexSession,
    }),
  );

  app.route(
    '/api/studio',
    createStudioControlRoutes({
      resetStudioData,
      worker: workerController,
    }),
  );

  app.route('/api/maintenance', createMaintenanceRoutes());
  app.route(
    '/api/styles',
    createUserStyleRoutes({
      store: userStyleStore,
      publishEvent,
    }),
  );

  app.route(
    '/api/sprite-atlas',
    createSpriteAtlasRoutes({
      readLibraryDir: () => getDefaultLibrary().path,
    }),
  );

  app.route(
    '/api/animation-sequence',
    createAnimationSequenceRoutes({
      readLibraryDir: () => getDefaultLibrary().path,
      getCatalogImage: (imageId) => catalogStore.getCatalogImage(imageId),
    }),
  );

  // Project routes retired: Workspace is the organization authority.
  app.all('/api/projects', (c) =>
    c.json(
      {
        error: 'Projects API removed',
        code: 'projects_retired',
        reason: 'Use /api/workspaces. Workspace is the durable organization authority.',
      },
      410,
    ),
  );
  app.all('/api/projects/*', (c) =>
    c.json(
      {
        error: 'Projects API removed',
        code: 'projects_retired',
        reason: 'Use /api/workspaces. Workspace is the durable organization authority.',
      },
      410,
    ),
  );

  app.route(
    '/api/jobs',
    createJobRoutes({
      listJobs: () => dbStore.listJobSummaries(),
      getJob: (jobId) => dbStore.getJob(jobId),
      getJobDetail,
      requeueJob: (jobId) => dbStore.requeueJob(jobId),
      cancelQueuedOrRunningJob: (jobId) => workerController.cancelQueuedOrRunningJob(jobId),
      ensureDefaultWorkspaceId: () => ensureDefaultWorkspace()?.id ?? 'default',
      createJobId: () => randomUUID(),
      createJob: (input) =>
        dbStore.createJob({
          id: input.id,
          projectId: input.projectId ?? null,
          workspaceId: input.workspaceId,
          kind: input.kind,
          providerId: input.providerId,
          sourceSpec: input.sourceSpec,
          prompt: input.prompt,
          execution: input.execution,
          libraryContext: input.libraryContext,
        }),
      updateJobFinalPrompt: (jobId, finalPrompt) =>
        dbStore.updateJobFinalPrompt(jobId, finalPrompt),
      processReferences: (jobId, prompt, references, libraryDir) =>
        processReferences(jobId, prompt, references ?? [], libraryDir),
      hydrateSourceSpecAssetPaths: (
        sourceSpec,
        references,
        persistedRefs,
        libraryDir,
        libraryContext,
      ) =>
        hydrateSourceSpecAssetPaths(
          sourceSpec,
          references ?? [],
          persistedRefs as ProcessedReference[],
          libraryDir,
          libraryContext?.libraryId,
        ),
      readLibraryDir: () => getDefaultLibrary().path,
      readLibraryContext: () => {
        const library = getDefaultLibrary();
        return { libraryId: library.id, rootPath: library.path };
      },
      readEditableSettings: () => readEditableStudioSettings(settingsStorage),
      resolveProviderExecutionBlocker: async (providerId) => {
        const codexRuntime =
          providerId === 'codex'
            ? (await readiness.refresh({ reason: 'passive' })).codexRuntime
            : readiness.readSnapshot().codexRuntime;
        const capabilityReport = readProviderCapabilities(
          readEditableStudioSettings(settingsStorage),
          process.env,
          codexRuntime ?? undefined,
        );
        const runtimePreflights =
          providerId === 'codex' && codexRuntime
            ? readGenerationProviderRuntimePreflights(process.env, codexRuntime)
            : [getExternalProviderRuntimePreflight(providerId)].filter(
                (preflight) => preflight !== null,
              );
        return getProviderExecutionBlocker(capabilityReport, providerId, runtimePreflights);
      },
      isReferenceProcessingError: (error): error is ReferenceProcessingError =>
        error instanceof ReferenceProcessingError,
      publishEvent,
      logJobCreated: (kind, jobId) => appLogger('info', 'api', `Job created: ${kind}`, jobId),
      enqueueJob: (job) => workerController.enqueueJob(job),
    }),
  );

  app.route(
    '/api/references',
    createReferenceRoutes({
      createHandoffId: () => `handoff-${randomUUID()}`,
      processReferences: (handoffId, prompt, references, libraryDir) =>
        processReferences(handoffId, prompt, references, libraryDir),
      readLibraryDir: () => getDefaultLibrary().path,
      toPublicAssetUrl: (filePath) => {
        const library = getDefaultLibrary();
        return toPublicAssetUrl(filePath, { libraryId: library.id, rootPath: library.path });
      },
      isReferenceProcessingError: (error): error is ReferenceProcessingError =>
        error instanceof ReferenceProcessingError,
    }),
  );

  app.route(
    '/api',
    createAssetLogRoutes({
      listAssets: () => dbStore.listAssets(),
      listLogs: () => dbStore.listLogs(),
    }),
  );

  const libraryRouteDependencies: LibrariesRoutesDependencies = {
    listLibraries,
    registerLibrary,
    setDefaultLibrary,
    removeLibrary,
    publishEvent,
    ...options.dependencies?.libraryRoutes,
  };
  app.route('/api/libraries', createLibrariesRoutes(libraryRouteDependencies));

  app.route(
    '/api/catalog',
    createCatalogRoutes({
      catalogStore,
      catalogCommands,
      embedMetadata,
    }),
  );

  app.route('/api/workspaces', createWorkspaceRoutes(options.dependencies?.workspaceRoutes));

  app.route(
    '/api',
    createEventStreamRoutes({
      subscribeEvents,
      readEventRevision: getCurrentEventRevision,
    }),
  );

  app.route(
    '/',
    createLibraryRoutes({
      resolvePublicLibraryPath,
      resolvePublicLibraryAssetRequest,
      ensureThumbnailVariant,
      buildLibraryAssetHeaders,
      resolveAssetCacheSeconds,
      resolveThumbnailMaxEdge,
      logger: appLogger,
    }),
  );

  void readiness.refresh({ reason: 'startup' }).catch((error) => {
    appLogger(
      'warn',
      'runtime',
      `Studio Readiness startup refresh failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  });

  let shutdownPromise: Promise<void> | null = null;

  return {
    app,
    config: getSettings(),
    initResult: initResult ?? ({} as ReturnType<typeof initStudio>),
    worker: workerController.getWorkerStatus(),
    workerController,
    shutdown() {
      if (!shutdownPromise) {
        shutdownPromise = (async () => {
          readiness.dispose();
          const results = await Promise.allSettled([
            Promise.resolve().then(() => workerController.shutdown()),
            Promise.resolve().then(() => stopLocalAppServer()),
          ]);
          const failures = results.flatMap((result) =>
            result.status === 'rejected' ? [result.reason] : [],
          );
          if (failures.length > 0) {
            throw new AggregateError(failures, 'Studio shutdown did not complete cleanly.');
          }
        })();
      }
      return shutdownPromise;
    },
  };
}
