import { describe, expect, it } from 'vite-plus/test';

import type { CatalogImage } from '../../../packages/shared/src';
import { createCatalogCommands } from './catalogCommands';

function catalogImage(overrides: Partial<CatalogImage> = {}): CatalogImage {
  return {
    id: overrides.id ?? 'image-1',
    libraryId: 'library-1',
    filePath: 'D:/library/assets/image-1.png',
    thumbnailPath: null,
    publicUrl: '/library/assets/image-1.png',
    thumbnailUrl: null,
    prompt: 'prompt',
    negativePrompt: null,
    aspectRatio: '2:3',
    imageSize: '1024x1536',
    width: null,
    height: null,
    mimeType: 'image/png',
    fileSizeBytes: null,
    jobId: null,
    workspaceId: null,
    batchId: null,
    recipeId: null,
    isFavorite: false,
    isDeleted: false,
    deletedAt: null,
    tags: [],
    generationConfig: null,
    createdAt: '2026-05-25T00:00:00.000Z',
    ...overrides,
  };
}

describe('catalogCommands', () => {
  it('publishes Catalog Entry updates from the command boundary', () => {
    const events: { type: string; payload: CatalogImage }[] = [];
    const updated = catalogImage({ id: 'image-2', isFavorite: true });
    const commands = createCatalogCommands({
      updateCatalogImage: () => updated,
      softDeleteCatalogImage: () => null,
      restoreCatalogImage: () => null,
      purgeCatalogImage: () => null,
      publishEvent: (type, payload) => events.push({ type, payload }),
    });

    const result = commands.update('image-2', { isFavorite: true });

    expect(result).toEqual({ ok: true, image: updated });
    expect(events).toEqual([{ type: 'catalog.updated', payload: updated }]);
  });

  it('keeps not-found outcomes HTTP-agnostic and does not publish', () => {
    const events: string[] = [];
    const commands = createCatalogCommands({
      updateCatalogImage: () => null,
      softDeleteCatalogImage: () => null,
      restoreCatalogImage: () => null,
      purgeCatalogImage: () => null,
      publishEvent: (type) => events.push(type),
    });

    expect(commands.restore('missing')).toEqual({ ok: false, reason: 'not_found' });
    expect(events).toEqual([]);
  });

  it('uses deletion-specific events only for permanent purge', () => {
    const events: string[] = [];
    const image = catalogImage();
    const commands = createCatalogCommands({
      updateCatalogImage: () => null,
      softDeleteCatalogImage: () => image,
      restoreCatalogImage: () => image,
      purgeCatalogImage: () => image,
      publishEvent: (type) => events.push(type),
    });

    expect(commands.softDelete('image-1')).toEqual({ ok: true, image });
    expect(commands.restore('image-1')).toEqual({ ok: true, image });
    expect(commands.purge('image-1')).toEqual({ ok: true, image });
    expect(events).toEqual(['catalog.updated', 'catalog.updated', 'catalog.deleted']);
  });
});
