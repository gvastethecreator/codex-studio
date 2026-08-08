import { useCallback, useEffect, useReducer, useMemo, useRef } from 'react';
import { listStudioJobs } from '../services/studio-api/jobs';
import { listStudioLogs } from '../services/studio-api/logs';
import {
  createStudioEventStream,
  type StudioEventStream,
  watchJob,
} from '../services/studioEventSource';
import type { LogEntry } from '../types';
import type { Job, SystemLog as StudioLog } from '../packages/shared/src';
import type { ShellActivityJob } from '../lib/shellActivityJob';
import {
  catalogRefreshScopeFromImage,
  type CatalogRefreshScope,
} from '../lib/catalogOperationResult';
import {
  buildMergedStudioLogs,
  countActiveServerJobs,
  INITIAL_LOCAL_STUDIO_SYNC_BACKEND_STATE,
  localStudioSyncBackendReducer,
} from './localStudioSyncProjection';
import { createLocalStudioSyncRefreshPolicy } from './localStudioSyncRefreshPolicy';
import { createCatalogEventRefreshPolicy } from './catalogEventRefreshPolicy';

interface UseLocalStudioSyncProps {
  logs: LogEntry[];
  log: (message: string) => void;
  onCatalogChanged?: (scope?: CatalogRefreshScope) => void | Promise<void>;
}

export interface LocalStudioSyncActivity {
  studioJobs: ShellActivityJob[];
  mergedLogs: LogEntry[];
  activeServerJobCount: number;
  isBackendConnected: boolean;
}

export interface LocalStudioSyncResult {
  activity: LocalStudioSyncActivity;
  refreshBackendState: () => Promise<void>;
  waitForBackendJob: (jobId: string, signal?: AbortSignal, timeoutMs?: number) => Promise<Job>;
}

export function useLocalStudioSync({
  logs,
  log,
  onCatalogChanged,
}: UseLocalStudioSyncProps): LocalStudioSyncResult {
  const [backendState, dispatch] = useReducer(
    localStudioSyncBackendReducer,
    INITIAL_LOCAL_STUDIO_SYNC_BACKEND_STATE,
  );
  const isMountedRef = useRef(true);
  const streamRef = useRef<StudioEventStream | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const mergedLogs = useMemo(() => {
    return buildMergedStudioLogs(backendState.logs, logs);
  }, [logs, backendState.logs]);

  const activeServerJobCount = useMemo(() => {
    return countActiveServerJobs(backendState.jobs);
  }, [backendState.jobs]);

  const refreshBackendState = useCallback(async () => {
    try {
      if (!isMountedRef.current) {
        return;
      }

      const [backendJobs, backendLogs] = await Promise.all([listStudioJobs(), listStudioLogs()]);

      dispatch({ type: 'refresh', jobs: backendJobs, logs: backendLogs });
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      dispatch({ type: 'disconnect' });
      log(
        `Local Codex backend sync failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }, [log]);

  useEffect(() => {
    // Policies are effect-owned so React StrictMode's setup-cleanup-setup cycle
    // always receives fresh, non-disposed instances.
    const catalogRefreshPolicy = createCatalogEventRefreshPolicy({
      refreshCatalog: async (scope) => {
        await onCatalogChanged?.(scope);
      },
    });
    const refreshPolicy = createLocalStudioSyncRefreshPolicy({
      refreshBackendState,
      onConnectionRestored: () => catalogRefreshPolicy.request({ kind: 'all' }),
    });
    void refreshBackendState().catch(() => undefined);

    const stream = createStudioEventStream();
    streamRef.current = stream;
    const unsubscribeJob = stream.onJobUpdate('*', (job) => {
      dispatch({ type: 'job_update', job });
    });
    const unsubscribeAsset = stream.onAssetAdded(() => {
      refreshPolicy.onAssetAdded();
    });
    const unsubscribeCatalog = stream.onCatalogChanged((event) => {
      catalogRefreshPolicy.request(
        event.type === 'catalog.batch_changed'
          ? { kind: 'all' }
          : catalogRefreshScopeFromImage(event.image),
      );
    });
    const unsubscribeLog = stream.onLogAdded((entry) => {
      dispatch({ type: 'log_added', entry });
    });
    const unsubscribeConnection = stream.onConnectionChange((connected) => {
      dispatch({ type: 'connection_change', connected });
      refreshPolicy.onConnectionChange(connected);
    });
    const unsubscribeRevisionGap =
      stream.onRevisionGap?.(() => {
        refreshPolicy.onRevisionGap();
        catalogRefreshPolicy.request({ kind: 'all' });
      }) ?? (() => {});

    return () => {
      unsubscribeJob();
      unsubscribeAsset();
      unsubscribeCatalog();
      unsubscribeLog();
      unsubscribeConnection();
      unsubscribeRevisionGap();
      stream.close();
      refreshPolicy.dispose();
      catalogRefreshPolicy.dispose();
      if (streamRef.current === stream) {
        streamRef.current = null;
      }
    };
  }, [onCatalogChanged, refreshBackendState]);

  const waitForBackendJob = useCallback(
    async (jobId: string, signal?: AbortSignal, timeoutMs?: number) => {
      const existingStream = streamRef.current;
      const stream = existingStream ?? createStudioEventStream();
      try {
        return await watchJob(stream, jobId, signal, timeoutMs);
      } finally {
        if (!existingStream) stream.close();
      }
    },
    [],
  );

  return {
    activity: {
      studioJobs: backendState.jobs,
      mergedLogs,
      activeServerJobCount,
      isBackendConnected: backendState.connected,
    },
    refreshBackendState,
    waitForBackendJob,
  };
}
