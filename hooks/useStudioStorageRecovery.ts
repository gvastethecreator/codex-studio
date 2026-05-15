import { useCallback, useEffect, useRef } from 'react';
import type { GenerationBatch, Toast } from '../types';
import { collectRecoverableBatches } from '../lib/studioStorageRecovery';
import { getAllEntries } from '../utils/idb';

type MergeBatches = (
  batches: GenerationBatch[],
  options?: { prepend?: boolean; maxTotal?: number; ensureWorkspaces?: boolean },
) => void;

interface UseStudioStorageRecoveryProps {
  batches: GenerationBatch[];
  mergeBatches: MergeBatches;
  addToast: (message: string, type: Toast['type']) => void;
  log: (message: string) => void;
}

export function useStudioStorageRecovery({
  batches,
  mergeBatches,
  addToast,
  log,
}: UseStudioStorageRecoveryProps) {
  const batchesRef = useRef(batches);

  useEffect(() => {
    batchesRef.current = batches;
  }, [batches]);

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
      const uniqueRecovered = collectRecoverableBatches({
        idbEntries,
        storageEntries,
        existingBatchIds: batchesRef.current.map((batch) => batch.id),
      });

      if (uniqueRecovered.length > 0) {
        mergeBatches(uniqueRecovered, { prepend: true, maxTotal: 100, ensureWorkspaces: true });
      }

      addToast(
        uniqueRecovered.length > 0
          ? `Recovery complete: restored ${uniqueRecovered.length} saved workspace batch${uniqueRecovered.length === 1 ? '' : 'es'}.`
          : 'Recovery scan complete: no additional saved workspace snapshots were found.',
        uniqueRecovered.length > 0 ? 'success' : 'info',
      );
    } catch (error) {
      log(`Workspace recovery scan failed: ${error instanceof Error ? error.message : String(error)}`);
      addToast('Workspace recovery scan failed', 'error');
    }
  }, [addToast, log, mergeBatches]);

  return {
    recoverOrphanedBatches,
  };
}
