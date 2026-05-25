import type { CatalogImage } from '../packages/shared/src';
import type { GenerationBatch } from '../types';
import {
  materializeVisualBatchImage,
  resolveVisualBatchCreatedAt,
  resolveVisualBatchId,
} from './studioVisualBatchCatalog';
import { buildGenerationConfigFromCatalogImage } from '../utils/catalogImageGenerationConfig';

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

export function createCatalogView(entries: CatalogImage[]): StudioCatalogView {
  const sortedEntries = [...entries].sort(compareCatalogEntries);
  const byId = new Map<string, CatalogImage>();
  const byBatchId = new Map<string, CatalogImage[]>();

  for (const entry of sortedEntries) {
    byId.set(entry.id, entry);
    const batchId = resolveVisualBatchId(entry);
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

export function materializeVisualBatchesFromCatalog(view: StudioCatalogView): GenerationBatch[] {
  const batches: GenerationBatch[] = [];

  for (const [batchId, entries] of view.byBatchId) {
    const firstEntry = entries[0];
    if (!firstEntry) continue;
    const createdAt = resolveVisualBatchCreatedAt(firstEntry);

    batches.push({
      id: batchId,
      workspaceId: firstEntry.workspaceId || 'default',
      config: buildGenerationConfigFromCatalogImage(firstEntry),
      images: entries.map((entry) =>
        materializeVisualBatchImage(entry, {
          batchId,
          createdAt: resolveVisualBatchCreatedAt(entry),
        }),
      ),
      createdAt,
    });
  }

  return batches.sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id));
}
