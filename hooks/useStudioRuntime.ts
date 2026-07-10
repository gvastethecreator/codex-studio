import { useCallback } from 'react';

import type { LogEntry, Toast } from '../types';
import { buildStudioReadinessSnapshot } from '../lib/studioReadiness';
import { buildStudioDiagnosticsSnapshot } from '../lib/studioDiagnostics';
import { useLocalStudioSync } from './useLocalStudioSync';
import { useStudioOnboarding } from './useStudioOnboarding';
import { useStudioReadiness } from './useStudioReadiness';
import type { CatalogRefreshScope } from '../lib/catalogOperationResult';

interface UseStudioRuntimeProps {
  logs: LogEntry[];
  log: (message: string) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  shouldAutoOpen: boolean;
  onCatalogChanged?: (scope?: CatalogRefreshScope) => void;
}

/**
 * Studio Runtime Orchestrator — React hook that wires the full local-backend
 * lifecycle (readiness, diagnostics, onboarding, session verification, and
 * local studio sync) into a single consumer API consumed by `useStudioShell`.
 *
 * @file hooks/useStudioRuntime.ts
 *
 * This is a REACT ORCHESTRATOR. It depends on multiple sub-hooks and takes
 * external state sinks as props.
 *
 * DO NOT confuse with services/studioRuntime.ts, which is a STATIC CONFIG
 * ADAPTER that only resolves the backend API base and desktop-vs-web runtime kind.
 */
export function useStudioRuntime({
  logs,
  log,
  addToast,
  shouldAutoOpen,
  onCatalogChanged,
}: UseStudioRuntimeProps) {
  const sync = useLocalStudioSync({
    logs,
    log,
    onCatalogChanged,
  });
  const readinessState = useStudioReadiness();
  const refreshHealth = useCallback(async () => {
    await readinessState.refresh();
  }, [readinessState.refresh]);
  const onboarding = useStudioOnboarding({
    log,
    addToast,
    shouldAutoOpen,
    health: readinessState.health,
    refreshHealth,
    healthError: readinessState.error,
    isCheckingHealth: readinessState.isRefreshing,
  });

  const readiness = buildStudioReadinessSnapshot({
    health: readinessState.health,
    isBackendConnected: sync.activity.isBackendConnected,
    localCodexSession: readinessState.localCodexSession,
    runtime: onboarding.runtime,
  });
  const diagnostics = buildStudioDiagnosticsSnapshot({
    health: readinessState.health,
    localCodexSession: readinessState.localCodexSession,
    hasFetchedDiagnostics: readinessState.serverSnapshot !== null,
    isBackendConnected: sync.activity.isBackendConnected,
  });

  const verifyCodexSession = useCallback(async () => {
    try {
      const response = await readinessState.refresh();
      const refreshed = buildStudioReadinessSnapshot({
        health: response.health,
        isBackendConnected: true,
        localCodexSession: response.readiness.localCodexSession,
        runtime: onboarding.runtime,
      });
      addToast(
        refreshed.isReady ? 'Local Codex session available' : refreshed.description,
        refreshed.isReady ? 'success' : 'error',
      );
      log(`Codex readiness: stage=${refreshed.stage}, revision=${response.readiness.revision}`);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Could not verify local Codex', 'error');
    }
  }, [addToast, log, onboarding.runtime, readinessState.refresh]);

  const refreshRuntime = useCallback(async () => {
    await Promise.allSettled([readinessState.refresh(), sync.refreshBackendState()]);
  }, [readinessState.refresh, sync.refreshBackendState]);

  return {
    activity: sync.activity,
    status: {
      diagnostics,
      localCodexSession: readinessState.localCodexSession,
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
      verifyCodexSession,
      refreshDiagnostics: readinessState.refresh,
      refreshRuntime,
    },
  };
}
