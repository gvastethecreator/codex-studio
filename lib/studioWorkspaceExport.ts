import type { GeneratedImageWithConfig } from '../types';
import { materializeCatalogEntryImageWithConfig } from './studioCatalogImageAdapter';
import type { StudioCatalogView } from './studioCatalogView';
import { buildLegacyVisualBatchSnapshotFromCatalog } from './studioLegacyVisualSnapshotExport';
import type { LegacyVisualBatchSnapshot } from './studioLegacyVisualBatchTypes';

interface WorkspaceExportInput {
  catalogView?: StudioCatalogView;
}

export function exportLegacyVisualBatchSnapshot({
  catalogView,
}: WorkspaceExportInput): LegacyVisualBatchSnapshot {
  if (!catalogView) return [];
  return buildLegacyVisualBatchSnapshotFromCatalog(catalogView);
}

/**
 * @deprecated Use `exportLegacyVisualBatchSnapshot`.
 * Compatibility alias kept only for incremental migration.
 */
export const buildLegacyVisualBatchSnapshot = exportLegacyVisualBatchSnapshot;

export function buildWorkspaceExportImages({
  catalogView,
}: WorkspaceExportInput): GeneratedImageWithConfig[] {
  if (!catalogView) return [];
  return catalogView.entries.map((entry) => materializeCatalogEntryImageWithConfig(entry));
}
