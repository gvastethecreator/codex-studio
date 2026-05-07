import { useCallback } from 'react';
import type { GenerationBatch, GeneratedImageWithConfig } from '../types';
import {
  downloadMultipleImagesAsZip,
  exportToJson,
  readJsonFile,
  validateVault,
} from '../utils/fileUtils';
import { formatErrorMessage } from '../utils/runtimeLogger';

interface UseVaultTransferProps {
  batches: GenerationBatch[];
  replaceBatches: (batches: GenerationBatch[], options?: { ensureWorkspaces?: boolean }) => void;
  archiveBatches: (batches: GenerationBatch[]) => void;
  clearAllBatches: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  log: (message: string) => void;
}

/**
 * Concentrate vault import/export and archive-download flows behind one hook so
 * AppContent only coordinates UI state, not file I/O choreography.
 */
export function useVaultTransfer({
  batches,
  replaceBatches,
  archiveBatches,
  clearAllBatches,
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

        if (!validateVault(data)) {
          throw new Error('Invalid vault format');
        }

        replaceBatches(data, { ensureWorkspaces: true });
        addToast('Workspace snapshot imported', 'success');
      } catch {
        addToast('Invalid workspace snapshot file', 'error');
      }
    },
    [addToast, replaceBatches],
  );

  const exportVault = useCallback(() => {
    exportToJson(batches, `workspace-snapshot-${Date.now()}.json`);
  }, [batches]);

  const downloadAndClearWorkspace = useCallback(async () => {
    try {
      const images = batches.flatMap((batch) =>
        batch.images.map(
          (image) => ({ ...image, config: batch.config }) as GeneratedImageWithConfig,
        ),
      );

      if (images.length > 0) {
        await downloadMultipleImagesAsZip(images, `workspace-export-${Date.now()}.zip`);
      }

      archiveBatches(batches);
      clearAllBatches();
      addToast('Workspace archive downloaded and canvas cleared', 'success');
      return true;
    } catch (error) {
      log(`Failed to download and clear workspace: ${formatErrorMessage(error)}`);
      addToast('Failed to download the workspace archive', 'error');
      return false;
    }
  }, [addToast, archiveBatches, batches, clearAllBatches, log]);

  return {
    importVault,
    exportVault,
    downloadAndClearWorkspace,
  };
}