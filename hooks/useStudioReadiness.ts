import { useCallback, useEffect, useRef, useState } from 'react';
import type { StudioRuntimeSnapshotResponse } from '../packages/shared/src';
import { getStudioRuntimeSnapshot, refreshStudioReadiness } from '../services/localStudioService';
import { createStudioDiagnosticsRefreshPolicy } from './studioDiagnosticsRefreshPolicy';

export function useStudioReadiness(refreshIntervalMs = 30_000) {
  const [response, setResponse] = useState<StudioRuntimeSnapshotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const readSnapshot = useCallback(async () => {
    const next = await getStudioRuntimeSnapshot();
    if (mountedRef.current) setResponse(next);
    return next;
  }, []);

  const refresh = useCallback(async () => {
    if (mountedRef.current) {
      setIsRefreshing(true);
      setError(null);
    }
    try {
      await refreshStudioReadiness();
      return await readSnapshot();
    } catch (refreshError) {
      const message =
        refreshError instanceof Error ? refreshError.message : 'Could not refresh Studio Readiness';
      if (mountedRef.current) setError(message);
      throw refreshError;
    } finally {
      if (mountedRef.current) setIsRefreshing(false);
    }
  }, [readSnapshot]);

  useEffect(() => {
    void refresh().catch(() => undefined);
    const policy = createStudioDiagnosticsRefreshPolicy({
      refreshDiagnostics: async () => {
        await refresh();
      },
      refreshIntervalMs,
    });
    return () => policy.dispose();
  }, [refresh, refreshIntervalMs]);

  return {
    error,
    health: response?.health ?? null,
    isRefreshing,
    localCodexSession: response?.readiness.localCodexSession ?? null,
    refresh,
    serverSnapshot: response?.readiness ?? null,
  };
}
