#!/usr/bin/env bun
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import assert from 'node:assert/strict';
import type { Job, JobDetailResponse } from '../packages/shared/src';
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
let dryRun: { jobId: string; catalogCount: number; assetBytes: number } | null = null;

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

  if (process.argv.includes('--dry-run')) {
    console.log('[portability] Isolated health passed; submitting one dry_run.');
    const accepted = await fetch(`${apiBase}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'dry_run',
        workspaceId: 'default',
        prompt: 'Isolated workflow verification',
      }),
      signal: AbortSignal.timeout(30_000),
    });
    assert.equal(accepted.ok, true, `Dry run intake returned ${accepted.status}.`);
    const job = (await accepted.json()) as Job;
    console.log('[portability] Dry run accepted; waiting for finalization.');
    let detail: JobDetailResponse | null = null;
    const dryRunDeadline = Date.now() + 30_000;
    while (Date.now() < dryRunDeadline) {
      const response = await fetch(`${apiBase}/api/jobs/${job.id}`, {
        signal: AbortSignal.timeout(5_000),
      });
      assert.equal(response.ok, true);
      detail = (await response.json()) as JobDetailResponse;
      if (!['queued', 'running'].includes(detail.job.status)) break;
      await Bun.sleep(100);
    }
    assert.equal(detail?.job.status, 'completed', 'Dry run must complete through the real worker.');
    assert.equal(detail?.job.providerId, 'dry_run');
    assert.equal(detail?.catalogImages.length, 1);
    const asset = detail!.catalogImages[0];
    const relativeAsset = path.relative(libraryDir, path.resolve(asset.filePath));
    assert.ok(relativeAsset && !relativeAsset.startsWith('..') && !path.isAbsolute(relativeAsset));
    const bytes = readFileSync(asset.filePath);
    assert.ok(bytes.toString('utf8').includes('Isolated workflow verification'));
    assert.ok(detail!.events.some((event) => event.type === 'dry_run.completed'));
    dryRun = {
      jobId: job.id,
      catalogCount: detail!.catalogImages.length,
      assetBytes: bytes.length,
    };
  }

  console.log(
    JSON.stringify({
      ok: true,
      platform: process.platform,
      healthPath: '/api/health',
      isolatedLibrary: true,
      dryRun,
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
  const relativeRoot = path.relative(tmpdir(), path.resolve(temporaryRoot));
  assert.ok(
    relativeRoot.startsWith('codex-studio-portability-') && !relativeRoot.includes(path.sep),
  );
  rmSync(temporaryRoot, { force: true, maxRetries: 5, recursive: true, retryDelay: 100 });
}
