import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { createSubscriptionAuthStore } from './store';

function makeStore() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'studio-oauth-'));
  const filePath = path.join(dir, 'studio-oauth.json');
  return {
    dir,
    filePath,
    store: createSubscriptionAuthStore({ resolveFilePath: () => filePath }),
  };
}

describe('subscription auth store', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes tokens to a library file and never through the public status shape', () => {
    const { dir, filePath, store } = makeStore();
    dirs.push(dir);
    store.writeProvider('codex', {
      status: 'logged_in',
      accessToken: 'access-secret',
      refreshToken: 'refresh-secret',
      expiresAt: '2026-09-01T00:00:00.000Z',
      accountLabel: 'user@example.com',
      chatgptAccountId: 'acct-1',
      lastError: null,
      updatedAt: '2026-09-01T00:00:00.000Z',
    });

    const saved = readFileSync(filePath, 'utf8');
    expect(saved).toContain('access-secret');
    expect(saved).toContain('refresh-secret');
    expect(store.readProvider('codex')).toMatchObject({
      status: 'logged_in',
      accountLabel: 'user@example.com',
    });
  });

  it('clears tokens on logout', () => {
    const { dir, store } = makeStore();
    dirs.push(dir);
    store.writeProvider('xai', {
      status: 'logged_in',
      accessToken: 'xai-access',
      refreshToken: 'xai-refresh',
      expiresAt: null,
      accountLabel: 'grok-user',
      chatgptAccountId: null,
      lastError: null,
      updatedAt: '2026-09-01T00:00:00.000Z',
    });
    store.clearProvider('xai');
    expect(store.readProvider('xai')).toMatchObject({
      status: 'logged_out',
      accessToken: null,
      refreshToken: null,
    });
    expect(store.generation('xai')).toBeGreaterThan(0);
  });

  it('uses a unique temp file per atomic write', () => {
    const { dir, store } = makeStore();
    dirs.push(dir);
    const generationsBefore = store.generation('codex');
    store.writeProvider('codex', {
      status: 'logged_in',
      accessToken: 'one',
      refreshToken: 'two',
      expiresAt: null,
      accountLabel: null,
      chatgptAccountId: null,
      lastError: null,
      updatedAt: '2026-09-01T00:00:00.000Z',
    });
    store.bumpGeneration('codex');
    expect(store.generation('codex')).toBe(generationsBefore + 1);
    expect(store.readProvider('codex').accessToken).toBe('one');
  });
});
