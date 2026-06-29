import type { CatalogImage } from '../packages/shared/src';
import type { GeneratedImage, GeneratedImageWithConfig } from '../types';
import { toStudioAssetUrl } from '../services/localStudioService';
import { buildGenerationConfigFromCatalogImage } from '../utils/catalogImageGenerationConfig';

const GRID_THUMBNAIL_MAX_EDGE = 512;
const MODAL_PREVIEW_MAX_EDGE = 1024;

export interface MaterializeCatalogEntryImageOptions {
  batchId?: string;
  createdAt?: number;
  thumbnail?: string;
}

export function resolveCatalogEntryBatchId(entry: Pick<CatalogImage, 'batchId' | 'jobId' | 'id'>) {
  return entry.batchId || `studio-${entry.jobId ?? entry.id}`;
}

export function resolveCatalogEntryCreatedAt(entry: Pick<CatalogImage, 'createdAt'>) {
  return Date.parse(entry.createdAt) || Date.now();
}

export function resolveCatalogEntryThumbnailUrl(
  entry: Pick<CatalogImage, 'thumbnailUrl' | 'publicUrl'>,
  maxEdge = GRID_THUMBNAIL_MAX_EDGE,
) {
  return entry.thumbnailUrl
    ? toStudioAssetUrl(entry.thumbnailUrl)
    : toStudioAssetUrl(entry.publicUrl, { variant: 'thumb', maxEdge });
}

export function resolveCatalogEntryPreviewUrl(
  entry: Pick<CatalogImage, 'publicUrl'>,
  maxEdge = MODAL_PREVIEW_MAX_EDGE,
) {
  return toStudioAssetUrl(entry.publicUrl, { variant: 'thumb', maxEdge });
}

export function materializeCatalogEntryImage(
  entry: CatalogImage,
  options: MaterializeCatalogEntryImageOptions = {},
): GeneratedImage {
  const batchId = options.batchId ?? resolveCatalogEntryBatchId(entry);
  const createdAt = options.createdAt ?? resolveCatalogEntryCreatedAt(entry);

  return {
    id: entry.id,
    src: toStudioAssetUrl(entry.publicUrl),
    thumbnail: options.thumbnail ?? resolveCatalogEntryThumbnailUrl(entry),
    preview: resolveCatalogEntryPreviewUrl(entry),
    width: entry.width,
    height: entry.height,
    batchId,
    createdAt,
    isFavorite: entry.isFavorite,
  };
}

export function materializeCatalogEntryImageWithConfig(
  entry: CatalogImage,
): GeneratedImageWithConfig {
  return {
    ...materializeCatalogEntryImage(entry),
    config: buildGenerationConfigFromCatalogImage(entry),
  };
}
