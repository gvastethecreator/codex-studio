import type { CatalogImage } from '../../../packages/shared/src';

type CatalogUpdatePatch = {
  isFavorite?: boolean;
  tags?: string[];
  workspaceId?: string | null;
};

export type CatalogCommandResult =
  | { ok: true; image: CatalogImage }
  | { ok: false; reason: 'not_found' };

export interface CreateCatalogCommandsDependencies {
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

export function createCatalogCommands({
  updateCatalogImage,
  softDeleteCatalogImage,
  restoreCatalogImage,
  purgeCatalogImage,
  publishEvent,
}: CreateCatalogCommandsDependencies) {
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
  };
}
