import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getStudioHealth,
  listStudioJobs,
  listStudioLogs,
  queryCatalog,
  toStudioAssetUrl,
} from '../services/localStudioService';
import { createStudioEventStream } from '../services/studioEventSource';
import type { GenerationBatch, LogEntry, Toast } from '../types';
import type { Job as StudioJob, SystemLog as StudioLog } from '../packages/shared/src';
import { buildGenerationConfigFromCatalogImage } from '../utils/catalogImageGenerationConfig';
import { validateVault } from '../utils/fileUtils';
import { getAllEntries } from '../utils/idb';

type MergeBatches = (
  batches: GenerationBatch[],
  options?: { prepend?: boolean; maxTotal?: number; ensureWorkspaces?: boolean },
) => void;

interface UseLocalStudioSyncProps {
  logs: LogEntry[];
  log: (message: string) => void;
  batches: GenerationBatch[];
  mergeBatches: MergeBatches;
  addToast: (message: string, type: Toast['type']) => void;
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
 * Materialize one catalog asset into the legacy visual batch model used by the
 * current studio grid while the catalog migration is still in flight.
 */
function mapAssetToBatch(
  asset: Awaited<ReturnType<typeof queryCatalog>>['images'][number],
): GenerationBatch {
  const createdAt = Date.parse(asset.createdAt) || Date.now();
  const batchId = asset.batchId || `studio-${asset.jobId ?? asset.id}`;

  return {
    id: batchId,
    workspaceId: asset.workspaceId || 'default',
    config: buildGenerationConfigFromCatalogImage(asset),
    images: [
      {
        id: asset.id,
        src: toStudioAssetUrl(asset.publicUrl),
        thumbnail: asset.thumbnailUrl ? toStudioAssetUrl(asset.thumbnailUrl) : undefined,
        batchId,
        createdAt,
        isFavorite: false,
      },
    ],
    createdAt,
  };
}

/**
 * Keep the React UI synchronized with persistent backend jobs, logs, and
 * imported local assets.
 */
export function useLocalStudioSync({
  logs,
  log,
  batches,
  mergeBatches,
  addToast,
}: UseLocalStudioSyncProps) {
  const [studioJobs, setStudioJobs] = useState<StudioJob[]>([]);
  const [studioLogs, setStudioLogs] = useState<StudioLog[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const batchesRef = useRef(batches);

  useEffect(() => {
    batchesRef.current = batches;
  }, [batches]);

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

  useEffect(() => {
    let cancelled = false;

    const importLocalAssets = async () => {
      const assets = (await queryCatalog({ limit: 200 })).images;
      if (assets.length === 0 || cancelled) return;

      const existingImageIds = new Set(
        batchesRef.current.flatMap((batch) => batch.images.map((image) => image.id)),
      );
      const newBatches = assets
        .filter((asset) => !existingImageIds.has(asset.id))
        .map(mapAssetToBatch);
      const importedCount = newBatches.length;

      if (importedCount > 0) {
        mergeBatches(newBatches, { prepend: true, ensureWorkspaces: true });
      }

      if (importedCount > 0 && !cancelled) {
        log(`Imported ${importedCount} local Codex asset(s) from the studio library`);
      }
    };

    const refreshBackendState = async () => {
      try {
        const [backendJobs, backendLogs] = await Promise.all([listStudioJobs(), listStudioLogs()]);

        if (!cancelled) {
          setStudioJobs(backendJobs);
          setStudioLogs(backendLogs);
          setIsBackendConnected(true);
        }

        await importLocalAssets();
      } catch (error) {
        if (!cancelled) {
          setIsBackendConnected(false);
          log(
            `Local Codex backend sync failed: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    };

    void refreshBackendState();
    const stream = createStudioEventStream();
    const unsubscribeJob = stream.onJobUpdate('*', (job) => {
      setStudioJobs((prev) =>
        [job, ...prev.filter((candidate) => candidate.id !== job.id)].slice(0, 100),
      );
    });
    const unsubscribeAsset = stream.onAssetAdded(() => {
      void importLocalAssets();
    });
    const unsubscribeLog = stream.onLogAdded((entry) => {
      setStudioLogs((prev) =>
        [entry, ...prev.filter((candidate) => candidate.id !== entry.id)].slice(0, 300),
      );
    });
    const unsubscribeConnection = stream.onConnectionChange((connected) => {
      setIsBackendConnected(connected);
      if (!connected) void refreshBackendState();
    });
    return () => {
      cancelled = true;
      unsubscribeJob();
      unsubscribeAsset();
      unsubscribeLog();
      unsubscribeConnection();
      stream.close();
    };
  }, [log, mergeBatches]);

  const recoverOrphanedBatches = useCallback(async () => {
    addToast('Starting Deep Scan Recovery...', 'info');

    try {
      const entries = await getAllEntries();
      const knownKeys = [
        'session-logs',
        'app-workspaces',
        'catalog-cache',
        'catalog-trash',
        'user-wallet-balance',
        'bg-config',
        'isBackgroundEnabled',
        'generation-config',
      ];
      const recoveredCandidates: GenerationBatch[] = [];

      for (const entry of entries) {
        if (typeof entry.key === 'string' && !knownKeys.includes(entry.key)) {
          if (Array.isArray(entry.value) && validateVault(entry.value)) {
            recoveredCandidates.push(...entry.value);
          } else if (validateVault([entry.value])) {
            recoveredCandidates.push(entry.value);
          }
        }
      }

      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key || knownKeys.includes(key)) continue;

        try {
          const item = localStorage.getItem(key);
          if (!item) continue;

          const parsed = JSON.parse(item);
          if (Array.isArray(parsed) && validateVault(parsed)) {
            recoveredCandidates.push(...parsed);
          } else if (validateVault([parsed])) {
            recoveredCandidates.push(parsed);
          }
        } catch {
          // Ignore invalid storage payloads.
        }
      }

      const existingIds = new Set(batchesRef.current.map((batch) => batch.id));
      const uniqueRecovered = recoveredCandidates.filter((batch) => !existingIds.has(batch.id));

      if (uniqueRecovered.length > 0) {
        mergeBatches(uniqueRecovered, { prepend: true, maxTotal: 100, ensureWorkspaces: true });
      }

      addToast(
        uniqueRecovered.length > 0
          ? `Success! Recovered ${uniqueRecovered.length} batches.`
          : 'Deep Scan complete: No new fragments found.',
        uniqueRecovered.length > 0 ? 'success' : 'info',
      );
    } catch (error) {
      log(`Deep scan failed: ${error instanceof Error ? error.message : String(error)}`);
      addToast('Error during Deep Scan', 'error');
    }
  }, [addToast, log, mergeBatches]);

  const verifyCodexSession = useCallback(async () => {
    try {
      const health = await getStudioHealth();
      const isReady = health.ok && health.checks.onboardingReady;
      const message = isReady
        ? 'Local Codex session available'
        : !health.checks.codexReady
          ? 'Codex CLI not available yet'
          : !health.appServer.running
            ? 'Local backend available, app-server not active'
            : 'The local library needs attention';
      addToast(message, isReady ? 'success' : 'error');
      log(
        `Codex health: cli=${health.codexCli.available ? health.codexCli.version || 'available' : 'missing'}, appServer=${health.appServer.running ? health.appServer.wsUrl : 'stopped'}, libraryReady=${health.checks.libraryReady}`,
      );
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Could not verify local Codex',
        'error',
      );
    }
  }, [addToast, log]);

  return {
    studioJobs,
    mergedLogs,
    activeServerJobCount,
    isBackendConnected,
    verifyCodexSession,
    recoverOrphanedBatches,
  };
}
