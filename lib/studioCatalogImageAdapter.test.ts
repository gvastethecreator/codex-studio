import { describe, expect, it } from 'vite-plus/test';
import type { CatalogImage } from '../packages/shared/src';
import {
  materializeCatalogEntryImage,
  materializeCatalogEntryImageWithConfig,
  resolveCatalogEntryBatchId,
} from './studioCatalogImageAdapter';

function catalogImage(overrides: Partial<CatalogImage> = {}): CatalogImage {
  const id = overrides.id ?? 'image-1';

  return {
    id,
    libraryId: overrides.libraryId ?? 'library-1',
    filePath: overrides.filePath ?? `C:/library/outputs/${id}.png`,
    thumbnailPath: overrides.thumbnailPath ?? null,
    publicUrl: overrides.publicUrl ?? `/library/outputs/${id}.png`,
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
    batchId: 'batchId' in overrides ? (overrides.batchId ?? null) : 'batch-1',
    recipeId: overrides.recipeId ?? null,
    isFavorite: overrides.isFavorite ?? false,
    isDeleted: overrides.isDeleted ?? false,
    deletedAt: overrides.deletedAt ?? null,
    tags: overrides.tags ?? [],
    generationConfig: overrides.generationConfig ?? null,
    createdAt: overrides.createdAt ?? '2026-05-24T00:00:00.000Z',
  };
}

describe('studioCatalogImageAdapter', () => {
  it('materializes one Catalog Entry image without a legacy Visual Batch lookup', () => {
    const image = materializeCatalogEntryImage(catalogImage({ isFavorite: true }));

    expect(image).toEqual(
      expect.objectContaining({
        id: 'image-1',
        src: 'http://localhost:17223/library/outputs/image-1.png',
        batchId: 'batch-1',
        isFavorite: true,
      }),
    );
  });

  it('falls back to an on-demand thumbnail variant when the catalog entry has no stored thumbnail', () => {
    const image = materializeCatalogEntryImage(catalogImage({ thumbnailUrl: null }));

    expect(image.thumbnail).toBe(
      'http://localhost:17223/library/outputs/image-1.png?variant=thumb&max=512',
    );
  });

  it('falls back to a stable compatibility batch id when the catalog entry has no batch id', () => {
    expect(
      resolveCatalogEntryBatchId(
        catalogImage({
          id: 'image-2',
          batchId: null,
          jobId: 'job-77',
        }),
      ),
    ).toBe('studio-job-77');
  });

  it('materializes a Catalog Entry image with config without a legacy Visual Batch lookup', () => {
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
        src: 'http://localhost:17223/library/outputs/catalog-image.png',
        config: expect.objectContaining({
          prompt: 'Stored prompt',
          model: 'codex-imagegen',
          aspectRatio: '1:1',
        }),
      }),
    );
  });
});
