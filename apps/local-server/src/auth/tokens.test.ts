import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { createSubscriptionAuthStore } from './store';
import {
  getUsableAccessToken,
  isCodexHttpCredentialReady,
  isGrokHttpCredentialReady,
} from './tokens';

describe('subscription tokens', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  function makeStore() {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'studio-oauth-tokens-'));
    dirs.push(dir);
    return createSubscriptionAuthStore({
      resolveFilePath: () => path.join(dir, 'studio-oauth.json'),
    });
  }

  it('does not treat a logged_in record without an access token as HTTP-ready', () => {
    const store = makeStore();
    store.writeProvider('codex', {
      status: 'logged_in',
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      accountLabel: 'user@example.com',
      chatgptAccountId: null,
      lastError: null,
      updatedAt: '2026-09-01T00:00:00.000Z',
    });
    expect(isCodexHttpCredentialReady(store)).toBe(false);
    expect(isGrokHttpCredentialReady(store, {})).toBe(false);
  });

  it('uses XAI_API_KEY without reading the token file', async () => {
    const store = makeStore();
    await expect(
      getUsableAccessToken('xai', { store, env: { XAI_API_KEY: 'xai-secret' } }),
    ).resolves.toBe('xai-secret');
    expect(isGrokHttpCredentialReady(store, { XAI_API_KEY: 'xai-secret' })).toBe(true);
  });

  it('refreshes an expired Codex token and refuses invalid_grant without fallback', async () => {
    const store = makeStore();
    store.writeProvider('codex', {
      status: 'logged_in',
      accessToken: 'stale-access',
      refreshToken: 'refresh-secret',
      expiresAt: '2020-01-01T00:00:00.000Z',
      accountLabel: 'user@example.com',
      chatgptAccountId: null,
      lastError: null,
      updatedAt: '2020-01-01T00:00:00.000Z',
    });
    const calls: string[] = [];
    const fetchMock = async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      calls.push(url);
      return new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 400 });
    };
    await expect(
      getUsableAccessToken('codex', {
        store,
        fetch: fetchMock as typeof fetch,
        now: () => Date.now(),
      }),
    ).rejects.toMatchObject({ code: 'invalid_grant', fallbackAllowed: false });
    expect(calls).toHaveLength(1);
    expect(store.readProvider('codex')).toMatchObject({
      status: 'refresh_failed',
      accessToken: null,
      refreshToken: null,
    });
  });

  it('does not treat a generic xAI 400 as invalid_grant', async () => {
    const store = makeStore();
    store.writeProvider('xai', {
      status: 'logged_in',
      accessToken: 'stale-access',
      refreshToken: 'xai-refresh',
      expiresAt: '2020-01-01T00:00:00.000Z',
      accountLabel: 'grok-user',
      chatgptAccountId: null,
      lastError: null,
      updatedAt: '2020-01-01T00:00:00.000Z',
    });
    await expect(
      getUsableAccessToken('xai', {
        store,
        env: {},
        fetch: (async (_input: RequestInfo | URL) =>
          new Response(JSON.stringify({ error: 'invalid_request' }), {
            status: 400,
          })) as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'refresh_failed', fallbackAllowed: false });
    expect(store.readProvider('xai')).toMatchObject({
      status: 'refresh_failed',
      refreshToken: 'xai-refresh',
    });
  });

  it('does not write a refresh after logout', async () => {
    const store = makeStore();
    store.writeProvider('codex', {
      status: 'logged_in',
      accessToken: 'stale-access',
      refreshToken: 'refresh-secret',
      expiresAt: '2020-01-01T00:00:00.000Z',
      accountLabel: 'user@example.com',
      chatgptAccountId: null,
      lastError: null,
      updatedAt: '2020-01-01T00:00:00.000Z',
    });
    let finishRefresh: ((value: Response) => void) | undefined;
    const fetchMock = async (_input: RequestInfo | URL) =>
      new Promise<Response>((resolve) => {
        finishRefresh = resolve;
      });
    const pending = getUsableAccessToken('codex', {
      store,
      fetch: fetchMock as typeof fetch,
    });
    store.clearProvider('codex');
    finishRefresh?.(
      new Response(
        JSON.stringify({
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          expires_in: 3600,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    await expect(pending).rejects.toMatchObject({ code: 'not_signed_in' });
    expect(store.readProvider('codex').accessToken).toBeNull();
  });
});
