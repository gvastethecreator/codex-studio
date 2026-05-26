import { useCallback, useEffect, useRef } from 'react';
import type { Toast } from '../types';
import { collectRecoverableLegacyVisualSnapshot } from '../lib/studioStorageRecovery';
import type { LegacyVisualBatchSnapshot } from '../lib/studioLegacyVisualSnapshotImport';
import { getAllEntries } from '../utils/idb';

export type ImportRecoveredLegacyVisualSnapshot = (
  snapshot: LegacyVisualBatchSnapshot,
  options?: { prepend?: boolean; maxTotal?: number; ensureWorkspaces?: boolean },
) => void;

interface UseStudioStorageRecoveryProps {
  existingLegacyVisualBatchIds: string[];
  importRecoveredLegacyVisualSnapshot: ImportRecoveredLegacyVisualSnapshot;
  addToast: (message: string, type: Toast['type']) => void;
  log: (message: string) => void;
}

export function useStudioStorageRecovery({
  existingLegacyVisualBatchIds,
  importRecoveredLegacyVisualSnapshot,
  addToast,
  log,
}: UseStudioStorageRecoveryProps) {
  const existingLegacyVisualBatchIdsRef = useRef(existingLegacyVisualBatchIds);

  useEffect(() => {
    existingLegacyVisualBatchIdsRef.current = existingLegacyVisualBatchIds;
  }, [existingLegacyVisualBatchIds]);

  const recoverOrphanedBatches = useCallback(async () => {
    addToast('Starting workspace recovery scan...', 'info');

    try {
      const idbEntries = await getAllEntries();
      const storageEntries = Array.from({ length: localStorage.length }, (_, index) => {
        const key = localStorage.key(index) ?? '';
        return {
          key,
          value: key ? localStorage.getItem(key) : null,
        };
      });
      const uniqueRecovered = collectRecoverableLegacyVisualSnapshot({
        idbEntries,
        storageEntries,
        existingBatchIds: existingLegacyVisualBatchIdsRef.current,
      });

      if (uniqueRecovered.length > 0) {
        importRecoveredLegacyVisualSnapshot(uniqueRecovered, {
          prepend: true,
          maxTotal: 100,
          ensureWorkspaces: true,
        });
      }

      addToast(
        uniqueRecovered.length > 0
          ? `Recovery complete: restored ${uniqueRecovered.length} saved workspace batch${uniqueRecovered.length === 1 ? '' : 'es'}.`
          : 'Recovery scan complete: no additional saved workspace snapshots were found.',
        uniqueRecovered.length > 0 ? 'success' : 'info',
      );
    } catch (error) {
      log(
        `Workspace recovery scan failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      addToast('Workspace recovery scan failed', 'error');
    }
  }, [addToast, importRecoveredLegacyVisualSnapshot, log]);

  return {
    recoverOrphanedBatches,
  };
}
