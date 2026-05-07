import { useCallback, useEffect, useRef, useState } from 'react';
import type { CodexAccountStatusResponse, HealthResponse } from '../packages/shared/src';
import { getCodexAccountStatus, getStudioHealth } from '../services/localStudioService';

interface UseStudioDiagnosticsOptions {
  initialHealth?: HealthResponse | null;
  refreshIntervalMs?: number;
}

function buildFallbackAccountStatus(error: unknown): CodexAccountStatusResponse {
  return {
    authMode: null,
    planType: null,
    usage: null,
    source: 'fallback',
    fetchedAt: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
  };
}

/**
 * Poll the local studio health and Codex account status so the shell can
 * render one diagnostics view without duplicating request choreography.
 */
export function useStudioDiagnostics({
  initialHealth = null,
  refreshIntervalMs = 30_000,
}: UseStudioDiagnosticsOptions = {}) {
  const [systemHealth, setSystemHealth] = useState<HealthResponse | null>(initialHealth);
  const [codexAccountStatus, setCodexAccountStatus] =
    useState<CodexAccountStatusResponse | null>(null);
  const [hasFetchedDiagnostics, setHasFetchedDiagnostics] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialHealth) {
      setSystemHealth(initialHealth);
    }
  }, [initialHealth]);

  const refreshDiagnostics = useCallback(async () => {
    const [healthResult, accountResult] = await Promise.allSettled([
      getStudioHealth(),
      getCodexAccountStatus(),
    ]);

    if (!isMountedRef.current) return;

    setSystemHealth(healthResult.status === 'fulfilled' ? healthResult.value : null);
    setCodexAccountStatus(
      accountResult.status === 'fulfilled'
        ? accountResult.value
        : buildFallbackAccountStatus(accountResult.reason),
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

  return {
    systemHealth,
    codexAccountStatus,
    hasFetchedDiagnostics,
    refreshDiagnostics,
  };
}