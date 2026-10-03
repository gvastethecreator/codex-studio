import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import { createRepositoryUpdates } from './repositoryUpdates';
import { createRepositoryUpdateRoutes } from './repositoryUpdateRoutes';
import { createLocalApiSecurityMiddleware } from './localApiSecurity';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture() {
  const base = mkdtempSync(join(tmpdir(), 'studio-update-'));
  roots.push(base);
  const remote = join(base, 'remote');
  const root = join(base, 'studio');
  mkdirSync(remote);
  const git = (cwd: string, ...args: string[]) =>
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Studio Test',
        '-c',
        'user.email=studio@example.invalid',
        '-c',
        'commit.gpgsign=false',
        '-c',
        'core.hooksPath=',
        ...args,
      ],
      { cwd, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
    ).trim();
  git(remote, 'init', '-b', 'main');
  writeFileSync(join(remote, 'app.txt'), 'v1');
  git(remote, 'add', '.');
  git(remote, 'commit', '-m', 'initial');
  git(base, 'clone', remote, root);
  function advance() {
    writeFileSync(join(remote, 'app.txt'), 'v2');
    git(remote, 'add', '.');
    git(remote, 'commit', '-m', 'update');
    return git(remote, 'rev-parse', 'HEAD');
  }
  const install = vi.fn(async () => {});
  const restart = vi.fn();
  let busy = false;
  const updates = createRepositoryUpdates({ root, install, restart, isBusy: () => busy });
  return {
    root,
    remote,
    git,
    advance,
    install,
    restart,
    updates,
    setBusy: (value: boolean) => {
      busy = value;
    },
  };
}

describe('repository updates', () => {
  let f: ReturnType<typeof fixture>;
  beforeEach(() => {
    f = fixture();
  });
  it('checks origin/main without changing HEAD, then fast-forwards, installs and restarts once', async () => {
    const target = f.advance();
    expect(await f.updates.check()).toMatchObject({
      behind: 1,
      latestCommit: target,
      canUpdate: true,
    });
    expect(readFileSync(join(f.root, 'app.txt'), 'utf8')).toBe('v1');
    expect(f.updates.apply(target).phase).toBe('updating');
    expect(() => f.updates.apply(target)).toThrow('already running');
    await vi.waitFor(() => expect(f.restart).toHaveBeenCalledTimes(1), { timeout: 5000 });
    expect(f.git(f.root, 'rev-parse', 'HEAD')).toBe(target);
    expect(f.install).toHaveBeenCalledTimes(1);
  });

  it('rechecks local changes and active work when applying', async () => {
    const target = f.advance();
    f.setBusy(true);
    expect(await f.updates.check()).toMatchObject({
      canUpdate: false,
      blocker: expect.stringContaining('active jobs'),
    });
    expect(() => f.updates.apply(target)).toThrow('active jobs');
    expect(() => f.updates.restart()).toThrow('unavailable');
    f.setBusy(false);
    expect(f.updates.status()).toMatchObject({ canUpdate: true, blocker: null });
    writeFileSync(join(f.root, 'app.txt'), 'my changes');
    f.updates.apply(target);
    await vi.waitFor(() => expect(f.updates.status().phase).toBe('error'), { timeout: 5000 });
    expect(f.updates.status().error).toContain('local changes');
    expect(readFileSync(join(f.root, 'app.txt'), 'utf8')).toBe('my changes');
    expect(f.install).not.toHaveBeenCalled();
    expect(f.restart).not.toHaveBeenCalled();
  });

  it('blocks other branches, untracked files and diverged local commits', async () => {
    f.advance();
    writeFileSync(join(f.root, 'notes.txt'), 'unique');
    expect(await f.updates.check()).toMatchObject({
      canUpdate: false,
      blocker: expect.stringContaining('untracked'),
    });
    f.git(f.root, 'add', '.');
    f.git(f.root, 'commit', '-m', 'local');
    expect(await f.updates.check()).toMatchObject({
      canUpdate: false,
      blocker: expect.stringContaining('Local commits'),
    });
    f.git(f.root, 'checkout', '-b', 'feature');
    expect(await f.updates.check()).toMatchObject({
      canUpdate: false,
      blocker: expect.stringContaining('Switch to main'),
    });
    expect(readFileSync(join(f.root, 'notes.txt'), 'utf8')).toBe('unique');
  });

  it('keeps the server alive and permits retry if dependency installation fails after the merge', async () => {
    const target = f.advance();
    await f.updates.check();
    f.install.mockRejectedValueOnce(new Error('install failed'));
    f.updates.apply(target);
    await vi.waitFor(
      () =>
        expect(f.updates.status()).toMatchObject({
          phase: 'error',
          canUpdate: true,
          canRestart: false,
        }),
      { timeout: 5000 },
    );
    expect(f.restart).not.toHaveBeenCalled();
    expect(f.updates.blocksMutations()).toBe(true);
    expect(await f.updates.check()).toMatchObject({
      phase: 'error',
      error: 'install failed',
      canUpdate: true,
    });
    // Installation retries use the applied commit, even when Git goes offline.
    f.git(f.root, 'remote', 'set-url', 'origin', join(f.root, 'missing-remote'));
    f.updates.apply(target);
    await vi.waitFor(() => expect(f.restart).toHaveBeenCalledTimes(1), { timeout: 5000 });
    expect(f.install).toHaveBeenCalledTimes(2);
  });

  it('rejects stale targets and reports remote failures without exposing Git credentials', async () => {
    const old = f.git(f.root, 'rev-parse', 'HEAD');
    await f.updates.check();
    const target = f.advance();
    f.updates.apply(old);
    await vi.waitFor(() => expect(f.updates.status().error).toContain('New commits arrived'), {
      timeout: 5000,
    });
    expect(f.git(f.root, 'rev-parse', 'HEAD')).toBe(old);
    expect(f.updates.status().latestCommit).toBe(target);
    f.git(f.root, 'remote', 'set-url', 'origin', join(f.root, 'secret-token-missing-remote'));
    const status = await f.updates.check();
    expect(status).toMatchObject({ phase: 'error', canUpdate: false, latestCommit: null });
    expect(status.error).not.toContain('secret-token');
  });

  it('requires a managed launcher and protects mutation routes from foreign origins and simple form posts', async () => {
    f.advance();
    const unmanaged = createRepositoryUpdates({
      root: f.root,
      isBusy: () => false,
      install: f.install,
    });
    expect(await unmanaged.check()).toMatchObject({
      canUpdate: false,
      canRestart: false,
      blocker: expect.stringContaining('bun run dev'),
    });
    const app = new Hono();
    app.use('*', createLocalApiSecurityMiddleware());
    app.route('/api/updates', createRepositoryUpdateRoutes(unmanaged));
    expect(
      (
        await app.request('/api/updates/restart', {
          method: 'POST',
          headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
          body: '{}',
        })
      ).status,
    ).toBe(403);
    expect((await app.request('/api/updates/restart', { method: 'POST', body: '' })).status).toBe(
      415,
    );
    expect(
      (
        await app.request('/api/updates/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{"commit":"--evil"}',
        })
      ).status,
    ).toBe(400);
  });
});
