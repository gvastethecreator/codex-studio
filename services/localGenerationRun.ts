import type { GeneratedImage, GenerationBatch, ImageGenerationConfig } from '../types';
import type { Job as StudioJob } from '../packages/shared/src';
import { createThumbnail } from '../utils/imageUtils';
import { resolveGenerationConfig } from '../lib/recipeContext';
import {
  createStudioJob,
  listProjects,
  queryCatalog,
  toStudioAssetUrl,
} from './localStudioService';
import { createStudioEventStream, type StudioEventStream, watchJob } from './studioEventSource';
import { getImageGenSizeForRatio } from '../utils/imageGenSizing';

interface RunLocalGenerationOptions {
  config: ImageGenerationConfig;
  workspaceId: string;
  inputImage?: {
    src: string;
    prompt?: string;
  };
  signal?: AbortSignal;
  onJobCreated?: (job: StudioJob) => void;
  onProgress?: (message: string) => void;
}

export interface LocalGenerationRunResult {
  batch: GenerationBatch;
  generatedCount: number;
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

/**
 * Run a single persistent Codex ImageGen backend job and materialize its assets
 * into the UI image shape consumed by the visual batch cache.
 */
export async function runSingleCodexImagegenJob(options: {
  config: ImageGenerationConfig;
  batchId: string;
  inputImage?: RunLocalGenerationOptions['inputImage'];
  stream?: StudioEventStream;
  signal?: AbortSignal;
  onJobCreated?: (job: StudioJob) => void;
  onProgress?: (message: string) => void;
}) {
  const { config, batchId, inputImage, signal, onProgress } = options;
  throwIfAborted(signal);
  const projects = await listProjects();
  const projectId = projects[0]?.id;
  const imageGenSize = getImageGenSizeForRatio(config.aspectRatio);
  const editPrompt = inputImage?.prompt?.trim();
  const promptParts = [
    editPrompt ? `Edit instruction:\n${editPrompt}` : null,
    config.prompt || 'Generate a high-quality image.',
    config.recipeContext ? `Recipe instructions:\n${config.recipeContext}` : null,
    config.negativePrompt ? `Avoid:\n${config.negativePrompt}` : null,
    `ImageGen output size: ${imageGenSize.size}`,
    `Aspect ratio: ${imageGenSize.ratio} (${imageGenSize.label.toLowerCase()})`,
  ].filter(Boolean);
  const inputReference = inputImage
    ? [
        {
          name: 'input-image.png',
          dataUrl: await toDataUrl(inputImage.src),
          strength: 1,
        },
      ]
    : [];
  const createdJob = await createStudioJob({
    projectId,
    kind: 'codex_imagegen',
    prompt: promptParts.join('\n\n'),
    execution: {
      model: config.executionModel,
      reasoningEffort: config.executionReasoningEffort,
      serviceTier: config.executionSpeed === 'standard' ? null : config.executionSpeed,
    },
    references: [
      ...inputReference,
      ...config.attachments.map((attachment) => ({
        name: attachment.name,
        dataUrl: attachment.dataUrl,
        strength: attachment.strength,
      })),
    ],
  });

  options.onJobCreated?.(createdJob);

  onProgress?.(`Codex job queued: ${createdJob.id}`);
  const stream = options.stream ?? createStudioEventStream();
  const completedJob = await watchJob(stream, createdJob.id, signal);
  const catalogPage = await queryCatalog({ jobId: completedJob.id, limit: 20 });
  const jobAssets = catalogPage.images;

  if (jobAssets.length === 0) {
    throw new Error(`Codex job ${completedJob.id} completed without an imported image asset.`);
  }

  const images: GeneratedImage[] = [];
  for (const asset of jobAssets) {
    const url = toStudioAssetUrl(asset.publicUrl);
    const thumbnail = await createThumbnail(url);
    images.push({
      id: asset.id,
      src: url,
      thumbnail: asset.thumbnailUrl ? toStudioAssetUrl(asset.thumbnailUrl) : thumbnail,
      batchId,
      createdAt: Date.now(),
      isFavorite: false,
    });
  }

  return images;
}

/**
 * Resolve recipe context, enqueue the required backend jobs, and return the
 * visual batch that the UI persists in its local cache.
 */
export async function runLocalGeneration({
  config,
  workspaceId,
  inputImage,
  signal,
  onProgress,
}: RunLocalGenerationOptions): Promise<LocalGenerationRunResult> {
  const stream = createStudioEventStream();
  try {
    throwIfAborted(signal);
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
          signal,
          onJobCreated: options.onJobCreated,
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
      batch: {
        id: batchId,
        workspaceId,
        config: resolvedConfig,
        images: batchImages,
        createdAt: Date.now(),
      },
    };
  } finally {
    stream.close();
  }
}
