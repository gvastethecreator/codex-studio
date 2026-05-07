import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getSettings } from './config';
import { registerCatalogImage } from './catalog';
import { addAsset, addJobEvent, getJob, updateJobStatus, upsertCodexTurn } from './db';
import { publishEvent } from './events';
import { resolveLibraryPath, toPublicAssetUrl } from './library';
import { log } from './logger';
import { createCodexTurn } from './codex';
import { embedMetadata } from './metadataEmbedder';
import type { Job } from '../../../packages/shared/src';

const runningJobs = new Set<string>();
const jobQueue: Job[] = [];
let activeWorkerCount = 0;
const codexTurn = createCodexTurn();

function getMaxConcurrentJobs() {
  return getSettings().codexMaxConcurrentJobs;
}

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
  const catalogImage = registerCatalogImage({
    filePath: asset.filePath,
    thumbnailPath: asset.thumbnailPath,
    prompt: asset.prompt,
    width: asset.width,
    height: asset.height,
    mimeType: asset.mimeType,
    fileSizeBytes: statSync(asset.filePath).size,
    jobId: asset.jobId,
    workspaceId: asset.projectId,
  });
  addJobEvent(job.id, 'asset.created', 'Dry run asset created.', { assetId: asset.id });
  publishEvent('asset.created', asset);
  publishEvent('catalog.created', catalogImage);
  updateJobStatus(job.id, 'completed');
  publishEvent('job.completed', getJob(job.id));
  log('info', 'worker', `Dry run job completed. Asset: ${path.basename(asset.filePath)}`, job.id);
}

async function runCodexJob(job: Job) {
  addJobEvent(job.id, 'codex.started', 'Codex image generation started.');
  log('info', 'worker', 'Codex imagegen job started.', job.id);
  const turnRecordId = upsertCodexTurn({ jobId: job.id, status: 'running' });
  const result = await codexTurn.runTurn({
    jobId: job.id,
    projectId: job.projectId,
    prompt: job.finalPromptUsed,
  });

  upsertCodexTurn({
    id: turnRecordId,
    jobId: job.id,
    codexThreadId: result.threadId,
    codexTurnId: result.turnId,
    transcriptPath: result.transcript,
    status: result.assets.length > 0 ? 'completed' : 'needs_review',
  });

  const discoveredImagePath = result.assets[0]?.sourcePath ?? null;
  if (!discoveredImagePath) {
    updateJobStatus(job.id, 'needs_review');
    publishEvent('job.progress', getJob(job.id));
    log(
      'warn',
      'worker',
      `Codex turn completed but no image file was discovered. Transcript: ${result.transcript}`,
      job.id,
    );
    return;
  }

  const ext = path.extname(discoveredImagePath).toLowerCase();
  const mimeType =
    ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
  const asset = addAsset({
    projectId: job.projectId,
    jobId: job.id,
    filePath: discoveredImagePath,
    thumbnailPath: null,
    publicUrl: toPublicAssetUrl(discoveredImagePath),
    prompt: job.finalPromptUsed,
    width: null,
    height: null,
    mimeType,
  });
  const catalogImage = registerCatalogImage({
    filePath: asset.filePath,
    thumbnailPath: asset.thumbnailPath,
    prompt: asset.prompt,
    width: asset.width,
    height: asset.height,
    mimeType: asset.mimeType,
    fileSizeBytes: statSync(asset.filePath).size,
    jobId: asset.jobId,
    workspaceId: asset.projectId,
  });
  void embedMetadata(asset.filePath, {
    prompt: job.finalPromptUsed,
    aspectRatio: job.finalPromptUsed.match(/Aspect ratio:\s*([0-9]+:[0-9]+)/)?.[1] ?? null,
    imageSize: job.finalPromptUsed.match(/ImageGen output size:\s*([^\n]+)/)?.[1]?.trim() ?? null,
    model: 'codex-imagegen',
    batchId: job.id,
    generatedAt: new Date().toISOString(),
    studioVersion: '0.0.0',
    libraryId: catalogImage.libraryId,
    catalogId: catalogImage.id,
  }).catch((error) => {
    log(
      'warn',
      'metadata',
      `Metadata embed failed: ${error instanceof Error ? error.message : String(error)}`,
      job.id,
    );
  });

  addJobEvent(job.id, 'asset.created', 'Codex image asset imported.', { assetId: asset.id });
  publishEvent('asset.created', asset);
  publishEvent('catalog.created', catalogImage);
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

export function getWorkerStatus() {
  return {
    maxConcurrentJobs: getMaxConcurrentJobs(),
    activeWorkerCount,
    queuedJobs: jobQueue.length,
    trackedJobs: runningJobs.size,
  };
}

async function processQueue() {
  while (activeWorkerCount < getMaxConcurrentJobs() && jobQueue.length > 0) {
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
      throw new Error('Unsupported job kind received by worker');
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
