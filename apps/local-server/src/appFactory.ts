import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { getCodexWsUrl, getEnvLocalPath, getSettings, hasEnvLocalFile } from './config';
import { resolveCodexInvocation } from './codexExecutable';
import { createCatalogCommands } from './catalogCommands';
import { createCatalogRoutes } from './catalogRoutes';
import { createDefaultCatalogStore, type StudioCatalogStore } from './catalogStore';
import { createDefaultDbStore, type StudioDbStore } from './dbStore';
import { getSettingValue, setSettingValue } from './db';
import { publishEvent, subscribeEvents } from './events';
import { initStudio } from './init';
import { inspectLibrary, resolvePublicLibraryPath, toPublicAssetUrl } from './library';
import { listLibraries, registerLibrary, removeLibrary, setDefaultLibrary } from './libraries';
import { log } from './logger';
import {
  readEditableStudioSettings,
  updateEditableStudioSettings,
  type StudioSettingsStorage,
} from './studioSettingsStore';
import { createWorkerController, type WorkerController, type WorkerStatus } from './worker';
import { resolveJobCatalogContext } from './workerCatalogContext';
import { resolveWorkerRuntimeTarget } from './workerRouting';
import { getCodexAccountStatus } from './codex/accountStatus';
import {
  ensureAppServer,
  getAppServerDiagnostics,
  isAppServerRunning,
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
import { createOutputSourceRoutes } from './outputSourceRoutes';
import { createProviderRoutes } from './providerRoutes';
import { createSettingsRoutes } from './settingsRoutes';
import { createCodexRoutes } from './codexRoutes';
import { createLibrariesRoutes, type LibrariesRoutesDependencies } from './librariesRoutes';
import { createProjectRoutes } from './projectRoutes';
import { createJobRoutes } from './jobRoutes';
import { createAssetLogRoutes } from './assetLogRoutes';
import { createRuntimeRoutes } from './runtimeRoutes';
import { createStudioControlRoutes } from './studioControlRoutes';
import { createMaintenanceRoutes } from './maintenanceRoutes';
import { createEventStreamRoutes } from './eventStreamRoutes';
import { createLibraryRoutes } from './libraryRoutes';
import { createReferenceRoutes } from './referenceRoutes';
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
    ensureAppServer?: (reason?: AppServerEnsureReason) => void;
    getAppServerDiagnostics?: typeof getAppServerDiagnostics;
    isAppServerRunning?: typeof isAppServerRunning;
    allowedOrigins?: string[];
    libraryRoutes?: Partial<LibrariesRoutesDependencies>;
    workspaceRoutes?: Partial<WorkspaceRoutesDependencies>;
    catalogStore?: StudioCatalogStore;
    dbStore?: StudioDbStore;
    settingsStorage?: StudioSettingsStorage;
    worker?: Pick<
      WorkerController,
      'cancelQueuedOrRunningJob' | 'enqueueJob' | 'getWorkerStatus' | 'resetWorkerState'
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
  const ensureLocalAppServer = options.dependencies?.ensureAppServer ?? ensureAppServer;
  const readAppServerDiagnostics =
    options.dependencies?.getAppServerDiagnostics ?? getAppServerDiagnostics;
  const isLocalAppServerRunning = options.dependencies?.isAppServerRunning ?? isAppServerRunning;
  const dbStore = options.dependencies?.dbStore ?? (await createDefaultDbStore());
  const catalogStore = options.dependencies?.catalogStore ?? (await createDefaultCatalogStore());
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
      resolveCodexInvocation,
      getCodexWsUrl,
      getEnvLocalPath,
      hasEnvLocalFile,
      ensureAppServer: ensureLocalAppServer,
      readAppServerDiagnostics,
      isAppServerRunning: isLocalAppServerRunning,
      readWorkerStatus: () => workerController.getWorkerStatus(),
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
      readCodexAccountStatus: getCodexAccountStatus,
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
    '/api/projects',
    createProjectRoutes({
      listProjects: () => dbStore.listProjects(),
      createProject: (name, description) => dbStore.createProject(name, description),
      publishEvent,
      logProjectCreated: (projectName) =>
        appLogger('info', 'api', `Project created: ${projectName}`),
    }),
  );

  app.route(
    '/api/jobs',
    createJobRoutes({
      listJobs: () => dbStore.listJobSummaries?.() ?? dbStore.listJobs(),
      getJob: (jobId) => dbStore.getJob(jobId),
      getJobDetail,
      cancelQueuedOrRunningJob: (jobId) => workerController.cancelQueuedOrRunningJob(jobId),
      ensureDefaultProjectId: () => dbStore.ensureDefaultProject().id,
      createJobId: () => randomUUID(),
      createJob: (input) =>
        dbStore.createJob({
          id: input.id,
          projectId: input.projectId,
          kind: input.kind,
          providerId: input.providerId,
          sourceSpec: input.sourceSpec,
          prompt: input.prompt,
          execution: input.execution,
        }),
      updateJobFinalPrompt: (jobId, finalPrompt) =>
        dbStore.updateJobFinalPrompt(jobId, finalPrompt),
      processReferences: (jobId, prompt, references, libraryDir) =>
        processReferences(jobId, prompt, references ?? [], libraryDir),
      hydrateSourceSpecAssetPaths: (sourceSpec, references, persistedRefs, libraryDir) =>
        hydrateSourceSpecAssetPaths(
          sourceSpec,
          references ?? [],
          persistedRefs as ProcessedReference[],
          libraryDir,
        ),
      readLibraryDir: () => getSettings().libraryDir,
      resolveProviderExecutionBlocker: (providerId) => {
        const capabilityReport = readProviderCapabilities(
          readEditableStudioSettings(settingsStorage),
        );
        return getProviderExecutionBlocker(capabilityReport, providerId);
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
      readLibraryDir: () => getSettings().libraryDir,
      toPublicAssetUrl,
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
    }),
  );

  app.route(
    '/',
    createLibraryRoutes({
      resolvePublicLibraryPath,
      ensureThumbnailVariant,
      buildLibraryAssetHeaders,
      resolveAssetCacheSeconds,
      resolveThumbnailMaxEdge,
      logger: appLogger,
    }),
  );

  return {
    app,
    config: getSettings(),
    initResult: initResult ?? ({} as ReturnType<typeof initStudio>),
    worker: workerController.getWorkerStatus(),
    workerController,
    async shutdown() {},
  };
}
