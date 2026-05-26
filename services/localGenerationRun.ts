import type { GeneratedImage, ImageGenerationConfig } from '../types';
import type {
  EditableStudioSettings,
  GenerationProviderId,
  GenerationTaskAssetRef,
  Job as StudioJob,
} from '../packages/shared/src';
import { createThumbnail } from '../utils/imageUtils';
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

function createAbortError() {
  const error = new Error('Operation cancelled by user');
  error.name = 'AbortError';
  return error;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw createAbortError();
  }
}

function waitWithAbort(durationMs: number, signal?: AbortSignal) {
  if (!signal) {
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, durationMs);
    });
  }

  throwIfAborted(signal);

  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, durationMs);

    const handleAbort = () => {
      window.clearTimeout(timeout);
      signal.removeEventListener('abort', handleAbort);
      reject(createAbortError());
    };

    signal.addEventListener('abort', handleAbort, { once: true });
  });
}

/**
 * Convert an image source into a data URL payload accepted by the local
 * generation backend.
 */
async function toDataUrl(src: string) {
  if (src.startsWith('data:')) return src;
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Unable to read input image: ${response.status}`);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to encode input image'));
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to encode input image as a data URL'));
        return;
      }

      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

export async function buildJobAssets({
  config,
  inputImage,
}: {
  config: ImageGenerationConfig;
  inputImage?: RunLocalGenerationOptions['inputImage'];
}): Promise<GenerationTaskAssetRef[]> {
  const assets: GenerationTaskAssetRef[] = [];

  if (inputImage) {
    assets.push({
      role: 'input',
      name: 'input-image.png',
      dataUrl: await toDataUrl(inputImage.src),
      strength: 1,
    });
  }

  for (const attachment of config.attachments) {
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
  workspaceId: string;
  providerId: GenerationProviderId;
  inputImage?: RunLocalGenerationOptions['inputImage'];
  stream?: StudioEventStream;
  signal?: AbortSignal;
  onJobCreated?: (job: StudioJob) => void;
  onProgress?: (message: string) => void;
}) {
  const { config, batchId, workspaceId, providerId, inputImage, signal, onProgress } = options;
  throwIfAborted(signal);
  const projects = await listProjects();
  const projectId = projects[0]?.id;
  const taskPrompt = buildLocalGenerationTaskPrompt({ config, inputImage });
  const requestAssets = await buildJobAssets({ config, inputImage });
  const sourceSpec = buildGenerationTaskSpecFromRecipe({
    id: `${batchId}-${Date.now()}`,
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

  const images: GeneratedImage[] = [];
  for (const asset of jobAssets) {
    const fallbackThumbnail = asset.thumbnailUrl
      ? undefined
      : await createThumbnail(materializeCatalogEntryImage(asset, { batchId }).src);
    images.push(
      materializeCatalogEntryImage(asset, {
        batchId,
        createdAt: Date.now(),
        thumbnail: fallbackThumbnail,
      }),
    );
  }

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
    throwIfAborted(signal);
    const settings = await getEditableStudioSettings();
    const providerId = resolveLocalGenerationProviderId({
      providerId: requestedProviderId,
      settings,
    });
    const resolvedConfig = resolveGenerationConfig(config);
    const batchId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const batchCount = inputImage ? 1 : resolvedConfig.batchCount || 1;
    const batchImages: GeneratedImage[] = [];
    let lastError: Error | null = null;

    for (let index = 0; index < batchCount; index += 1) {
      try {
        const images = await runSingleCodexImagegenJob({
          config: resolvedConfig,
          batchId,
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
        await waitWithAbort(2000, signal);
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
