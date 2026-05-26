import { describe, expect, it } from 'vite-plus/test';
import type { CatalogImage } from '../packages/shared/src';
import { createCatalogView } from './studioCatalogView';
import {
  materializeCatalogEntryImageWithConfig,
  materializeVisualBatchesFromCatalog,
} from './studioCatalogVisualBatchAdapter';

function catalogImage(overrides: Partial<CatalogImage> = {}): CatalogImage {
  const id = overrides.id ?? 'image-1';

  return {
    id,
    libraryId: overrides.libraryId ?? 'library-1',
    filePath: overrides.filePath ?? `C:/library/assets/${id}.png`,
    thumbnailPath: overrides.thumbnailPath ?? null,
    publicUrl: overrides.publicUrl ?? `/library/assets/${id}.png`,
    thumbnailUrl: overrides.thumbnailUrl ?? null,
    prompt: overrides.prompt ?? 'Generate an image',
    negativePrompt: overrides.negativePrompt ?? null,
    aspectRatio: overrides.aspectRatio ?? '2:3',
    imageSize: overrides.imageSize ?? '1024x1536',
    width: overrides.width ?? null,
    height: overrides.height ?? null,
    mimeType: overrides.mimeType ?? 'image/png',
    fileSizeBytes: overrides.fileSizeBytes ?? null,
    jobId: overrides.jobId ?? 'job-1',
    workspaceId: overrides.workspaceId ?? 'default',
    batchId: overrides.batchId ?? 'batch-1',
    recipeId: overrides.recipeId ?? null,
    isFavorite: overrides.isFavorite ?? false,
    isDeleted: overrides.isDeleted ?? false,
    deletedAt: overrides.deletedAt ?? null,
    tags: overrides.tags ?? [],
    generationConfig: overrides.generationConfig ?? null,
    createdAt: overrides.createdAt ?? '2026-05-24T00:00:00.000Z',
  };
}

describe('studioCatalogVisualBatchAdapter', () => {
  it('materializes grouped Catalog Entries only at the Visual Batch compatibility edge', () => {
    const view = createCatalogView([
      catalogImage({ id: 'newer', batchId: 'batch-a', createdAt: '2026-05-24T00:00:02.000Z' }),
      catalogImage({ id: 'older', batchId: 'batch-a', createdAt: '2026-05-24T00:00:01.000Z' }),
    ]);

    const batches = materializeVisualBatchesFromCatalog(view);

    expect(batches).toHaveLength(1);
    expect(batches[0]).toEqual(
      expect.objectContaining({
        id: 'batch-a',
        workspaceId: 'default',
      }),
    );
    expect(batches[0].images.map((image) => image.id)).toEqual(['newer', 'older']);
  });

  it('materializes a Catalog Entry image with config without a GenerationBatch lookup', () => {
    const image = materializeCatalogEntryImageWithConfig(
      catalogImage({
        id: 'catalog-image',
        prompt: 'Catalog prompt',
        generationConfig: {
          prompt: 'Stored prompt',
          model: 'gpt-image-1',
          aspectRatio: '1:1',
        },
      }),
    );

    expect(image).toEqual(
      expect.objectContaining({
        id: 'catalog-image',
        src: 'http://localhost:4317/library/assets/catalog-image.png',
        config: expect.objectContaining({
          prompt: 'Stored prompt',
          model: 'codex-imagegen',
          aspectRatio: '1:1',
        }),
      }),
    );
  });
});
