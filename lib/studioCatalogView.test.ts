import { describe, expect, it } from 'vite-plus/test';
import type { CatalogImage } from '../packages/shared/src';
import {
  createCatalogView,
  materializeVisualBatchesFromCatalog,
  selectCatalogEntries,
} from './studioCatalogView';

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

describe('studioCatalogView', () => {
  it('keeps Catalog Entries as the primary read model while grouping only for visual compatibility', () => {
    const view = createCatalogView([
      catalogImage({ id: 'newer', batchId: 'batch-a', createdAt: '2026-05-24T00:00:02.000Z' }),
      catalogImage({ id: 'older', batchId: 'batch-a', createdAt: '2026-05-24T00:00:01.000Z' }),
    ]);

    expect(view.entries.map((entry) => entry.id)).toEqual(['newer', 'older']);
    expect(view.byId.get('newer')?.batchId).toBe('batch-a');
    expect(materializeVisualBatchesFromCatalog(view)).toHaveLength(1);
    expect(materializeVisualBatchesFromCatalog(view)[0].images.map((image) => image.id)).toEqual([
      'newer',
      'older',
    ]);
  });

  it('filters Catalog Entries without forcing callers through GenerationBatch state', () => {
    const view = createCatalogView([
      catalogImage({ id: 'active-favorite', isFavorite: true, isDeleted: false }),
      catalogImage({ id: 'deleted-favorite', isFavorite: true, isDeleted: true }),
      catalogImage({ id: 'active-plain', isFavorite: false, isDeleted: false }),
    ]);

    expect(
      selectCatalogEntries(view, { favorite: true, deleted: false }).map((entry) => entry.id),
    ).toEqual(['active-favorite']);
    expect(selectCatalogEntries(view, { deleted: true }).map((entry) => entry.id)).toEqual([
      'deleted-favorite',
    ]);
  });
});
