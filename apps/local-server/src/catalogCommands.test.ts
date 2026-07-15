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
    const events: Array<{ type: string; payload: unknown }> = [];
    const updated = catalogImage({ id: 'image-2', isFavorite: true });
    const commands = createCatalogCommands({
      listCatalogImageIds: () => [],
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
    const events: Array<{ type: string; payload: unknown }> = [];
    const commands = createCatalogCommands({
      listCatalogImageIds: () => [],
      updateCatalogImage: () => null,
      softDeleteCatalogImage: () => null,
      restoreCatalogImage: () => null,
      purgeCatalogImage: () => null,
      publishEvent: (type, payload) => events.push({ type, payload }),
    });

    expect(commands.restore('missing')).toEqual({ ok: false, reason: 'not_found' });
    expect(events).toEqual([]);
  });

  it('uses deletion-specific events only for permanent purge', () => {
    const events: string[] = [];
    const image = catalogImage();
    const commands = createCatalogCommands({
      listCatalogImageIds: () => [],
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

  it('runs full-scope catalog commands from filter-selected ids', () => {
    const first = catalogImage({ id: 'image-1', workspaceId: 'workspace-a' });
    const second = catalogImage({ id: 'image-2', workspaceId: 'workspace-a' });
    const images = new Map([
      [first.id, first],
      [second.id, second],
    ]);
    const events: Array<{ type: string; payload: unknown }> = [];
    const commands = createCatalogCommands({
      listCatalogImageIds: (filters) =>
        [...images.values()]
          .filter((image) => image.workspaceId === filters.workspaceId)
          .map((image) => image.id),
      updateCatalogImage: () => null,
      softDeleteCatalogImage: (id) => images.get(id) ?? null,
      restoreCatalogImage: () => null,
      purgeCatalogImage: () => null,
      publishEvent: (type, payload) => events.push({ type, payload }),
    });

    expect(commands.archiveByFilter({ workspaceId: 'workspace-a' })).toMatchObject({
      ok: true,
      action: 'archive',
      matchedCount: 2,
      changedCount: 2,
      failed: [],
    });
    expect(events).toEqual([
      {
        type: 'catalog.batch_changed',
        payload: {
          action: 'archive',
          changedCount: 2,
          scope: { kind: 'workspace', workspaceId: 'workspace-a' },
        },
      },
    ]);
  });

  it('publishes one compact event for a 200-image batch', () => {
    const ids = Array.from({ length: 200 }, (_, index) => `image-${index}`);
    const events: Array<{ type: string; payload: unknown }> = [];
    const commands = createCatalogCommands({
      listCatalogImageIds: () => ids,
      updateCatalogImage: () => null,
      softDeleteCatalogImage: (id) => catalogImage({ id }),
      restoreCatalogImage: () => null,
      purgeCatalogImage: () => null,
      publishEvent: (type, payload) => events.push({ type, payload }),
    });

    expect(commands.archiveByFilter({ ids })).toMatchObject({ changedCount: 200, failed: [] });
    expect(events).toEqual([
      {
        type: 'catalog.batch_changed',
        payload: { action: 'archive', changedCount: 200, scope: { kind: 'selection' } },
      },
    ]);
  });

  it('publishes one event for partial success and none when no image changes', () => {
    const events: Array<{ type: string; payload: unknown }> = [];
    const commands = createCatalogCommands({
      listCatalogImageIds: (filters) => filters.ids ?? ['ok', 'missing'],
      updateCatalogImage: () => null,
      softDeleteCatalogImage: (id) => (id === 'ok' ? catalogImage({ id }) : null),
      restoreCatalogImage: () => null,
      purgeCatalogImage: () => null,
      publishEvent: (type, payload) => events.push({ type, payload }),
    });

    expect(commands.archiveByFilter({ ids: ['ok', 'missing'] })).toMatchObject({
      changedCount: 1,
      failed: [{ id: 'missing', reason: 'not_found' }],
    });
    expect(events).toHaveLength(1);

    events.length = 0;
    expect(commands.archiveByFilter({ ids: ['missing'] })).toMatchObject({ changedCount: 0 });
    expect(events).toEqual([]);
  });

  it('does not archive the whole catalog without an explicit scope', () => {
    const commands = createCatalogCommands({
      listCatalogImageIds: () => ['image-1'],
      updateCatalogImage: () => null,
      softDeleteCatalogImage: () => catalogImage(),
      restoreCatalogImage: () => null,
      purgeCatalogImage: () => null,
      publishEvent: () => {},
    });

    expect(commands.archiveByFilter({})).toEqual({
      ok: true,
      action: 'archive',
      matchedCount: 0,
      changedCount: 0,
      failed: [],
    });
  });
});
