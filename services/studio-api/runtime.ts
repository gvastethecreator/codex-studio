import type {
  CodexRuntimeDoctorReport,
  HealthResponse,
  StudioReadinessEnvelope,
  StudioReadinessRefreshReason,
  StudioResetResponse,
  StudioRuntimeSnapshotResponse,
} from '../../packages/shared/src';
import { request } from './http';

export interface StudioReadinessRefreshOptions {
  reason?: StudioReadinessRefreshReason;
  force?: boolean;
}

const runtimeSnapshotCacheTtlMs = 1_000;
let runtimeSnapshotCache: { value: StudioRuntimeSnapshotResponse; cachedAt: number } | null = null;
let runtimeSnapshotGeneration = 0;
let runtimeSnapshotInFlight: {
  generation: number;
  promise: Promise<StudioRuntimeSnapshotResponse>;
} | null = null;
let passiveReadinessRefreshInFlight: Promise<StudioReadinessEnvelope> | null = null;
let forcedReadinessRefreshInFlight: Promise<StudioReadinessEnvelope> | null = null;

function invalidateRuntimeSnapshot() {
  runtimeSnapshotGeneration += 1;
  runtimeSnapshotCache = null;
}

export async function getStudioHealth() {
  return request<HealthResponse>('/api/health');
}

export async function getStudioRuntimeSnapshot({ bypassCache = false } = {}) {
  if (bypassCache) invalidateRuntimeSnapshot();

  const now = Date.now();
  if (
    !bypassCache &&
    runtimeSnapshotCache &&
    now - runtimeSnapshotCache.cachedAt < runtimeSnapshotCacheTtlMs
  ) {
    return runtimeSnapshotCache.value;
  }

  const generation = runtimeSnapshotGeneration;
  if (runtimeSnapshotInFlight?.generation === generation) {
    return runtimeSnapshotInFlight.promise;
  }

  const promise = request<StudioRuntimeSnapshotResponse>('/api/runtime/snapshot')
    .then((value) => {
      if (runtimeSnapshotGeneration === generation) {
        runtimeSnapshotCache = { value, cachedAt: Date.now() };
      }
      return value;
    })
    .finally(() => {
      if (runtimeSnapshotInFlight?.promise === promise) runtimeSnapshotInFlight = null;
    });
  runtimeSnapshotInFlight = { generation, promise };
  return promise;
}

export async function refreshStudioReadiness({
  reason = 'passive',
  force = false,
}: StudioReadinessRefreshOptions = {}) {
  const inFlight = force ? forcedReadinessRefreshInFlight : passiveReadinessRefreshInFlight;
  if (inFlight) return inFlight;
  if (force) invalidateRuntimeSnapshot();

  const refreshRequest = request<StudioReadinessEnvelope>('/api/readiness/refresh', {
    method: 'POST',
    body: JSON.stringify({ reason, force }),
  })
    .then((value) => {
      invalidateRuntimeSnapshot();
      return value;
    })
    .finally(() => {
      if (force) forcedReadinessRefreshInFlight = null;
      else passiveReadinessRefreshInFlight = null;
    });

  if (force) forcedReadinessRefreshInFlight = refreshRequest;
  else passiveReadinessRefreshInFlight = refreshRequest;
  return refreshRequest;
}

export async function getCodexRuntimeDoctor() {
  return request<CodexRuntimeDoctorReport>('/api/runtime/doctor');
}

export async function startStudioAppServer() {
  return request<{
    running: boolean;
    wsUrl: string;
    pid?: number | null;
    lastStartError?: string | null;
    codexRuntime?: CodexRuntimeDoctorReport;
  }>('/api/app-server/start', { method: 'POST' });
}

export async function resetStudioData() {
  return request<StudioResetResponse>('/api/studio/reset', { method: 'POST' });
}
