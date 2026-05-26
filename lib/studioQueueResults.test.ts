import { describe, expect, it } from 'vite-plus/test';
import type { CatalogImage } from '../packages/shared/src';
import { buildStudioQueueResultPreviews } from './studioQueueResults';

function catalogImage(overrides: Partial<CatalogImage> = {}): CatalogImage {
  const id = overrides.id ?? 'catalog-image';

  return {
    id,
    libraryId: overrides.libraryId ?? 'library-1',
    filePath: overrides.filePath ?? `C:/library/assets/${id}.png`,
    thumbnailPath: overrides.thumbnailPath ?? null,
    publicUrl: overrides.publicUrl ?? `/library/assets/${id}.png`,
    thumbnailUrl: overrides.thumbnailUrl ?? null,
    prompt: overrides.prompt ?? 'Catalog prompt',
    negativePrompt: overrides.negativePrompt ?? null,
    aspectRatio: overrides.aspectRatio ?? '1:1',
    imageSize: overrides.imageSize ?? '1K',
    width: overrides.width ?? null,
    height: overrides.height ?? null,
    mimeType: overrides.mimeType ?? 'image/png',
    fileSizeBytes: overrides.fileSizeBytes ?? null,
    jobId: overrides.jobId ?? 'job-1',
    workspaceId: overrides.workspaceId ?? 'default',
    batchId: overrides.batchId ?? 'catalog-batch',
    recipeId: overrides.recipeId ?? null,
    isFavorite: overrides.isFavorite ?? false,
    isDeleted: overrides.isDeleted ?? false,
    deletedAt: overrides.deletedAt ?? null,
    tags: overrides.tags ?? [],
    generationConfig: overrides.generationConfig ?? null,
    createdAt: overrides.createdAt ?? '2026-05-24T00:00:00.000Z',
  };
}

describe('buildStudioQueueResultPreviews', () => {
  it('sorts newest first and prefers thumbnails for queue result previews', () => {
    const previews = buildStudioQueueResultPreviews(
      [
        catalogImage({
          id: 'older',
          publicUrl: '/library/assets/older.png',
          createdAt: '2026-05-24T00:00:00.000Z',
        }),
        catalogImage({
          id: 'newer',
          thumbnailUrl: '/library/thumbs/newer.webp',
          createdAt: '2026-05-25T00:00:00.000Z',
        }),
      ],
      { toAssetUrl: (assetPath) => `studio:${assetPath}` },
    );

    expect(previews.map((preview) => preview.id)).toEqual(['newer', 'older']);
    expect(previews[0]?.src).toBe('studio:/library/thumbs/newer.webp');
    expect(previews[1]?.src).toBe('studio:/library/assets/older.png');
  });

  it('caps the number of queue result previews', () => {
    const previews = buildStudioQueueResultPreviews(
      [
        catalogImage({ id: 'one', createdAt: '2026-05-25T00:00:01.000Z' }),
        catalogImage({ id: 'two', createdAt: '2026-05-25T00:00:02.000Z' }),
        catalogImage({ id: 'three', createdAt: '2026-05-25T00:00:03.000Z' }),
      ],
      { limit: 2 },
    );

    expect(previews.map((preview) => preview.id)).toEqual(['three', 'two']);
  });
});
