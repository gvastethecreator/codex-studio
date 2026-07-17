import { stopDevProcesses, waitForFirstDevProcessExit } from './devProcessPolicy';

const processes = [
  Bun.spawn(['bun', 'run', 'dev:server'], {
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
  }),
  Bun.spawn(['bun', 'run', 'dev:ui'], {
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
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
