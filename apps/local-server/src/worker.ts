import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { addAsset, addJobEvent, getJob, updateJobStatus, upsertCodexTurn } from './db';
import { publishEvent } from './events';
import { resolveLibraryPath, toPublicAssetUrl } from './library';
import { log } from './logger';
import { runCodexImagegenJob } from './codexClient';
import type { Job } from '../../../packages/shared/src';

const runningJobs = new Set<string>();
const jobQueue: Job[] = [];
let activeWorkerCount = 0;
const maxConcurrentJobs = Number(process.env.STUDIO_MAX_CONCURRENT_CODEX_JOBS || 4);

function svgForPrompt(prompt: string) {
  const safePrompt = prompt
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .slice(0, 180);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#101113"/>
  <rect x="48" y="48" width="1104" height="704" rx="24" fill="#181b20" stroke="#3b3f46" stroke-width="2"/>
  <text x="88" y="130" fill="#f4f4f5" font-family="Arial, sans-serif" font-size="44" font-weight="700">Codex Image Studio Dry Run</text>
  <text x="88" y="205" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="24">Local pipeline verified: DB, assets, logs and SSE.</text>
  <foreignObject x="88" y="280" width="980" height="220">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: #e4e4e7; font-size: 30px; line-height: 1.35;">${safePrompt}</div>
  </foreignObject>
  <circle cx="1000" cy="590" r="80" fill="#f59e0b"/>
  <rect x="800" y="550" width="340" height="120" rx="18" fill="#27272a"/>
  <text x="835" y="625" fill="#fafafa" font-family="Arial, sans-serif" font-size="28">asset placeholder</text>
</svg>`;
}

function createDryRunAsset(job: Job) {
  mkdirSync(resolveLibraryPath('assets'), { recursive: true });
  const filePath = resolveLibraryPath('assets', `${job.id}-dry-run.svg`);
  writeFileSync(filePath, svgForPrompt(job.finalPromptUsed), 'utf8');
  return addAsset({
    projectId: job.projectId,
    jobId: job.id,
    filePath,
    thumbnailPath: null,
    publicUrl: toPublicAssetUrl(filePath),
    prompt: job.finalPromptUsed,
    width: 1200,
    height: 800,
    mimeType: 'image/svg+xml',
  });
}

async function runDryJob(job: Job) {
  addJobEvent(job.id, 'dry_run.started', 'Dry run asset creation started.');
  log('info', 'worker', 'Dry run job started.', job.id);
  await Bun.sleep(500);
  const asset = createDryRunAsset(job);
  addJobEvent(job.id, 'asset.created', 'Dry run asset created.', { assetId: asset.id });
  publishEvent('asset.created', asset);
  updateJobStatus(job.id, 'completed');
  publishEvent('job.completed', getJob(job.id));
  log('info', 'worker', `Dry run job completed. Asset: ${path.basename(asset.filePath)}`, job.id);
}

async function runCodexJob(job: Job) {
  addJobEvent(job.id, 'codex.started', 'Codex image generation started.');
  log('info', 'worker', 'Codex imagegen job started.', job.id);
  const turnRecordId = upsertCodexTurn({ jobId: job.id, status: 'running' });
  const result = await runCodexImagegenJob({
    id: job.id,
    projectId: job.projectId,
    prompt: job.finalPromptUsed,
  });

  upsertCodexTurn({
    id: turnRecordId,
    jobId: job.id,
    codexThreadId: result.codexThreadId,
    codexTurnId: result.codexTurnId,
    transcriptPath: result.transcriptPath,
    status: result.discoveredImagePath ? 'completed' : 'needs_review',
  });

  if (!result.discoveredImagePath) {
    updateJobStatus(job.id, 'needs_review');
    publishEvent('job.progress', getJob(job.id));
    log('warn', 'worker', `Codex turn completed but no image file was discovered. Transcript: ${result.transcriptPath}`, job.id);
    return;
  }

  const ext = path.extname(result.discoveredImagePath).toLowerCase();
  const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
  const asset = addAsset({
    projectId: job.projectId,
    jobId: job.id,
    filePath: result.discoveredImagePath,
    thumbnailPath: null,
    publicUrl: toPublicAssetUrl(result.discoveredImagePath),
    prompt: job.finalPromptUsed,
    width: null,
    height: null,
    mimeType,
  });

  addJobEvent(job.id, 'asset.created', 'Codex image asset imported.', { assetId: asset.id });
  publishEvent('asset.created', asset);
  updateJobStatus(job.id, 'completed');
  publishEvent('job.completed', getJob(job.id));
  log('info', 'worker', `Codex job completed. Asset: ${path.basename(asset.filePath)}`, job.id);
}

export function enqueueJob(job: Job) {
  if (runningJobs.has(job.id)) return;
  runningJobs.add(job.id);
  jobQueue.push(job);
  queueMicrotask(processQueue);
}

async function processQueue() {
  while (activeWorkerCount < maxConcurrentJobs && jobQueue.length > 0) {
    const job = jobQueue.shift();
    if (!job) continue;

    activeWorkerCount += 1;
    queueMicrotask(async () => {
      try {
        await processJob(job);
      } finally {
        activeWorkerCount -= 1;
        queueMicrotask(processQueue);
      }
    });
  }
}

async function processJob(job: Job) {
    try {
      updateJobStatus(job.id, 'running');
      publishEvent('job.running', getJob(job.id));
      if (job.kind === 'dry_run') {
        await runDryJob(job);
      } else if (job.kind === 'codex_imagegen') {
        await runCodexJob(job);
      } else {
        throw new Error(`Unsupported job kind: ${job.kind}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      updateJobStatus(job.id, 'failed', message);
      publishEvent('job.failed', getJob(job.id));
      log('error', 'worker', message, job.id);
    } finally {
      runningJobs.delete(job.id);
    }
}
