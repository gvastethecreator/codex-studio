import { spawn, type ChildProcess } from 'node:child_process';
import { parseListeningUrl, portableServerArgv, resolvePortableLibraryDir } from './portableLaunch';
import { resolveDefaultLibraryDir } from '../apps/local-server/src/config';
import { resolveUiDistDir, uiDistIsReady } from '../apps/local-server/src/uiStaticRoutes';

export interface PortableStartDependencies {
  env?: NodeJS.ProcessEnv;
  cwd?: string;
  spawnServer?: (argv: string[], options: { cwd: string; env: NodeJS.ProcessEnv }) => ChildProcess;
  openBrowser?: (url: string) => void;
  waitMs?: (ms: number) => Promise<void>;
  distReady?: (rootDir: string) => boolean;
  forwardOutput?: (chunk: string) => void;
  now?: () => number;
  listenDeadlineMs?: number;
}

function defaultOpenBrowser(url: string) {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
    return;
  }
  if (process.platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    return;
  }
  spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
}

function defaultSpawnServer(argv: string[], options: { cwd: string; env: NodeJS.ProcessEnv }) {
  return spawn(process.execPath, argv, {
    cwd: options.cwd,
    env: options.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

export async function runPortableStart(dependencies: PortableStartDependencies = {}) {
  const env = { ...(dependencies.env ?? process.env) };
  const cwd = dependencies.cwd ?? process.cwd();
  const portable = env.STUDIO_PORTABLE === '1';
  env.STUDIO_LIBRARY_DIR = resolvePortableLibraryDir({
    studioLibraryDir: env.STUDIO_LIBRARY_DIR,
    portable,
    unpackRoot: cwd,
    homeDefault: resolveDefaultLibraryDir(),
  });

  const distDir = resolveUiDistDir(env, cwd);
  const distReady = dependencies.distReady ?? uiDistIsReady;
  if (!distReady(distDir)) {
    throw new Error(
      'Build the UI first with `bun run build`. Portable start serves dist/ from one local-server process.',
    );
  }

  const child = (dependencies.spawnServer ?? defaultSpawnServer)(portableServerArgv(), {
    cwd,
    env,
  });

  let combined = '';
  const forward =
    dependencies.forwardOutput ??
    ((chunk: string) => {
      process.stdout.write(chunk);
    });
  child.stdout?.on('data', (chunk) => {
    const text = String(chunk);
    combined += text;
    forward(text);
  });
  child.stderr?.on('data', (chunk) => {
    const text = String(chunk);
    combined += text;
    forward(text);
  });

  const waitMs =
    dependencies.waitMs ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
  const now = dependencies.now ?? Date.now;
  const deadline = now() + (dependencies.listenDeadlineMs ?? 30_000);
  let url: string | null = null;
  while (now() < deadline) {
    url = parseListeningUrl(combined);
    if (url) break;
    if (child.exitCode !== null) {
      throw new Error('local-server exited before it started listening.');
    }
    await waitMs(100);
  }
  if (!url) {
    child.kill();
    throw new Error('local-server did not report a listening URL before the deadline.');
  }

  (dependencies.openBrowser ?? defaultOpenBrowser)(url);
  return { url, libraryDir: env.STUDIO_LIBRARY_DIR, child };
}

if (import.meta.main) {
  try {
    const started = await runPortableStart();
    await new Promise<void>((resolve) => {
      started.child.once('exit', () => resolve());
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
