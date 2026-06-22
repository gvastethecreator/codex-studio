import type {
  CatalogBatchCommandResult,
  CatalogCommandFilter,
  CatalogImage,
} from '../../../packages/shared/src';

type CatalogUpdatePatch = {
  isFavorite?: boolean;
  tags?: string[];
  workspaceId?: string | null;
};

export type CatalogCommandResult =
  | { ok: true; image: CatalogImage }
  | { ok: false; reason: 'not_found' };

export interface CreateCatalogCommandsDependencies {
  listCatalogImageIds: (filters: CatalogCommandFilter) => string[];
  updateCatalogImage: (id: string, patch: CatalogUpdatePatch) => CatalogImage | null;
  softDeleteCatalogImage: (id: string) => CatalogImage | null;
  restoreCatalogImage: (id: string) => CatalogImage | null;
  purgeCatalogImage: (id: string) => CatalogImage | null;
  publishEvent: (type: string, payload: CatalogImage) => void;
}

function resultFor(
  image: CatalogImage | null,
  eventType: 'catalog.updated' | 'catalog.deleted',
  publishEvent: CreateCatalogCommandsDependencies['publishEvent'],
): CatalogCommandResult {
  if (!image) return { ok: false, reason: 'not_found' };
  publishEvent(eventType, image);
  return { ok: true, image };
}

function hasScopeFilter(filters: CatalogCommandFilter) {
  return Boolean(
    (filters.ids && filters.ids.length > 0) ||
    typeof filters.workspaceId === 'string' ||
    typeof filters.batchId === 'string',
  );
}

export function createCatalogCommands({
  listCatalogImageIds,
  updateCatalogImage,
  softDeleteCatalogImage,
  restoreCatalogImage,
  purgeCatalogImage,
  publishEvent,
}: CreateCatalogCommandsDependencies) {
  function runBatchCommand({
    action,
    filters,
    run,
    eventType,
  }: {
    action: CatalogBatchCommandResult['action'];
    filters: CatalogCommandFilter;
    run: (id: string) => CatalogImage | null;
    eventType: 'catalog.updated' | 'catalog.deleted';
  }): CatalogBatchCommandResult {
    const ids = listCatalogImageIds(filters);
    const failed: CatalogBatchCommandResult['failed'] = [];
    let changedCount = 0;

    for (const id of ids) {
      try {
        const image = run(id);
        if (!image) {
          failed.push({ id, reason: 'not_found' });
          continue;
        }
        changedCount += 1;
        publishEvent(eventType, image);
      } catch (error) {
        failed.push({
          id,
          reason: 'operation_failed',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      ok: true,
      action,
      matchedCount: ids.length,
      changedCount,
      failed,
    };
  }

  return {
    update(id: string, patch: CatalogUpdatePatch) {
      return resultFor(updateCatalogImage(id, patch), 'catalog.updated', publishEvent);
    },
    softDelete(id: string) {
      return resultFor(softDeleteCatalogImage(id), 'catalog.updated', publishEvent);
    },
    restore(id: string) {
      return resultFor(restoreCatalogImage(id), 'catalog.updated', publishEvent);
    },
    purge(id: string) {
      return resultFor(purgeCatalogImage(id), 'catalog.deleted', publishEvent);
    },
    archiveByFilter(filters: CatalogCommandFilter) {
      if (!hasScopeFilter(filters)) {
        return {
          ok: true,
          action: 'archive',
          matchedCount: 0,
          changedCount: 0,
          failed: [],
        } satisfies CatalogBatchCommandResult;
      }
      return runBatchCommand({
        action: 'archive',
        filters: { ...filters, isDeleted: filters.isDeleted ?? false },
        run: softDeleteCatalogImage,
        eventType: 'catalog.updated',
      });
    },
    restoreByFilter(filters: CatalogCommandFilter) {
      return runBatchCommand({
        action: 'restore',
        filters: { ...filters, isDeleted: filters.isDeleted ?? true },
        run: restoreCatalogImage,
        eventType: 'catalog.updated',
      });
    },
    purgeByFilter(filters: CatalogCommandFilter) {
      return runBatchCommand({
        action: 'purge',
        filters: { ...filters, isDeleted: filters.isDeleted ?? true },
        run: purgeCatalogImage,
        eventType: 'catalog.deleted',
      });
    },
  };
}
