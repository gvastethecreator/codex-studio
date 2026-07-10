import { Hono } from 'hono';
import type { AppServerEnsureReason, CodexRuntimeDoctorReport } from '../../../packages/shared/src';
import type { getSettings } from './config';
import { readCodexRuntimeDoctor } from './codexRuntimeDoctor';
import type { getAppServerDiagnostics } from './codex/processSupervisor';
import type { inspectLibrary } from './library';
import type { WorkerStatus } from './worker';
import type { StudioReadinessLifecycle } from './studioReadinessLifecycle';

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
}: RuntimeRoutesDependencies) {
  const routes = new Hono();

  const bunVersion =
    typeof globalThis === 'object' && 'Bun' in globalThis
      ? ((globalThis as { Bun?: { version?: string } }).Bun?.version ?? null)
      : null;

  const buildHealthResponse = () => {
    const settings = readSettings();
    const library = inspectLibrary();
    const fullCodexRuntime = readiness
      ? (readiness.readSnapshot().codexRuntime ?? createCheckingRuntimeReport())
      : readCodexRuntimeDoctorFn();
    const codexRuntime = redactRuntimeDoctor(fullCodexRuntime);
    const codexAvailable = codexRuntime.selectedVersion !== null;
    const appServerDiagnostics = readAppServerDiagnostics();
    const libraryReady = library.exists && library.writable && library.missingFolders.length === 0;
    const appServerRunning = isAppServerRunning();

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
        codexReady: codexRuntime.canRunJobs,
        onboardingReady: libraryReady && codexRuntime.canRunJobs && appServerRunning,
      },
      worker: readWorkerStatus(),
    };
  };

  routes.get('/health', (c) => c.json(buildHealthResponse()));

  const readPublicReadiness = () => {
    const snapshot = readiness?.readSnapshot();
    if (!snapshot?.codexRuntime) return snapshot ?? null;
    return { ...snapshot, codexRuntime: redactRuntimeDoctor(snapshot.codexRuntime) };
  };

  routes.get('/runtime/snapshot', (c) =>
    c.json({
      health: buildHealthResponse(),
      readiness: readPublicReadiness(),
    }),
  );

  routes.get('/readiness', (c) => c.json(readPublicReadiness()));

  routes.post('/readiness/refresh', async (c) =>
    c.json(
      readiness
        ? await readiness
            .refresh({ reason: 'manual', force: true })
            .then(() => readPublicReadiness())
        : { codexRuntime: readCodexRuntimeDoctorFn() },
    ),
  );

  routes.get('/runtime/doctor', async (c) => {
    if (!readiness) return c.json(readCodexRuntimeDoctorFn());
    const snapshot = await readiness.refresh({ reason: 'manual', force: true });
    return c.json(snapshot.codexRuntime ?? createCheckingRuntimeReport());
  });

  routes.post('/app-server/start', async (c) => {
    const codexRuntime = readiness
      ? ((await readiness.refresh({ reason: 'manual' })).codexRuntime ??
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
