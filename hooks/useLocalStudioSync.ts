import { useCallback, useEffect, useReducer, useMemo, useRef } from 'react';
import { listStudioJobs, listStudioLogs } from '../services/localStudioService';
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

interface UseLocalStudioSyncProps {
  logs: LogEntry[];
  log: (message: string) => void;
  onCatalogChanged?: (scope?: CatalogRefreshScope) => void;
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
    }
  }, [log, onCatalogChanged]);

  const refreshPolicy = useMemo(
    () =>
      createLocalStudioSyncRefreshPolicy({
        refreshBackendState,
      }),
    [refreshBackendState],
  );

  useEffect(() => {
    void refreshBackendState();

    const stream = createStudioEventStream();
    streamRef.current = stream;
    const unsubscribeJob = stream.onJobUpdate('*', (job) => {
      dispatch({ type: 'job_update', job });
    });
    const unsubscribeAsset = stream.onAssetAdded(() => {
      refreshPolicy.onAssetAdded();
    });
    const unsubscribeCatalog = stream.onCatalogChanged(({ image }) => {
      onCatalogChanged?.(catalogRefreshScopeFromImage(image));
    });
    const unsubscribeLog = stream.onLogAdded((entry) => {
      dispatch({ type: 'log_added', entry });
    });
    const unsubscribeConnection = stream.onConnectionChange((connected) => {
      dispatch({ type: 'connection_change', connected });
      refreshPolicy.onConnectionChange(connected);
    });

    return () => {
      unsubscribeJob();
      unsubscribeAsset();
      unsubscribeCatalog();
      unsubscribeLog();
      unsubscribeConnection();
      stream.close();
      if (streamRef.current === stream) {
        streamRef.current = null;
      }
    };
  }, [refreshPolicy, refreshBackendState]);

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
