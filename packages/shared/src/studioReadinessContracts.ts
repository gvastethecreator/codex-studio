import type { CodexRuntimeDoctorReport, HealthResponse, LocalCodexSessionResponse } from './types';

export type StudioReadinessRefreshReason =
  | 'startup'
  | 'passive'
  | 'manual'
  | 'onboarding'
  | 'session_verify'
  | 'app_server_change';

export interface StudioReadinessEnvelope {
  revision: number;
  observedAt: string | null;
  freshness: 'unknown' | 'fresh' | 'stale';
  refreshState: 'idle' | 'refreshing' | 'failed';
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  codexRuntime: CodexRuntimeDoctorReport | null;
  localCodexSession: LocalCodexSessionResponse | null;
}

export interface StudioReadinessRefreshRequest {
  reason: StudioReadinessRefreshReason;
  force?: boolean;
}

export interface StudioRuntimeSnapshotResponse {
  health: HealthResponse;
  readiness: StudioReadinessEnvelope;
}
