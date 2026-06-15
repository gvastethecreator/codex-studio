import {
  installShutdownHandlers,
  probeHttp,
  spawnManagedProcess,
  stopManagedProcesses,
  waitForFirstProcessExit,
  waitForHttp,
} from './electron-utils';

const rendererUrl = process.env.STUDIO_ELECTRON_RENDERER_URL || 'http://localhost:17222';
const apiBase = process.env.STUDIO_ELECTRON_API_BASE || 'http://127.0.0.1:17223';

const processes = [] as ReturnType<typeof spawnManagedProcess>[];

if (await probeHttp(`${apiBase}/api/health`)) {
  console.log(`[dev:electron] Reusing existing local studio API at ${apiBase}`);
} else {
  processes.push(spawnManagedProcess('local-server', ['bun', 'run', 'dev:server']));
}

if (await probeHttp(rendererUrl, { expectedText: 'Codex Studio' })) {
  console.log(`[dev:electron] Reusing existing renderer at ${rendererUrl}`);
} else {
  processes.push(spawnManagedProcess('renderer', ['bun', 'run', 'dev:ui']));
}

const shutdown = installShutdownHandlers(processes);

try {
  await waitForHttp(`${apiBase}/api/health`, 'local studio API');
  await waitForHttp(rendererUrl, 'renderer dev server');

  processes.push(
    spawnManagedProcess('electron', ['bun', 'x', 'electron', 'electron/main.cjs'], {
      NODE_ENV: 'development',
      STUDIO_ELECTRON_API_BASE: apiBase,
      STUDIO_ELECTRON_RENDERER_URL: rendererUrl,
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
