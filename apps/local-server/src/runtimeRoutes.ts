import { Hono } from 'hono';
import {
  buildOnboardingProbe,
  onboardingFactsFromHealth,
  type AppServerEnsureReason,
  type CodexRuntimeDoctorReport,
  type GenerationProviderId,
  type StudioReadinessRefreshReason,
  type StudioReadinessRefreshRequest,
} from '../../../packages/shared/src';
import type { getSettings } from './config';
import { readCodexRuntimeDoctor } from './codexRuntimeDoctor';
import type { getAppServerDiagnostics } from './codex/processSupervisor';
import type { inspectLibrary } from './library';
import type { WorkerStatus } from './worker';
import type { StudioReadinessLifecycle } from './studioReadinessLifecycle';
import {
  applyOnboardingSetup,
  OnboardingSetupError,
  setupResultWithProbe,
} from './onboardingSetup';
import { applyOnboardingHostAction, OnboardingHostActionError } from './hostTerminal';
import { getSubscriptionAuthStore, isSubscriptionLoggedIn } from './auth/store';
import { readXaiApiKey } from './auth/tokens';
import {
  publishOnboardingActionFinished,
  publishOnboardingLog,
  publishOnboardingProbe,
  publishOnboardingStage,
  reportOnboardingProgress,
} from './onboardingEvents';

interface RuntimeRoutesDependencies {
  readSettings: () => ReturnType<typeof getSettings>;
  inspectLibrary: () => ReturnType<typeof inspectLibrary>;
  readCodexRuntimeDoctor?: () => CodexRuntimeDoctorReport;
  getCodexWsUrl: () => string;
  getEnvLocalPath: () => string;
  hasEnvLocalFile: () => boolean;
  ensureAppServer: (reason?: AppServerEnsureReason) => void;
  readAppServerDiagnostics: typeof getAppServerDiagnostics;
  isAppServerRunning: () => boolean;
  readWorkerStatus: () => WorkerStatus;
  readiness?: StudioReadinessLifecycle;
  applyOnboardingSetupFn?: typeof applyOnboardingSetup;
  applyOnboardingHostActionFn?: typeof applyOnboardingHostAction;
  readGrokOnboardingFacts?: () => { grokCliAvailable: boolean; grokLoggedIn: boolean };
  readSubscriptionFacts?: () => { codexSignedIn: boolean; grokSignedIn: boolean };
  readEditableSettings?: () => { defaultProviderId?: GenerationProviderId | null };
}

export function createCheckingRuntimeReport(): CodexRuntimeDoctorReport {
  return {
    status: 'blocked',
    canRunJobs: false,
    checkedAt: new Date(0).toISOString(),
    selectedExecutable: '',
    selectedCommand: '',
    selectedVersion: null,
    selectedVersionNumber: null,
    appServerSupported: false,
    recommendedAction: 'Codex Product Runtime readiness is still being checked.',
    issues: [],
    candidates: [],
  };
}

function redactRuntimeDoctor(report: CodexRuntimeDoctorReport): CodexRuntimeDoctorReport {
  return {
    ...report,
    selectedExecutable: report.selectedVersion ? 'codex' : '',
    selectedCommand: report.selectedVersion ? 'codex --version' : '',
    candidates: [],
  };
}

const readinessRefreshReasons: readonly StudioReadinessRefreshReason[] = [
  'startup',
  'passive',
  'manual',
  'onboarding',
  'session_verify',
  'app_server_change',
];
const forceableReadinessReasons: readonly StudioReadinessRefreshReason[] = [
  'manual',
  'session_verify',
  'app_server_change',
];

function readSubscriptionOnboardingFacts() {
  try {
    const store = getSubscriptionAuthStore();
    return {
      codexSignedIn: isSubscriptionLoggedIn(store.readProvider('codex')),
      grokSignedIn: isSubscriptionLoggedIn(store.readProvider('xai')) || Boolean(readXaiApiKey()),
    };
  } catch {
    return { codexSignedIn: false, grokSignedIn: false };
  }
}

function mergeGrokOnboardingFacts(
  grok: { grokCliAvailable: boolean; grokLoggedIn: boolean },
  grokSignedIn: boolean,
) {
  return {
    grokCliAvailable: grok.grokCliAvailable,
    grokLoggedIn: grok.grokLoggedIn || grokSignedIn,
  };
}

/**
 * Keep the local readiness endpoint passive by default. A forced Runtime
 * Doctor probe must be an explicit, named action from the caller.
 */
export function normalizeReadinessRefreshRequest(value: unknown): StudioReadinessRefreshRequest {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const requestedForce = input.force === true;
  const requestedReason = input.reason;
  const reason = readinessRefreshReasons.includes(requestedReason as StudioReadinessRefreshReason)
    ? (requestedReason as StudioReadinessRefreshReason)
    : requestedForce
      ? 'manual'
      : 'passive';

  return {
    reason,
    force: requestedForce && forceableReadinessReasons.includes(reason),
  };
}

export function createRuntimeRoutes({
  readSettings,
  inspectLibrary,
  readCodexRuntimeDoctor: readCodexRuntimeDoctorFn = readCodexRuntimeDoctor,
  getCodexWsUrl,
  getEnvLocalPath,
  hasEnvLocalFile,
  ensureAppServer,
  readAppServerDiagnostics,
  isAppServerRunning,
  readWorkerStatus,
  readiness,
  applyOnboardingSetupFn = applyOnboardingSetup,
  applyOnboardingHostActionFn = applyOnboardingHostAction,
  readGrokOnboardingFacts = () => ({ grokCliAvailable: false, grokLoggedIn: false }),
  readSubscriptionFacts = readSubscriptionOnboardingFacts,
  readEditableSettings,
}: RuntimeRoutesDependencies) {
  const routes = new Hono();

  const bunVersion =
    typeof globalThis === 'object' && 'Bun' in globalThis
      ? ((globalThis as { Bun?: { version?: string } }).Bun?.version ?? null)
      : null;

  const buildHealthResponse = () => {
    const settings = readSettings();
    const library = inspectLibrary();
    const readinessSnapshot = readiness?.readSnapshot();
    const fullCodexRuntime = readiness
      ? (readinessSnapshot?.codexRuntime ?? createCheckingRuntimeReport())
      : readCodexRuntimeDoctorFn();
    const codexRuntime = redactRuntimeDoctor(fullCodexRuntime);
    const codexAvailable = codexRuntime.selectedVersion !== null;
    const appServerDiagnostics = readAppServerDiagnostics();
    const libraryReady = library.exists && library.writable && library.missingFolders.length === 0;
    const appServerRunning = isAppServerRunning();
    const localCodexSession = readinessSnapshot?.localCodexSession ?? null;
    const subscription = readSubscriptionFacts();
    const cliReady =
      fullCodexRuntime.canRunJobs &&
      appServerRunning &&
      localCodexSession?.canRunLocalJobs === true;
    const selectedProviderId = readEditableSettings?.().defaultProviderId ?? 'chatgpt';

    return {
      ok: true,
      checkedAt: new Date().toISOString(),
      libraryDir: settings.libraryDir,
      runtime: {
        platform: process.platform,
        arch: process.arch,
        bunVersion,
        nodeVersion: process.versions.node,
        cwd: process.cwd(),
        envLocalPath: getEnvLocalPath(),
        envLocalPresent: hasEnvLocalFile(),
      },
      config: {
        serverPort: settings.serverPort,
        codexWsPort: settings.codexWsPort,
      },
      library: {
        exists: library.exists,
        writable: library.writable,
        readmePresent: library.readmePresent,
        missingFolders: library.missingFolders,
      },
      codexCli: {
        available: codexAvailable,
        version: codexRuntime.selectedVersion,
        command: codexRuntime.selectedCommand,
      },
      codexRuntime,
      appServer: {
        running: appServerRunning,
        wsUrl: getCodexWsUrl(),
        pid: appServerDiagnostics.pid,
        lastExitCode: appServerDiagnostics.lastExitCode,
        lastExitAt: appServerDiagnostics.lastExitAt,
        lastInvocation: appServerDiagnostics.lastInvocation?.join(' ') ?? null,
        lastStartAt: appServerDiagnostics.lastStartAt,
        lastStartError: appServerDiagnostics.lastStartError,
        lastEnsureAt: appServerDiagnostics.lastEnsureAt,
        lastEnsureReason: appServerDiagnostics.lastEnsureReason,
      },
      checks: {
        libraryReady,
        codexReady: fullCodexRuntime.canRunJobs || subscription.codexSignedIn,
        onboardingReady:
          libraryReady &&
          (selectedProviderId === 'codex'
            ? cliReady
            : selectedProviderId === 'chatgpt'
              ? subscription.codexSignedIn
              : true),
      },
      worker: readWorkerStatus(),
    };
  };

  const buildOnboardingResponse = (health: ReturnType<typeof buildHealthResponse>) => {
    const session = readiness?.readSnapshot()?.localCodexSession ?? null;
    const subscription = readSubscriptionFacts();
    const selectedProviderId = readEditableSettings?.().defaultProviderId ?? 'chatgpt';
    return buildOnboardingProbe(
      onboardingFactsFromHealth({
        bunVersion: health.runtime.bunVersion,
        codexCliAvailable: health.codexCli.available,
        chatgptLoggedIn: subscription.codexSignedIn,
        codexSubscriptionReady: subscription.codexSignedIn,
        selectedProviderId,
        localCodexSessionReady: session?.canRunLocalJobs === true,
        studioLibraryReady: health.checks.libraryReady,
        studioLibraryPath: health.libraryDir,
        bootstrapConfigReady: health.runtime.envLocalPresent,
        appServerReady: health.appServer.running,
        ...mergeGrokOnboardingFacts(readGrokOnboardingFacts(), subscription.grokSignedIn),
      }),
    );
  };

  routes.get('/health', (c) => c.json(buildHealthResponse()));

  const readPublicReadiness = () => {
    const snapshot = readiness?.readSnapshot();
    if (!snapshot?.codexRuntime) return snapshot ?? null;
    return { ...snapshot, codexRuntime: redactRuntimeDoctor(snapshot.codexRuntime) };
  };

  routes.get('/runtime/snapshot', (c) => {
    const health = buildHealthResponse();
    return c.json({
      health,
      readiness: readPublicReadiness(),
      onboarding: buildOnboardingResponse(health),
    });
  });

  routes.get('/onboarding/probe', (c) => c.json(buildOnboardingResponse(buildHealthResponse())));

  routes.post('/onboarding/setup', async (c) => {
    let body: unknown = {};
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    try {
      const result = applyOnboardingSetupFn(body, {
        report: (event) => reportOnboardingProgress('setup', event),
      });
      await readiness?.refresh({ reason: 'onboarding' });
      const probe = buildOnboardingResponse(buildHealthResponse());
      publishOnboardingActionFinished('setup', probe);
      return c.json(setupResultWithProbe(result, probe));
    } catch (error) {
      if (error instanceof OnboardingSetupError) {
        return c.json(error.body, error.status);
      }
      publishOnboardingStage('setup', 'failed', 'Setup failed.');
      publishOnboardingLog('Setup failed.', 'error');
      throw error;
    }
  });

  routes.post('/onboarding/host-action', async (c) => {
    let body: unknown = {};
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    try {
      const result = applyOnboardingHostActionFn(body, {
        report: (event) => reportOnboardingProgress('host_action', event),
      });
      const probe = buildOnboardingResponse(buildHealthResponse());
      if (result.ok) {
        publishOnboardingActionFinished('host_action', probe);
      } else {
        publishOnboardingStage('host_action', 'failed', result.error ?? 'Host action failed.');
        publishOnboardingLog(result.error ?? 'Host action failed.', 'error');
        publishOnboardingProbe(probe);
      }
      return c.json({ ...result, probe });
    } catch (error) {
      if (error instanceof OnboardingHostActionError) {
        return c.json(error.body, error.status);
      }
      publishOnboardingStage('host_action', 'failed', 'Host action failed.');
      publishOnboardingLog('Host action failed.', 'error');
      throw error;
    }
  });

  routes.get('/readiness', (c) => c.json(readPublicReadiness()));

  routes.post('/readiness/refresh', async (c) => {
    let body: unknown = null;
    try {
      body = await c.req.json();
    } catch {
      // Empty or malformed bodies intentionally use the passive default.
    }
    const request = normalizeReadinessRefreshRequest(body);
    return c.json(
      readiness
        ? await readiness.refresh(request).then(() => readPublicReadiness())
        : { codexRuntime: readCodexRuntimeDoctorFn() },
    );
  });

  routes.get('/runtime/doctor', async (c) => {
    if (!readiness) return c.json(readCodexRuntimeDoctorFn());
    const snapshot = await readiness.refresh({ reason: 'manual', force: true });
    return c.json(snapshot.codexRuntime ?? createCheckingRuntimeReport());
  });

  routes.post('/app-server/start', async (c) => {
    const codexRuntime = readiness
      ? ((await readiness.refresh({ reason: 'app_server_change', force: true })).codexRuntime ??
        createCheckingRuntimeReport())
      : readCodexRuntimeDoctorFn();
    if (!codexRuntime.canRunJobs) {
      const diagnostics = readAppServerDiagnostics();
      return c.json({
        running: false,
        wsUrl: getCodexWsUrl(),
        pid: diagnostics.pid,
        lastStartError: codexRuntime.recommendedAction,
        codexRuntime: redactRuntimeDoctor(codexRuntime),
      });
    }

    ensureAppServer('user');
    const diagnostics = readAppServerDiagnostics();
    return c.json({
      running: isAppServerRunning(),
      wsUrl: getCodexWsUrl(),
      pid: diagnostics.pid,
      lastStartError: diagnostics.lastStartError,
      codexRuntime: redactRuntimeDoctor(codexRuntime),
    });
  });

  routes.get('/bootstrap-config', (c) => c.json(readSettings()));

  return routes;
}
