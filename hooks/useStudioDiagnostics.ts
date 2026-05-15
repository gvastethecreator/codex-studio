import { useCallback, useEffect, useRef, useState } from 'react';
import { buildStudioDiagnosticsSnapshot } from '../lib/studioDiagnostics';
import type { HealthResponse, LocalCodexSessionResponse } from '../packages/shared/src';
import { getLocalCodexSession, getStudioHealth } from '../services/localStudioService';

interface UseStudioDiagnosticsOptions {
  initialHealth?: HealthResponse | null;
  isBackendConnected?: boolean;
  refreshIntervalMs?: number;
}

function buildFallbackLocalCodexSession(error: unknown): LocalCodexSessionResponse {
  return {
    authMode: null,
    planType: null,
    usage: null,
    source: 'fallback',
    fetchedAt: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
    authLabel: 'Not signed in',
    state: 'unavailable',
    reason: 'app_server_unavailable',
    isChatgptLogin: false,
    isSupportedAuthMode: false,
    canRunLocalJobs: false,
  };
}

/**
 * Refresh the local studio health and Local Codex Session so the shell can
 * render one diagnostics view without duplicating request choreography.
 */
export function useStudioDiagnostics({
  initialHealth = null,
  isBackendConnected = false,
  refreshIntervalMs = 30_000,
}: UseStudioDiagnosticsOptions = {}) {
  const [health, setHealth] = useState<HealthResponse | null>(initialHealth);
  const [localCodexSession, setLocalCodexSession] = useState<LocalCodexSessionResponse | null>(null);
  const [hasFetchedDiagnostics, setHasFetchedDiagnostics] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialHealth) {
      setHealth(initialHealth);
    }
  }, [initialHealth]);

  const refreshDiagnostics = useCallback(async () => {
    const [healthResult, sessionResult] = await Promise.allSettled([
      getStudioHealth(),
      getLocalCodexSession(),
    ]);

    if (!isMountedRef.current) return;

    setHealth(healthResult.status === 'fulfilled' ? healthResult.value : null);
    setLocalCodexSession(
      sessionResult.status === 'fulfilled'
        ? sessionResult.value
        : buildFallbackLocalCodexSession(sessionResult.reason),
    );
    setHasFetchedDiagnostics(true);
  }, []);

  useEffect(() => {
    void refreshDiagnostics();

    const interval = window.setInterval(() => {
      void refreshDiagnostics();
    }, refreshIntervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshDiagnostics, refreshIntervalMs]);

  const snapshot = buildStudioDiagnosticsSnapshot({
    health,
    localCodexSession,
    hasFetchedDiagnostics,
    isBackendConnected,
  });

  return {
    health,
    localCodexSession,
    hasFetchedDiagnostics,
    refreshDiagnostics,
    snapshot,
  };
}