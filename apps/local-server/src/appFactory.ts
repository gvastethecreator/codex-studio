import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { streamSSE } from 'hono/streaming';
import { getCodexWsUrl, getEnvLocalPath, getSettings, hasEnvLocalFile } from './config';
import { resolveCodexInvocation } from './codexExecutable';
import {
  getCatalogImage,
  purgeCatalogImage,
  queryCatalog,
  registerCatalogImage,
  restoreCatalogImage,
  softDeleteCatalogImage,
  updateCatalogImage,
} from './catalog';
import { createCatalogCommands } from './catalogCommands';
import { createDefaultDbStore, type StudioDbStore } from './dbStore';
import { getSettingValue, setSettingValue } from './db';
import { publishEvent, subscribeEvents } from './events';
import { initStudio } from './init';
import { inspectLibrary, resolveLibraryPath } from './library';
import { listLibraries, registerLibrary, removeLibrary, setDefaultLibrary } from './libraries';
import { log } from './logger';
import {
  readEditableStudioSettings,
  updateEditableStudioSettings,
  type StudioSettingsStorage,
} from './studioSettingsStore';
import type { WorkerController, WorkerStatus } from './worker';
import {
  getCodexAccountStatus,
  ensureAppServer,
  getAppServerDiagnostics,
  getCodexModelCatalog,
  getLocalCodexSession,
  isAppServerRunning,
} from './codex';
import { embedMetadata } from './metadataEmbedder';
import { getJobDetail } from './jobDetails';
import { processReferences, ReferenceProcessingError } from './referenceManager';
import { createWorkspaceRoutes } from './workspaceRoutes';
import { resetStudioData } from './reset';
import {
  detectExternalOutputSourceCandidates,
  importExternalOutputSourceFiles,
  listExternalOutputSourceFiles,
  readExternalOutputSourceRegistry,
  registerExternalOutputSource,
} from './outputSources';
import type {
  AppServerEnsureReason,
  CodexModelCatalogResponse,
  CreateJobRequest,
  LocalCodexSessionResponse,
} from '../../../packages/shared/src';

export interface StudioAppInstance {
  app: Hono;
  config: ReturnType<typeof getSettings>;
  initResult: ReturnType<typeof initStudio>;
  worker: WorkerStatus;
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
    dbStore?: StudioDbStore;
    settingsStorage?: StudioSettingsStorage;
    worker?: Pick<WorkerController, 'cancelQueuedOrRunningJob' | 'enqueueJob' | 'getWorkerStatus'>;
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
  const settingsStorage = options.dependencies?.settingsStorage ?? {
    getSetting: getSettingValue,
    setSetting: setSettingValue,
  };
  const workerController =
    options.dependencies?.worker ?? (await import('./worker')).getDefaultWorkerController();
  const catalogCommands = createCatalogCommands({
    updateCatalogImage,
    softDeleteCatalogImage,
    restoreCatalogImage,
    purgeCatalogImage,
    publishEvent,
  });

  app.use('*', cors());

  app.get('/api/health', (c) => {
    const settings = getSettings();
    const library = inspectLibrary();
    const [command, ...args] = resolveCodexInvocation(['--version']);
    const codex = spawnSync(command, args, { encoding: 'utf8' });
    const codexAvailable = codex.status === 0;
    const appServerDiagnostics = readAppServerDiagnostics();
    const libraryReady = library.exists && library.writable && library.missingFolders.length === 0;
    const appServerRunning = isLocalAppServerRunning();

    return c.json({
      ok: true,
      checkedAt: new Date().toISOString(),
      libraryDir: settings.libraryDir,
      runtime: {
        platform: process.platform,
        arch: process.arch,
        bunVersion: Bun.version,
        nodeVersion: process.versions.node,
        cwd: process.cwd(),
        envLocalPath: getEnvLocalPath(),
        envLocalPresent: hasEnvLocalFile(),
      },
      config: {
        serverPort: settings.serverPort,
        codexWsPort: settings.codexWsPort,
      },
      library: {
        exists: library.exists,
        writable: library.writable,
        readmePresent: library.readmePresent,
        missingFolders: library.missingFolders,
      },
      codexCli: {
        available: codexAvailable,
        version: codexAvailable ? codex.stdout.trim() : null,
        command: [command, ...args].join(' '),
      },
      appServer: {
        running: appServerRunning,
        wsUrl: getCodexWsUrl(),
        pid: appServerDiagnostics.pid,
        lastExitCode: appServerDiagnostics.lastExitCode,
        lastExitAt: appServerDiagnostics.lastExitAt,
        lastInvocation: appServerDiagnostics.lastInvocation?.join(' ') ?? null,
        lastStartAt: appServerDiagnostics.lastStartAt,
        lastStartError: appServerDiagnostics.lastStartError,
        lastEnsureAt: appServerDiagnostics.lastEnsureAt,
        lastEnsureReason: appServerDiagnostics.lastEnsureReason,
      },
      checks: {
        libraryReady,
        codexReady: codexAvailable,
        onboardingReady: libraryReady && codexAvailable && appServerRunning,
      },
      worker: workerController.getWorkerStatus(),
    });
  });

  app.post('/api/app-server/start', (c) => {
    ensureLocalAppServer('user');
    const diagnostics = readAppServerDiagnostics();
    return c.json({
      running: isLocalAppServerRunning(),
      wsUrl: getCodexWsUrl(),
      pid: diagnostics.pid,
      lastStartError: diagnostics.lastStartError,
    });
  });

  app.get('/api/bootstrap-config', (c) => c.json(getSettings()));

  app.get('/api/settings', (c) => c.json(readEditableStudioSettings(settingsStorage)));

  app.patch('/api/settings', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    return c.json(updateEditableStudioSettings(settingsStorage, body));
  });

  app.get('/api/output-sources', (c) => {
    const settings = readEditableStudioSettings(settingsStorage);
    return c.json({
      registry: readExternalOutputSourceRegistry(settingsStorage),
      candidates: detectExternalOutputSourceCandidates({
        libraryDir: getSettings().libraryDir,
        settings,
      }),
    });
  });

  app.post('/api/output-sources', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const result = registerExternalOutputSource({
      storage: settingsStorage,
      libraryDir: getSettings().libraryDir,
      input: body,
    });

    if (!result.ok) {
      return c.json({ error: result.reason }, 400);
    }

    publishEvent('output-source.registered', result.source);
    return c.json(result.source, 201);
  });

  app.get('/api/output-sources/:id/files', (c) => {
    const url = new URL(c.req.url);
    const result = listExternalOutputSourceFiles({
      storage: settingsStorage,
      sourceId: c.req.param('id'),
      limit: Number(url.searchParams.get('limit') || 100),
    });
    if (!result.ok) return c.json({ error: result.reason }, 404);
    return c.json({ source: result.source, files: result.files });
  });

  app.post('/api/output-sources/:id/import', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const result = importExternalOutputSourceFiles({
      storage: settingsStorage,
      sourceId: c.req.param('id'),
      libraryDir: getSettings().libraryDir,
      input: body,
      registerCatalogImage,
    });
    if (!result.ok) return c.json({ error: result.reason }, 400);
    publishEvent('output-source.imported', result.result);
    return c.json(result.result, 201);
  });

  app.get('/api/codex/models', async (c) => {
    return c.json(await readCodexModelCatalog());
  });

  app.get('/api/codex/session', async (c) => {
    return c.json(await readLocalCodexSession());
  });

  app.get('/api/codex/account', async (c) => {
    return c.json(await getCodexAccountStatus());
  });

  app.post('/api/studio/reset', async (c) => {
    return c.json(await resetStudioData());
  });

  app.get('/api/projects', (c) => c.json(dbStore.listProjects()));

  app.post('/api/projects', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const project = dbStore.createProject(
      body.name || 'Untitled Project',
      body.description || null,
    );
    publishEvent('project.created', project);
    log('info', 'api', `Project created: ${project.name}`);
    return c.json(project, 201);
  });

  app.get('/api/jobs', (c) => c.json(dbStore.listJobs()));

  app.get('/api/jobs/:id', async (c) => {
    const detail = await getJobDetail(c.req.param('id'));
    if (!detail) return c.json({ error: 'Job not found' }, 404);
    return c.json(detail);
  });

  app.post('/api/jobs/:id/cancel', (c) => {
    const jobId = c.req.param('id');
    const job = dbStore.getJob(jobId);
    if (!job) return c.json({ error: 'Job not found' }, 404);

    if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
      return c.json(job);
    }

    const updatedJob = workerController.cancelQueuedOrRunningJob(jobId);
    if (!updatedJob) {
      return c.json({ error: 'Job cannot be cancelled right now' }, 409);
    }

    return c.json(updatedJob);
  });

  app.post('/api/jobs', async (c) => {
    const body = (await c.req.json()) as CreateJobRequest;
    const projectId = body.projectId || dbStore.ensureDefaultProject().id;
    const prompt = (body.prompt || body.sourceSpec?.prompt || '').trim();
    if (!prompt) return c.json({ error: 'Prompt is required' }, 400);
    // Legacy clients may still post only { kind, prompt }. Keep the local runtime
    // Codex-first by normalizing those jobs onto the current provider boundary.
    const providerId =
      body.kind === 'dry_run'
        ? 'dry_run'
        : (body.providerId ?? body.sourceSpec?.providerId ?? 'codex');
    const sourceSpec = body.sourceSpec
      ? {
          ...body.sourceSpec,
          providerId: body.sourceSpec.providerId ?? providerId,
        }
      : null;
    const job = dbStore.createJob({
      projectId,
      kind: body.kind,
      providerId,
      sourceSpec,
      prompt,
      execution: body.execution ?? null,
    });
    let finalPrompt = prompt;
    try {
      finalPrompt = (
        await processReferences(job.id, prompt, body.references || [], getSettings().libraryDir)
      ).augmentedPrompt;
    } catch (error) {
      if (error instanceof ReferenceProcessingError) {
        return c.json(
          { error: error.message, referenceName: error.referenceName, reason: error.reason },
          400,
        );
      }
      throw error;
    }
    const queuedJob = dbStore.updateJobFinalPrompt(job.id, finalPrompt) || job;
    publishEvent('job.created', queuedJob);
    log('info', 'api', `Job created: ${queuedJob.kind}`, queuedJob.id);
    workerController.enqueueJob(queuedJob);
    return c.json(queuedJob, 201);
  });

  app.get('/api/assets', (c) => c.json(dbStore.listAssets()));

  app.get('/api/logs', (c) => c.json(dbStore.listLogs()));

  app.get('/api/libraries', (c) => c.json(listLibraries()));

  app.post('/api/libraries', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const library = registerLibrary({
      name: body.name || 'Untitled Library',
      path: body.path,
      isDefault: Boolean(body.isDefault),
    });
    publishEvent('library.created', library);
    return c.json(library, 201);
  });

  app.put('/api/libraries/:id/default', (c) => {
    const library = setDefaultLibrary(c.req.param('id'));
    if (!library) return c.json({ error: 'Library not found' }, 404);
    publishEvent('library.default', library);
    return c.json(library);
  });

  app.delete('/api/libraries/:id', (c) => {
    if (!removeLibrary(c.req.param('id')))
      return c.json({ error: 'Library not found or default library cannot be removed' }, 400);
    return c.json({ ok: true });
  });

  app.get('/api/catalog', (c) => {
    const url = new URL(c.req.url);
    return c.json(
      queryCatalog({
        libraryId: url.searchParams.get('library_id'),
        workspaceId: url.searchParams.get('workspace_id'),
        jobId: url.searchParams.get('job_id'),
        batchId: url.searchParams.get('batch_id'),
        favorite: url.searchParams.has('favorite')
          ? url.searchParams.get('favorite') === 'true'
          : undefined,
        isDeleted: url.searchParams.get('deleted') === 'true',
        q: url.searchParams.get('q'),
        offset: Number(url.searchParams.get('offset') || 0),
        limit: Number(url.searchParams.get('limit') || 50),
      }),
    );
  });

  app.route('/api/workspaces', createWorkspaceRoutes());

  app.get('/api/catalog/search', (c) => {
    const url = new URL(c.req.url);
    return c.json(
      queryCatalog({
        q: url.searchParams.get('q'),
        offset: Number(url.searchParams.get('offset') || 0),
        limit: Number(url.searchParams.get('limit') || 50),
      }),
    );
  });

  app.get('/api/catalog/:id', (c) => {
    const image = getCatalogImage(c.req.param('id'));
    if (!image) return c.json({ error: 'Catalog image not found' }, 404);
    return c.json(image);
  });

  app.patch('/api/catalog/:id', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const result = catalogCommands.update(c.req.param('id'), {
      isFavorite: body.isFavorite,
      tags: body.tags,
      workspaceId: body.workspaceId,
    });
    if (!result.ok) return c.json({ error: 'Catalog image not found' }, 404);
    return c.json(result.image);
  });

  app.delete('/api/catalog/:id', (c) => {
    const result = catalogCommands.softDelete(c.req.param('id'));
    if (!result.ok) return c.json({ error: 'Catalog image not found' }, 404);
    return c.json(result.image);
  });

  app.delete('/api/catalog/:id/permanent', (c) => {
    const result = catalogCommands.purge(c.req.param('id'));
    if (!result.ok) return c.json({ error: 'Catalog image not found' }, 404);
    return c.json(result.image);
  });

  app.post('/api/catalog/:id/restore', (c) => {
    const result = catalogCommands.restore(c.req.param('id'));
    if (!result.ok) return c.json({ error: 'Catalog image not found' }, 404);
    return c.json(result.image);
  });

  app.post('/api/catalog/:id/embed', async (c) => {
    const image = getCatalogImage(c.req.param('id'));
    if (!image) return c.json({ error: 'Catalog image not found' }, 404);
    const result = await embedMetadata(image.filePath, {
      prompt: image.prompt || '',
      negativePrompt: image.negativePrompt,
      aspectRatio: image.aspectRatio,
      imageSize: image.imageSize,
      model: 'codex-imagegen',
      recipe: image.recipeId,
      batchId: image.batchId,
      generatedAt: image.createdAt,
      studioVersion: '0.0.0',
      libraryId: image.libraryId,
      catalogId: image.id,
    });
    return c.json(result);
  });

  app.get('/api/events', (c) => {
    c.header('X-Accel-Buffering', 'no');

    return streamSSE(c, async (stream) => {
      let cleanedUp = false;

      const send = (event: unknown) => {
        void stream.writeSSE({
          data: JSON.stringify(event),
        });
      };

      const unsubscribe = subscribeEvents(send);

      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        unsubscribe();
      };

      const abort = () => {
        cleanup();
        if (!stream.aborted) {
          stream.abort();
        }
      };

      c.req.raw.signal.addEventListener('abort', abort, { once: true });

      try {
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'server.connected',
            payload: { ok: true },
            createdAt: new Date().toISOString(),
          }),
        });

        while (!stream.aborted) {
          await stream.sleep(10_000);
          if (stream.aborted) {
            break;
          }

          await stream.write(`: keep-alive ${Date.now()}\n\n`);
        }
      } finally {
        cleanup();
        c.req.raw.signal.removeEventListener('abort', abort);
      }
    });
  });

  app.get('/library/*', async (c) => {
    const encoded = c.req.path.replace('/library/', '');
    const relative = decodeURIComponent(encoded);
    if (relative.includes('..')) return c.notFound();
    const filePath = resolveLibraryPath(...relative.split('/'));
    if (!existsSync(filePath)) return c.notFound();
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === '.svg'
        ? 'image/svg+xml; charset=utf-8'
        : ext === '.png'
          ? 'image/png'
          : ext === '.jpg' || ext === '.jpeg'
            ? 'image/jpeg'
            : ext === '.webp'
              ? 'image/webp'
              : 'application/octet-stream';
    return new Response(Bun.file(filePath), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    });
  });

  return {
    app,
    config: getSettings(),
    initResult: initResult ?? ({} as ReturnType<typeof initStudio>),
    worker: workerController.getWorkerStatus(),
    async shutdown() {},
  };
}
