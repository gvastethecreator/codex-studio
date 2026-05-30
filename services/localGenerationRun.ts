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
  createStudioJob,
  getEditableStudioSettings,
  listProjects,
  queryCatalog,
} from './localStudioService';
import { createStudioEventStream, type StudioEventStream, watchJob } from './studioEventSource';
import {
  isGenerationCancellationError,
  throwIfGenerationAborted,
  toGenerationDataUrl,
  waitForGenerationDelay,
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
      message: string;
      durationMs: number;
    }
  | {
      status: 'failed';
      message: string;
      durationMs: number;
    };

export interface LocalGenerationRunResult {
  batchId: string;
  workspaceId: string;
  config: ImageGenerationConfig;
  images: GeneratedImage[];
  createdAt: number;
  generatedCount: number;
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

  for (const attachment of queuedAttachments) {
    assets.push({
      role: attachment.id.startsWith('mask-') ? 'mask' : 'reference',
      name: attachment.name,
      dataUrl: attachment.dataUrl,
      strength: attachment.strength,
    });
  }

  return assets;
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
      asset.dataUrl
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

  onProgress?.(`${providerId} job queued: ${createdJob.id}`);
  const stream = options.stream ?? createStudioEventStream();
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
    const batchImages: GeneratedImage[] = [];
    let lastError: Error | null = null;

    for (let index = 0; index < batchCount; index += 1) {
      try {
        const images = await runSingleCodexImagegenJob({
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
        });
        batchImages.push(...images);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        onProgress?.(`Generation Error during batch: ${lastError.message}`);
        break;
      }

      if (index < batchCount - 1) {
        await waitForGenerationDelay(2000, signal);
      }
    }

    if (batchImages.length === 0) {
      if (lastError) throw lastError;
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
    if (isGenerationCancellationError(error)) {
      return {
        status: 'cancelled',
        message: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startedAt,
      };
    }

    return {
      status: 'failed',
      message: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
    };
  }
}
