import type { CatalogImage } from '../packages/shared/src';

export interface StudioQueueResultPreview {
  id: string;
  src: string;
  fullSrc: string;
  prompt: string | null;
  jobId: string | null;
  recipeId: string | null;
  createdAt: string;
}

interface BuildStudioQueueResultPreviewsOptions {
  limit?: number;
  thumbnailMaxEdge?: number;
  toAssetUrl?: (
    assetPath: string,
    options?: {
      variant?: 'thumb';
      maxEdge?: number;
    },
  ) => string;
}

function createdAtMs(entry: Pick<CatalogImage, 'createdAt'>) {
  return Date.parse(entry.createdAt) || 0;
}

function compareCatalogEntries(left: CatalogImage, right: CatalogImage) {
  return createdAtMs(right) - createdAtMs(left) || left.id.localeCompare(right.id);
}

export function buildStudioQueueResultPreviews(
  entries: CatalogImage[],
  {
    limit = 6,
    thumbnailMaxEdge = 96,
    toAssetUrl = (assetPath) => assetPath,
  }: BuildStudioQueueResultPreviewsOptions = {},
): StudioQueueResultPreview[] {
  return entries
    .toSorted(compareCatalogEntries)
    .slice(0, limit)
    .map((entry) => ({
      id: entry.id,
      src: entry.thumbnailUrl
        ? toAssetUrl(entry.thumbnailUrl)
        : toAssetUrl(entry.publicUrl, { variant: 'thumb', maxEdge: thumbnailMaxEdge }),
      fullSrc: toAssetUrl(entry.publicUrl),
      prompt: entry.prompt,
      jobId: entry.jobId,
      recipeId: entry.recipeId,
      createdAt: entry.createdAt,
    }));
}
