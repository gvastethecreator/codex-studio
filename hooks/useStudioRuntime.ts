import { useCallback } from 'react';

import type { GenerationBatch, LogEntry, Toast } from '../types';
import { buildStudioReadinessSnapshot } from '../lib/studioReadiness';
import { useLocalStudioSync } from './useLocalStudioSync';
import { useStudioDiagnostics } from './useStudioDiagnostics';
import { useStudioOnboarding } from './useStudioOnboarding';
import { useStudioSessionVerifier } from './useStudioSessionVerifier';
import { useStudioStorageRecovery } from './useStudioStorageRecovery';

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
 * Concentrate the Studio Runtime seams that talk to the local backend so the
 * shell consumes grouped activity, status, onboarding, and maintenance
 * interfaces instead of stitching multiple adapters inline.
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
  });
  const recovery = useStudioStorageRecovery({
    batches,
    mergeBatches,
    addToast,
    log,
  });
  const sessionVerifier = useStudioSessionVerifier({
    addToast,
    log,
  });
  const onboarding = useStudioOnboarding({
    log,
    addToast,
    shouldAutoOpen,
  });
  const diagnosticsState = useStudioDiagnostics({
    initialHealth: onboarding.health,
    isBackendConnected: sync.activity.isBackendConnected,
  });

  const readiness = buildStudioReadinessSnapshot({
    health: diagnosticsState.health,
    isBackendConnected: sync.activity.isBackendConnected,
    localCodexSession: diagnosticsState.localCodexSession,
    runtime: onboarding.runtime,
  });

  const refreshRuntime = useCallback(async () => {
    await Promise.allSettled([
      onboarding.refreshHealth(),
      diagnosticsState.refreshDiagnostics(),
      sync.refreshBackendState(),
    ]);
  }, [diagnosticsState, onboarding, sync]);

  return {
    activity: sync.activity,
    status: {
      diagnostics: diagnosticsState.snapshot,
      localCodexSession: diagnosticsState.localCodexSession,
      readiness,
      runtime: onboarding.runtime,
    },
    onboarding: {
      apiBase: onboarding.apiBase,
      error: onboarding.error,
      health: onboarding.health,
      isChecking: onboarding.isChecking,
      isDesktopRuntime: onboarding.isDesktopRuntime,
      isOpen: onboarding.isOpen,
      isReady: onboarding.isReady,
      isStartingAppServer: onboarding.isStartingAppServer,
      open: onboarding.openOnboarding,
      close: onboarding.closeOnboarding,
      complete: onboarding.completeOnboarding,
      refreshHealth: onboarding.refreshHealth,
      ensureAppServer: onboarding.ensureAppServer,
    },
    maintenance: {
      recoverWorkspace: recovery.recoverOrphanedBatches,
      verifyCodexSession: sessionVerifier.verifyCodexSession,
      refreshDiagnostics: diagnosticsState.refreshDiagnostics,
      refreshRuntime,
    },
  };
}
