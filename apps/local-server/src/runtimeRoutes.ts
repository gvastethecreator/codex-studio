import { Hono } from 'hono';
import type { AppServerEnsureReason, CodexRuntimeDoctorReport } from '../../../packages/shared/src';
import type { getSettings } from './config';
import { readCodexRuntimeDoctor } from './codexRuntimeDoctor';
import type { getAppServerDiagnostics } from './codex/processSupervisor';
import type { inspectLibrary } from './library';
import type { WorkerStatus } from './worker';

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
}: RuntimeRoutesDependencies) {
  const routes = new Hono();

  const bunVersion =
    typeof globalThis === 'object' && 'Bun' in globalThis
      ? ((globalThis as { Bun?: { version?: string } }).Bun?.version ?? null)
      : null;

  routes.get('/health', (c) => {
    const settings = readSettings();
    const library = inspectLibrary();
    const codexRuntime = readCodexRuntimeDoctorFn();
    const codexAvailable = codexRuntime.selectedVersion !== null;
    const appServerDiagnostics = readAppServerDiagnostics();
    const libraryReady = library.exists && library.writable && library.missingFolders.length === 0;
    const appServerRunning = isAppServerRunning();

    return c.json({
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
    });
  });

  routes.get('/runtime/doctor', (c) => c.json(readCodexRuntimeDoctorFn()));

  routes.post('/app-server/start', (c) => {
    const codexRuntime = readCodexRuntimeDoctorFn();
    if (!codexRuntime.canRunJobs) {
      const diagnostics = readAppServerDiagnostics();
      return c.json({
        running: false,
        wsUrl: getCodexWsUrl(),
        pid: diagnostics.pid,
        lastStartError: codexRuntime.recommendedAction,
        codexRuntime,
      });
    }

    ensureAppServer('user');
    const diagnostics = readAppServerDiagnostics();
    return c.json({
      running: isAppServerRunning(),
      wsUrl: getCodexWsUrl(),
      pid: diagnostics.pid,
      lastStartError: diagnostics.lastStartError,
      codexRuntime,
    });
  });

  routes.get('/bootstrap-config', (c) => c.json(readSettings()));

  return routes;
}
