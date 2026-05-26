import { describe, expect, it } from 'vite-plus/test';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { CatalogImage } from '../packages/shared/src';
import type { GenerationBatch, Workspace } from '../types';
import { createCatalogView } from '../lib/studioCatalogView';
import { buildWorkspacesWithThumbs } from './useWorkspaceStrip';

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

const workspaces: Workspace[] = [
  { id: 'default', name: 'Default', createdAt: 1 },
  { id: 'concepts', name: 'Concepts', createdAt: 2 },
];

describe('buildWorkspacesWithThumbs', () => {
  it('prefers Catalog Entries for workspace counts and thumbnails', () => {
    const batches: GenerationBatch[] = [
      {
        id: 'visual-batch',
        workspaceId: 'default',
        createdAt: 1,
        config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'legacy batch prompt' },
        images: [
          {
            id: 'visual-image',
            batchId: 'visual-batch',
            src: '/legacy.png',
            createdAt: 1,
          },
        ],
      },
    ];
    const catalogView = createCatalogView([
      catalogImage({
        id: 'old-default',
        workspaceId: 'default',
        createdAt: '2026-05-24T00:00:00.000Z',
      }),
      catalogImage({
        id: 'new-default',
        workspaceId: 'default',
        thumbnailUrl: '/thumbs/new-default.webp',
        createdAt: '2026-05-25T00:00:00.000Z',
      }),
      catalogImage({
        id: 'concept-entry',
        workspaceId: 'concepts',
        createdAt: '2026-05-23T00:00:00.000Z',
      }),
    ]);

    const result = buildWorkspacesWithThumbs({
      workspaces,
      catalogView,
      legacyVisualBatches: batches,
    });

    expect(result).toMatchObject([
      {
        id: 'default',
        imageCount: 2,
      },
      {
        id: 'concepts',
        imageCount: 1,
      },
    ]);
    expect(result[0].lastImage).toContain('/thumbs/new-default.webp');
    expect(result[0].lastImage).not.toBe('/legacy.png');
  });

  it('keeps Visual Batch fallback for legacy callers', () => {
    const batches: GenerationBatch[] = [
      {
        id: 'older',
        workspaceId: 'default',
        createdAt: 1,
        config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'older' },
        images: [
          {
            id: 'older-image',
            batchId: 'older',
            src: '/older.png',
            createdAt: 1,
          },
        ],
      },
      {
        id: 'newer',
        workspaceId: 'default',
        createdAt: 2,
        config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'newer' },
        images: [
          {
            id: 'newer-image',
            batchId: 'newer',
            src: '/newer.png',
            thumbnail: '/newer-thumb.webp',
            createdAt: 2,
          },
        ],
      },
    ];

    const result = buildWorkspacesWithThumbs({ workspaces, legacyVisualBatches: batches });

    expect(result[0].imageCount).toBe(2);
    expect(result[0].lastImage).toBe('/newer-thumb.webp');
    expect(result[1].imageCount).toBe(0);
  });
});
