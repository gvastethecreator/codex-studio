import type { GeneratedImageWithConfig } from '../types';
import { materializeCatalogEntryImageWithConfig } from './studioCatalogImageAdapter';
import type { StudioCatalogView } from './studioCatalogView';
import { buildLegacyWorkspaceSnapshotFromCatalog } from './studioLegacyWorkspaceSnapshotExport';
import type { LegacyWorkspaceSnapshot } from './studioLegacyWorkspaceSnapshotTypes';

interface WorkspaceExportInput {
  catalogView?: StudioCatalogView;
}

export function exportLegacyWorkspaceSnapshot({
  catalogView,
}: WorkspaceExportInput): LegacyWorkspaceSnapshot {
  if (!catalogView) return [];
  return buildLegacyWorkspaceSnapshotFromCatalog(catalogView);
}

export function buildWorkspaceExportImages({
  catalogView,
}: WorkspaceExportInput): GeneratedImageWithConfig[] {
  if (!catalogView) return [];
  return catalogView.entries.map((entry) => materializeCatalogEntryImageWithConfig(entry));
}
