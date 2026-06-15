import {
  installShutdownHandlers,
  probeHttp,
  spawnManagedProcess,
  stopManagedProcesses,
  waitForFirstProcessExit,
  waitForHttp,
} from './electron-utils';

const apiBase = process.env.STUDIO_ELECTRON_API_BASE || 'http://127.0.0.1:17223';

const build = Bun.spawnSync(['bun', 'run', 'build:ui'], {
  stdout: 'inherit',
  stderr: 'inherit',
  stdin: 'inherit',
});

if (build.exitCode !== 0) {
  process.exit(build.exitCode ?? 1);
}

const processes = [] as ReturnType<typeof spawnManagedProcess>[];

if (await probeHttp(`${apiBase}/api/health`)) {
  console.log(`[preview:electron] Reusing existing local studio API at ${apiBase}`);
} else {
  processes.push(spawnManagedProcess('local-server', ['bun', 'run', 'dev:server']));
}

const shutdown = installShutdownHandlers(processes);

try {
  await waitForHttp(`${apiBase}/api/health`, 'local studio API');

  processes.push(
    spawnManagedProcess('electron', ['bun', 'x', 'electron', 'electron/main.cjs'], {
      NODE_ENV: 'production',
      STUDIO_ELECTRON_API_BASE: apiBase,
    }),
  );

  const result = await waitForFirstProcessExit(processes);
  shutdown();
  process.exit(typeof result.code === 'number' ? result.code : 0);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  stopManagedProcesses(processes);
  process.exit(1);
}
