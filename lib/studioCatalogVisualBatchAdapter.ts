import type { GeneratedImageWithConfig, GenerationBatch } from '../types';
import { buildGenerationConfigFromCatalogImage } from '../utils/catalogImageGenerationConfig';
import type { StudioCatalogView } from './studioCatalogView';
import {
  materializeVisualBatchImage,
  resolveVisualBatchCreatedAt,
} from './studioVisualBatchCatalog';
import type { CatalogImage } from '../packages/shared/src';

export function materializeCatalogEntryImageWithConfig(
  entry: CatalogImage,
): GeneratedImageWithConfig {
  return {
    ...materializeVisualBatchImage(entry),
    config: buildGenerationConfigFromCatalogImage(entry),
  };
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
