import { describe, expect, it } from 'vite-plus/test';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { CatalogImage } from '../packages/shared/src';
import type { GenerationBatch } from '../types';
import { createCatalogView } from '../lib/studioCatalogView';
import { buildLegacyVisualBatchSnapshot, buildWorkspaceExportImages } from './useVaultTransfer';

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

const batches: GenerationBatch[] = [
  {
    id: 'visual-batch',
    workspaceId: 'default',
    config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'Visual prompt' },
    images: [
      {
        id: 'visual-image',
        batchId: 'visual-batch',
        src: '/visual.png',
        createdAt: 1,
      },
    ],
    createdAt: 1,
  },
];

describe('vault transfer builders', () => {
  it('prefers Catalog View for vault snapshot export payloads', () => {
    const catalogView = createCatalogView([
      catalogImage({
        id: 'catalog-image',
        batchId: 'catalog-batch',
        generationConfig: { prompt: 'Catalog prompt' },
      }),
    ]);

    const snapshotBatches = buildLegacyVisualBatchSnapshot({
      catalogView,
      legacyVisualBatches: batches,
    });

    expect(snapshotBatches.map((batch) => batch.id)).toEqual(['catalog-batch']);
    expect(snapshotBatches[0].images.map((image) => image.id)).toEqual(['catalog-image']);
    expect(snapshotBatches[0].config.prompt).toBe('Catalog prompt');
  });

  it('prefers Catalog View for workspace archive images', () => {
    const catalogView = createCatalogView([
      catalogImage({
        id: 'catalog-image',
        generationConfig: { prompt: 'Catalog archive prompt' },
      }),
    ]);

    const images = buildWorkspaceExportImages({
      catalogView,
      legacyVisualBatches: batches,
    });

    expect(images.map((image) => image.id)).toEqual(['catalog-image']);
    expect(images[0].config.prompt).toBe('Catalog archive prompt');
  });

  it('keeps Visual Batch fallback for legacy vault callers', () => {
    expect(buildLegacyVisualBatchSnapshot({ legacyVisualBatches: batches })).toBe(batches);
    expect(
      buildWorkspaceExportImages({ legacyVisualBatches: batches }).map((image) => image.id),
    ).toEqual(['visual-image']);
  });
});
