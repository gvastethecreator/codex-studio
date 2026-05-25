import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
export function useLocalStudioSync({
  logs,
  log,
  onCatalogChanged,
}: UseLocalStudioSyncProps): LocalStudioSyncResult {
  const [studioJobs, setStudioJobs] = useState<StudioJob[]>([]);
  const [studioLogs, setStudioLogs] = useState<StudioLog[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const mergedLogs = useMemo(() => {
    return [...studioLogs.map(mapStudioLog), ...logs]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);
  }, [logs, studioLogs]);

  const activeServerJobCount = useMemo(() => {
    return studioJobs.filter(
      (job) => job.status === 'queued' || job.status === 'running' || job.status === 'needs_review',
    ).length;
  }, [studioJobs]);

  const refreshBackendState = useCallback(async () => {
    try {
      const [backendJobs, backendLogs] = await Promise.all([listStudioJobs(), listStudioLogs()]);

      if (!isMountedRef.current) {
        return;
      }

      setStudioJobs(backendJobs);
      setStudioLogs(backendLogs);
      setIsBackendConnected(true);
      onCatalogChanged?.();
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      setIsBackendConnected(false);
      log(
        `Local Codex backend sync failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [log, onCatalogChanged]);

  useEffect(() => {
    void refreshBackendState();

    const stream = createStudioEventStream();
    const unsubscribeJob = stream.onJobUpdate('*', (job) => {
      setStudioJobs((prev) =>
        [job, ...prev.filter((candidate) => candidate.id !== job.id)].slice(0, 100),
      );
    });
    const unsubscribeAsset = stream.onAssetAdded(() => {
      onCatalogChanged?.();
    });
    const unsubscribeLog = stream.onLogAdded((entry) => {
      setStudioLogs((prev) =>
        [entry, ...prev.filter((candidate) => candidate.id !== entry.id)].slice(0, 300),
      );
    });
    const unsubscribeConnection = stream.onConnectionChange((connected) => {
      setIsBackendConnected(connected);
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
      studioJobs,
      mergedLogs,
      activeServerJobCount,
      isBackendConnected,
    },
    refreshBackendState,
  };
}
