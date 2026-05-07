import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getCodexWsUrl, getEnvLocalPath, getSettings, hasEnvLocalFile } from './config';
import { resolveCodexInvocation } from './codexExecutable';
import {
  getCatalogImage,
  queryCatalog,
  restoreCatalogImage,
  softDeleteCatalogImage,
  updateCatalogImage,
} from './catalog';
import {
  createJob,
  createProject,
  ensureDefaultProject,
  listAssets,
  listJobs,
  listLogs,
  listProjects,
  updateJobFinalPrompt,
} from './db';
import { publishEvent, subscribeEvents } from './events';
import { initStudio } from './init';
import { inspectLibrary, resolveLibraryPath } from './library';
import { listLibraries, registerLibrary, removeLibrary, setDefaultLibrary } from './libraries';
import { log } from './logger';
import { enqueueJob, getWorkerStatus } from './worker';
import { ensureAppServer, getAppServerDiagnostics, isAppServerRunning } from './codex';
import { embedMetadata } from './metadataEmbedder';
import { processReferences, ReferenceProcessingError } from './referenceManager';
import { createWorkspaceRoutes } from './workspaceRoutes';
import type { CreateJobRequest } from '../../../packages/shared/src';

export interface StudioAppInstance {
  app: Hono;
  config: ReturnType<typeof getSettings>;
  initResult: ReturnType<typeof initStudio>;
  worker: ReturnType<typeof getWorkerStatus>;
  shutdown(): Promise<void>;
}

export interface CreateStudioAppOptions {
  runInit?: boolean;
}

export async function createStudioApp(
  options: CreateStudioAppOptions = {},
): Promise<StudioAppInstance> {
  const initResult = options.runInit === false ? null : initStudio();
  const app = new Hono();

  app.use('*', cors());

  app.get('/api/health', (c) => {
    const settings = getSettings();
    const library = inspectLibrary();
    const [command, ...args] = resolveCodexInvocation(['--version']);
    const codex = spawnSync(command, args, { encoding: 'utf8' });
    const codexAvailable = codex.status === 0;
    const appServerDiagnostics = getAppServerDiagnostics();
    const libraryReady = library.exists && library.writable && library.missingFolders.length === 0;
    const appServerRunning = isAppServerRunning();

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
      },
      checks: {
        libraryReady,
        codexReady: codexAvailable,
        onboardingReady: libraryReady && codexAvailable && appServerRunning,
      },
      worker: getWorkerStatus(),
    });
  });

  app.post('/api/app-server/start', (c) => {
    ensureAppServer();
    const diagnostics = getAppServerDiagnostics();
    return c.json({
      running: isAppServerRunning(),
      wsUrl: getCodexWsUrl(),
      pid: diagnostics.pid,
      lastStartError: diagnostics.lastStartError,
    });
  });

  app.get('/api/settings', (c) => c.json(getSettings()));

  app.get('/api/projects', (c) => c.json(listProjects()));

  app.post('/api/projects', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const project = createProject(body.name || 'Untitled Project', body.description || null);
    publishEvent('project.created', project);
    log('info', 'api', `Project created: ${project.name}`);
    return c.json(project, 201);
  });

  app.get('/api/jobs', (c) => c.json(listJobs()));

  app.post('/api/jobs', async (c) => {
    const body = (await c.req.json()) as CreateJobRequest;
    const projectId = body.projectId || ensureDefaultProject().id;
    const prompt = body.prompt?.trim();
    if (!prompt) return c.json({ error: 'Prompt is required' }, 400);
    const job = createJob({ projectId, kind: body.kind, prompt });
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
    const queuedJob = updateJobFinalPrompt(job.id, finalPrompt) || job;
    publishEvent('job.created', queuedJob);
    log('info', 'api', `Job created: ${queuedJob.kind}`, queuedJob.id);
    enqueueJob(queuedJob);
    return c.json(queuedJob, 201);
  });

  app.get('/api/assets', (c) => c.json(listAssets()));

  app.get('/api/logs', (c) => c.json(listLogs()));

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
    const image = updateCatalogImage(c.req.param('id'), {
      isFavorite: body.isFavorite,
      tags: body.tags,
      workspaceId: body.workspaceId,
    });
    if (!image) return c.json({ error: 'Catalog image not found' }, 404);
    publishEvent('catalog.updated', image);
    return c.json(image);
  });

  app.delete('/api/catalog/:id', (c) => {
    const image = softDeleteCatalogImage(c.req.param('id'));
    if (!image) return c.json({ error: 'Catalog image not found' }, 404);
    publishEvent('catalog.updated', image);
    return c.json(image);
  });

  app.post('/api/catalog/:id/restore', (c) => {
    const image = restoreCatalogImage(c.req.param('id'));
    if (!image) return c.json({ error: 'Catalog image not found' }, 404);
    publishEvent('catalog.updated', image);
    return c.json(image);
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
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const send = (event: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };
        send({
          type: 'server.connected',
          payload: { ok: true },
          createdAt: new Date().toISOString(),
        });
        const unsubscribe = subscribeEvents(send);
        c.req.raw.signal.addEventListener('abort', () => {
          unsubscribe();
          controller.close();
        });
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
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
    worker: getWorkerStatus(),
    async shutdown() {},
  };
}
