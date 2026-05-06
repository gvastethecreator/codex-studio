import type { GeneratedImage, GenerationBatch, ImageGenerationConfig } from '../types';
import { createThumbnail } from '../utils/imageUtils';
import {
  createStudioJob,
  listProjects,
  listStudioAssets,
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
  onProgress?: (message: string) => void;
}

export interface LocalGenerationRunResult {
  batch: GenerationBatch;
  generatedCount: number;
}

async function toDataUrl(src: string) {
  if (src.startsWith('data:')) return src;
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Unable to read input image: ${response.status}`);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to encode input image'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

export async function runSingleCodexImagegenJob(options: {
  config: ImageGenerationConfig;
  batchId: string;
  inputImage?: RunLocalGenerationOptions['inputImage'];
  stream?: StudioEventStream;
  signal?: AbortSignal;
  onProgress?: (message: string) => void;
}) {
  const { config, batchId, inputImage, signal, onProgress } = options;
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
    ? [{
        name: 'input-image.png',
        dataUrl: await toDataUrl(inputImage.src),
        strength: 1,
      }]
    : [];
  const createdJob = await createStudioJob({
    projectId,
    kind: 'codex_imagegen',
    prompt: promptParts.join('\n\n'),
    references: [...inputReference, ...config.attachments.map(attachment => ({
      name: attachment.name,
      dataUrl: attachment.dataUrl,
      strength: attachment.strength,
    }))],
  });

  onProgress?.(`Codex job queued: ${createdJob.id}`);
  const stream = options.stream ?? createStudioEventStream();
  const completedJob = await watchJob(stream, createdJob.id, signal);
  const studioAssets = await listStudioAssets();
  const jobAssets = studioAssets.filter(asset => asset.jobId === completedJob.id);

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
      thumbnail,
      batchId,
      createdAt: Date.now(),
      isFavorite: false,
    });
  }

  return images;
}

export async function runLocalGeneration({ config, workspaceId, inputImage, signal, onProgress }: RunLocalGenerationOptions): Promise<LocalGenerationRunResult> {
  const stream = createStudioEventStream();
  try {
    const batchId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const batchCount = inputImage ? 1 : config.batchCount || 1;
    const batchImages: GeneratedImage[] = [];
    let lastError: Error | null = null;

    for (let index = 0; index < batchCount; index += 1) {
      try {
        const images = await runSingleCodexImagegenJob({ config, batchId, signal, onProgress, stream, inputImage });
        batchImages.push(...images);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        onProgress?.(`Generation Error during batch: ${lastError.message}`);
        break;
      }

      if (index < batchCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
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
        config,
        images: batchImages,
        createdAt: Date.now(),
      },
    };
  } finally {
    stream.close();
  }
}
