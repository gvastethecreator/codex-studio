import type { GeneratedImage, GenerationBatch, ImageGenerationConfig } from '../types';
import { createThumbnail } from '../utils/imageUtils';
import {
  createStudioJob,
  listProjects,
  listStudioAssets,
  toStudioAssetUrl,
  waitForStudioJob,
} from './localStudioService';
import { getImageGenSizeForRatio } from '../utils/imageGenSizing';

interface RunLocalGenerationOptions {
  config: ImageGenerationConfig;
  workspaceId: string;
  signal?: AbortSignal;
  onProgress?: (message: string) => void;
}

export interface LocalGenerationRunResult {
  batch: GenerationBatch;
  generatedCount: number;
}

async function runSingleCodexImagegenJob(config: ImageGenerationConfig, batchId: string, signal?: AbortSignal, onProgress?: (message: string) => void) {
  const projects = await listProjects();
  const projectId = projects[0]?.id;
  const imageGenSize = getImageGenSizeForRatio(config.aspectRatio);
  const promptParts = [
    config.prompt || 'Generate a high-quality image.',
    config.recipeContext ? `Recipe instructions:\n${config.recipeContext}` : null,
    config.negativePrompt ? `Avoid:\n${config.negativePrompt}` : null,
    `ImageGen output size: ${imageGenSize.size}`,
    `Aspect ratio: ${imageGenSize.ratio} (${imageGenSize.label.toLowerCase()})`,
  ].filter(Boolean);
  const createdJob = await createStudioJob({
    projectId,
    kind: 'codex_imagegen',
    prompt: promptParts.join('\n\n'),
    references: config.attachments.map(attachment => ({
      name: attachment.name,
      dataUrl: attachment.dataUrl,
      strength: attachment.strength,
    })),
  });

  onProgress?.(`Codex job queued: ${createdJob.id}`);
  const completedJob = await waitForStudioJob(createdJob.id, signal);
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

export async function runLocalGeneration({ config, workspaceId, signal, onProgress }: RunLocalGenerationOptions): Promise<LocalGenerationRunResult> {
  const batchId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const batchCount = config.batchCount || 1;
  const batchImages: GeneratedImage[] = [];
  let lastError: Error | null = null;

  for (let index = 0; index < batchCount; index += 1) {
    try {
      const images = await runSingleCodexImagegenJob(config, batchId, signal, onProgress);
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
}
