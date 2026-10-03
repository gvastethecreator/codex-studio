import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { getCodexWsUrl, getEnvLocalPath, getSettings, hasEnvLocalFile } from './config';
import { readCodexRuntimeDoctor } from './codexRuntimeDoctor';
import { isCodexHttpCredentialReady } from './auth/tokens';
import {
  grokOnboardingFactsFromDoctor,
  readGrokRuntimeDoctor,
  type GrokRuntimeDoctorReport,
} from './grokRuntimeDoctor';
import {
  readAntigravityRuntimeDoctor,
  type AntigravityRuntimeDoctorReport,
} from './antigravityRuntimeDoctor';
import { createCatalogCommands } from './catalogCommands';
import { createCatalogRoutes } from './catalogRoutes';
import { createImageConversionRoutes } from './imageConversionRoutes';
import { updateCatalogImageFileSize } from './catalog';
import { createDefaultCatalogStore, type StudioCatalogStore } from './catalogStore';
import { listAssets } from './db/assets';
import { listLogs } from './db/events';
import {
  createJob,
  getJob,
  getJobStatus,
  listJobSummaries,
  requeueJob,
  updateJobFinalPrompt,
} from './db/jobs';
import { getSettingValue, setSettingValue } from './db/settings';
import { ensureDefaultWorkspace, listWorkspaces } from './db/workspaces';
import { workspaceOutputSlugMap } from './outputOrganization';
import { sanitizeEditableStudioSettingsPatch } from '../../../packages/shared/src/studioSettings';
import { validateOutputTemplate } from '../../../packages/shared/src/outputLayout';
import { getCurrentEventRevision, publishEvent, subscribeEvents } from './events';
import { initStudio } from './init';
import { inspectLibrary, resolvePublicLibraryPath, toPublicAssetUrl } from './library';
import {
  getDefaultLibrary,
  listLibraries,
  registerLibrary,
  registerOutputDirectory,
  getLibrary,
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
import { getAccountSession } from './codex/chatgptAccountHttp';
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
import { resolveBootstrapProviderExecutionOptions } from './providers/providerExecutionDefaults';
import { readGenerationProviderRuntimePreflights } from './providers/runtimeConfig';
import { createOutputSourceRoutes } from './outputSourceRoutes';
import { createProviderRoutes } from './providerRoutes';
import { findWorkflowModuleForApiPath } from '../../../packages/shared/src/workflowModules';
import { createSettingsRoutes } from './settingsRoutes';
import { createSubscriptionAuthRoutes } from './auth/authRoutes';
import { createCodexRoutes } from './codexRoutes';
import { createLibrariesRoutes, type LibrariesRoutesDependencies } from './librariesRoutes';

import { createJobRoutes } from './jobRoutes';
import { jobBatchStore } from './db/jobBatches';
import { createAssetLogRoutes } from './assetLogRoutes';
import { createCheckingRuntimeReport, createRuntimeRoutes } from './runtimeRoutes';
import { createStudioControlRoutes } from './studioControlRoutes';
import { createRepositoryUpdates } from './repositoryUpdates';
import { createRepositoryUpdateRoutes } from './repositoryUpdateRoutes';
import { listRecoverableJobs } from './db/jobs';
import { createMaintenanceRoutes } from './maintenanceRoutes';
import { createEventStreamRoutes } from './eventStreamRoutes';
import { createLibraryRoutes } from './libraryRoutes';
import { createReferenceRoutes } from './referenceRoutes';
import { createUserStyleRoutes } from './userStyleRoutes';
import { createExtensionRoutes } from './extensionRoutes';
import {
  createGitHubExtensionSourceClient,
  resolveRemoteExtensionSources,
  type ExtensionSourceClient,
} from './extensionSources';
import {
  createExtensionStore,
  resolveExtensionInstallDir,
  resolveExtensionSources,
  type ExtensionStore,
} from './extensionStore';
import { createSpriteAtlasRoutes } from './spriteAtlasRoutes';
import { createSpriteAtlasService } from './spriteAtlasService';
import { createSpriteAtlasRunParticipant } from './spriteAtlasRunReconciler';
import { createAnimationSequenceRoutes } from './animationSequenceRoutes';
import { createAnimationSequenceService } from './animationSequenceService';
import { createAnimationSequenceRunParticipant } from './animationSequenceRunReconciler';
import { createWorkflowRunReconciler } from './workflowRunReconciler';
import { createStudioReadinessLifecycle } from './studioReadinessLifecycle';
import { createDefaultUserStyleStore } from './sqliteUserStyles';
import type { UserStyleStore } from './userStyles';
import { createLocalApiSecurityMiddleware } from './localApiSecurity';
import { createUiStaticHandler, resolveUiDistDir, uiDistIsReady } from './uiStaticRoutes';
import type {
  AppServerEnsureReason,
  CodexModelCatalogResponse,
  Job,
  LocalCodexSessionResponse,
} from '../../../packages/shared/src';

export interface StudioAppInstance {
  app: Hono;
  config: ReturnType<typeof getSettings>;
  initResult: ReturnType<typeof initStudio>;
  worker: WorkerStatus;
  workerController: WorkerController;
  /** Repairs workflow runs at startup, before recoverable jobs are scheduled. */
  reconcileWorkflowRuns(recoverableJobs: Job[]): Promise<void>;
  shutdown(): Promise<void>;
}

export interface StudioJobStore {
  createJob: typeof createJob;
  updateJobFinalPrompt: typeof updateJobFinalPrompt;
  requeueJob: typeof requeueJob;
  getJob: typeof getJob;
  getJobStatus: typeof getJobStatus;
  listJobSummaries: typeof listJobSummaries;
}

export interface StudioAssetStore {
  listAssets: typeof listAssets;
}

export interface StudioLogStore {
  listLogs: typeof listLogs;
}

const defaultJobStore: StudioJobStore = {
  createJob,
  updateJobFinalPrompt,
  requeueJob,
  getJob,
  getJobStatus,
  listJobSummaries,
};
const defaultAssetStore: StudioAssetStore = { listAssets };
const defaultLogStore: StudioLogStore = { listLogs };

export interface CreateStudioAppOptions {
  runInit?: boolean;
  restart?: () => void;
  dependencies?: {
    readLocalCodexSession?: () => Promise<LocalCodexSessionResponse>;
    readCodexModelCatalog?: () => Promise<CodexModelCatalogResponse>;
    readCodexRuntimeDoctor?: typeof readCodexRuntimeDoctor;
    readGrokRuntimeDoctor?: () => GrokRuntimeDoctorReport;
    readAntigravityRuntimeDoctor?: () => AntigravityRuntimeDoctorReport;
    ensureAppServer?: (reason?: AppServerEnsureReason) => void;
    stopAppServer?: typeof stopAppServer;
    getAppServerDiagnostics?: typeof getAppServerDiagnostics;
    isAppServerRunning?: typeof isAppServerRunning;
    allowedOrigins?: string[];
    uiDistDir?: string | null;
    libraryRoutes?: Partial<LibrariesRoutesDependencies>;
    workspaceRoutes?: Partial<WorkspaceRoutesDependencies>;
    catalogStore?: StudioCatalogStore;
    jobStore?: StudioJobStore;
    assetStore?: StudioAssetStore;
    logStore?: StudioLogStore;
    userStyleStore?: UserStyleStore;
    extensionStore?: ExtensionStore;
    extensionSourceClient?: ExtensionSourceClient;
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
  const readLocalCodexSession = options.dependencies?.readLocalCodexSession ?? getAccountSession;
  const readCodexModelCatalog = options.dependencies?.readCodexModelCatalog ?? getCodexModelCatalog;
  const readCodexRuntimeDoctorFn =
    options.dependencies?.readCodexRuntimeDoctor ?? readCodexRuntimeDoctor;
  const readGrokRuntimeDoctorFn =
    options.dependencies?.readGrokRuntimeDoctor ?? readGrokRuntimeDoctor;
  const readAntigravityRuntimeDoctorFn =
    options.dependencies?.readAntigravityRuntimeDoctor ?? readAntigravityRuntimeDoctor;
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
  const jobStore = options.dependencies?.jobStore ?? defaultJobStore;
  const assetStore = options.dependencies?.assetStore ?? defaultAssetStore;
  const logStore = options.dependencies?.logStore ?? defaultLogStore;
  const catalogStore = options.dependencies?.catalogStore ?? (await createDefaultCatalogStore());
  const userStyleStore = options.dependencies?.userStyleStore ?? createDefaultUserStyleStore();
  const extensionStore =
    options.dependencies?.extensionStore ?? createExtensionStore(resolveExtensionSources());
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

  let activeMutations = 0;
  const updates = createRepositoryUpdates({
    restart: options.restart,
    isBusy: () => activeMutations > 0 || listRecoverableJobs().length > 0,
  });
  app.use('/api/*', async (c, next) => {
    if (
      ['GET', 'HEAD', 'OPTIONS'].includes(c.req.method) ||
      c.req.path.startsWith('/api/updates')
    ) {
      return next();
    }
    if (updates.blocksMutations())
      return c.json(
        { error: 'Studio update is incomplete. Finish it in Settings before continuing.' },
        503,
      );
    activeMutations += 1;
    try {
      await next();
    } finally {
      activeMutations -= 1;
    }
  });
  app.route('/api/updates', createRepositoryUpdateRoutes(updates));

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
      readGrokOnboardingFacts: () => grokOnboardingFactsFromDoctor(readGrokRuntimeDoctorFn()),
      readEditableSettings: () => readEditableStudioSettings(settingsStorage),
    }),
  );

  app.route('/api/auth', createSubscriptionAuthRoutes());

  app.route(
    '/api/settings',
    createSettingsRoutes({
      readSettings: () => readEditableStudioSettings(settingsStorage),
      updateSettings: (patch) => {
        const input = sanitizeEditableStudioSettingsPatch(patch);
        const rawTemplate = (patch as { outputOrganization?: { fileNameTemplate?: string } })
          .outputOrganization?.fileNameTemplate;
        if (rawTemplate !== undefined) {
          const error = validateOutputTemplate(rawTemplate);
          if (error) throw new Error(error);
        }
        const destination =
          input.outputDirectory === undefined
            ? undefined
            : input.outputDirectory
              ? registerOutputDirectory(input.outputDirectory)
              : null;
        return updateEditableStudioSettings(
          settingsStorage,
          patch,
          new Date().toISOString(),
          destination,
        );
      },
    }),
  );

  app.route(
    '/api/providers',
    createProviderRoutes({
      readSettings: () => readEditableStudioSettings(settingsStorage),
      readCodexRuntimeDoctor: () =>
        readiness.readSnapshot().codexRuntime ?? createCheckingRuntimeReport(),
      readGrokRuntimeDoctor: readGrokRuntimeDoctorFn,
      readAntigravityRuntimeDoctor: readAntigravityRuntimeDoctorFn,
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
    '/api/extensions',
    createExtensionRoutes({
      store: extensionStore,
      remote: {
        client: options.dependencies?.extensionSourceClient ?? createGitHubExtensionSourceClient(),
        sources: resolveRemoteExtensionSources(),
        installDir: resolveExtensionInstallDir(),
      },
      defaultPackId: process.env.STUDIO_DEFAULT_STYLE_PACK?.trim() || 'cozy.pack-00',
    }),
  );
  app.route(
    '/api/styles',
    createUserStyleRoutes({
      store: userStyleStore,
      publishEvent,
    }),
  );

  const readLibraryContext = (workspaceId?: string) => {
    const library = getDefaultLibrary();
    const settings = readEditableStudioSettings(settingsStorage);
    const destination = settings.outputDirectoryId ? getLibrary(settings.outputDirectoryId) : null;
    if (settings.outputDirectoryId && !destination)
      throw new Error(
        'The selected output directory is no longer registered. Choose it again in Settings.',
      );
    return {
      libraryId: library.id,
      rootPath: library.path,
      output: destination ? { libraryId: destination.id, rootPath: destination.path } : undefined,
      outputOrganization: structuredClone(settings.outputOrganization),
      workspaceSlug: workspaceOutputSlugMap(listWorkspaces()).get(workspaceId ?? 'default'),
      sourceRoots: listLibraries().map((entry) => ({
        rootPath: entry.path,
        outputOnly: entry.kind === 'output',
      })),
    };
  };

  // Routes of a turned-off workflow module answer 404 until the user turns it back on.
  app.use('/api/*', async (c, next) => {
    const workflowModule = findWorkflowModuleForApiPath(c.req.path);
    if (
      workflowModule &&
      readEditableStudioSettings(settingsStorage).disabledWorkflowModules.includes(
        workflowModule.id,
      )
    )
      return c.json(
        {
          error: `${workflowModule.title} is turned off. Turn it on in Settings, Extensions.`,
          code: 'workflow_module_disabled',
          moduleId: workflowModule.id,
        },
        404,
      );
    return next();
  });

  // One service per workflow: its run locks belong to that instance, so the
  // routes and the run reconciler must share it.
  const workflowServiceOptions = {
    readLibraryDir: () => getDefaultLibrary().path,
    readOutputContext: readLibraryContext,
    getCatalogImage: (imageId: string) => catalogStore.getCatalogImage(imageId),
  };
  const spriteAtlasService = createSpriteAtlasService(workflowServiceOptions);
  const animationSequenceService = createAnimationSequenceService(workflowServiceOptions);
  const workflowRuns = createWorkflowRunReconciler({
    participants: [
      createSpriteAtlasRunParticipant(spriteAtlasService),
      createAnimationSequenceRunParticipant(animationSequenceService),
    ],
    getJob: (jobId) => jobStore.getJob(jobId),
    logger: appLogger,
    publishEvent,
  });
  const unsubscribeWorkflowRuns = subscribeEvents(workflowRuns.onStudioEvent);

  app.route(
    '/api/sprite-atlas',
    createSpriteAtlasRoutes({ ...workflowServiceOptions, service: spriteAtlasService }),
  );

  app.route(
    '/api/animation-sequence',
    createAnimationSequenceRoutes({ ...workflowServiceOptions, service: animationSequenceService }),
  );

  app.route(
    '/api/jobs',
    createJobRoutes({
      listJobs: (query) => jobStore.listJobSummaries(query),
      getJob: (jobId) => jobStore.getJob(jobId),
      getJobStatus: (jobId) => jobStore.getJobStatus(jobId),
      getJobDetail,
      requeueJob: (jobId, expected) => jobStore.requeueJob(jobId, undefined, expected),
      batchStore: jobBatchStore,
      cancelQueuedOrRunningJob: (jobId) => workerController.cancelQueuedOrRunningJob(jobId),
      ensureDefaultWorkspaceId: () => ensureDefaultWorkspace()?.id ?? 'default',
      createJobId: () => randomUUID(),
      createJob: (input) =>
        jobStore.createJob({
          id: input.id,
          workspaceId: input.workspaceId,
          kind: input.kind,
          providerId: input.providerId,
          sourceSpec: input.sourceSpec,
          prompt: input.prompt,
          execution: input.execution,
          libraryContext: input.libraryContext,
        }),
      updateJobFinalPrompt: (jobId, finalPrompt) =>
        jobStore.updateJobFinalPrompt(jobId, finalPrompt),
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
      readLibraryContext,
      readEditableSettings: () => readEditableStudioSettings(settingsStorage),
      resolveBootstrapExecution: (providerId) =>
        resolveBootstrapProviderExecutionOptions(providerId, process.env, {
          grokRuntime: readGrokRuntimeDoctorFn(),
        }),
      readGrokAvailableModels: () => readGrokRuntimeDoctorFn().availableModels,
      readCodexTransportAvailability: () => ({
        codex_app_server: readCodexRuntimeDoctorFn().canRunJobs,
        subscription_http: isCodexHttpCredentialReady(),
      }),
      resolveProviderExecutionBlocker: async (providerId) => {
        const codexRuntime =
          providerId === 'codex'
            ? (await readiness.refresh({ reason: 'passive' })).codexRuntime
            : readiness.readSnapshot().codexRuntime;
        const evaluatedCodexRuntime = codexRuntime ?? readCodexRuntimeDoctorFn();
        const grokRuntime = readGrokRuntimeDoctorFn();
        const antigravityRuntime = readAntigravityRuntimeDoctorFn();
        const runtimePreflights = readGenerationProviderRuntimePreflights(
          process.env,
          evaluatedCodexRuntime,
          grokRuntime,
          antigravityRuntime,
        );
        const capabilityReport = readProviderCapabilities(
          readEditableStudioSettings(settingsStorage),
          process.env,
          evaluatedCodexRuntime,
          grokRuntime,
          undefined,
          antigravityRuntime,
          runtimePreflights,
        );
        return getProviderExecutionBlocker(capabilityReport, providerId, runtimePreflights);
      },
      isReferenceProcessingError: (error): error is ReferenceProcessingError =>
        error instanceof ReferenceProcessingError,
      publishEvent,
      logJobCreated: (kind, jobId) => appLogger('info', 'api', `Job created: ${kind}`, jobId),
      enqueueJob: (job) => workerController.enqueueJob(job),
      validateDispatch: (spec) => workflowRuns.validateDispatch(spec),
      onJobsAccepted: (jobs) => workflowRuns.jobsAccepted(jobs),
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
      listAssets: () => assetStore.listAssets(),
      listLogs: () => logStore.listLogs(),
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
      getJob,
      updateCatalogImageFileSize,
    }),
  );

  app.route(
    '/api/catalog',
    createImageConversionRoutes({
      catalogStore,
      getLibrary,
      getJob,
      readLibraryContext,
      readLibraryDir: () => getDefaultLibrary().path,
      publishEvent,
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

  const uiDistDir =
    options.dependencies?.uiDistDir === undefined
      ? resolveUiDistDir()
      : options.dependencies.uiDistDir;
  if (uiDistDir && uiDistIsReady(uiDistDir)) {
    app.on(['GET', 'HEAD'], '*', createUiStaticHandler({ rootDir: uiDistDir }));
  }

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
    reconcileWorkflowRuns: (recoverableJobs) => workflowRuns.recover(recoverableJobs),
    shutdown() {
      if (!shutdownPromise) {
        shutdownPromise = (async () => {
          readiness.dispose();
          unsubscribeWorkflowRuns();
          const results = await Promise.allSettled([
            Promise.resolve()
              .then(() => workerController.shutdown())
              .finally(() => workflowRuns.drain()),
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
