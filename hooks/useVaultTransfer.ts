import { useCallback } from 'react';
import type { StudioCatalogView } from '../lib/studioCatalogView';
import {
  exportLegacyVisualBatchSnapshot as exportLegacyVisualBatchSnapshotPayload,
  buildWorkspaceExportImages,
} from '../lib/studioWorkspaceExport';
import { downloadMultipleImagesAsZip, exportToJson } from '../utils/fileUtils';
import { formatErrorMessage } from '../utils/runtimeLogger';

interface UseVaultTransferProps {
  catalogView?: StudioCatalogView;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  log: (message: string) => void;
}

export interface VaultTransferController {
  exportLegacyVisualBatchSnapshot: () => void;
  /**
   * @deprecated Use `exportLegacyVisualBatchSnapshot`.
   * Compatibility alias kept only for incremental migration.
   */
  exportWorkspaceSnapshot: () => void;
  downloadAndClearWorkspace: () => Promise<boolean>;
}

/**
 * Concentrate vault export and archive-download flows behind one hook so
 * AppContent only coordinates UI state, not file I/O choreography.
 */
export function useVaultTransfer({
  catalogView,
  addToast,
  log,
}: UseVaultTransferProps): VaultTransferController {
  const exportLegacyVisualBatchSnapshot = useCallback(() => {
    exportToJson(
      exportLegacyVisualBatchSnapshotPayload({ catalogView }),
      `workspace-snapshot-${Date.now()}.json`,
    );
  }, [catalogView]);

  const downloadAndClearWorkspace = useCallback(async () => {
    try {
      const images = buildWorkspaceExportImages({ catalogView });

      if (images.length > 0) {
        await downloadMultipleImagesAsZip(images, `workspace-export-${Date.now()}.zip`);
      }

      addToast('Workspace archive downloaded', 'success');
      return true;
    } catch (error) {
      log(`Failed to download workspace: ${formatErrorMessage(error)}`);
      addToast('Failed to download the workspace archive', 'error');
      return false;
    }
  }, [addToast, catalogView, log]);

  return {
    exportLegacyVisualBatchSnapshot,
    // Compatibility alias for callers still using neutral naming.
    exportWorkspaceSnapshot: exportLegacyVisualBatchSnapshot,
    downloadAndClearWorkspace,
  };
}
