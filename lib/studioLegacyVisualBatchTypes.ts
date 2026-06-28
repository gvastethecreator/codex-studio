import type { GeneratedImage, GenerationBatch, ImageGenerationConfig } from '../types';

export interface LegacyVisualBatchImage extends Pick<
  GeneratedImage,
  'id' | 'src' | 'thumbnail' | 'preview' | 'batchId' | 'createdAt'
> {
  isFavorite?: boolean;
}

export interface LegacyVisualBatch {
  id: string;
  workspaceId: string;
  config: ImageGenerationConfig;
  images: LegacyVisualBatchImage[];
  createdAt: number;
}

export type LegacyVisualBatchSnapshot = LegacyVisualBatch[];

export function toLegacyVisualBatch(batch: GenerationBatch): LegacyVisualBatch {
  return {
    id: batch.id,
    workspaceId: batch.workspaceId,
    config: batch.config,
    images: batch.images.map((image) => ({
      id: image.id,
      src: image.src,
      ...(image.thumbnail ? { thumbnail: image.thumbnail } : {}),
      ...(image.preview ? { preview: image.preview } : {}),
      batchId: image.batchId,
      createdAt: image.createdAt,
      ...(image.isFavorite !== undefined ? { isFavorite: image.isFavorite } : {}),
    })),
    createdAt: batch.createdAt,
  };
}

export function toLegacyVisualBatchSnapshot(
  batches: readonly GenerationBatch[],
): LegacyVisualBatchSnapshot {
  return batches.map(toLegacyVisualBatch);
}
