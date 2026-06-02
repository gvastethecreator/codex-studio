import { spawnSync } from 'node:child_process';
import { Hono } from 'hono';
import type { AppServerEnsureReason } from '../../../packages/shared/src';
import type { getSettings } from './config';
import type { resolveCodexInvocation } from './codexExecutable';
import type { getAppServerDiagnostics } from './codex/processSupervisor';
import type { inspectLibrary } from './library';
import type { WorkerStatus } from './worker';

interface RuntimeRoutesDependencies {
  readSettings: () => ReturnType<typeof getSettings>;
  inspectLibrary: () => ReturnType<typeof inspectLibrary>;
  resolveCodexInvocation: typeof resolveCodexInvocation;
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
  resolveCodexInvocation,
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
    const [command, ...args] = resolveCodexInvocation(['--version']);
    const codex = spawnSync(command, args, { encoding: 'utf8' });
    const codexAvailable = codex.status === 0;
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
        version: codexAvailable ? codex.stdout.trim() : null,
        command: [command, ...args].join(' '),
      },
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
        codexReady: codexAvailable,
        onboardingReady: libraryReady && codexAvailable && appServerRunning,
      },
      worker: readWorkerStatus(),
    });
  });

  routes.post('/app-server/start', (c) => {
    ensureAppServer('user');
    const diagnostics = readAppServerDiagnostics();
    return c.json({
      running: isAppServerRunning(),
      wsUrl: getCodexWsUrl(),
      pid: diagnostics.pid,
      lastStartError: diagnostics.lastStartError,
    });
  });

  routes.get('/bootstrap-config', (c) => c.json(readSettings()));

  return routes;
}
