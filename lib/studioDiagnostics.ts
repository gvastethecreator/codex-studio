import type { CodexAccountStatusResponse, HealthResponse } from '../packages/shared/src';

export type StudioStatusTone = 'success' | 'warning' | 'danger';
export type StudioUsageTone = 'available' | 'neutral' | 'offline';
export type StudioRuntimeStatusKey = 'backend' | 'codexCli' | 'appServer';

export interface StudioRuntimeStatusItem {
  key: StudioRuntimeStatusKey;
  label: string;
  value: string;
  detail: string;
  tone: StudioStatusTone;
}

export interface StudioUsageSummary {
  value: string;
  meta: string;
  tooltip: string;
  unitLabel: string | null;
  tone: StudioUsageTone;
  isLoading: boolean;
}

export interface StudioDiagnosticsSnapshot {
  health: HealthResponse | null;
  backendConnected: boolean;
  hasFetchedDiagnostics: boolean;
  codexAccountStatus: CodexAccountStatusResponse | null;
  statusItems: StudioRuntimeStatusItem[];
  usage: StudioUsageSummary;
}

interface BuildStudioDiagnosticsSnapshotArgs {
  health: HealthResponse | null;
  codexAccountStatus: CodexAccountStatusResponse | null;
  hasFetchedDiagnostics: boolean;
  isBackendConnected: boolean;
}

export function formatCodexPlan(planType: string | null | undefined) {
  if (!planType) return 'Codex account';

  return planType
    .replace(/chatgpt/gi, 'ChatGPT')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function buildStudioDiagnosticsSnapshot({
  health,
  codexAccountStatus,
  hasFetchedDiagnostics,
  isBackendConnected,
}: BuildStudioDiagnosticsSnapshotArgs): StudioDiagnosticsSnapshot {
  const statusItems: StudioRuntimeStatusItem[] = [
    {
      key: 'backend',
      label: 'Backend',
      value: isBackendConnected ? 'Connected' : 'Offline',
      detail: isBackendConnected
        ? `HTTP API and live events are reachable on localhost:${health?.config.serverPort ?? 4317}.`
        : 'The Studio UI cannot reach the local backend right now. Check whether the local server is still running.',
      tone: isBackendConnected ? 'success' : 'danger',
    },
    {
      key: 'codexCli',
      label: 'Codex CLI',
      value:
        health?.codexCli.available === true ? 'Ready' : health ? 'Unavailable' : 'Checking',
      detail:
        health?.codexCli.available === true
          ? health.codexCli.version ?? health.codexCli.command ?? 'Codex CLI detected.'
          : health
            ? 'Install Codex CLI or confirm it is available on your PATH before running image tasks.'
            : 'Waiting for the first runtime check from the local backend.',
      tone:
        health?.codexCli.available === true ? 'success' : health ? 'danger' : 'warning',
    },
    {
      key: 'appServer',
      label: 'App Server',
      value: health?.appServer.running === true ? 'Running' : health ? 'Standby' : 'Checking',
      detail:
        health?.appServer.running === true
          ? health.appServer.wsUrl || 'Codex app-server websocket is live.'
          : health
            ? 'The Codex app-server will start automatically when a generation or account check needs it.'
            : 'Waiting for the first runtime check from the local backend.',
      tone: health?.appServer.running === true ? 'success' : 'warning',
    },
  ];

  const usageIsLoading = isBackendConnected && !hasFetchedDiagnostics;
  const usageMeta = !isBackendConnected
    ? 'Local backend offline'
    : codexAccountStatus?.planType
      ? formatCodexPlan(codexAccountStatus.planType)
      : codexAccountStatus?.authMode === 'apikey'
        ? 'API key session'
        : 'Codex account';
  const usageValue = !isBackendConnected
    ? 'Offline'
    : usageIsLoading
      ? 'Checking…'
      : codexAccountStatus?.usage?.display ?? 'Unavailable';
  const usageTooltip = !isBackendConnected
    ? 'Reconnect the local backend to refresh health, usage, and app-server status.'
    : codexAccountStatus?.error
      ? `Usage unavailable: ${codexAccountStatus.error}`
      : `Available usage for ${usageMeta}`;
  const usageTone: StudioUsageTone = !isBackendConnected
    ? 'offline'
    : codexAccountStatus?.usage?.display
      ? 'available'
      : 'neutral';

  return {
    health,
    backendConnected: isBackendConnected,
    hasFetchedDiagnostics,
    codexAccountStatus,
    statusItems,
    usage: {
      value: usageValue,
      meta: usageMeta,
      tooltip: usageTooltip,
      unitLabel:
        !usageIsLoading && codexAccountStatus?.usage?.unit === 'credits' ? 'credits' : null,
      tone: usageTone,
      isLoading: usageIsLoading,
    },
  };
}
