import { stopDevProcesses, waitForFirstDevProcessExit } from './devProcessPolicy';
import { findAvailablePort } from './devPortFinder';
import { cleanupExistingDevProcesses } from './devProcessCleanup';

const defaultBackendPort = Number(process.env.STUDIO_SERVER_PORT) || 17223;
const defaultUiPort = 17222;

// Automatically clean up stale or orphaned processes from previous runs
const cleanedPids = await cleanupExistingDevProcesses({
  ports: [defaultUiPort, defaultBackendPort],
});

if (cleanedPids.length > 0) {
  console.log(
    `[dev] Closed ${cleanedPids.length} existing dev process(es) (PIDs: ${cleanedPids.join(', ')})`,
  );
}

const availableBackendPort = await findAvailablePort(defaultBackendPort);
const backendBaseUrl = `http://127.0.0.1:${availableBackendPort}`;

if (availableBackendPort !== defaultBackendPort) {
  console.log(
    `[dev] Port ${defaultBackendPort} in use; starting backend on available port ${availableBackendPort}`,
  );
}

const processes = [
  Bun.spawn(['bun', 'run', 'dev:server'], {
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
    env: {
      ...process.env,
      STUDIO_SERVER_PORT: String(availableBackendPort),
    },
  }),
  Bun.spawn(['bun', 'run', 'dev:ui'], {
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
    env: {
      ...process.env,
      VITE_STUDIO_API_BASE: backendBaseUrl,
    },
  }),
];

const stopOptions = {
  platform: process.platform,
  killProcessTree:
    process.platform === 'win32'
      ? (pid: number) =>
          Bun.spawnSync(['taskkill', '/PID', String(pid), '/T', '/F'], {
            stdout: 'ignore',
            stderr: 'ignore',
          }).exitCode === 0
      : undefined,
};

function shutdown() {
  stopDevProcesses(processes, stopOptions);
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

const firstExitCode = await waitForFirstDevProcessExit(processes, stopOptions);
process.exitCode = firstExitCode;
