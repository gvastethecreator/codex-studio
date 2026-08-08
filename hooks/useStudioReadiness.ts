import { useCallback, useEffect, useRef, useState } from 'react';
import type { StudioRuntimeSnapshotResponse } from '../packages/shared/src';
import { getStudioRuntimeSnapshot, refreshStudioReadiness } from '../services/studio-api/runtime';
import { createStudioDiagnosticsRefreshPolicy } from './studioDiagnosticsRefreshPolicy';
import { createStudioReadinessPublicationPolicy } from './studioReadinessPublicationPolicy';

export function useStudioReadiness(refreshIntervalMs = 30_000) {
  const [response, setResponse] = useState<StudioRuntimeSnapshotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(true);
  const publicationPolicyRef = useRef<ReturnType<
    typeof createStudioReadinessPublicationPolicy
  > | null>(null);
  publicationPolicyRef.current ??= createStudioReadinessPublicationPolicy();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const readSnapshot = useCallback(async (bypassCache = false) => {
    const requestId = publicationPolicyRef.current!.beginSnapshotRead();
    const next = await getStudioRuntimeSnapshot({ bypassCache });
    if (mountedRef.current && publicationPolicyRef.current!.shouldPublishSnapshot(requestId)) {
      setResponse(next);
    }
    return next;
  }, []);

  const refresh = useCallback(async () => {
    const refreshRequestId = publicationPolicyRef.current!.beginRefresh();
    if (mountedRef.current) {
      setIsRefreshing(true);
      setError(null);
    }
    try {
      await refreshStudioReadiness({ reason: 'manual', force: true });
      const next = await readSnapshot(true);
      if (
        mountedRef.current &&
        publicationPolicyRef.current!.shouldPublishRefresh(refreshRequestId)
      ) {
        setError(null);
      }
      return next;
    } catch (refreshError) {
      const message =
        refreshError instanceof Error ? refreshError.message : 'Could not refresh Studio Readiness';
      if (
        mountedRef.current &&
        publicationPolicyRef.current!.shouldPublishRefresh(refreshRequestId)
      ) {
        setError(message);
      }
      throw refreshError;
    } finally {
      const remainsRefreshing = publicationPolicyRef.current!.endRefresh();
      if (mountedRef.current) setIsRefreshing(remainsRefreshing);
    }
  }, [readSnapshot]);

  const refreshPassive = useCallback(async () => {
    const refreshRequestId = publicationPolicyRef.current!.beginRefresh();
    if (mountedRef.current) setIsRefreshing(true);
    try {
      await refreshStudioReadiness({ reason: 'passive', force: false });
      const next = await readSnapshot();
      if (
        mountedRef.current &&
        publicationPolicyRef.current!.shouldPublishRefresh(refreshRequestId)
      ) {
        setError(null);
      }
      return next;
    } catch (refreshError) {
      const message =
        refreshError instanceof Error ? refreshError.message : 'Could not refresh Studio Readiness';
      if (
        mountedRef.current &&
        publicationPolicyRef.current!.shouldPublishRefresh(refreshRequestId)
      ) {
        setError(message);
      }
      throw refreshError;
    } finally {
      const remainsRefreshing = publicationPolicyRef.current!.endRefresh();
      if (mountedRef.current) setIsRefreshing(remainsRefreshing);
    }
  }, [readSnapshot]);

  useEffect(() => {
    void refreshPassive().catch(() => undefined);
    const policy = createStudioDiagnosticsRefreshPolicy({
      refreshDiagnostics: async () => {
        await refreshPassive();
      },
      refreshIntervalMs,
    });
    return () => policy.dispose();
  }, [refreshIntervalMs, refreshPassive]);

  return {
    error,
    health: response?.health ?? null,
    isRefreshing,
    localCodexSession: response?.readiness.localCodexSession ?? null,
    refresh,
    serverSnapshot: response?.readiness ?? null,
  };
}
