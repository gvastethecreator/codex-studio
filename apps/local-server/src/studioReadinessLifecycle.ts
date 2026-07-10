import type {
  CodexRuntimeDoctorReport,
  LocalCodexSessionResponse,
  StudioReadinessEnvelope,
  StudioReadinessRefreshRequest,
} from '../../../packages/shared/src';
import { refreshCodexRuntimeDoctor } from './codexRuntimeDoctor';

interface StudioReadinessLifecycleDependencies {
  now?: () => Date;
  maxAgeMs?: number;
  probeCodexRuntime?: () => Promise<CodexRuntimeDoctorReport>;
  readLocalCodexSession: () => Promise<LocalCodexSessionResponse>;
  isAppServerRunning: () => boolean;
}

export interface StudioReadinessLifecycle {
  readSnapshot(): StudioReadinessEnvelope;
  refresh(request: StudioReadinessRefreshRequest): Promise<StudioReadinessEnvelope>;
  dispose(): void;
}

export function createStudioReadinessLifecycle({
  now = () => new Date(),
  maxAgeMs = 30_000,
  probeCodexRuntime = refreshCodexRuntimeDoctor,
  readLocalCodexSession,
  isAppServerRunning,
}: StudioReadinessLifecycleDependencies): StudioReadinessLifecycle {
  let disposed = false;
  let expiresAt = 0;
  let inFlight: Promise<StudioReadinessEnvelope> | null = null;
  let snapshot: StudioReadinessEnvelope = {
    revision: 0,
    observedAt: null,
    freshness: 'unknown',
    refreshState: 'idle',
    lastAttemptAt: null,
    lastSuccessAt: null,
    codexRuntime: null,
    localCodexSession: null,
  };

  const readSnapshot = () => {
    if (snapshot.freshness === 'fresh' && expiresAt <= now().getTime()) {
      return { ...snapshot, freshness: 'stale' as const };
    }
    return snapshot;
  };

  const refresh = (request: StudioReadinessRefreshRequest) => {
    if (disposed) return Promise.reject(new Error('Studio Readiness lifecycle is disposed'));
    if (!request.force && readSnapshot().freshness === 'fresh') {
      return Promise.resolve(snapshot);
    }
    if (inFlight) return inFlight;

    const attemptedAt = now().toISOString();
    snapshot = { ...readSnapshot(), refreshState: 'refreshing', lastAttemptAt: attemptedAt };
    inFlight = (async () => {
      try {
        const codexRuntime = await probeCodexRuntime();
        const localCodexSession =
          codexRuntime.canRunJobs && isAppServerRunning() ? await readLocalCodexSession() : null;
        if (disposed) throw new Error('Studio Readiness lifecycle is disposed');
        const observedAt = now().toISOString();
        expiresAt = now().getTime() + maxAgeMs;
        snapshot = {
          revision: snapshot.revision + 1,
          observedAt,
          freshness: 'fresh',
          refreshState: 'idle',
          lastAttemptAt: attemptedAt,
          lastSuccessAt: observedAt,
          codexRuntime,
          localCodexSession,
        };
        return snapshot;
      } catch (error) {
        if (!disposed) {
          snapshot = {
            ...readSnapshot(),
            refreshState: 'failed',
            lastAttemptAt: attemptedAt,
          };
        }
        throw error;
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  };

  return {
    readSnapshot,
    refresh,
    dispose() {
      disposed = true;
    },
  };
}
