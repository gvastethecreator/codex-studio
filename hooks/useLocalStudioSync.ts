import { useCallback, useEffect, useReducer, useMemo, useRef } from 'react';
import { listStudioJobs, listStudioLogs } from '../services/localStudioService';
import { createStudioEventStream } from '../services/studioEventSource';
import type { LogEntry } from '../types';
import type { Job as StudioJob, SystemLog as StudioLog } from '../packages/shared/src';
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
  onCatalogChanged?: () => void;
}

export interface LocalStudioSyncActivity {
  studioJobs: StudioJob[];
  mergedLogs: LogEntry[];
  activeServerJobCount: number;
  isBackendConnected: boolean;
}

export interface LocalStudioSyncResult {
  activity: LocalStudioSyncActivity;
  refreshBackendState: () => Promise<void>;
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
      onCatalogChanged?.();
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
    const unsubscribeJob = stream.onJobUpdate('*', (job) => {
      dispatch({ type: 'job_update', job });
    });
    const unsubscribeAsset = stream.onAssetAdded(() => {
      refreshPolicy.onAssetAdded();
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
      unsubscribeLog();
      unsubscribeConnection();
      stream.close();
    };
  }, [refreshPolicy, refreshBackendState]);

  return {
    activity: {
      studioJobs: backendState.jobs,
      mergedLogs,
      activeServerJobCount,
      isBackendConnected: backendState.connected,
    },
    refreshBackendState,
  };
}
