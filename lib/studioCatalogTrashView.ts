import type { CatalogImage } from '../packages/shared/src';
import { toStudioAssetUrl } from '../services/localStudioService';
import { buildGenerationConfigFromCatalogImage } from '../utils/catalogImageGenerationConfig';
import type { StudioCatalogView } from './studioCatalogView';

export interface ArchivedImageGroup {
  id: string;
  workspaceId: string;
  createdAt: number;
  prompt: string;
  model: string;
  imageCount: number;
  thumbnail?: string;
}

function resolveCreatedAt(entry: Pick<CatalogImage, 'createdAt'>) {
  return Date.parse(entry.createdAt) || 0;
}

function resolveThumbnail(entry: CatalogImage) {
  return toStudioAssetUrl(entry.thumbnailUrl || entry.publicUrl);
}

export function buildArchivedImageGroupsFromCatalog(view: StudioCatalogView): ArchivedImageGroup[] {
  const groups: ArchivedImageGroup[] = [];

  for (const [batchId, entries] of view.byBatchId) {
    const firstEntry = entries[0];
    if (!firstEntry) continue;

    const config = buildGenerationConfigFromCatalogImage(firstEntry);

    groups.push({
      id: batchId,
      workspaceId: firstEntry.workspaceId || 'default',
      createdAt: resolveCreatedAt(firstEntry),
      prompt: config.prompt,
      model: config.model,
      imageCount: entries.length,
      thumbnail: resolveThumbnail(firstEntry),
    });
  }

  return groups.sort(
    (left, right) => right.createdAt - left.createdAt || left.id.localeCompare(right.id),
  );
}
