import type {
  HealthResponse,
  LocalCodexSessionResponse,
  StudioReadinessAction,
  StudioReadinessCheck,
  StudioReadinessSnapshot,
} from '../packages/shared/src';
import type { StudioRuntimeInfo } from '../services/studioRuntime';

interface BuildStudioReadinessSnapshotArgs {
  health: HealthResponse | null;
  isBackendConnected: boolean;
  localCodexSession: LocalCodexSessionResponse | null;
  runtime: Pick<StudioRuntimeInfo, 'label'>;
}

function resolveLocalCodexSessionDetail(session: LocalCodexSessionResponse | null) {
  if (!session) {
    return {
      ok: false,
      detail: 'Waiting for the first Local Codex Session check.',
    };
  }

  if (session.canRunLocalJobs) {
    return {
      ok: true,
      detail: session.planType
        ? `ChatGPT login active · ${session.planType}`
        : 'ChatGPT login active in the local Codex CLI.',
    };
  }

  switch (session.reason) {
    case 'chatgpt_login_required':
      return {
        ok: false,
        detail: 'Run `codex login` and choose ChatGPT before starting local Codex turns.',
      };
    case 'api_key_not_supported':
      return {
        ok: false,
        detail:
          'Local-only mode does not use API key sessions. Re-authenticate the local Codex CLI with ChatGPT login.',
      };
    case 'external_tokens_not_supported':
      return {
        ok: false,
        detail:
          'Codex Studio expects the user-managed ChatGPT login from the local Codex CLI, not externally managed tokens.',
      };
    default:
      return {
        ok: false,
        detail: session.error
          ? `Could not read the Local Codex Session: ${session.error}`
          : 'The Local Codex Session is unavailable right now.',
      };
  }
}

function resolveNextAction(
  health: HealthResponse | null,
  localCodexSession: LocalCodexSessionResponse | null,
  isBackendConnected: boolean,
): StudioReadinessAction {
  if (!isBackendConnected) return 'retry';
  if (!health) return null;
  if (!health.checks.libraryReady) return 'fix-library';
  if (health.checks.onboardingReady) return null;
  if (!health.codexRuntime.canRunJobs && !health.checks.codexReady) return 'install-codex';
  if (!health.appServer.running) return 'start-app-server';
  if (!localCodexSession?.canRunLocalJobs) {
    return localCodexSession?.reason === 'app_server_unavailable' ? 'retry' : 'login-chatgpt';
  }
  return null;
}

function buildTitle(nextAction: StudioReadinessAction, runtimeLabel: string) {
  switch (nextAction) {
    case 'install-codex':
      return 'Repair Codex CLI';
    case 'start-app-server':
      return 'Start codex app-server';
    case 'login-chatgpt':
      return 'Sign in with ChatGPT';
    case 'fix-library':
      return 'Repair the Studio Library';
    case 'retry':
      return 'Reconnect the local backend';
    default:
      return `${runtimeLabel} ready`;
  }
}

function buildDescription(nextAction: StudioReadinessAction, runtimeLabel: string) {
  switch (nextAction) {
    case 'install-codex':
      return 'Install, update, or reprioritize the local Codex CLI before running a Local Generation Run.';
    case 'start-app-server':
      return 'The backend is reachable, but the App-Server Lifecycle still needs to start `codex app-server`.';
    case 'login-chatgpt':
      return 'Sign in from Studio Settings, or run `codex login` and choose ChatGPT.';
    case 'fix-library':
      return 'The Studio Library is missing folders or write access, so Local Assets cannot be persisted safely.';
    case 'retry':
      return 'The local backend or app-server is unavailable. Refresh after the local runtime comes back.';
    default:
      return `${runtimeLabel} is ready for Local Generation Runs.`;
  }
}

export function buildStudioReadinessSnapshot({
  health,
  isBackendConnected,
  localCodexSession,
  runtime,
}: BuildStudioReadinessSnapshotArgs): StudioReadinessSnapshot {
  const sessionStatus = resolveLocalCodexSessionDetail(localCodexSession);
  const httpCoversCodex = Boolean(health?.checks.codexReady);
  const httpCoversOnboarding = Boolean(health?.checks.onboardingReady);
  const cliReady = Boolean(health?.codexRuntime?.canRunJobs);
  const sessionOk = sessionStatus.ok || httpCoversOnboarding;
  const sessionDetail = sessionStatus.ok
    ? sessionStatus.detail
    : httpCoversOnboarding
      ? 'ChatGPT Sign in is ready for HTTP jobs. Local Codex app-server is optional.'
      : sessionStatus.detail;
  const checks: StudioReadinessCheck[] = [
    {
      key: 'backend',
      label: 'Backend',
      ok: isBackendConnected,
      detail: isBackendConnected
        ? 'The local Studio backend is reachable.'
        : 'The Studio UI cannot reach the local backend right now.',
      blocking: true,
    },
    {
      key: 'library',
      label: 'Local Library',
      ok: Boolean(health?.checks.libraryReady),
      detail: health?.checks.libraryReady
        ? 'Library folders and write access look healthy.'
        : 'The Studio Library still needs folders or write access.',
      blocking: true,
    },
    {
      key: 'codexCli',
      label: 'Codex CLI',
      ok: cliReady || httpCoversCodex,
      detail: cliReady
        ? health?.codexCli.available
          ? health.codexCli.version || 'Codex CLI detected.'
          : 'Codex Product Runtime is ready.'
        : httpCoversCodex
          ? 'ChatGPT Sign in is ready for HTTP jobs. Codex CLI is optional for app-server jobs.'
          : health?.codexRuntime
            ? health.codexRuntime.recommendedAction
            : 'Install or restore the local Codex CLI.',
      blocking: true,
    },
    {
      key: 'appServer',
      label: 'codex app-server',
      ok: Boolean((health?.appServer.running && cliReady) || httpCoversOnboarding),
      detail:
        health?.appServer.running && cliReady
          ? health.appServer.wsUrl || 'The app-server websocket is live.'
          : httpCoversOnboarding
            ? 'ChatGPT Sign in is ready for HTTP jobs. Select app-server after completing its local setup.'
            : health?.codexRuntime && !cliReady
              ? health.codexRuntime.recommendedAction
              : 'The local app-server is not running yet.',
      blocking: true,
    },
    {
      key: 'localCodexSession',
      label: 'Local Codex Session',
      ok: sessionOk,
      detail: sessionDetail,
      blocking: true,
    },
  ];

  if (!isBackendConnected) {
    return {
      stage: 'offline',
      isReady: false,
      nextAction: 'retry',
      title: buildTitle('retry', runtime.label),
      description: buildDescription('retry', runtime.label),
      checks,
    };
  }

  if (!health || (!localCodexSession && !httpCoversOnboarding)) {
    return {
      stage: 'checking',
      isReady: false,
      nextAction: null,
      title: `${runtime.label} checking`,
      description:
        'Refreshing backend health, app-server diagnostics, and the Local Codex Session.',
      checks,
    };
  }

  const nextAction = resolveNextAction(health, localCodexSession, isBackendConnected);
  const isReady = checks.every((check) => !check.blocking || check.ok);

  return {
    stage: isReady ? 'ready' : 'action_required',
    isReady,
    nextAction,
    title: buildTitle(nextAction, runtime.label),
    description: buildDescription(nextAction, runtime.label),
    checks,
  };
}
