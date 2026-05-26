import { describe, expect, it } from 'vite-plus/test';
import type { CatalogImage } from '../packages/shared/src';
import type { Workspace } from '../types';
import { createCatalogView } from '../lib/studioCatalogView';
import { buildWorkspacesWithThumbs, mergeWorkspacesWithCatalogEntries } from './useWorkspaceStrip';

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
  it('derives missing workspaces from catalog entries when state is incomplete', () => {
    const merged = mergeWorkspacesWithCatalogEntries(
      [{ id: 'default', name: 'Default', createdAt: 1 }],
      createCatalogView([
        catalogImage({
          id: 'imported-entry',
          workspaceId: '604b5e44-9e74-47b6-92bd-5ae8b446676b',
          createdAt: '2026-05-25T08:00:00.000Z',
        }),
      ]),
    );

    expect(merged).toEqual([
      { id: 'default', name: 'Default', createdAt: 1 },
      {
        id: '604b5e44-9e74-47b6-92bd-5ae8b446676b',
        name: 'Imported (676b)',
        createdAt: Date.parse('2026-05-25T08:00:00.000Z'),
      },
    ]);
  });

  it('builds workspace thumbs from Catalog Entries', () => {
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
  });

  it('returns zero-count workspaces when no catalog view is available', () => {
    const result = buildWorkspacesWithThumbs({ workspaces });

    expect(result[0].imageCount).toBe(0);
    expect(result[0].lastImage).toBeUndefined();
    expect(result[1].imageCount).toBe(0);
  });
});
