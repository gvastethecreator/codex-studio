import type { HealthResponse, LocalCodexSessionResponse } from '../packages/shared/src';

export type StudioStatusTone = 'success' | 'warning' | 'danger';
export type StudioUsageTone = 'available' | 'neutral' | 'offline';
export type StudioRuntimeStatusKey = 'backend' | 'codexCli' | 'appServer' | 'localCodexSession';

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
  localCodexSession: LocalCodexSessionResponse | null;
  statusItems: StudioRuntimeStatusItem[];
  usage: StudioUsageSummary;
}

interface BuildStudioDiagnosticsSnapshotArgs {
  health: HealthResponse | null;
  localCodexSession: LocalCodexSessionResponse | null;
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
  localCodexSession,
  hasFetchedDiagnostics,
  isBackendConnected,
}: BuildStudioDiagnosticsSnapshotArgs): StudioDiagnosticsSnapshot {
  const localSessionStatus = !localCodexSession
    ? {
        value: 'Checking',
        detail: 'Waiting for the first Local Codex Session check from the local backend.',
        tone: 'warning' as const,
      }
    : localCodexSession.canRunLocalJobs
      ? {
          value: 'ChatGPT Login',
          detail: localCodexSession.planType
            ? `Local session ready · ${formatCodexPlan(localCodexSession.planType)}`
            : 'Local ChatGPT login ready for Codex turns.',
          tone: 'success' as const,
        }
      : localCodexSession.reason === 'chatgpt_login_required'
        ? {
            value: 'Login Required',
            detail: 'Run `codex login` and choose ChatGPT before running local image tasks.',
            tone: 'warning' as const,
          }
        : localCodexSession.reason === 'api_key_not_supported'
          ? {
              value: 'API Key',
              detail:
                'Local-only mode does not use API key sessions. Re-authenticate the local Codex CLI with ChatGPT.',
              tone: 'danger' as const,
            }
          : localCodexSession.reason === 'external_tokens_not_supported'
            ? {
                value: 'External Tokens',
                detail:
                  'Codex Studio expects the user-managed ChatGPT login from the local Codex CLI.',
                tone: 'danger' as const,
              }
            : {
                value: 'Unavailable',
                detail:
                  localCodexSession.error
                    ? `Could not read the local session: ${localCodexSession.error}`
                    : 'The Local Codex Session is unavailable right now.',
                tone: 'danger' as const,
              };

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
            ? 'The App-Server Lifecycle will start codex app-server automatically when a generation or Local Codex Session check needs it.'
            : 'Waiting for the first runtime check from the local backend.',
      tone: health?.appServer.running === true ? 'success' : 'warning',
    },
    {
      key: 'localCodexSession',
      label: 'Local Session',
      value: localSessionStatus.value,
      detail: localSessionStatus.detail,
      tone: localSessionStatus.tone,
    },
  ];

  const usageIsLoading = isBackendConnected && !hasFetchedDiagnostics;
  const usageMeta = !isBackendConnected
    ? 'Local backend offline'
    : localCodexSession?.planType
      ? formatCodexPlan(localCodexSession.planType)
      : localCodexSession?.reason === 'chatgpt_login_required'
        ? 'ChatGPT login required'
        : localCodexSession?.reason === 'api_key_not_supported'
          ? 'Unsupported API key session'
          : 'Local Codex session';
  const usageValue = !isBackendConnected
    ? 'Offline'
    : usageIsLoading
      ? 'Checking…'
      : localCodexSession?.usage?.display ??
        (localCodexSession?.reason === 'chatgpt_login_required'
          ? 'Sign in with ChatGPT'
          : 'Unavailable');
  const usageTooltip = !isBackendConnected
    ? 'Reconnect the local backend to refresh health, usage, and app-server status.'
    : localCodexSession?.error
      ? `Usage unavailable: ${localCodexSession.error}`
      : `Available usage for ${usageMeta}`;
  const usageTone: StudioUsageTone = !isBackendConnected
    ? 'offline'
    : localCodexSession?.usage?.display
      ? 'available'
      : 'neutral';

  return {
    health,
    backendConnected: isBackendConnected,
    hasFetchedDiagnostics,
    localCodexSession,
    statusItems,
    usage: {
      value: usageValue,
      meta: usageMeta,
      tooltip: usageTooltip,
      unitLabel:
        !usageIsLoading && localCodexSession?.usage?.unit === 'credits' ? 'credits' : null,
      tone: usageTone,
      isLoading: usageIsLoading,
    },
  };
}
