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

function shutdown() {
  for (const child of processes) {
    child.kill();
  }
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

await Promise.race(processes.map((child) => child.exited));
shutdown();
