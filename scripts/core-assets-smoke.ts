#!/usr/bin/env bun
/** Build and boot the UI from a temporary checkout with every optional asset pack absent. */
import { cpSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createServer } from 'node:net';

const root = process.cwd();
const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'codex-studio-core-assets-'));
const expectedTempPrefix = normalize(path.join(os.tmpdir(), 'codex-studio-core-assets-'));
if (!normalize(tempRoot).startsWith(expectedTempPrefix)) {
  throw new Error(`Unexpected core asset smoke path: ${tempRoot}`);
}
const coreDefaults = new Set([
  'assets/recipes/styles/defaults/SP01-001.webp',
  'assets/recipes/styles/defaults/SP01-005.webp',
  'assets/recipes/styles/defaults/SP02-001.webp',
  'assets/recipes/styles/defaults/SP02-003.webp',
  'assets/recipes/styles/defaults/SP02-004.webp',
  'assets/recipes/styles/defaults/SP06-082.webp',
  'assets/recipes/styles/defaults/SP06-095.webp',
  'assets/recipes/styles/defaults/SP11-047.webp',
  'assets/recipes/styles/defaults/SP11-050.webp',
]);

function normalize(filePath: string) {
  return filePath.replaceAll('\\', '/');
}

function shouldCopy(source: string) {
  const relative = normalize(path.relative(root, source));
  if (!relative) return true;
  if (
    relative === '.git' ||
    relative.startsWith('.git/') ||
    relative === '.scratch' ||
    relative.startsWith('.scratch/') ||
    relative === 'dist' ||
    relative.startsWith('dist/') ||
    relative === 'node_modules' ||
    relative.startsWith('node_modules/')
  ) {
    return false;
  }
  if (relative.startsWith('assets/recipes/styles/category-bases/')) return false;
  if (relative.startsWith('assets/recipes/character-lab/sources/')) return false;
  if (relative.startsWith('assets/recipes/styles/defaults/')) {
    return coreDefaults.has(relative) || relative === 'assets/recipes/styles/defaults';
  }
  if (
    relative.startsWith('assets/recipes/character-lab/character-lab-') &&
    !relative.endsWith('-atlas.png')
  ) {
    return false;
  }
  return true;
}

async function findAvailablePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Could not reserve a preview port'));
        return;
      }
      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });
}

async function waitForPreview(url: string, child: ChildProcessWithoutNullStreams) {
  const deadline = Date.now() + 20_000;
  let lastError = 'preview did not respond';

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Preview exited early with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await Bun.sleep(100);
  }

  throw new Error(`Preview readiness timed out: ${lastError}`);
}

async function stopPreview(child: ChildProcessWithoutNullStreams) {
  if (child.exitCode !== null) return;
  if (process.platform === 'win32' && child.pid) {
    spawnSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
      encoding: 'utf8',
      windowsHide: true,
    });
    return;
  }
  child.kill('SIGTERM');
  await Promise.race([
    new Promise<void>((resolve) => child.once('exit', () => resolve())),
    Bun.sleep(2_000),
  ]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

async function runBrowserSmoke(tempDir: string, baseUrl: string) {
  const child = spawn(
    'node',
    [
      path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs'),
      path.join(tempDir, 'scripts', 'core-assets-browser-smoke.ts'),
      `--url=${baseUrl}`,
    ],
    {
      cwd: tempDir,
      env: process.env,
      windowsHide: true,
    },
  );
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += String(chunk);
  });
  child.stderr.on('data', (chunk) => {
    output += String(chunk);
  });

  const exitCode = await new Promise<number | null>((resolve, reject) => {
    const timeoutId = setTimeout(() => resolve(null), 120_000);
    child.once('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
    child.once('close', (code) => {
      clearTimeout(timeoutId);
      resolve(code);
    });
  });
  if (exitCode === null) {
    await stopPreview(child);
    throw new Error(`Core asset browser smoke timed out.\n${output}`);
  }
  if (exitCode !== 0) {
    throw new Error(`Core asset browser smoke failed with code ${exitCode}.\n${output}`);
  }

  const resultLine = output.split(/\r?\n/).findLast((line) => line.startsWith('{"ok":'));
  if (!resultLine) throw new Error(`Core asset browser smoke returned no result.\n${output}`);
  return JSON.parse(resultLine) as { routes: string[] };
}

let preview: ChildProcessWithoutNullStreams | null = null;
try {
  cpSync(root, tempRoot, { recursive: true, filter: shouldCopy });
  symlinkSync(
    path.join(root, 'node_modules'),
    path.join(tempRoot, 'node_modules'),
    process.platform === 'win32' ? 'junction' : 'dir',
  );

  const result = spawnSync(process.execPath, ['x', 'vp', 'build'], {
    cwd: tempRoot,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    process.exitCode = 1;
  } else {
    const port = await findAvailablePort();
    const baseUrl = `http://127.0.0.1:${port}`;
    preview = spawn(
      process.execPath,
      ['x', 'vp', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
      {
        cwd: tempRoot,
        env: process.env,
        windowsHide: true,
      },
    );
    let previewOutput = '';
    preview.stdout.on('data', (chunk) => {
      previewOutput += String(chunk);
    });
    preview.stderr.on('data', (chunk) => {
      previewOutput += String(chunk);
    });
    await waitForPreview(baseUrl, preview);
    let browserResult: { routes: string[] };
    try {
      browserResult = await runBrowserSmoke(tempRoot, baseUrl);
    } catch (error) {
      if (previewOutput.trim()) process.stderr.write(previewOutput);
      throw error;
    }
    console.log(
      JSON.stringify(
        {
          ok: true,
          optionalPacksPresent: false,
          build: 'vp build',
          browser: 'playwright chromium',
          routes: browserResult.routes,
          assetFailures: 0,
        },
        null,
        2,
      ),
    );
  }
} finally {
  if (preview) await stopPreview(preview);
  rmSync(tempRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
