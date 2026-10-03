import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import type { RepositoryUpdateStatus } from '../../../packages/shared/src/repositoryUpdates';

const exec = promisify(execFile);
const repoRoot = resolve(import.meta.dirname, '../../..');
const busyMessage = 'Wait for active jobs and operations to finish before updating.';

interface RepositoryUpdateOptions {
  root?: string;
  restart?: () => void;
  isBusy: () => boolean;
  install?: () => Promise<void>;
}

export function createRepositoryUpdates({
  root = repoRoot,
  restart,
  isBusy,
  install = async () => {
    await exec(process.execPath, ['install', '--frozen-lockfile'], {
      cwd: root,
      windowsHide: true,
      timeout: 300_000,
      maxBuffer: 1024 * 1024,
    }).catch(() => {
      throw new Error(
        'Dependency installation failed. Retry the update, or run bun install --frozen-lockfile in the repository.',
      );
    });
  },
}: RepositoryUpdateOptions) {
  const state: RepositoryUpdateStatus = {
    instanceId: randomUUID(),
    phase: 'idle',
    checkedAt: null,
    currentCommit: null,
    latestCommit: null,
    behind: 0,
    canUpdate: false,
    canRestart: false,
    blocker: null,
    error: null,
  };
  let needsInstall = false;
  let pending: Promise<void> | null = null;

  async function git(args: string[], failure: string) {
    try {
      const { stdout } = await exec(
        'git',
        ['-c', 'core.hooksPath=', '-c', 'merge.autoStash=false', ...args],
        {
          cwd: root,
          windowsHide: true,
          timeout: 30_000,
          maxBuffer: 1024 * 1024,
          env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
        },
      );
      return stdout.trim();
    } catch {
      // Git diagnostics may contain remote URLs with credentials.
      throw new Error(failure);
    }
  }

  async function inspect(fetchRemote: boolean) {
    state.canUpdate = false;
    state.blocker = null;
    const top = await git(
      ['rev-parse', '--show-toplevel'],
      'Updates require a Git checkout with an origin remote.',
    );
    if (resolve(top) !== resolve(root))
      throw new Error('Updates require the Studio repository root.');
    state.currentCommit = await git(['rev-parse', 'HEAD'], 'Cannot read the installed commit.');
    if (fetchRemote) {
      state.latestCommit = null;
      state.behind = 0;
      await git(
        [
          'fetch',
          '--no-tags',
          '--no-recurse-submodules',
          'origin',
          '+refs/heads/main:refs/remotes/origin/main',
        ],
        'Cannot check origin/main. Check your connection and Git access, then try again.',
      );
      state.checkedAt = new Date().toISOString();
    }
    state.latestCommit = await git(
      ['rev-parse', 'refs/remotes/origin/main'],
      'The origin remote has no fetched main branch.',
    );
    const branch = await git(['branch', '--show-current'], 'Cannot read the current branch.');
    const dirty = await git(
      ['status', '--porcelain', '--untracked-files=normal'],
      'Cannot inspect local changes.',
    );
    const counts = await git(
      ['rev-list', '--left-right', '--count', `HEAD...${state.latestCommit}`],
      'Cannot compare commits with origin/main.',
    );
    const [ahead, behind] = counts.split(/\s+/).map(Number);
    state.behind = behind;
    state.blocker =
      branch !== 'main'
        ? 'Switch to main before updating.'
        : dirty
          ? 'Save or commit local changes and untracked files before updating.'
          : ahead > 0
            ? 'Local commits differ from origin/main. Reconcile them manually before updating.'
            : !restart
              ? 'Start Studio with bun run dev to enable updates and restart.'
              : null;
    state.canUpdate = !state.blocker && (behind > 0 || needsInstall);
  }

  function status(): RepositoryUpdateStatus {
    const locked = state.phase === 'updating' || state.phase === 'restarting';
    const busy = isBusy();
    return {
      ...state,
      blocker: state.blocker ?? (busy ? busyMessage : null),
      canRestart: !!restart && !locked && !pending && !needsInstall && !busy,
      canUpdate: state.canUpdate && !locked && !pending && !busy,
    };
  }

  async function check() {
    if (pending || state.phase === 'restarting' || needsInstall) return status();
    state.phase = 'checking';
    state.error = null;
    pending = inspect(true)
      .then(() => {
        state.phase = 'idle';
      })
      .catch((error: Error) => {
        state.phase = 'error';
        state.error = error.message;
        state.canUpdate = false;
      });
    try {
      await pending;
    } finally {
      pending = null;
    }
    return status();
  }

  function scheduleRestart() {
    state.phase = 'restarting';
    // Allow the accepted response to reach the browser before closing HTTP.
    setTimeout(() => restart?.(), 500);
  }

  function apply(expectedCommit: string) {
    if (pending || state.phase === 'restarting')
      throw new Error('An update operation is already running.');
    if (!restart) throw new Error('Start Studio with bun run dev to enable updates and restart.');
    if (isBusy()) throw new Error(busyMessage);
    if (!state.latestCommit || expectedCommit !== state.latestCommit)
      throw new Error('Check for updates again before updating.');
    state.phase = 'updating';
    state.error = null;
    pending = (async () => {
      if (needsInstall) {
        const head = await git(['rev-parse', 'HEAD'], 'Cannot read the installed commit.');
        if (head !== state.currentCommit || head !== expectedCommit)
          throw new Error(
            'The repository changed after the update. Restore the applied commit before retrying installation.',
          );
      } else {
        await inspect(true);
        if (state.latestCommit !== expectedCommit)
          throw new Error('New commits arrived. Check and review the update again.');
        if (state.blocker) throw new Error(state.blocker);
        if (isBusy()) throw new Error(busyMessage);
        if (!state.canUpdate) throw new Error('Studio is already up to date.');
        await git(
          ['merge', '--ff-only', '--no-edit', expectedCommit],
          'Update could not fast-forward safely. Local work was preserved; check the repository manually.',
        );
        needsInstall = true;
        state.currentCommit = expectedCommit;
        state.behind = 0;
      }
      await install();
      needsInstall = false;
      scheduleRestart();
    })()
      .catch((error: Error) => {
        state.phase = 'error';
        state.error = error.message;
        state.canUpdate = needsInstall;
      })
      .finally(() => {
        pending = null;
      });
    return status();
  }

  function restartNow() {
    if (!status().canRestart)
      throw new Error(
        'Restart is unavailable. Finish active jobs or retry the failed update first.',
      );
    scheduleRestart();
    return status();
  }

  return {
    status,
    check,
    apply,
    restart: restartNow,
    blocksMutations: () =>
      needsInstall || state.phase === 'updating' || state.phase === 'restarting',
  };
}

export type RepositoryUpdates = ReturnType<typeof createRepositoryUpdates>;
