import type { GeneratedImage, ImageGenerationConfig } from '../types';
import type {
  EditableStudioSettings,
  GenerationProviderId,
  GenerationTaskAssetRef,
  Job as StudioJob,
} from '../packages/shared/src';
import { createThumbnail } from '../utils/imageUtils';
import {
  buildGenerationVariationBrief,
  createGenerationVariationKey,
} from '../lib/generationVariation';
import { resolveGenerationConfig } from '../lib/recipeContext';
import { materializeCatalogEntryImage } from '../lib/studioCatalogImageAdapter';
import { buildGenerationTaskSpecFromRecipe } from '../lib/recipeModules';
import {
  cancelStudioJob,
  createStudioJob,
  getEditableStudioSettings,
  listProjects,
  queryCatalog,
} from './localStudioService';
import { resolveStudioApiBase } from './studioRuntime';
import { createStudioEventStream, type StudioEventStream, watchJob } from './studioEventSource';
import {
  isGenerationCancellationError,
  throwIfGenerationAborted,
  toGenerationDataUrl,
} from './localGenerationRuntimeAdapters';

interface RunLocalGenerationOptions {
  config: ImageGenerationConfig;
  workspaceId: string;
  providerId?: GenerationProviderId | null;
  inputImage?: {
    src: string;
    prompt?: string;
  };
  signal?: AbortSignal;
  onJobCreated?: (job: StudioJob) => void;
  onProgress?: (message: string) => void;
}

export type LocalGenerationLifecycleOutcome =
  | {
      status: 'completed';
      result: LocalGenerationRunResult;
      durationMs: number;
    }
  | {
      status: 'cancelled';
      reason: 'cancelled';
      message: string;
      durationMs: number;
    }
  | {
      status: 'failed';
      reason: 'timeout' | 'failed';
      message: string;
      durationMs: number;
    };

export type LocalGenerationFailureReason = 'cancelled' | 'timeout' | 'failed';

export interface LocalGenerationRunResult {
  batchId: string;
  workspaceId: string;
  config: ImageGenerationConfig;
  images: GeneratedImage[];
  createdAt: number;
  generatedCount: number;
}

export function classifyLocalGenerationFailureReason(error: unknown): LocalGenerationFailureReason {
  if (isGenerationCancellationError(error)) {
    return 'cancelled';
  }

  const message = error instanceof Error ? error.message : String(error);
  return /timed?\s*out|timeout/i.test(message) ? 'timeout' : 'failed';
}

export function buildLocalGenerationFailureOutcome({
  error,
  durationMs,
}: {
  error: unknown;
  durationMs: number;
}): Extract<LocalGenerationLifecycleOutcome, { status: 'cancelled' | 'failed' }> {
  const reason = classifyLocalGenerationFailureReason(error);
  const message = error instanceof Error ? error.message : String(error);

  if (reason === 'cancelled') {
    return {
      status: 'cancelled',
      reason,
      message,
      durationMs,
    };
  }

  return {
    status: 'failed',
    reason,
    message,
    durationMs,
  };
}

export function resolveLocalGenerationProviderId({
  providerId,
  settings,
}: {
  providerId?: GenerationProviderId | null;
  settings?: Pick<EditableStudioSettings, 'defaultProviderId'> | null;
}): GenerationProviderId {
  return providerId ?? settings?.defaultProviderId ?? 'codex';
}

export function createLocalRunBatchId(now = Date.now, random = Math.random) {
  return `batch-${now()}-${random().toString(36).slice(2, 10)}`;
}

export function createLocalRunTaskSpecId({
  batchId,
  batchIndex,
  now = Date.now,
}: {
  batchId: string;
  batchIndex: number;
  now?: () => number;
}) {
  return `spec-${batchId}-${batchIndex}-${now()}`;
}

export async function buildJobAssets({
  config,
  inputImage,
}: {
  config: ImageGenerationConfig;
  inputImage?: RunLocalGenerationOptions['inputImage'];
}): Promise<GenerationTaskAssetRef[]> {
  const assets: GenerationTaskAssetRef[] = [];
  const isEditMode = Boolean(inputImage);

  if (inputImage) {
    assets.push({
      role: 'input',
      name: 'input-image.png',
      dataUrl: await toGenerationDataUrl(inputImage.src),
      strength: 1,
    });
  }

  const queuedAttachments = isEditMode
    ? config.attachments.filter((attachment) => attachment.id.startsWith('mask-'))
    : config.attachments;

  for (const [index, attachment] of queuedAttachments.entries()) {
    assets.push({
      role: getQueuedAttachmentAssetRole({ config, attachment, index }),
      name: attachment.name,
      ...resolveAttachmentAssetLocation(attachment),
      strength: attachment.strength,
    });
  }

  return assets;
}

function isInlineAttachmentDataUrl(value: string | null | undefined) {
  return /^data:image\/[^;]+;base64,/i.test(value?.trim() ?? '');
}

function resolveAttachmentAssetLocation(
  attachment: ImageGenerationConfig['attachments'][number],
): Pick<GenerationTaskAssetRef, 'dataUrl' | 'localPath' | 'sourceUrl'> {
  const localPath = attachment.localPath?.trim();
  if (localPath) return { localPath };

  const explicitSourceUrl = attachment.sourceUrl?.trim();
  if (explicitSourceUrl) return { sourceUrl: explicitSourceUrl };

  const attachmentSource = attachment.dataUrl.trim();
  if (isInlineAttachmentDataUrl(attachmentSource)) return { dataUrl: attachmentSource };

  if (/^https?:\/\//i.test(attachmentSource)) return { sourceUrl: attachmentSource };
  if (attachmentSource.startsWith('/')) {
    return { sourceUrl: `${resolveStudioApiBase()}${attachmentSource}` };
  }

  return { dataUrl: attachmentSource };
}

function getQueuedAttachmentAssetRole({
  config,
  attachment,
  index,
}: {
  config: Pick<ImageGenerationConfig, 'recipeId'>;
  attachment: ImageGenerationConfig['attachments'][number];
  index: number;
}): GenerationTaskAssetRef['role'] {
  if (attachment.id.startsWith('mask-')) return 'mask';
  if (config.recipeId === 'character-lab' && index === 0) return 'input';
  return 'reference';
}

export function buildLocalGenerationTaskPrompt({
  config,
  inputImage,
}: {
  config: Pick<ImageGenerationConfig, 'prompt' | 'attachments' | 'recipeId'>;
  inputImage?: RunLocalGenerationOptions['inputImage'];
}) {
  const editPrompt = inputImage?.prompt?.trim();
  if (editPrompt) return editPrompt;

  const prompt = config.prompt?.trim();
  if (prompt) return prompt;

  if (config.attachments.length > 0) {
    return config.recipeId === 'styles'
      ? 'Apply the selected style using the provided reference image.'
      : 'Generate from the provided reference image.';
  }

  return 'Generate a high-quality image.';
}

/**
 * Run a single persistent local generation backend job and materialize its assets
 * into the UI image shape consumed by the visual batch cache.
 */
export async function runSingleCodexImagegenJob(options: {
  config: ImageGenerationConfig;
  batchId: string;
  batchIndex: number;
  batchCount: number;
  workspaceId: string;
  providerId: GenerationProviderId;
  inputImage?: RunLocalGenerationOptions['inputImage'];
  stream?: StudioEventStream;
  signal?: AbortSignal;
  onJobCreated?: (job: StudioJob) => void;
  onProgress?: (message: string) => void;
  cancelJob?: typeof cancelStudioJob;
}) {
  const {
    config,
    batchId,
    batchIndex,
    batchCount,
    workspaceId,
    providerId,
    inputImage,
    signal,
    onProgress,
    cancelJob = cancelStudioJob,
  } = options;
  throwIfGenerationAborted(signal);
  const projects = await listProjects();
  const projectId = projects[0]?.id;
  const taskPrompt = buildLocalGenerationTaskPrompt({ config, inputImage });
  const requestAssets = await buildJobAssets({ config, inputImage });
  const variationKey = createGenerationVariationKey(batchId);
  const variationBrief = inputImage
    ? null
    : buildGenerationVariationBrief({
        batchIndex,
        batchCount,
        variationKey,
      });
  const sourceSpec = buildGenerationTaskSpecFromRecipe({
    id: createLocalRunTaskSpecId({ batchId, batchIndex }),
    providerId,
    task: inputImage ? 'image_edit' : undefined,
    config: {
      ...config,
      prompt: taskPrompt,
      batchCount: 1,
    },
  });
  const createdJob = await createStudioJob({
    projectId,
    kind: sourceSpec.task,
    providerId,
    sourceSpec: {
      ...sourceSpec,
      assets: requestAssets,
      metadata: {
        ...(sourceSpec.metadata ?? {}),
        workspaceId,
        batchId,
        variationKey,
        variationBrief,
      },
    },
    prompt: taskPrompt,
    execution: {
      model: config.executionModel,
      reasoningEffort: config.executionReasoningEffort,
      serviceTier: config.executionSpeed === 'standard' ? null : config.executionSpeed,
    },
    references: requestAssets.flatMap((asset) =>
      asset.dataUrl && isInlineAttachmentDataUrl(asset.dataUrl)
        ? [
            {
              name: asset.name,
              dataUrl: asset.dataUrl,
              strength: asset.strength ?? 0,
            },
          ]
        : [],
    ),
  });

  options.onJobCreated?.(createdJob);

  let cancellationRequest: Promise<void> | null = null;
  const requestBackendCancellation = () => {
    cancellationRequest ??= cancelJob(createdJob.id)
      .then(() => undefined)
      .catch((error) => {
        onProgress?.(
          `Unable to cancel ${providerId} job ${createdJob.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      });
    return cancellationRequest;
  };
  const handleAbort = () => {
    void requestBackendCancellation();
  };
  signal?.addEventListener('abort', handleAbort, { once: true });

  if (signal?.aborted) {
    await requestBackendCancellation();
    throwIfGenerationAborted(signal);
  }

  onProgress?.(`${providerId} job queued: ${createdJob.id}`);
  const stream = options.stream ?? createStudioEventStream();
  const shouldCloseStream = !options.stream;
  try {
    const completedJob = await watchJob(stream, createdJob.id, signal);
    const catalogPage = await queryCatalog({ jobId: completedJob.id, limit: 20 });
    const jobAssets = catalogPage.images;

    if (jobAssets.length === 0) {
      throw new Error(
        `${providerId} job ${completedJob.id} completed without an imported image asset.`,
      );
    }

    const images = await Promise.all(
      jobAssets.map(async (asset) => {
        const fallbackThumbnail = asset.thumbnailUrl
          ? undefined
          : await createThumbnail(materializeCatalogEntryImage(asset, { batchId }).src);
        return materializeCatalogEntryImage(asset, {
          batchId,
          createdAt: Date.now(),
          thumbnail: fallbackThumbnail,
        });
      }),
    );

    return images;
  } finally {
    signal?.removeEventListener('abort', handleAbort);
    if (signal?.aborted) await requestBackendCancellation();
    if (shouldCloseStream) stream.close();
  }
}

/**
 * Resolve recipe context, enqueue backend jobs, and return catalog-derived
 * images. The legacy Visual Batch cache is updated outside this service.
 */
export async function runLocalGeneration({
  config,
  workspaceId,
  providerId: requestedProviderId,
  inputImage,
  signal,
  onJobCreated,
  onProgress,
}: RunLocalGenerationOptions): Promise<LocalGenerationRunResult> {
  const stream = createStudioEventStream();
  try {
    throwIfGenerationAborted(signal);
    const settings = await getEditableStudioSettings();
    const providerId = resolveLocalGenerationProviderId({
      providerId: requestedProviderId,
      settings,
    });
    const resolvedConfig = resolveGenerationConfig(config);
    const batchId = createLocalRunBatchId();
    const batchCount = inputImage ? 1 : resolvedConfig.batchCount || 1;
    const settledRuns = await Promise.allSettled(
      Array.from({ length: batchCount }, (_, index) =>
        runSingleCodexImagegenJob({
          config: resolvedConfig,
          batchId,
          batchIndex: index + 1,
          batchCount,
          workspaceId,
          providerId,
          signal,
          onJobCreated,
          onProgress,
          stream,
          inputImage,
        }),
      ),
    );
    const batchImages = settledRuns.flatMap((result) =>
      result.status === 'fulfilled' ? result.value : [],
    );
    const firstFailure = settledRuns.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );
    if (firstFailure) {
      const failure =
        firstFailure.reason instanceof Error
          ? firstFailure.reason
          : new Error(String(firstFailure.reason));
      onProgress?.(`Generation Error during batch: ${failure.message}`);
      if (batchImages.length === 0) throw failure;
    }

    if (batchImages.length === 0) {
      throw new Error('No assets were synthesized. Please check your prompt or context.');
    }

    return {
      generatedCount: batchImages.length,
      batchId,
      workspaceId,
      config: resolvedConfig,
      images: batchImages,
      createdAt: Date.now(),
    };
  } finally {
    stream.close();
  }
}

export async function runLocalGenerationWithLifecycle(
  options: RunLocalGenerationOptions,
): Promise<LocalGenerationLifecycleOutcome> {
  const startedAt = Date.now();
  try {
    const result = await runLocalGeneration(options);
    return {
      status: 'completed',
      result,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return buildLocalGenerationFailureOutcome({
      error,
      durationMs: Date.now() - startedAt,
    });
  }
}
