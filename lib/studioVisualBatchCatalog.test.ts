import { describe, expect, it } from 'vite-plus/test';

import type { CatalogImage } from '../packages/shared/src';
import { materializeVisualBatch, materializeVisualBatches, resolveVisualBatchId } from './studioVisualBatchCatalog';

function createCatalogImage(overrides: Partial<CatalogImage> = {}): CatalogImage {
  return {
    id: 'asset-1',
    libraryId: 'library-1',
    filePath: '/library/assets/asset-1.png',
    thumbnailPath: '/library/thumbnails/asset-1.png',
    publicUrl: '/library/assets/asset-1.png',
    thumbnailUrl: '/library/thumbnails/asset-1.png',
    prompt: 'Neon skyline',
    negativePrompt: null,
    aspectRatio: '1:1',
    imageSize: '1K',
    width: 1024,
    height: 1024,
    mimeType: 'image/png',
    fileSizeBytes: 1234,
    jobId: 'job-1',
    workspaceId: 'shots',
    batchId: 'batch-1',
    recipeId: 'camera',
    isFavorite: true,
    isDeleted: false,
    deletedAt: null,
    tags: [],
    generationConfig: null,
    createdAt: '2026-05-15T00:00:00.000Z',
    ...overrides,
  };
}

describe('studioVisualBatchCatalog', () => {
  it('materializes one Catalog Entry into a Visual Batch', () => {
    const batch = materializeVisualBatch(createCatalogImage());

    expect(batch.id).toBe('batch-1');
    expect(batch.workspaceId).toBe('shots');
    expect(batch.images).toHaveLength(1);
    expect(batch.images[0].id).toBe('asset-1');
    expect(batch.images[0].isFavorite).toBe(true);
  });

  it('falls back to a stable Visual Batch id when the catalog image has no batch id', () => {
    expect(
      resolveVisualBatchId(
        createCatalogImage({
          id: 'asset-2',
          batchId: null,
          jobId: 'job-77',
        }),
      ),
    ).toBe('studio-job-77');
  });

  it('filters already-imported Catalog Entries when materializing Visual Batches', () => {
    const batches = materializeVisualBatches(
      [createCatalogImage(), createCatalogImage({ id: 'asset-2', batchId: 'batch-2' })],
      { excludeImageIds: ['asset-1'] },
    );

    expect(batches).toHaveLength(1);
    expect(batches[0].id).toBe('batch-2');
    expect(batches[0].images[0].id).toBe('asset-2');
  });
});
