import { useCallback } from 'react';

import type { LogEntry, Toast } from '../types';
import { buildStudioReadinessSnapshot } from '../lib/studioReadiness';
import { useLocalStudioSync } from './useLocalStudioSync';
import { useStudioDiagnostics } from './useStudioDiagnostics';
import { useStudioOnboarding } from './useStudioOnboarding';
import { useStudioSessionVerifier } from './useStudioSessionVerifier';
import {
  useStudioStorageRecovery,
  type ImportRecoveredLegacyVisualSnapshot,
} from './useStudioStorageRecovery';

interface UseStudioRuntimeProps {
  logs: LogEntry[];
  log: (message: string) => void;
  existingLegacyVisualBatchIds: string[];
  importRecoveredLegacyVisualSnapshot: ImportRecoveredLegacyVisualSnapshot;
  addToast: (message: string, type?: Toast['type']) => void;
  shouldAutoOpen: boolean;
  onCatalogChanged?: () => void;
}

/**
 * Studio Runtime Orchestrator — React hook that wires the full local-backend
 * lifecycle (readiness, diagnostics, onboarding, session verification, storage
 * recovery, and local studio sync) into a single consumer API consumed by
 * `useStudioShell`.
 *
 * @file hooks/useStudioRuntime.ts
 *
 * This is a REACT ORCHESTRATOR. It depends on multiple sub-hooks and takes
 * external state sinks (legacy visual batches, logs, toasts) as props.
 *
 * DO NOT confuse with services/studioRuntime.ts, which is a STATIC CONFIG
 * ADAPTER that only resolves the backend API base and desktop-vs-web runtime kind.
 */
export function useStudioRuntime({
  logs,
  log,
  existingLegacyVisualBatchIds,
  importRecoveredLegacyVisualSnapshot,
  addToast,
  shouldAutoOpen,
  onCatalogChanged,
}: UseStudioRuntimeProps) {
  const sync = useLocalStudioSync({
    logs,
    log,
    onCatalogChanged,
  });
  const recovery = useStudioStorageRecovery({
    existingLegacyVisualBatchIds,
    importRecoveredLegacyVisualSnapshot,
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
