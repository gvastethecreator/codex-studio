#!/usr/bin/env bun
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'codex-studio-portability-'));
const libraryDir = path.join(temporaryRoot, 'library');
const reservation = Bun.serve({ port: 0, fetch: () => new Response('reserved') });
const serverPort = reservation.port;
await reservation.stop(true);
if (!serverPort) throw new Error('Unable to reserve a local port for the smoke test.');

const server = Bun.spawn(['bun', 'apps/local-server/src/index.ts'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    STUDIO_LIBRARY_DIR: libraryDir,
    STUDIO_SERVER_PORT: String(serverPort),
    STUDIO_CODEX_WS_PORT: String(serverPort + 1),
  },
  stderr: 'pipe',
  stdout: 'pipe',
});

const apiBase = `http://127.0.0.1:${serverPort}`;
let health: { ok?: boolean; libraryDir?: string } | null = null;
let lastError: unknown = null;

try {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Local server exited before health check (code ${server.exitCode}).`);
    }

    try {
      const response = await fetch(`${apiBase}/api/health`);
      if (response.ok) {
        health = (await response.json()) as { ok?: boolean; libraryDir?: string };
        if (health.ok) break;
      }
    } catch (error) {
      lastError = error;
    }

    await Bun.sleep(100);
  }

  if (!health?.ok) {
    throw new Error(
      `Local server did not become healthy within 30 seconds${lastError instanceof Error ? `: ${lastError.message}` : '.'}`,
    );
  }
  if (path.resolve(health.libraryDir ?? '') !== path.resolve(libraryDir)) {
    throw new Error('Health response did not use the isolated Studio Library.');
  }

  console.log(
    JSON.stringify({
      ok: true,
      platform: process.platform,
      healthPath: '/api/health',
      isolatedLibrary: true,
    }),
  );
} finally {
  if (process.platform === 'win32') {
    Bun.spawnSync(['taskkill', '/PID', String(server.pid), '/T', '/F'], {
      stderr: 'ignore',
      stdout: 'ignore',
    });
  } else {
    server.kill('SIGTERM');
  }
  await Promise.race([server.exited, Bun.sleep(10_000)]);
  if (server.exitCode === null) server.kill('SIGKILL');
  await Promise.race([server.exited, Bun.sleep(2_000)]);
  rmSync(temporaryRoot, { force: true, maxRetries: 5, recursive: true, retryDelay: 100 });
}
