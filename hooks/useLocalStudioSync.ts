import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listStudioJobs, listStudioLogs, queryCatalog } from '../services/localStudioService';
import { createStudioEventStream } from '../services/studioEventSource';
import type { GenerationBatch, LogEntry } from '../types';
import type { Job as StudioJob, SystemLog as StudioLog } from '../packages/shared/src';
import { materializeVisualBatches } from '../lib/studioVisualBatchCatalog';

type MergeBatches = (
  batches: GenerationBatch[],
  options?: { prepend?: boolean; maxTotal?: number; ensureWorkspaces?: boolean },
) => void;

interface UseLocalStudioSyncProps {
  logs: LogEntry[];
  log: (message: string) => void;
  batches: GenerationBatch[];
  mergeBatches: MergeBatches;
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
 * Keep Local Studio Sync focused on mirroring backend jobs, logs, and Catalog
 * Entries into the Visual Batch cache consumed by the current Studio grid.
 */
export function useLocalStudioSync({
  logs,
  log,
  batches,
  mergeBatches,
}: UseLocalStudioSyncProps): LocalStudioSyncResult {
  const [studioJobs, setStudioJobs] = useState<StudioJob[]>([]);
  const [studioLogs, setStudioLogs] = useState<StudioLog[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const batchesRef = useRef(batches);
  const isMountedRef = useRef(true);

  useEffect(() => {
    batchesRef.current = batches;
  }, [batches]);

  useEffect(() => {
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

  const importCatalogEntries = useCallback(async () => {
    const assets = (await queryCatalog({ limit: 200 })).images;
    if (assets.length === 0 || !isMountedRef.current) {
      return;
    }

    const existingImageIds = new Set(
      batchesRef.current.flatMap((batch) => batch.images.map((image) => image.id)),
    );
    const newBatches = materializeVisualBatches(assets, {
      excludeImageIds: existingImageIds,
    });

    if (newBatches.length > 0 && isMountedRef.current) {
      mergeBatches(newBatches, { prepend: true, ensureWorkspaces: true });
      log(`Imported ${newBatches.length} local Codex asset(s) from the studio library`);
    }
  }, [log, mergeBatches]);

  const refreshBackendState = useCallback(async () => {
    try {
      const [backendJobs, backendLogs] = await Promise.all([listStudioJobs(), listStudioLogs()]);

      if (!isMountedRef.current) {
        return;
      }

      setStudioJobs(backendJobs);
      setStudioLogs(backendLogs);
      setIsBackendConnected(true);

      await importCatalogEntries();
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      setIsBackendConnected(false);
      log(
        `Local Codex backend sync failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [importCatalogEntries, log]);

  useEffect(() => {
    void refreshBackendState();

    const stream = createStudioEventStream();
    const unsubscribeJob = stream.onJobUpdate('*', (job) => {
      setStudioJobs((prev) =>
        [job, ...prev.filter((candidate) => candidate.id !== job.id)].slice(0, 100),
      );
    });
    const unsubscribeAsset = stream.onAssetAdded(() => {
      void importCatalogEntries();
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
  }, [importCatalogEntries, refreshBackendState]);

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
