import { useCallback, useEffect, useReducer, useMemo, useRef } from 'react';
import { listStudioJobs, listStudioLogs } from '../services/localStudioService';
import { createStudioEventStream } from '../services/studioEventSource';
import type { LogEntry } from '../types';
import type { Job as StudioJob, SystemLog as StudioLog } from '../packages/shared/src';

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

/**
 * Normalize a backend log entry into the UI log shape consumed by the debug
 * panel and overlays.
 */
function mapStudioLog(entry: StudioLog): LogEntry {
  return {
    id: `studio-log-${entry.id}`,
    timestamp: Date.parse(entry.createdAt) || Date.now(),
    message: `[${entry.scope}${entry.jobId ? `:${entry.jobId.slice(0, 8)}` : ''}] ${entry.message}`,
  };
}

/**
 * Keep Local Studio Sync focused on mirroring backend jobs and logs while
 * notifying the Image Catalog read model when backend assets change.
 */
interface BackendState {
  jobs: StudioJob[];
  logs: StudioLog[];
  connected: boolean;
}

const INITIAL_BACKEND_STATE: BackendState = { jobs: [], logs: [], connected: false };

type BackendAction =
  | { type: 'refresh'; jobs: StudioJob[]; logs: StudioLog[] }
  | { type: 'job_update'; job: StudioJob }
  | { type: 'log_added'; entry: StudioLog }
  | { type: 'connection_change'; connected: boolean }
  | { type: 'disconnect' };

function backendReducer(state: BackendState, action: BackendAction): BackendState {
  switch (action.type) {
    case 'refresh':
      return { jobs: action.jobs, logs: action.logs, connected: true };
    case 'job_update':
      return {
        ...state,
        jobs: [action.job, ...state.jobs.filter((c) => c.id !== action.job.id)].slice(0, 100),
      };
    case 'log_added':
      return {
        ...state,
        logs: [action.entry, ...state.logs.filter((c) => c.id !== action.entry.id)].slice(0, 300),
      };
    case 'connection_change':
      return { ...state, connected: action.connected };
    case 'disconnect':
      return { ...state, connected: false };
  }
}

export function useLocalStudioSync({
  logs,
  log,
  onCatalogChanged,
}: UseLocalStudioSyncProps): LocalStudioSyncResult {
  const [backendState, dispatch] = useReducer(backendReducer, INITIAL_BACKEND_STATE);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const mergedLogs = useMemo(() => {
    return [...backendState.logs.map(mapStudioLog), ...logs]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);
  }, [logs, backendState.logs]);

  const activeServerJobCount = useMemo(() => {
    return backendState.jobs.filter(
      (job) => job.status === 'queued' || job.status === 'running' || job.status === 'needs_review',
    ).length;
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

  useEffect(() => {
    void refreshBackendState();

    const stream = createStudioEventStream();
    const unsubscribeJob = stream.onJobUpdate('*', (job) => {
      dispatch({ type: 'job_update', job });
    });
    const unsubscribeAsset = stream.onAssetAdded(() => {
      onCatalogChanged?.();
    });
    const unsubscribeLog = stream.onLogAdded((entry) => {
      dispatch({ type: 'log_added', entry });
    });
    const unsubscribeConnection = stream.onConnectionChange((connected) => {
      dispatch({ type: 'connection_change', connected });
      if (!connected) {
        void refreshBackendState();
      }
    });

    return () => {
      unsubscribeJob();
      unsubscribeAsset();
      unsubscribeLog();
      unsubscribeConnection();
      stream.close();
    };
  }, [onCatalogChanged, refreshBackendState]);

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
