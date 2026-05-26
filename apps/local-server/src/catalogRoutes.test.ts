import { describe, expect, it } from 'vite-plus/test';

import type { CatalogImage } from '../../../packages/shared/src';
import { createCatalogRoutes, createMemoryCatalogStore } from './catalogRoutes';
import { createCatalogCommands } from './catalogCommands';
import type { QueryCatalogFilters, StudioCatalogStore } from './catalogStore';

function catalogImage(overrides: Partial<CatalogImage> = {}): CatalogImage {
  return {
    id: overrides.id ?? 'image-1',
    libraryId: overrides.libraryId ?? 'library-1',
    filePath: overrides.filePath ?? 'D:/library/outputs/image-1.png',
    thumbnailPath: overrides.thumbnailPath ?? null,
    publicUrl: overrides.publicUrl ?? '/library/outputs/image-1.png',
    thumbnailUrl: overrides.thumbnailUrl ?? null,
    prompt: overrides.prompt ?? 'prompt',
    negativePrompt: overrides.negativePrompt ?? null,
    aspectRatio: overrides.aspectRatio ?? '1:1',
    imageSize: overrides.imageSize ?? '1024x1024',
    width: overrides.width ?? null,
    height: overrides.height ?? null,
    mimeType: overrides.mimeType ?? 'image/png',
    fileSizeBytes: overrides.fileSizeBytes ?? null,
    jobId: overrides.jobId ?? null,
    workspaceId: overrides.workspaceId ?? null,
    batchId: overrides.batchId ?? null,
    recipeId: overrides.recipeId ?? null,
    isFavorite: overrides.isFavorite ?? false,
    isDeleted: overrides.isDeleted ?? false,
    deletedAt: overrides.deletedAt ?? null,
    tags: overrides.tags ?? [],
    generationConfig: overrides.generationConfig ?? null,
    createdAt: overrides.createdAt ?? '2026-05-26T00:00:00.000Z',
  };
}

function createRoutes(store: StudioCatalogStore) {
  return createCatalogRoutes({
    catalogStore: store,
    catalogCommands: createCatalogCommands({
      updateCatalogImage: (...args) => store.updateCatalogImage(...args),
      softDeleteCatalogImage: (...args) => store.softDeleteCatalogImage(...args),
      restoreCatalogImage: (...args) => store.restoreCatalogImage(...args),
      purgeCatalogImage: (...args) => store.purgeCatalogImage(...args),
      publishEvent: () => {},
    }),
    embedMetadata: async (filePath) => ({
      filePath,
      bytesWritten: 0,
      format: 'png' as const,
    }),
  });
}

describe('catalog routes', () => {
  it('queries through an injected Catalog Store', async () => {
    const calls: QueryCatalogFilters[] = [];
    const image = catalogImage({
      id: 'image-42',
      workspaceId: 'workspace-1',
      jobId: 'job-1',
      batchId: 'batch-1',
      isFavorite: true,
      tags: ['studio'],
    });
    const routes = createRoutes(
      createMemoryCatalogStore([image], (filters) => calls.push(filters ?? {})),
    );

    const response = await routes.request(
      '/?workspace_id=workspace-1&job_id=job-1&batch_id=batch-1&favorite=true&deleted=false&q=studio&offset=5&limit=10',
    );

    await expect(response.json()).resolves.toEqual({
      images: [image],
      total: 1,
      hasMore: false,
    });
    expect(calls).toEqual([
      {
        libraryId: null,
        workspaceId: 'workspace-1',
        jobId: 'job-1',
        batchId: 'batch-1',
        favorite: true,
        isDeleted: false,
        q: 'studio',
        offset: 5,
        limit: 10,
      },
    ]);
  });

  it('updates and restores Catalog Entries without DB globals', async () => {
    const image = catalogImage({ id: 'image-99', isFavorite: false });
    const routes = createRoutes(createMemoryCatalogStore([image]));

    const patched = await routes.request('/image-99', {
      method: 'PATCH',
      body: JSON.stringify({ isFavorite: true, tags: ['kept'] }),
      headers: { 'Content-Type': 'application/json' },
    });
    const deleted = await routes.request('/image-99', { method: 'DELETE' });
    const restored = await routes.request('/image-99/restore', { method: 'POST' });
    const missing = await routes.request('/missing');

    await expect(patched.json()).resolves.toMatchObject({
      id: 'image-99',
      isFavorite: true,
      tags: ['kept'],
    });
    await expect(deleted.json()).resolves.toMatchObject({
      id: 'image-99',
      isDeleted: true,
    });
    await expect(restored.json()).resolves.toMatchObject({
      id: 'image-99',
      isDeleted: false,
    });
    expect(missing.status).toBe(404);
  });
});
