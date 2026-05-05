import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getCodexWsUrl, getSettings } from './config';
import { resolveCodexInvocation } from './codexExecutable';
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
import { resolveLibraryPath } from './library';
import { log } from './logger';
import { enqueueJob } from './worker';
import { ensureAppServer, isAppServerRunning } from './codexClient';
import type { CreateJobRequest } from '../../../packages/shared/src';

const initResult = initStudio();
const app = new Hono();

app.use('*', cors());

app.get('/api/health', (c) => {
  const [command, ...args] = resolveCodexInvocation(['--version']);
  const codex = spawnSync(command, args, { encoding: 'utf8' });
  return c.json({
    ok: true,
    libraryDir: getSettings().libraryDir,
    codexCli: {
      available: codex.status === 0,
      version: codex.status === 0 ? codex.stdout.trim() : null,
    },
    appServer: {
      running: isAppServerRunning(),
      wsUrl: getCodexWsUrl(),
    },
  });
});

app.post('/api/app-server/start', (c) => {
  ensureAppServer();
  return c.json({ running: isAppServerRunning(), wsUrl: getCodexWsUrl() });
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
  const queuedJob = updateJobFinalPrompt(job.id, buildPromptWithReferences(prompt, persistJobReferences(job.id, body.references || []))) || job;
  publishEvent('job.created', queuedJob);
  log('info', 'api', `Job created: ${queuedJob.kind}`, queuedJob.id);
  enqueueJob(queuedJob);
  return c.json(queuedJob, 201);
});

app.get('/api/assets', (c) => c.json(listAssets()));

app.get('/api/logs', (c) => c.json(listLogs()));

app.get('/api/events', (c) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      send({ type: 'server.connected', payload: { ok: true }, createdAt: new Date().toISOString() });
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

function safeReferenceName(name: string, index: number) {
  const parsed = path.parse(name || `reference-${index + 1}.png`);
  const base = (parsed.name || `reference-${index + 1}`).replace(/[^a-z0-9._-]+/gi, '-').slice(0, 80);
  const ext = parsed.ext && /^\.[a-z0-9]+$/i.test(parsed.ext) ? parsed.ext.toLowerCase() : '.png';
  return `${base || `reference-${index + 1}`}${ext}`;
}

function persistJobReferences(jobId: string, references: NonNullable<CreateJobRequest['references']>) {
  if (references.length === 0) return [];
  const saved: { name: string; filePath: string; strength: number }[] = [];
  const referencesDir = resolveLibraryPath('references', jobId);
  mkdirSync(referencesDir, { recursive: true });

  for (const [index, reference] of references.entries()) {
    const match = /^data:(image\/(?:png|jpe?g|webp|gif|svg\+xml));base64,(.+)$/i.exec(reference.dataUrl);
    if (!match) continue;
    const fileName = safeReferenceName(reference.name, index);
    const filePath = path.join(referencesDir, fileName);
    const bytes = Buffer.from(match[2], 'base64');
    writeFileSync(filePath, bytes);
    saved.push({ name: reference.name || fileName, filePath, strength: reference.strength });
  }

  if (saved.length > 0) {
    log('info', 'api', `Stored ${saved.length} reference image(s).`, jobId);
  }
  return saved;
}

function buildPromptWithReferences(prompt: string, references: { name: string; filePath: string; strength: number }[]) {
  if (references.length === 0) return prompt;
  const referenceBlock = references
    .map((reference, index) => `${index + 1}. ${reference.filePath} (${reference.name}, strength ${reference.strength.toFixed(2)})`)
    .join('\n');
  return `${prompt}

Use these local reference image files as visual context for the requested image. Respect the strength value as the visual influence for each reference:
${referenceBlock}`;
}

app.get('/library/*', async (c) => {
  const encoded = c.req.path.replace('/library/', '');
  const relative = decodeURIComponent(encoded);
  if (relative.includes('..')) return c.notFound();
  const filePath = resolveLibraryPath(...relative.split('/'));
  if (!existsSync(filePath)) return c.notFound();
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    ext === '.svg' ? 'image/svg+xml; charset=utf-8'
      : ext === '.png' ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
          : ext === '.webp' ? 'image/webp'
            : 'application/octet-stream';
  return new Response(Bun.file(filePath), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    },
  });
});

const port = getSettings().serverPort;

log('info', 'server', `Local server starting on http://localhost:${port}. Library: ${initResult.settings.libraryDir}`);

Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`Codex Image Studio local-server listening on http://localhost:${port}`);
