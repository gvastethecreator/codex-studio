import { mkdirSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { getSettings } from './config';
import { getCatalogImageByJobId, registerCatalogImage } from './catalog';
import { addAsset, getAssetByJobId } from './db/assets';
import { upsertCodexTurn } from './db/codexTurns';
import { addJobEvent } from './db/events';
import {
  getJob,
  updateJobFinalization,
  updateJobStatus,
  updateJobRemoteExecution,
} from './db/jobs';
import { getSettingValue, setSettingValue } from './db/settings';
import { getWorkspace, listWorkspaces } from './db/workspaces';
import { publishEvent } from './events';
import { resolveLibraryPath, toPublicAssetUrl } from './library';
import { ensureThumbnailVariant as ensureThumbnailVariantDefault } from './libraryAssetVariants';
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
import {
  validateWorkerLimits,
  type WorkerStatus,
} from '../../../packages/shared/src/workerContracts';
import { readEditableStudioSettings } from './studioSettingsStore';
import { resolveJobCatalogContext } from './workerCatalogContext';
import { resolveWorkerRuntimeTarget } from './workerRouting';
import { createWorkerAssetPathing, inferGeneratedAssetMimeType } from './workerAssetPathing';
import { createWorkerAssetFinalizer } from './workerAssetFinalizer';
import {
  createAbortWorkerError,
  createUnsupportedRuntimeTargetError,
  formatWorkerErrorMessage,
  ProviderExecutionUncertainError,
} from './workerErrors';

export type { WorkerStatus } from '../../../packages/shared/src/workerContracts';

export interface WorkerController {
  enqueueJob(job: Job): void;
  cancelQueuedOrRunningJob(jobId: string): ReturnType<typeof getJob>;
  getWorkerStatus(): WorkerStatus;
  resetWorkerState(): Promise<void>;
  shutdown(): Promise<void>;
}

export interface CreateWorkerControllerDependencies {
  createTurn?: () => CodexTurn;
  getSettings?: typeof getSettings;
  registerCatalogImage?: typeof registerCatalogImage;
  getCatalogImageByJobId?: typeof getCatalogImageByJobId;
  addAsset?: typeof addAsset;
  getAssetByJobId?: typeof getAssetByJobId;
  addJobEvent?: typeof addJobEvent;
  getJob?: typeof getJob;
  updateJobStatus?: typeof updateJobStatus;
  updateJobFinalization?: typeof updateJobFinalization;
  updateJobRemoteExecution?: typeof updateJobRemoteExecution;
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
  readEditableStudioSettings?: typeof readEditableStudioSettings;
  resolveJobCatalogContext?: typeof resolveJobCatalogContext;
  resolveWorkerRuntimeTarget?: typeof resolveWorkerRuntimeTarget;
  ensureThumbnailVariant?: typeof ensureThumbnailVariantDefault;
}

function createAbortError() {
  return createAbortWorkerError();
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

export function createWorkerController({
  createTurn = createCodexTurn,
  getSettings: getSettingsFn = getSettings,
  registerCatalogImage: registerCatalogImageFn = registerCatalogImage,
  getCatalogImageByJobId: getCatalogImageByJobIdFn = getCatalogImageByJobId,
  addAsset: addAssetFn = addAsset,
  getAssetByJobId: getAssetByJobIdFn = getAssetByJobId,
  addJobEvent: addJobEventFn = addJobEvent,
  getJob: getJobFn = getJob,
  updateJobStatus: updateJobStatusFn = updateJobStatus,
  updateJobFinalization: updateJobFinalizationFn = updateJobFinalization,
  updateJobRemoteExecution: updateJobRemoteExecutionFn = updateJobRemoteExecution,
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
  readEditableStudioSettings: readEditableStudioSettingsFn = readEditableStudioSettings,
  resolveJobCatalogContext: resolveJobCatalogContextFn = resolveJobCatalogContext,
  resolveWorkerRuntimeTarget: resolveWorkerRuntimeTargetFn = resolveWorkerRuntimeTarget,
  ensureThumbnailVariant: ensureThumbnailVariantFn = ensureThumbnailVariantDefault,
}: CreateWorkerControllerDependencies = {}): WorkerController {
  const limits = validateWorkerLimits(structuredClone(getSettingsFn().workerLimits));
  const activeByProvider = new Map<string, number>();
  let lastStartedProvider: string | null = null;
  const providerFor = (job: Job) =>
    job.kind === 'dry_run' ? 'dry_run' : (job.providerId ?? job.sourceSpec?.providerId ?? 'codex');
  const providerLimit = (provider: string) => limits.providers[provider] ?? 1;
  const executionSpans = new Map<
    string,
    { attempt: number; executionId: string; transport: string }
  >();
  const recordJobEvent: typeof addJobEvent = (jobId, type, message, metadata) => {
    const span = executionSpans.get(jobId);
    const fields =
      metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {};
    addJobEventFn(jobId, type, message, span ? { ...fields, ...span } : metadata);
  };
  const runningJobs = new Set<string>();
  const jobQueue: Job[] = [];
  const runningJobControllers = new Map<string, AbortController>();
  const runningJobAbortReasons = new Map<string, 'user' | 'reset' | 'shutdown'>();
  const activeJobPromises = new Map<string, Promise<void>>();
  let activeWorkerCount = 0;
  let isShuttingDown = false;
  let shutdownPromise: Promise<void> | null = null;
  const codexGenerationProvider =
    createGenerationProvider?.() ?? createCodexGenerationProvider({ turn: createTurn() });
  const externalGenerationProvider =
    createExternalProvider?.() ?? createExternalGenerationProvider();
  const assetPathing = createWorkerAssetPathing({
    resolveExecutionOptions,
    readEditableStudioSettings: readEditableStudioSettingsFn,
    getSetting: getSettingValue,
    setSetting: setSettingValue,
    resolveLibraryPath: resolveLibraryPathFn,
    getWorkspace,
    listWorkspaces,
  });

  function getMaxConcurrentJobs() {
    return limits.global;
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

  const assetFinalizer = createWorkerAssetFinalizer({
    registerCatalogImage: registerCatalogImageFn,
    getCatalogImageByJobId: getCatalogImageByJobIdFn,
    addAsset: addAssetFn,
    getAssetByJobId: getAssetByJobIdFn,
    addJobEvent: recordJobEvent,
    updateJobStatus: updateJobStatusFn,
    updateJobFinalization: updateJobFinalizationFn,
    publishEvent: publishEventFn,
    getJob: getJobFn,
    toPublicAssetUrl: toPublicAssetUrlFn,
    logger,
    embedMetadata: embedMetadataFn,
    parsePromptTransport: parsePromptTransportFn,
    resolveExecutionOptions,
    resolveCatalogGenerationConfig: buildCatalogGenerationConfigFromJob,
    resolveGeneratedAssetTargetPath: assetPathing.resolveGeneratedAssetTargetPath,
    moveGeneratedAssetToPath: assetPathing.moveGeneratedAssetToPath,
    inferGeneratedAssetMimeType,
    ensureThumbnailVariant: ensureThumbnailVariantFn,
  });

  async function runDryJob(job: Job, signal?: AbortSignal) {
    const startedAt = Date.now();
    recordJobEvent(job.id, 'dry_run.started', 'Dry run asset creation started.');
    logger('info', 'worker', 'Dry run job started.', job.id);
    await waitWithAbort(500, signal);
    throwIfAborted(signal);

    const filePath = assetPathing.resolveGeneratedAssetTargetPath(job, 'dry_run', '.svg');
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, svgForPrompt(job.finalPromptUsed), 'utf8');
    const checkpoint = {
      state: 'moving_asset' as const,
      sourcePath: filePath,
      filePath,
      assetId: null,
      catalogId: null,
    };
    updateJobFinalizationFn(job.id, checkpoint);
    await assetFinalizer.finalizeJobAsset({
      job: { ...job, finalization: checkpoint },
      catalogContext: resolveJobCatalogContextFn(job),
      discoveredImagePath: filePath,
      providerId: 'dry_run',
      options: { logPrefix: 'Dry run', width: 1200, height: 800 },
    });
    recordJobEvent(job.id, 'dry_run.completed', 'Dry run asset creation completed.', {
      durationMs: Date.now() - startedAt,
      assetCount: 1,
    });
  }

  function persistProviderCheckpoint(job: Job, checkpoint: NonNullable<Job['remoteExecution']>) {
    updateJobRemoteExecutionFn(job.id, checkpoint);
    job.remoteExecution = checkpoint;
    recordJobEvent(job.id, 'provider.checkpoint', `Remote execution ${checkpoint.phase}.`, {
      ...checkpoint,
    });
  }

  async function runCodexJob(job: Job, signal?: AbortSignal) {
    logger('info', 'worker', 'Codex imagegen job started.', job.id);
    const turnRecordId = upsertCodexTurnFn({ jobId: job.id, status: 'running' });
    recordJobEvent(job.id, 'codex.started', 'Codex image generation started.', { turnRecordId });
    const catalogContext = resolveJobCatalogContextFn(job);
    const executionOptions = resolveExecutionOptions(job.execution);
    const result = await codexGenerationProvider.run({
      id: job.id,
      workspaceId: job.workspaceId,
      libraryContext: job.libraryContext,
      prompt: job.finalPromptUsed,
      execution: job.execution,
      providerId: job.providerId ?? job.sourceSpec?.providerId ?? 'codex',
      sourceSpec: job.sourceSpec,
      remoteExecution: job.remoteExecution,
      checkpointRemoteExecution: (checkpoint) => persistProviderCheckpoint(job, checkpoint),
      signal,
    });

    throwIfAborted(signal);
    recordJobEvent(job.id, 'codex.completed', 'Codex image generation completed.', {
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

    await assetFinalizer.finalizeJobAsset({
      job,
      catalogContext,
      discoveredImagePath,
      providerId: 'codex',
      options: {
        logPrefix: 'Codex',
        embedMetadata: true,
        executionOptions,
      },
    });
  }

  async function runExternalJob(job: Job, signal?: AbortSignal) {
    const providerId = job.providerId ?? job.sourceSpec?.providerId ?? 'unknown';
    recordJobEvent(job.id, 'external.started', `External provider job started: ${providerId}.`);
    logger('info', 'worker', `External provider job started: ${providerId}.`, job.id);
    const catalogContext = resolveJobCatalogContextFn(job);

    const result = await externalGenerationProvider.run({
      id: job.id,
      workspaceId: job.workspaceId,
      libraryContext: job.libraryContext,
      prompt: job.finalPromptUsed,
      execution: job.execution,
      providerId: job.providerId ?? job.sourceSpec?.providerId ?? null,
      sourceSpec: job.sourceSpec,
      remoteExecution: job.remoteExecution,
      checkpointRemoteExecution: (checkpoint) => persistProviderCheckpoint(job, checkpoint),
      signal,
    });

    throwIfAborted(signal);

    recordJobEvent(job.id, 'external.completed', 'External provider execution completed.', {
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

    await assetFinalizer.finalizeJobAsset({
      job,
      catalogContext,
      discoveredImagePath,
      providerId,
      options: {
        logPrefix: 'External provider',
      },
    });
  }

  async function processJob(job: Job, controller: AbortController) {
    executionSpans.set(job.id, {
      attempt: job.attempt ?? 1,
      executionId: randomUUID(),
      transport: job.execution?.providerOptions?.codex?.transport ?? job.providerId ?? 'unknown',
    });
    try {
      throwIfAborted(controller.signal);
      recordJobEvent(job.id, 'job.started', 'Job execution started.', {
        startedAt: new Date().toISOString(),
      });
      updateJobStatusFn(job.id, 'running');
      publishEventFn('job.running', getJobFn(job.id));
      if (job.finalization) {
        if (job.finalization.state === 'completed') {
          updateJobStatusFn(job.id, 'completed');
          publishEventFn('job.completed', getJobFn(job.id));
          return;
        }
        const resumePath = job.finalization.filePath ?? job.finalization.sourcePath;
        if (!resumePath) {
          throw new Error(`Job ${job.id} has an incomplete finalization checkpoint.`);
        }
        const providerId = job.providerId ?? job.sourceSpec?.providerId ?? 'recovered';
        await assetFinalizer.finalizeJobAsset({
          job,
          catalogContext: resolveJobCatalogContextFn(job),
          discoveredImagePath: resumePath,
          providerId,
          options: { logPrefix: 'Recovered' },
        });
        return;
      }
      const runtimeTarget = resolveWorkerRuntimeTargetFn(job);

      if (runtimeTarget === 'dry_run') {
        await runDryJob(job, controller.signal);
      } else if (runtimeTarget === 'codex') {
        await runCodexJob(job, controller.signal);
      } else if (runtimeTarget === 'external') {
        await runExternalJob(job, controller.signal);
      } else {
        throw createUnsupportedRuntimeTargetError(
          {
            kind: job.kind,
            providerId: job.providerId ?? job.sourceSpec?.providerId ?? null,
            sourceTask: job.sourceSpec?.task ?? null,
          },
          { jobId: job.id },
        );
      }
    } catch (error) {
      if (
        error instanceof ProviderExecutionUncertainError ||
        (!isAbortError(error) &&
          job.remoteExecution &&
          ['submitting', 'accepted', 'completed'].includes(job.remoteExecution.phase))
      ) {
        const message =
          error instanceof ProviderExecutionUncertainError
            ? error.message
            : 'Provider execution was recorded, but local completion could not be confirmed. Review this job before creating another request.';
        recordJobEvent(job.id, 'job.needs_review', message);
        updateJobStatusFn(job.id, 'needs_review', message);
        publishEventFn('job.progress', getJobFn(job.id));
        logger('warn', 'worker', message, job.id);
      } else if (isAbortError(error)) {
        const abortReason = runningJobAbortReasons.get(job.id) ?? 'user';
        if (
          abortReason !== 'shutdown' &&
          job.remoteExecution &&
          job.remoteExecution.phase !== 'cancelled'
        ) {
          const message =
            'Remote cancellation is not confirmed. Resume this job to reconcile its provider result.';
          updateJobStatusFn(job.id, 'needs_review', message);
          publishEventFn('job.progress', getJobFn(job.id));
          recordJobEvent(job.id, 'job.needs_review', message);
        } else if (abortReason === 'shutdown') {
          recordJobEvent(job.id, 'job.interrupted', 'Studio shutdown interrupted this job.');
          updateJobStatusFn(job.id, 'queued');
          publishEventFn('job.queued', getJobFn(job.id));
          logger('info', 'worker', 'Job requeued for recovery after studio shutdown.', job.id);
        } else {
          recordJobEvent(job.id, 'job.cancelled', 'Job cancelled by user.');
          updateJobStatusFn(job.id, 'cancelled');
          publishEventFn('job.cancelled', getJobFn(job.id));
          logger('info', 'worker', 'Job cancelled by user.', job.id);
        }
      } else {
        const message = formatWorkerErrorMessage(error);
        updateJobStatusFn(job.id, 'failed', message);
        publishEventFn('job.failed', getJobFn(job.id));
        logger('error', 'worker', message, job.id);
      }
    } finally {
      executionSpans.delete(job.id);
      runningJobControllers.delete(job.id);
      runningJobAbortReasons.delete(job.id);
      runningJobs.delete(job.id);
    }
  }

  async function processQueue() {
    if (isShuttingDown) return;
    while (activeWorkerCount < getMaxConcurrentJobs() && jobQueue.length > 0) {
      const providers = [...new Set(jobQueue.map(providerFor))];
      const lastIndex = lastStartedProvider ? providers.indexOf(lastStartedProvider) : -1;
      let selectedProvider: string | undefined;
      for (let offset = 1; offset <= providers.length; offset += 1) {
        const provider = providers[(lastIndex + offset) % providers.length]!;
        if ((activeByProvider.get(provider) ?? 0) < providerLimit(provider)) {
          selectedProvider = provider;
          break;
        }
      }
      if (!selectedProvider) return;
      const selectedIndex = jobQueue.findIndex(
        (candidate) => providerFor(candidate) === selectedProvider,
      );
      const job = jobQueue.splice(selectedIndex, 1)[0]!;
      const provider = selectedProvider;
      lastStartedProvider = provider;
      activeByProvider.set(provider, (activeByProvider.get(provider) ?? 0) + 1);
      const controller = new AbortController();
      runningJobControllers.set(job.id, controller);

      activeWorkerCount += 1;
      const workPromise = Promise.resolve().then(async () => {
        try {
          await processJob(job, controller);
        } finally {
          activeWorkerCount -= 1;
          const remaining = (activeByProvider.get(provider) ?? 1) - 1;
          if (remaining === 0) activeByProvider.delete(provider);
          else activeByProvider.set(provider, remaining);
          activeJobPromises.delete(job.id);
          queueMicrotask(processQueue);
        }
      });
      activeJobPromises.set(job.id, workPromise);
    }
  }

  return {
    enqueueJob(job: Job) {
      if (isShuttingDown || runningJobs.has(job.id)) return;
      runningJobs.add(job.id);
      jobQueue.push(job);
      queueMicrotask(processQueue);
    },
    cancelQueuedOrRunningJob(jobId: string) {
      const queuedIndex = jobQueue.findIndex((job) => job.id === jobId);
      if (queuedIndex >= 0) {
        const [queuedJob] = jobQueue.splice(queuedIndex, 1);
        runningJobs.delete(jobId);
        if (queuedJob?.remoteExecution) {
          const message =
            'Local observation stopped; the remote Comfy job may still be running. Resume to inspect its result.';
          recordJobEvent(jobId, 'job.needs_review', message);
          const job = updateJobStatusFn(jobId, 'needs_review', message);
          publishEventFn('job.progress', job);
          return job;
        }
        recordJobEvent(jobId, 'job.cancelled', 'Queued job cancelled before execution.');
        const job = updateJobStatusFn(jobId, 'cancelled');
        publishEventFn('job.cancelled', job);
        logger('info', 'worker', 'Queued job cancelled before execution.', jobId);
        return job;
      }

      const controller = runningJobControllers.get(jobId);
      if (controller) {
        recordJobEvent(jobId, 'job.cancel.requested', 'Cancellation requested for running job.');
        runningJobAbortReasons.set(jobId, 'user');
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
        providerLimits: { ...limits.providers },
        activeByProvider: Object.fromEntries(activeByProvider),
        stopping: isShuttingDown,
        waiting: jobQueue.map((job) => {
          const providerId = providerFor(job);
          const reason = isShuttingDown
            ? 'stopping'
            : (activeByProvider.get(providerId) ?? 0) >= providerLimit(providerId)
              ? 'provider_capacity'
              : activeWorkerCount >= limits.global
                ? 'global_capacity'
                : 'provider_turn';
          return { jobId: job.id, providerId, reason };
        }),
      };
    },
    async resetWorkerState() {
      const queuedJobs = jobQueue.splice(0, jobQueue.length);

      for (const queuedJob of queuedJobs) {
        runningJobs.delete(queuedJob.id);
        if (queuedJob.remoteExecution) {
          const message =
            'Studio reset stopped local observation. Resume to reconcile the existing remote execution.';
          updateJobStatusFn(queuedJob.id, 'needs_review', message);
          publishEventFn('job.progress', getJobFn(queuedJob.id));
          recordJobEvent(queuedJob.id, 'job.needs_review', message);
          continue;
        }
        recordJobEvent(queuedJob.id, 'job.cancelled', 'Queued job cancelled during studio reset.');
        updateJobStatusFn(queuedJob.id, 'cancelled');
        publishEventFn('job.cancelled', getJobFn(queuedJob.id));
      }

      for (const [jobId, controller] of runningJobControllers.entries()) {
        if (!controller.signal.aborted) {
          recordJobEvent(jobId, 'job.cancel.requested', 'Studio reset requested cancellation.');
          runningJobAbortReasons.set(jobId, 'reset');
          controller.abort();
        }
      }

      if (activeJobPromises.size > 0) {
        await Promise.allSettled(activeJobPromises.values());
      }

      runningJobs.clear();
    },
    shutdown() {
      if (!shutdownPromise) {
        shutdownPromise = (async () => {
          isShuttingDown = true;

          const queuedJobs = jobQueue.splice(0, jobQueue.length);
          for (const queuedJob of queuedJobs) {
            runningJobs.delete(queuedJob.id);
          }

          for (const [jobId, controller] of runningJobControllers.entries()) {
            if (!controller.signal.aborted) {
              recordJobEvent(
                jobId,
                'job.interrupt.requested',
                'Studio shutdown requested a recoverable interruption.',
              );
              runningJobAbortReasons.set(jobId, 'shutdown');
              controller.abort('studio_shutdown');
            }
          }

          if (activeJobPromises.size > 0) {
            await Promise.allSettled(activeJobPromises.values());
          }

          runningJobs.clear();
        })();
      }

      return shutdownPromise;
    },
  };
}
