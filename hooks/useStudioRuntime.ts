import { useCallback } from 'react';

import type { GenerationBatch, LogEntry, Toast } from '../types';
import { useLocalStudioSync } from './useLocalStudioSync';
import { useStudioDiagnostics } from './useStudioDiagnostics';
import { useStudioOnboarding } from './useStudioOnboarding';

type MergeBatches = (
  batches: GenerationBatch[],
  options?: { prepend?: boolean; maxTotal?: number; ensureWorkspaces?: boolean },
) => void;

interface UseStudioRuntimeProps {
  logs: LogEntry[];
  log: (message: string) => void;
  batches: GenerationBatch[];
  mergeBatches: MergeBatches;
  addToast: (message: string, type?: Toast['type']) => void;
  shouldAutoOpen: boolean;
}

/**
 * Concentrate the Studio runtime seams that talk to the local backend so the
 * shell consumes one grouped interface instead of stitching sync, onboarding,
 * and diagnostics manually.
 */
export function useStudioRuntime({
  logs,
  log,
  batches,
  mergeBatches,
  addToast,
  shouldAutoOpen,
}: UseStudioRuntimeProps) {
  const sync = useLocalStudioSync({
    logs,
    log,
    batches,
    mergeBatches,
    addToast,
  });

  const onboarding = useStudioOnboarding({
    log,
    addToast,
    shouldAutoOpen,
  });

  const diagnosticsState = useStudioDiagnostics({
    initialHealth: onboarding.health,
    isBackendConnected: sync.isBackendConnected,
  });

  const refreshRuntime = useCallback(async () => {
    await Promise.allSettled([onboarding.refreshHealth(), diagnosticsState.refreshDiagnostics()]);
  }, [diagnosticsState, onboarding]);

  return {
    sync,
    onboarding,
    diagnostics: diagnosticsState.snapshot,
    refreshDiagnostics: diagnosticsState.refreshDiagnostics,
    refreshRuntime,
  };
}
