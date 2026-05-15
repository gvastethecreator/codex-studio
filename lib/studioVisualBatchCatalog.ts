import type { CatalogImage } from '../packages/shared/src';
import type { GeneratedImage, GenerationBatch } from '../types';
import { toStudioAssetUrl } from '../services/localStudioService';
import { buildGenerationConfigFromCatalogImage } from '../utils/catalogImageGenerationConfig';

export interface MaterializeVisualBatchImageOptions {
  batchId?: string;
  createdAt?: number;
  thumbnail?: string;
}

export function resolveVisualBatchId(asset: Pick<CatalogImage, 'batchId' | 'jobId' | 'id'>) {
  return asset.batchId || `studio-${asset.jobId ?? asset.id}`;
}

export function resolveVisualBatchCreatedAt(asset: Pick<CatalogImage, 'createdAt'>) {
  return Date.parse(asset.createdAt) || Date.now();
}

export function materializeVisualBatchImage(
  asset: CatalogImage,
  options: MaterializeVisualBatchImageOptions = {},
): GeneratedImage {
  const batchId = options.batchId ?? resolveVisualBatchId(asset);
  const createdAt = options.createdAt ?? resolveVisualBatchCreatedAt(asset);

  return {
    id: asset.id,
    src: toStudioAssetUrl(asset.publicUrl),
    thumbnail:
      options.thumbnail ??
      (asset.thumbnailUrl ? toStudioAssetUrl(asset.thumbnailUrl) : undefined),
    batchId,
    createdAt,
    isFavorite: asset.isFavorite,
  };
}

export function materializeVisualBatch(asset: CatalogImage): GenerationBatch {
  const batchId = resolveVisualBatchId(asset);
  const createdAt = resolveVisualBatchCreatedAt(asset);

  return {
    id: batchId,
    workspaceId: asset.workspaceId || 'default',
    config: buildGenerationConfigFromCatalogImage(asset),
    images: [materializeVisualBatchImage(asset, { batchId, createdAt })],
    createdAt,
  };
}

export function materializeVisualBatches(
  assets: CatalogImage[],
  options: { excludeImageIds?: Iterable<string> } = {},
): GenerationBatch[] {
  const excludedImageIds = new Set(options.excludeImageIds ?? []);

  return assets
    .filter((asset) => !excludedImageIds.has(asset.id))
    .map((asset) => materializeVisualBatch(asset));
}
