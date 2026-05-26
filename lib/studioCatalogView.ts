import type { CatalogImage } from '../packages/shared/src';

export interface CatalogEntryFilters {
  workspaceId?: string | null;
  favorite?: boolean;
  deleted?: boolean;
  batchId?: string | null;
  jobId?: string | null;
}

export interface StudioCatalogView {
  entries: CatalogImage[];
  byId: Map<string, CatalogImage>;
  byBatchId: Map<string, CatalogImage[]>;
}

function createdAtMs(entry: Pick<CatalogImage, 'createdAt'>) {
  return Date.parse(entry.createdAt) || 0;
}

function compareCatalogEntries(a: CatalogImage, b: CatalogImage) {
  return createdAtMs(b) - createdAtMs(a) || a.id.localeCompare(b.id);
}

function resolveCatalogBatchGroupId(entry: Pick<CatalogImage, 'batchId' | 'jobId' | 'id'>) {
  return entry.batchId || `studio-${entry.jobId ?? entry.id}`;
}

export function createCatalogView(entries: CatalogImage[]): StudioCatalogView {
  const sortedEntries = entries.toSorted(compareCatalogEntries);
  const byId = new Map<string, CatalogImage>();
  const byBatchId = new Map<string, CatalogImage[]>();

  for (const entry of sortedEntries) {
    byId.set(entry.id, entry);
    const batchId = resolveCatalogBatchGroupId(entry);
    const batchEntries = byBatchId.get(batchId) ?? [];
    batchEntries.push(entry);
    byBatchId.set(batchId, batchEntries);
  }

  return {
    entries: sortedEntries,
    byId,
    byBatchId,
  };
}

export function selectCatalogEntries(
  view: StudioCatalogView,
  filters: CatalogEntryFilters = {},
): CatalogImage[] {
  return view.entries.filter((entry) => {
    if (filters.workspaceId !== undefined && entry.workspaceId !== filters.workspaceId) {
      return false;
    }
    if (filters.favorite !== undefined && entry.isFavorite !== filters.favorite) {
      return false;
    }
    if (filters.deleted !== undefined && entry.isDeleted !== filters.deleted) {
      return false;
    }
    if (filters.batchId !== undefined && entry.batchId !== filters.batchId) {
      return false;
    }
    if (filters.jobId !== undefined && entry.jobId !== filters.jobId) {
      return false;
    }

    return true;
  });
}
