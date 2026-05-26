import { describe, expect, it } from 'vite-plus/test';
import type { CatalogImage } from '../packages/shared/src';
import { createCatalogView } from './studioCatalogView';
import { buildArchivedImageGroupsFromCatalog } from './studioCatalogTrashView';

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
    isDeleted: overrides.isDeleted ?? true,
    deletedAt: overrides.deletedAt ?? '2026-05-25T00:00:00.000Z',
    tags: overrides.tags ?? [],
    generationConfig: overrides.generationConfig ?? null,
    createdAt: overrides.createdAt ?? '2026-05-24T00:00:00.000Z',
  };
}

describe('buildArchivedImageGroupsFromCatalog', () => {
  it('builds trash groups from Catalog Entries without Visual Batch input', () => {
    const view = createCatalogView([
      catalogImage({
        id: 'older',
        batchId: 'older-batch',
        createdAt: '2026-05-23T00:00:00.000Z',
        generationConfig: { prompt: 'Older prompt', model: 'gpt-image-1' },
      }),
      catalogImage({
        id: 'newer-a',
        batchId: 'newer-batch',
        workspaceId: 'concepts',
        thumbnailUrl: '/thumbs/newer.webp',
        createdAt: '2026-05-25T00:00:00.000Z',
        generationConfig: { prompt: 'Newer prompt', model: 'gemini-2.5-flash-image' },
      }),
      catalogImage({
        id: 'newer-b',
        batchId: 'newer-batch',
        workspaceId: 'concepts',
        createdAt: '2026-05-24T00:00:00.000Z',
      }),
    ]);

    const groups = buildArchivedImageGroupsFromCatalog(view);

    expect(groups).toMatchObject([
      {
        id: 'newer-batch',
        workspaceId: 'concepts',
        prompt: 'Newer prompt',
        model: 'codex-imagegen',
        imageCount: 2,
      },
      {
        id: 'older-batch',
        imageCount: 1,
      },
    ]);
    expect(groups[0].thumbnail).toContain('/thumbs/newer.webp');
  });
});
