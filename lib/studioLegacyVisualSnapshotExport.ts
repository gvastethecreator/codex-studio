import { buildGenerationConfigFromCatalogImage } from '../utils/catalogImageGenerationConfig';
import type { StudioCatalogView } from './studioCatalogView';
import {
  materializeCatalogEntryImage,
  resolveCatalogEntryCreatedAt,
} from './studioCatalogImageAdapter';
import {
  toLegacyVisualBatch,
  type LegacyVisualBatchSnapshot,
} from './studioLegacyVisualBatchTypes';

export function buildLegacyVisualBatchSnapshotFromCatalog(
  view: StudioCatalogView,
): LegacyVisualBatchSnapshot {
  const batches: LegacyVisualBatchSnapshot = [];

  for (const [batchId, entries] of view.byBatchId) {
    const firstEntry = entries[0];
    if (!firstEntry) continue;
    const createdAt = resolveCatalogEntryCreatedAt(firstEntry);

    batches.push(
      toLegacyVisualBatch({
        id: batchId,
        workspaceId: firstEntry.workspaceId || 'default',
        config: buildGenerationConfigFromCatalogImage(firstEntry),
        images: entries.map((entry) =>
          materializeCatalogEntryImage(entry, {
            batchId,
            createdAt: resolveCatalogEntryCreatedAt(entry),
          }),
        ),
        createdAt,
      }),
    );
  }

  return batches.sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id));
}
