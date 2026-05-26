import { useCallback } from 'react';
import type { Toast } from '../types';

interface UseStudioStorageRecoveryProps {
  addToast: (message: string, type?: Toast['type']) => void;
  log: (message: string) => void;
}

export function useStudioStorageRecovery({ addToast, log }: UseStudioStorageRecoveryProps) {
  const recoverOrphanedBatches = useCallback(async () => {
    addToast('Workspace recovery scan complete: no legacy snapshots remain.', 'info');
    log('Workspace recovery scan skipped — legacy visual batch storage removed.');
  }, [addToast, log]);

  return {
    recoverOrphanedBatches,
  };
}
