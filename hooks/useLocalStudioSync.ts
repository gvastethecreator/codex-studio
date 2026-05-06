import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_GENERATION_CONFIG, MODELS } from '../constants';
import {
  getStudioHealth,
  listStudioAssets,
  listStudioJobs,
  listStudioLogs,
  toStudioAssetUrl,
} from '../services/localStudioService';
import type { GenerationBatch, LogEntry, Toast } from '../types';
import type { Job as StudioJob, SystemLog as StudioLog } from '../packages/shared/src';
import { normalizeImageGenRatio } from '../utils/imageGenSizing';

type SetBatches = (value: GenerationBatch[] | ((previous: GenerationBatch[]) => GenerationBatch[])) => void;

interface UseLocalStudioSyncProps {
  logs: LogEntry[];
  log: (message: string) => void;
  setBatches: SetBatches;
  addToast: (message: string, type: Toast['type']) => void;
}

function mapStudioLog(entry: StudioLog): LogEntry {
  return {
    id: `studio-log-${entry.id}`,
    timestamp: Date.parse(entry.createdAt) || Date.now(),
    message: `[${entry.scope}${entry.jobId ? `:${entry.jobId.slice(0, 8)}` : ''}] ${entry.message}`,
  };
}

function mapAssetToBatch(asset: Awaited<ReturnType<typeof listStudioAssets>>[number]): GenerationBatch {
  const createdAt = Date.parse(asset.createdAt) || Date.now();
  const batchId = `studio-${asset.jobId}`;

  return {
    id: batchId,
    workspaceId: 'default',
    config: {
      ...DEFAULT_GENERATION_CONFIG,
      prompt: asset.prompt,
      model: MODELS.CODEX_IMAGEGEN,
      aspectRatio: normalizeImageGenRatio(asset.prompt.match(/Aspect ratio:\s*([0-9]+:[0-9]+)/)?.[1]),
    },
    images: [{
      id: asset.id,
      src: toStudioAssetUrl(asset.publicUrl),
      batchId,
      createdAt,
      isFavorite: false,
    }],
    createdAt,
  };
}

export function useLocalStudioSync({ logs, log, setBatches, addToast }: UseLocalStudioSyncProps) {
  const [studioJobs, setStudioJobs] = useState<StudioJob[]>([]);
  const [studioLogs, setStudioLogs] = useState<StudioLog[]>([]);

  const mergedLogs = useMemo(() => {
    return [...studioLogs.map(mapStudioLog), ...logs]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);
  }, [logs, studioLogs]);

  const activeServerJobCount = useMemo(() => {
    return studioJobs.filter(job => job.status === 'queued' || job.status === 'running' || job.status === 'needs_review').length;
  }, [studioJobs]);

  useEffect(() => {
    let cancelled = false;

    const importLocalAssets = async () => {
      const assets = await listStudioAssets();
      if (assets.length === 0 || cancelled) return;

      let importedCount = 0;
      setBatches(prev => {
        const existingImageIds = new Set(prev.flatMap(batch => batch.images.map(image => image.id)));
        const newBatches = assets
          .filter(asset => !existingImageIds.has(asset.id))
          .map(mapAssetToBatch);

        importedCount = newBatches.length;
        return importedCount > 0 ? [...newBatches, ...prev] : prev;
      });

      if (importedCount > 0 && !cancelled) {
        log(`Imported ${importedCount} local Codex asset(s) from the studio library`);
      }
    };

    const refreshBackendState = async () => {
      try {
        const [backendJobs, backendLogs] = await Promise.all([
          listStudioJobs(),
          listStudioLogs(),
        ]);

        if (!cancelled) {
          setStudioJobs(backendJobs);
          setStudioLogs(backendLogs);
        }

        await importLocalAssets();
      } catch (error) {
        if (!cancelled) {
          log(`Local Codex backend sync failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    };

    void refreshBackendState();
    const interval = window.setInterval(() => void refreshBackendState(), 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [log, setBatches]);

  const verifyCodexSession = useCallback(async () => {
    try {
      const health = await getStudioHealth();
      const isReady = health.ok && health.checks.onboardingReady;
      const message = isReady
        ? 'Sesion local Codex disponible'
        : !health.checks.codexReady
          ? 'Codex CLI no disponible todavia'
          : !health.appServer.running
            ? 'Backend local disponible, app-server no activo'
            : 'La biblioteca local necesita atencion';
      addToast(message, isReady ? 'success' : 'error');
      log(`Codex health: cli=${health.codexCli.available ? health.codexCli.version || 'available' : 'missing'}, appServer=${health.appServer.running ? health.appServer.wsUrl : 'stopped'}, libraryReady=${health.checks.libraryReady}`);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo verificar Codex local', 'error');
    }
  }, [addToast, log]);

  return {
    studioJobs,
    mergedLogs,
    activeServerJobCount,
    verifyCodexSession,
  };
}
