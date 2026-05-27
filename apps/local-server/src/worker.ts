import { existsSync, mkdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getSettings } from './config';
import { registerCatalogImage } from './catalog';
import {
  addAsset,
  addJobEvent,
  getJob,
  getSettingValue,
  setSettingValue,
  updateJobStatus,
  upsertCodexTurn,
} from './db';
import { publishEvent } from './events';
import { resolveLibraryPath, toPublicAssetUrl } from './library';
import { log } from './logger';
import { createCodexTurn } from './codex/turn';
import type { CodexTurn } from './codex/turn';
import { resolveJobExecutionOptions } from './codex/executionOptions';
import { createCodexGenerationProvider } from './providers/codexProvider';
import { createExternalGenerationProvider } from './providers/externalProvider';
import type { GenerationProvider } from './providers/types';
import { embedMetadata } from './metadataEmbedder';
import { parsePromptTransport } from '../../../packages/shared/src/promptTransport';
import type { Job } from '../../../packages/shared/src/types';
import { buildOutputAssetRelativePath } from './outputOrganization';
import { readEditableStudioSettings } from './studioSettingsStore';
import { resolveJobCatalogContext } from './workerCatalogContext';
import { resolveWorkerRuntimeTarget } from './workerRouting';

export interface WorkerStatus {
  maxConcurrentJobs: number;
  activeWorkerCount: number;
  queuedJobs: number;
  trackedJobs: number;
}

export interface WorkerController {
  enqueueJob(job: Job): void;
  cancelQueuedOrRunningJob(jobId: string): ReturnType<typeof getJob>;
  getWorkerStatus(): WorkerStatus;
  resetWorkerState(): Promise<void>;
}

export interface CreateWorkerControllerDependencies {
  createTurn?: () => CodexTurn;
  getSettings?: typeof getSettings;
  registerCatalogImage?: typeof registerCatalogImage;
  addAsset?: typeof addAsset;
  addJobEvent?: typeof addJobEvent;
  getJob?: typeof getJob;
  updateJobStatus?: typeof updateJobStatus;
  upsertCodexTurn?: typeof upsertCodexTurn;
  publishEvent?: typeof publishEvent;
  resolveLibraryPath?: typeof resolveLibraryPath;
  toPublicAssetUrl?: typeof toPublicAssetUrl;
  logger?: typeof log;
  resolveExecutionOptions?: typeof resolveJobExecutionOptions;
  embedMetadata?: typeof embedMetadata;
  parsePromptTransport?: typeof parsePromptTransport;
  createGenerationProvider?: () => GenerationProvider;
  createExternalProvider?: () => GenerationProvider;
}

function createAbortError() {
  const error = new Error('Operation cancelled by user');
  error.name = 'AbortError';
  return error;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw createAbortError();
  }
}

function waitWithAbort(durationMs: number, signal?: AbortSignal) {
  if (!signal) return Bun.sleep(durationMs);
  throwIfAborted(signal);

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, durationMs);

    const handleAbort = () => {
      clearTimeout(timeout);
      signal.removeEventListener('abort', handleAbort);
      reject(createAbortError());
    };

    signal.addEventListener('abort', handleAbort, { once: true });
  });
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
  <text x="88" y="130" fill="#f4f4f5" font-family="Arial, sans-serif" font-size="44" font-weight="700">Codex Studio Dry Run</text>
  <text x="88" y="205" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="24">Local pipeline verified: DB, assets, logs and SSE.</text>
  <foreignObject x="88" y="280" width="980" height="220">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: #e4e4e7; font-size: 30px; line-height: 1.35;">${safePrompt}</div>
  </foreignObject>
  <circle cx="1000" cy="590" r="80" fill="#f59e0b"/>
  <rect x="800" y="550" width="340" height="120" rx="18" fill="#27272a"/>
  <text x="835" y="625" fill="#fafafa" font-family="Arial, sans-serif" font-size="28">asset placeholder</text>
</svg>`;
}

function resolveUniquePath(filePath: string) {
  if (!existsSync(filePath)) return filePath;
  const parsed = path.parse(filePath);
  for (let index = 2; index < 1000; index += 1) {
    const candidate = path.join(parsed.dir, `${parsed.name}-${index}${parsed.ext}`);
    if (!existsSync(candidate)) return candidate;
  }
  return path.join(parsed.dir, `${parsed.name}-${Date.now()}${parsed.ext}`);
}

export function createWorkerController({
  createTurn = createCodexTurn,
  getSettings: getSettingsFn = getSettings,
  registerCatalogImage: registerCatalogImageFn = registerCatalogImage,
  addAsset: addAssetFn = addAsset,
  addJobEvent: addJobEventFn = addJobEvent,
  getJob: getJobFn = getJob,
  updateJobStatus: updateJobStatusFn = updateJobStatus,
  upsertCodexTurn: upsertCodexTurnFn = upsertCodexTurn,
  publishEvent: publishEventFn = publishEvent,
  resolveLibraryPath: resolveLibraryPathFn = resolveLibraryPath,
  toPublicAssetUrl: toPublicAssetUrlFn = toPublicAssetUrl,
  logger = log,
  resolveExecutionOptions = resolveJobExecutionOptions,
  embedMetadata: embedMetadataFn = embedMetadata,
  parsePromptTransport: parsePromptTransportFn = parsePromptTransport,
  createGenerationProvider,
  createExternalProvider,
}: CreateWorkerControllerDependencies = {}): WorkerController {
  const runningJobs = new Set<string>();
  const jobQueue: Job[] = [];
  const runningJobControllers = new Map<string, AbortController>();
  const activeJobPromises = new Map<string, Promise<void>>();
  let activeWorkerCount = 0;
  const codexGenerationProvider =
    createGenerationProvider?.() ?? createCodexGenerationProvider({ turn: createTurn() });
  const externalGenerationProvider =
    createExternalProvider?.() ?? createExternalGenerationProvider();

  function getMaxConcurrentJobs() {
    return getSettingsFn().codexMaxConcurrentJobs;
  }

  function resolveGeneratedAssetTargetPath(job: Job, providerId: string | null, extension: string) {
    const executionOptions = resolveExecutionOptions(job.execution);
    const settings = readEditableStudioSettings({
      getSetting: getSettingValue,
      setSetting: setSettingValue,
    });
    const relativePath = buildOutputAssetRelativePath(settings, {
      jobId: job.id,
      providerId,
      model: executionOptions.model,
      recipeId: job.sourceSpec?.recipeId ?? null,
      extension,
    });
    return resolveUniquePath(resolveLibraryPathFn(...relativePath.split(/[\\/]/)));
  }

  function organizeGeneratedAssetPath(job: Job, filePath: string, providerId: string | null) {
    const ext = path.extname(filePath).toLowerCase() || '.png';
    const targetPath = resolveGeneratedAssetTargetPath(job, providerId, ext);

    if (path.resolve(filePath) === path.resolve(targetPath)) return filePath;
    mkdirSync(path.dirname(targetPath), { recursive: true });
    if (existsSync(filePath)) {
      renameSync(filePath, targetPath);
      return targetPath;
    }
    return filePath;
  }

  function buildCatalogGenerationConfig(prompt: string) {
    const parsedPrompt = parsePromptTransportFn(prompt);
    const executionOptions = resolveExecutionOptions();

    return {
      prompt: parsedPrompt.prompt,
      recipeContext: parsedPrompt.recipeContext,
      recipeId: parsedPrompt.recipeId,
      recipeParams: null,
      attachments: [],
      aspectRatio: parsedPrompt.aspectRatio,
      imageSize: parsedPrompt.imageSize,
      negativePrompt: parsedPrompt.negativePrompt,
      temperature: 0.8,
      model: 'codex-imagegen',
      executionModel: executionOptions.model,
      executionReasoningEffort: executionOptions.reasoningEffort,
      executionSpeed: executionOptions.serviceTier ?? 'standard',
      batchCount: 1,
      useThinkingAndSearch: false,
    };
  }

  function buildCatalogGenerationConfigFromJob(job: Job) {
    if (job.sourceSpec) {
      const executionOptions = resolveExecutionOptions(job.execution);
      const recipeContext =
        typeof job.sourceSpec.metadata.recipeContext === 'string'
          ? job.sourceSpec.metadata.recipeContext
          : null;

      return {
        prompt: job.sourceSpec.prompt,
        recipeContext,
        recipeId: job.sourceSpec.recipeId,
        recipeParams: job.sourceSpec.recipeParams,
        attachments: job.sourceSpec.assets,
        aspectRatio: job.sourceSpec.output.aspectRatio,
        imageSize: job.sourceSpec.output.imageSize,
        negativePrompt: job.sourceSpec.negativePrompt,
        temperature: 0.8,
        model: 'codex-imagegen',
        executionModel: executionOptions.model,
        executionReasoningEffort: executionOptions.reasoningEffort,
        executionSpeed: executionOptions.serviceTier ?? 'standard',
        batchCount: job.sourceSpec.output.count,
        useThinkingAndSearch: false,
      };
    }

    const parsedPrompt = parsePromptTransportFn(job.finalPromptUsed);
    const executionOptions = resolveExecutionOptions(job.execution);

    return {
      prompt: parsedPrompt.prompt,
      recipeContext: parsedPrompt.recipeContext,
      recipeId: parsedPrompt.recipeId,
      recipeParams: null,
      attachments: [],
      aspectRatio: parsedPrompt.aspectRatio,
      imageSize: parsedPrompt.imageSize,
      negativePrompt: parsedPrompt.negativePrompt,
      temperature: 0.8,
      model: 'codex-imagegen',
      executionModel: executionOptions.model,
      executionReasoningEffort: executionOptions.reasoningEffort,
      executionSpeed: executionOptions.serviceTier ?? 'standard',
      batchCount: 1,
      useThinkingAndSearch: false,
    };
  }

  async function finalizeJobAsset(
    job: Job,
    catalogContext: ReturnType<typeof resolveJobCatalogContext>,
    discoveredImagePath: string,
    providerId: string,
    options: {
      logPrefix: string;
      embedMetadata?: boolean;
      executionOptions?: ReturnType<typeof resolveExecutionOptions>;
    },
  ) {
    const ext = path.extname(discoveredImagePath).toLowerCase();
    const mimeType =
      ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.webp'
          ? 'image/webp'
          : 'image/png';
    const organizedImagePath = organizeGeneratedAssetPath(job, discoveredImagePath, providerId);
    const asset = addAssetFn({
      projectId: job.projectId,
      jobId: job.id,
      filePath: organizedImagePath,
      thumbnailPath: null,
      publicUrl: toPublicAssetUrlFn(discoveredImagePath),
      prompt: job.finalPromptUsed,
      width: null,
      height: null,
      mimeType,
    });
    const parsedPrompt = job.sourceSpec
      ? {
          prompt: job.sourceSpec.prompt,
          negativePrompt: job.sourceSpec.negativePrompt,
          aspectRatio: job.sourceSpec.output.aspectRatio,
          imageSize: job.sourceSpec.output.imageSize,
          recipeId: job.sourceSpec.recipeId,
        }
      : parsePromptTransportFn(job.finalPromptUsed);
    const catalogImage = registerCatalogImageFn({
      filePath: asset.filePath,
      thumbnailPath: asset.thumbnailPath,
      prompt: asset.prompt,
      negativePrompt: parsedPrompt.negativePrompt || null,
      aspectRatio: parsedPrompt.aspectRatio,
      imageSize: parsedPrompt.imageSize,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
      fileSizeBytes: statSync(asset.filePath).size,
      jobId: asset.jobId,
      workspaceId: catalogContext.workspaceId,
      batchId: catalogContext.batchId,
      recipeId: parsedPrompt.recipeId,
      generationConfig: buildCatalogGenerationConfigFromJob(job),
    });

    if (options.embedMetadata && options.executionOptions) {
      void embedMetadataFn(asset.filePath, {
        prompt: job.finalPromptUsed,
        negativePrompt: parsedPrompt.negativePrompt || null,
        aspectRatio: parsedPrompt.aspectRatio,
        imageSize: parsedPrompt.imageSize,
        model: options.executionOptions.model,
        recipe: parsedPrompt.recipeId,
        batchId: catalogContext.batchId ?? job.id,
        generatedAt: new Date().toISOString(),
        studioVersion: '0.0.0',
        libraryId: catalogImage.libraryId,
        catalogId: catalogImage.id,
      }).catch((error) => {
        logger(
          'warn',
          'metadata',
          `Metadata embed failed: ${error instanceof Error ? error.message : String(error)}`,
          job.id,
        );
      });
    }

    addJobEventFn(job.id, 'asset.created', `${options.logPrefix} asset imported.`, {
      assetId: asset.id,
    });
    publishEventFn('asset.created', asset);
    publishEventFn('catalog.created', catalogImage);
    updateJobStatusFn(job.id, 'completed');
    publishEventFn('job.completed', getJobFn(job.id));
    logger(
      'info',
      'worker',
      `${options.logPrefix} job completed. Asset: ${path.basename(asset.filePath)}`,
      job.id,
    );
  }

  async function runDryJob(job: Job, signal?: AbortSignal) {
    const startedAt = Date.now();
    addJobEventFn(job.id, 'dry_run.started', 'Dry run asset creation started.');
    logger('info', 'worker', 'Dry run job started.', job.id);
    await waitWithAbort(500, signal);
    throwIfAborted(signal);

    const filePath = resolveGeneratedAssetTargetPath(job, 'dry_run', '.svg');
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, svgForPrompt(job.finalPromptUsed), 'utf8');
    const asset = addAssetFn({
      projectId: job.projectId,
      jobId: job.id,
      filePath,
      thumbnailPath: null,
      publicUrl: toPublicAssetUrlFn(filePath),
      prompt: job.finalPromptUsed,
      width: 1200,
      height: 800,
      mimeType: 'image/svg+xml',
    });
    const catalogContext = resolveJobCatalogContext(job);
    const parsedPrompt = parsePromptTransportFn(job.finalPromptUsed);
    const catalogImage = registerCatalogImageFn({
      filePath: asset.filePath,
      thumbnailPath: asset.thumbnailPath,
      prompt: asset.prompt,
      negativePrompt: parsedPrompt.negativePrompt || null,
      aspectRatio: parsedPrompt.aspectRatio,
      imageSize: parsedPrompt.imageSize,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
      fileSizeBytes: statSync(asset.filePath).size,
      jobId: asset.jobId,
      workspaceId: catalogContext.workspaceId,
      batchId: catalogContext.batchId,
      recipeId: parsedPrompt.recipeId,
      generationConfig: buildCatalogGenerationConfig(job.finalPromptUsed),
    });
    addJobEventFn(job.id, 'dry_run.completed', 'Dry run asset creation completed.', {
      durationMs: Date.now() - startedAt,
      assetCount: 1,
    });
    addJobEventFn(job.id, 'asset.created', 'Dry run asset created.', { assetId: asset.id });
    publishEventFn('asset.created', asset);
    publishEventFn('catalog.created', catalogImage);
    updateJobStatusFn(job.id, 'completed');
    publishEventFn('job.completed', getJobFn(job.id));
    logger(
      'info',
      'worker',
      `Dry run job completed. Asset: ${path.basename(asset.filePath)}`,
      job.id,
    );
  }

  async function runCodexJob(job: Job, signal?: AbortSignal) {
    addJobEventFn(job.id, 'codex.started', 'Codex image generation started.');
    logger('info', 'worker', 'Codex imagegen job started.', job.id);
    const turnRecordId = upsertCodexTurnFn({ jobId: job.id, status: 'running' });
    const catalogContext = resolveJobCatalogContext(job);
    const executionOptions = resolveExecutionOptions(job.execution);
    const result = await codexGenerationProvider.run({
      id: job.id,
      projectId: job.projectId,
      prompt: job.finalPromptUsed,
      execution: job.execution,
      providerId: job.providerId ?? job.sourceSpec?.providerId ?? 'codex',
      sourceSpec: job.sourceSpec,
      signal,
    });

    throwIfAborted(signal);
    addJobEventFn(job.id, 'codex.completed', 'Codex image generation completed.', {
      durationMs: result.durationMs,
      assetCount: result.assets.length,
      threadId: result.threadId,
      turnId: result.turnId,
    });

    upsertCodexTurnFn({
      id: turnRecordId,
      jobId: job.id,
      codexThreadId: result.threadId,
      codexTurnId: result.turnId,
      transcriptPath: result.transcript,
      status: result.assets.length > 0 ? 'completed' : 'needs_review',
    });

    const discoveredImagePath = result.assets[0]?.sourcePath ?? null;
    if (!discoveredImagePath) {
      updateJobStatusFn(job.id, 'needs_review');
      publishEventFn('job.progress', getJobFn(job.id));
      logger(
        'warn',
        'worker',
        `Codex turn completed but no image file was discovered. Transcript: ${result.transcript}`,
        job.id,
      );
      return;
    }

    await finalizeJobAsset(job, catalogContext, discoveredImagePath, 'codex', {
      logPrefix: 'Codex',
      embedMetadata: true,
      executionOptions,
    });
  }

  async function runExternalJob(job: Job, signal?: AbortSignal) {
    const providerId = job.providerId ?? job.sourceSpec?.providerId ?? 'unknown';
    addJobEventFn(job.id, 'external.started', `External provider job started: ${providerId}.`);
    logger('info', 'worker', `External provider job started: ${providerId}.`, job.id);
    const catalogContext = resolveJobCatalogContext(job);

    const result = await externalGenerationProvider.run({
      id: job.id,
      projectId: job.projectId,
      prompt: job.finalPromptUsed,
      execution: job.execution,
      providerId: job.providerId ?? job.sourceSpec?.providerId ?? null,
      sourceSpec: job.sourceSpec,
      signal,
    });

    throwIfAborted(signal);

    addJobEventFn(job.id, 'external.completed', 'External provider execution completed.', {
      transcript: result.transcript,
      durationMs: result.durationMs,
      assetCount: result.assets.length,
    });

    const discoveredImagePath = result.assets[0]?.sourcePath ?? null;
    if (!discoveredImagePath) {
      updateJobStatusFn(job.id, 'needs_review');
      publishEventFn('job.progress', getJobFn(job.id));
      logger(
        'warn',
        'worker',
        `External provider completed but no image file was discovered. Transcript: ${result.transcript}`,
        job.id,
      );
      return;
    }

    await finalizeJobAsset(job, catalogContext, discoveredImagePath, providerId, {
      logPrefix: 'External provider',
    });
  }

  async function processJob(job: Job) {
    const controller = new AbortController();
    runningJobControllers.set(job.id, controller);

    try {
      addJobEventFn(job.id, 'job.started', 'Job execution started.', {
        startedAt: new Date().toISOString(),
      });
      updateJobStatusFn(job.id, 'running');
      publishEventFn('job.running', getJobFn(job.id));
      const runtimeTarget = resolveWorkerRuntimeTarget(job);

      if (runtimeTarget === 'dry_run') {
        await runDryJob(job, controller.signal);
      } else if (runtimeTarget === 'codex') {
        await runCodexJob(job, controller.signal);
      } else if (runtimeTarget === 'external') {
        await runExternalJob(job, controller.signal);
      } else {
        throw new Error(
          `Unsupported job kind received by worker: kind=${job.kind} provider=${job.providerId ?? job.sourceSpec?.providerId ?? 'null'} sourceTask=${job.sourceSpec?.task ?? 'null'}`,
        );
      }
    } catch (error) {
      if (isAbortError(error)) {
        addJobEventFn(job.id, 'job.cancelled', 'Job cancelled by user.');
        updateJobStatusFn(job.id, 'cancelled');
        publishEventFn('job.cancelled', getJobFn(job.id));
        logger('info', 'worker', 'Job cancelled by user.', job.id);
      } else {
        const message = error instanceof Error ? error.message : String(error);
        updateJobStatusFn(job.id, 'failed', message);
        publishEventFn('job.failed', getJobFn(job.id));
        logger('error', 'worker', message, job.id);
      }
    } finally {
      runningJobControllers.delete(job.id);
      runningJobs.delete(job.id);
    }
  }

  async function processQueue() {
    while (activeWorkerCount < getMaxConcurrentJobs() && jobQueue.length > 0) {
      const job = jobQueue.shift();
      if (!job) continue;

      activeWorkerCount += 1;
      const workPromise = Promise.resolve().then(async () => {
        try {
          await processJob(job);
        } finally {
          activeWorkerCount -= 1;
          activeJobPromises.delete(job.id);
          queueMicrotask(processQueue);
        }
      });
      activeJobPromises.set(job.id, workPromise);
    }
  }

  return {
    enqueueJob(job: Job) {
      if (runningJobs.has(job.id)) return;
      runningJobs.add(job.id);
      jobQueue.push(job);
      queueMicrotask(processQueue);
    },
    cancelQueuedOrRunningJob(jobId: string) {
      const queuedIndex = jobQueue.findIndex((job) => job.id === jobId);
      if (queuedIndex >= 0) {
        jobQueue.splice(queuedIndex, 1);
        runningJobs.delete(jobId);
        addJobEventFn(jobId, 'job.cancelled', 'Queued job cancelled before execution.');
        const job = updateJobStatusFn(jobId, 'cancelled');
        publishEventFn('job.cancelled', job);
        logger('info', 'worker', 'Queued job cancelled before execution.', jobId);
        return job;
      }

      const controller = runningJobControllers.get(jobId);
      if (controller) {
        addJobEventFn(jobId, 'job.cancel.requested', 'Cancellation requested for running job.');
        controller.abort();
        logger('info', 'worker', 'Cancellation requested for running job.', jobId);
        return getJobFn(jobId);
      }

      return getJobFn(jobId);
    },
    getWorkerStatus() {
      return {
        maxConcurrentJobs: getMaxConcurrentJobs(),
        activeWorkerCount,
        queuedJobs: jobQueue.length,
        trackedJobs: runningJobs.size,
      };
    },
    async resetWorkerState() {
      const queuedJobs = jobQueue.splice(0, jobQueue.length);

      for (const queuedJob of queuedJobs) {
        runningJobs.delete(queuedJob.id);
        addJobEventFn(queuedJob.id, 'job.cancelled', 'Queued job cancelled during studio reset.');
        updateJobStatusFn(queuedJob.id, 'cancelled');
        publishEventFn('job.cancelled', getJobFn(queuedJob.id));
      }

      for (const [jobId, controller] of runningJobControllers.entries()) {
        if (!controller.signal.aborted) {
          addJobEventFn(jobId, 'job.cancel.requested', 'Studio reset requested cancellation.');
          controller.abort();
        }
      }

      if (activeJobPromises.size > 0) {
        await Promise.allSettled(activeJobPromises.values());
      }

      runningJobs.clear();
    },
  };
}
