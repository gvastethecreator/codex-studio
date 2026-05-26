import { useCallback } from 'react';
import type { GenerationBatch, GeneratedImageWithConfig } from '../types';
import {
  materializeCatalogEntryImageWithConfig,
  materializeVisualBatchesFromCatalog,
} from '../lib/studioCatalogVisualBatchAdapter';
import type { StudioCatalogView } from '../lib/studioCatalogView';
import { validateLegacyVisualBatchVault } from '../lib/studioLegacyVisualBatchStore';
import { downloadMultipleImagesAsZip, exportToJson, readJsonFile } from '../utils/fileUtils';
import { formatErrorMessage } from '../utils/runtimeLogger';

interface UseVaultTransferProps {
  catalogView?: StudioCatalogView;
  legacyVisualBatches?: GenerationBatch[];
  importLegacyVisualBatches: (
    batches: GenerationBatch[],
    options?: { ensureWorkspaces?: boolean },
  ) => void;
  archiveLegacyVisualBatches: (batches: GenerationBatch[]) => void;
  clearAllLegacyVisualBatches: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  log: (message: string) => void;
}

interface LegacyVisualBatchSnapshotInput {
  catalogView?: StudioCatalogView;
  legacyVisualBatches?: GenerationBatch[];
}

export function buildLegacyVisualBatchSnapshot({
  catalogView,
  legacyVisualBatches = [],
}: LegacyVisualBatchSnapshotInput) {
  return catalogView ? materializeVisualBatchesFromCatalog(catalogView) : legacyVisualBatches;
}

export function buildWorkspaceExportImages({
  catalogView,
  legacyVisualBatches = [],
}: LegacyVisualBatchSnapshotInput): GeneratedImageWithConfig[] {
  if (catalogView) {
    return catalogView.entries.map((entry) => materializeCatalogEntryImageWithConfig(entry));
  }

  return legacyVisualBatches.flatMap((batch) =>
    batch.images.map((image) => ({ ...image, config: batch.config }) as GeneratedImageWithConfig),
  );
}

/**
 * Concentrate vault import/export and archive-download flows behind one hook so
 * AppContent only coordinates UI state, not file I/O choreography.
 */
export function useVaultTransfer({
  catalogView,
  legacyVisualBatches = [],
  importLegacyVisualBatches,
  archiveLegacyVisualBatches,
  clearAllLegacyVisualBatches,
  addToast,
  log,
}: UseVaultTransferProps) {
  const importVault = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      try {
        const data = await readJsonFile(file);

        if (!validateLegacyVisualBatchVault(data)) {
          throw new Error('Invalid vault format');
        }

        importLegacyVisualBatches(data, { ensureWorkspaces: true });
        addToast('Workspace snapshot imported', 'success');
      } catch {
        addToast('Invalid workspace snapshot file', 'error');
      }
    },
    [addToast, importLegacyVisualBatches],
  );

  const exportWorkspaceSnapshot = useCallback(() => {
    exportToJson(
      buildLegacyVisualBatchSnapshot({ catalogView, legacyVisualBatches }),
      `workspace-snapshot-${Date.now()}.json`,
    );
  }, [catalogView, legacyVisualBatches]);

  const downloadAndClearWorkspace = useCallback(async () => {
    try {
      const images = buildWorkspaceExportImages({ catalogView, legacyVisualBatches });

      if (images.length > 0) {
        await downloadMultipleImagesAsZip(images, `workspace-export-${Date.now()}.zip`);
      }

      archiveLegacyVisualBatches(
        buildLegacyVisualBatchSnapshot({ catalogView, legacyVisualBatches }),
      );
      clearAllLegacyVisualBatches();
      addToast('Workspace archive downloaded and canvas cleared', 'success');
      return true;
    } catch (error) {
      log(`Failed to download and clear workspace: ${formatErrorMessage(error)}`);
      addToast('Failed to download the workspace archive', 'error');
      return false;
    }
  }, [
    addToast,
    archiveLegacyVisualBatches,
    catalogView,
    clearAllLegacyVisualBatches,
    legacyVisualBatches,
    log,
  ]);

  return {
    importVault,
    exportWorkspaceSnapshot,
    downloadAndClearWorkspace,
  };
}
