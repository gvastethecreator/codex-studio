import { Hono } from 'hono';

import type {
  CatalogBatchCommandResult,
  CatalogCommandFilter,
  CatalogImage,
} from '../../../packages/shared/src';
import type { CatalogCommandResult } from './catalogCommands';
import type { StudioCatalogStore } from './catalogStore';
import type { embedMetadata as embedMetadataFn } from './metadataEmbedder';

interface CatalogCommandsBoundary {
  update(
    id: string,
    patch: { isFavorite?: boolean; tags?: string[]; workspaceId?: string | null },
  ): CatalogCommandResult;
  softDelete(id: string): CatalogCommandResult;
  restore(id: string): CatalogCommandResult;
  purge(id: string): CatalogCommandResult;
  archiveByFilter(filters: CatalogCommandFilter): CatalogBatchCommandResult;
  restoreByFilter(filters: CatalogCommandFilter): CatalogBatchCommandResult;
  purgeByFilter(filters: CatalogCommandFilter): CatalogBatchCommandResult;
}

export interface CreateCatalogRoutesDependencies {
  catalogStore: StudioCatalogStore;
  catalogCommands: CatalogCommandsBoundary;
  embedMetadata: typeof embedMetadataFn;
}

function jsonNotFound(c: { json: (payload: unknown, status: 404) => Response }) {
  return c.json({ error: 'Catalog image not found' }, 404);
}

function catalogFiltersFromUrl(url: string) {
  const searchParams = new URL(url).searchParams;
  return {
    libraryId: searchParams.get('library_id'),
    workspaceId: searchParams.get('workspace_id'),
    jobId: searchParams.get('job_id'),
    batchId: searchParams.get('batch_id'),
    favorite: searchParams.has('favorite') ? searchParams.get('favorite') === 'true' : undefined,
    isDeleted: searchParams.get('deleted') === 'true',
    q: searchParams.get('q'),
    offset: Number(searchParams.get('offset') || 0),
    limit: Number(searchParams.get('limit') || 50),
  };
}

async function readCatalogCommandFilter(request: { json: () => Promise<unknown> }) {
  const body = await request.json().catch(() => ({}));
  const record = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const raw = record as Record<string, unknown>;
  return {
    ids: Array.isArray(raw.ids)
      ? raw.ids.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : undefined,
    workspaceId:
      typeof raw.workspaceId === 'string' || raw.workspaceId === null ? raw.workspaceId : undefined,
    batchId: typeof raw.batchId === 'string' ? raw.batchId : undefined,
    isDeleted: typeof raw.isDeleted === 'boolean' ? raw.isDeleted : undefined,
  } satisfies CatalogCommandFilter;
}

export function createCatalogRoutes({
  catalogStore,
  catalogCommands,
  embedMetadata,
}: CreateCatalogRoutesDependencies) {
  const routes = new Hono();

  routes.get('/', (c) => c.json(catalogStore.queryCatalog(catalogFiltersFromUrl(c.req.url))));

  routes.get('/search', (c) => {
    const url = new URL(c.req.url);
    return c.json(
      catalogStore.queryCatalog({
        q: url.searchParams.get('q'),
        offset: Number(url.searchParams.get('offset') || 0),
        limit: Number(url.searchParams.get('limit') || 50),
      }),
    );
  });

  routes.get('/workspaces', (c) => {
    const searchParams = new URL(c.req.url).searchParams;
    return c.json(
      catalogStore.queryWorkspaceSummaries({
        libraryId: searchParams.get('library_id'),
        isDeleted: searchParams.get('deleted') === 'true',
      }),
    );
  });

  routes.post('/commands/archive', async (c) => {
    return c.json(catalogCommands.archiveByFilter(await readCatalogCommandFilter(c.req)));
  });

  routes.post('/commands/restore', async (c) => {
    return c.json(catalogCommands.restoreByFilter(await readCatalogCommandFilter(c.req)));
  });

  routes.post('/commands/purge', async (c) => {
    return c.json(catalogCommands.purgeByFilter(await readCatalogCommandFilter(c.req)));
  });

  routes.get('/:id', (c) => {
    const image = catalogStore.getCatalogImage(c.req.param('id'));
    if (!image) return jsonNotFound(c);
    return c.json(image);
  });

  routes.patch('/:id', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const result = catalogCommands.update(c.req.param('id'), {
      isFavorite: body.isFavorite,
      tags: body.tags,
      workspaceId: body.workspaceId,
    });
    if (!result.ok) return jsonNotFound(c);
    return c.json(result.image);
  });

  routes.delete('/:id', (c) => {
    const result = catalogCommands.softDelete(c.req.param('id'));
    if (!result.ok) return jsonNotFound(c);
    return c.json(result.image);
  });

  routes.delete('/:id/permanent', (c) => {
    const result = catalogCommands.purge(c.req.param('id'));
    if (!result.ok) return jsonNotFound(c);
    return c.json(result.image);
  });

  routes.post('/:id/restore', (c) => {
    const result = catalogCommands.restore(c.req.param('id'));
    if (!result.ok) return jsonNotFound(c);
    return c.json(result.image);
  });

  routes.post('/:id/embed', async (c) => {
    const image = catalogStore.getCatalogImage(c.req.param('id'));
    if (!image) return jsonNotFound(c);
    const result = await embedMetadata(image.filePath, {
      prompt: image.prompt || '',
      negativePrompt: image.negativePrompt,
      aspectRatio: image.aspectRatio,
      imageSize: image.imageSize,
      model: 'codex-imagegen',
      recipe: image.recipeId,
      batchId: image.batchId,
      generatedAt: image.createdAt,
      studioVersion: '0.0.0',
      libraryId: image.libraryId,
      catalogId: image.id,
    });
    return c.json(result);
  });

  return routes;
}

export function createMemoryCatalogStore(
  images: CatalogImage[],
  onQuery?: (filters: Parameters<StudioCatalogStore['queryCatalog']>[0]) => void,
): StudioCatalogStore {
  const byId = new Map(images.map((image) => [image.id, image]));
  return {
    getCatalogImage: (id) => byId.get(id) ?? null,
    listCatalogImageIds(filters = {}) {
      const ids: string[] = [];
      const filterIds = filters.ids && filters.ids.length > 0 ? new Set(filters.ids) : null;
      for (const image of byId.values()) {
        if (filterIds && !filterIds.has(image.id)) continue;
        if (
          filters.workspaceId !== undefined &&
          (image.workspaceId ?? 'default') !== filters.workspaceId
        ) {
          continue;
        }
        if (filters.batchId && image.batchId !== filters.batchId) continue;
        if (filters.isDeleted !== undefined && image.isDeleted !== filters.isDeleted) continue;
        ids.push(image.id);
      }
      return ids;
    },
    queryCatalog(filters = {}) {
      onQuery?.(filters);
      return {
        images,
        total: images.length,
        hasMore: false,
      };
    },
    queryWorkspaceSummaries(filters = {}) {
      const summaries = new Map<
        string,
        {
          images: CatalogImage[];
          imageCount: number;
          totalFileSizeBytes: number;
          knownFileSizeCount: number;
          libraryIds: Set<string>;
        }
      >();

      for (const image of byId.values()) {
        if (image.isDeleted !== Boolean(filters.isDeleted)) continue;
        if (filters.libraryId && image.libraryId !== filters.libraryId) continue;

        const workspaceId = image.workspaceId ?? 'default';
        const summary =
          summaries.get(workspaceId) ??
          ({
            images: [],
            imageCount: 0,
            totalFileSizeBytes: 0,
            knownFileSizeCount: 0,
            libraryIds: new Set<string>(),
          } satisfies {
            images: CatalogImage[];
            imageCount: number;
            totalFileSizeBytes: number;
            knownFileSizeCount: number;
            libraryIds: Set<string>;
          });

        summary.images.push(image);
        summary.imageCount += 1;
        summary.libraryIds.add(image.libraryId);
        if (image.fileSizeBytes !== null) {
          summary.totalFileSizeBytes += image.fileSizeBytes;
          summary.knownFileSizeCount += 1;
        }
        summaries.set(workspaceId, summary);
      }

      return [...summaries.entries()]
        .map(([workspaceId, summary]) => {
          const lastImage =
            [...summary.images].sort((left, right) =>
              right.createdAt.localeCompare(left.createdAt),
            )[0] ?? null;

          return {
            workspaceId,
            imageCount: summary.imageCount,
            totalFileSizeBytes: summary.totalFileSizeBytes,
            knownFileSizeCount: summary.knownFileSizeCount,
            libraryIds: [...summary.libraryIds],
            firstCreatedAt:
              [...summary.images].sort((left, right) =>
                left.createdAt.localeCompare(right.createdAt),
              )[0]?.createdAt ?? null,
            latestCreatedAt: lastImage?.createdAt ?? null,
            sampleFilePath: lastImage?.filePath ?? null,
            lastImage: lastImage ? { ...lastImage, generationConfig: null } : null,
          };
        })
        .sort((left, right) =>
          (right.latestCreatedAt ?? '').localeCompare(left.latestCreatedAt ?? ''),
        );
    },
    registerCatalogImage(input) {
      const image = {
        id: `image-${byId.size + 1}`,
        libraryId: input.libraryId ?? 'library-1',
        filePath: input.filePath,
        thumbnailPath: input.thumbnailPath ?? null,
        publicUrl: input.filePath,
        thumbnailUrl: null,
        prompt: input.prompt ?? null,
        negativePrompt: input.negativePrompt ?? null,
        aspectRatio: input.aspectRatio ?? null,
        imageSize: input.imageSize ?? null,
        width: input.width ?? null,
        height: input.height ?? null,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes ?? null,
        jobId: input.jobId ?? null,
        workspaceId: input.workspaceId ?? null,
        batchId: input.batchId ?? null,
        recipeId: input.recipeId ?? null,
        isFavorite: false,
        isDeleted: false,
        deletedAt: null,
        tags: input.tags ?? [],
        generationConfig: input.generationConfig ?? null,
        createdAt: '2026-05-26T00:00:00.000Z',
      } satisfies CatalogImage;
      byId.set(image.id, image);
      return image;
    },
    updateCatalogImage: (id, patch) => {
      const image = byId.get(id);
      if (!image) return null;
      const updated = {
        ...image,
        isFavorite: patch.isFavorite ?? image.isFavorite,
        tags: patch.tags ?? image.tags,
        workspaceId: patch.workspaceId === undefined ? image.workspaceId : patch.workspaceId,
      };
      byId.set(id, updated);
      return updated;
    },
    softDeleteCatalogImage: (id) => {
      const image = byId.get(id);
      if (!image) return null;
      const updated = {
        ...image,
        isDeleted: true,
        deletedAt: '2026-05-26T00:00:00.000Z',
      };
      byId.set(id, updated);
      return updated;
    },
    restoreCatalogImage: (id) => {
      const image = byId.get(id);
      if (!image) return null;
      const updated = {
        ...image,
        isDeleted: false,
        deletedAt: null,
      };
      byId.set(id, updated);
      return updated;
    },
    purgeCatalogImage: (id) => {
      const image = byId.get(id) ?? null;
      byId.delete(id);
      return image;
    },
  };
}
