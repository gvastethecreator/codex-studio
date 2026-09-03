import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { createSubscriptionAuthStore } from './store';
import {
  getUsableAccessToken,
  isCodexHttpCredentialReady,
  isGoogleHttpCredentialReady,
  isGoogleOAuthCredentialReady,
  isGrokHttpCredentialReady,
  tokensFromOAuthPayload,
} from './tokens';

function formBody(value: BodyInit | null | undefined) {
  if (typeof value !== 'string') throw new Error('Expected a form body.');
  return new URLSearchParams(value);
}

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

  it('refreshes Google OAuth with the configured desktop client', async () => {
    const store = makeStore();
    store.writeProvider('google', {
      status: 'logged_in',
      accessToken: 'stale-google-access',
      refreshToken: 'google-refresh',
      expiresAt: '2020-01-01T00:00:00.000Z',
      accountLabel: 'user@example.com',
      chatgptAccountId: null,
      lastError: null,
      updatedAt: '2020-01-01T00:00:00.000Z',
    });
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    await expect(
      getUsableAccessToken('google', {
        store,
        env: {
          GOOGLE_OAUTH_CLIENT_ID: 'studio.apps.googleusercontent.com',
          GOOGLE_CLOUD_PROJECT_ID: 'studio-project',
          GOOGLE_OAUTH_TOKEN_URL: 'http://127.0.0.1:4567/token',
        },
        fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
          const url =
            typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
          calls.push({ url, init });
          return new Response(
            JSON.stringify({ access_token: 'fresh-google-access', expires_in: 3600 }),
          );
        }) as typeof fetch,
      }),
    ).resolves.toBe('fresh-google-access');

    expect(calls[0]?.url).toBe('http://127.0.0.1:4567/token');
    const body = formBody(calls[0]?.init?.body);
    expect(body.get('client_id')).toBe('studio.apps.googleusercontent.com');
    expect(body.get('refresh_token')).toBe('google-refresh');
    expect(store.readProvider('google').refreshToken).toBe('google-refresh');
    expect(
      isGoogleOAuthCredentialReady(store, {
        GOOGLE_OAUTH_CLIENT_ID: 'studio.apps.googleusercontent.com',
        GOOGLE_CLOUD_PROJECT_ID: 'studio-project',
      }),
    ).toBe(true);
  });

  it('accepts a Google API key without treating OAuth as connected', () => {
    const store = makeStore();
    expect(isGoogleHttpCredentialReady(store, { GOOGLE_API_KEY: 'google-secret' })).toBe(true);
    expect(isGoogleOAuthCredentialReady(store, { GOOGLE_API_KEY: 'google-secret' })).toBe(false);
  });

  it('rejects OAuth token responses that require a non-Bearer authorization scheme', () => {
    expect(() =>
      tokensFromOAuthPayload(
        { access_token: 'access-secret', token_type: 'MAC' },
        { refreshToken: null, accountLabel: null, chatgptAccountId: null },
        Date.parse('2026-09-01T00:00:00.000Z'),
      ),
    ).toThrow('unsupported token type');
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

  it('preserves credentials when a successful refresh response is malformed', async () => {
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

    await expect(
      getUsableAccessToken('codex', {
        store,
        fetch: (async (_input: RequestInfo | URL) =>
          new Response('{}', { status: 200 })) as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'refresh_failed', fallbackAllowed: true });
    expect(store.readProvider('codex')).toMatchObject({
      status: 'refresh_failed',
      accessToken: 'stale-access',
      refreshToken: 'refresh-secret',
    });
  });

  it('clears xAI credentials when a forbidden refresh reports invalid_grant', async () => {
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
          new Response(JSON.stringify({ error: 'invalid_grant' }), {
            status: 403,
          })) as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'invalid_grant', fallbackAllowed: false });
    expect(store.readProvider('xai')).toMatchObject({
      status: 'refresh_failed',
      accessToken: null,
      refreshToken: null,
    });
  });

  it('does not refresh a valid xAI token more than five minutes early', async () => {
    const store = makeStore();
    const now = Date.parse('2026-09-01T00:00:00.000Z');
    store.writeProvider('xai', {
      status: 'logged_in',
      accessToken: 'current-access',
      refreshToken: 'xai-refresh',
      expiresAt: new Date(now + 10 * 60_000).toISOString(),
      accountLabel: 'grok-user',
      chatgptAccountId: null,
      lastError: null,
      updatedAt: new Date(now).toISOString(),
    });

    await expect(
      getUsableAccessToken('xai', {
        store,
        env: {},
        now: () => now,
        fetch: (async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
          throw new Error('refresh should not run');
        }) as typeof fetch,
      }),
    ).resolves.toBe('current-access');
  });

  it('allows CLI fallback when refresh transport or provider availability fails', async () => {
    for (const failure of [
      () => Promise.reject(new TypeError('fetch failed')),
      () => Promise.resolve(new Response('unavailable', { status: 503 })),
    ]) {
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

      await expect(
        getUsableAccessToken('codex', {
          store,
          fetch: failure as unknown as typeof fetch,
        }),
      ).rejects.toMatchObject({ fallbackAllowed: true });
      expect(store.readProvider('codex').status).toBe('refresh_failed');
    }
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
    const revoked: string[] = [];
    const pending = getUsableAccessToken('codex', {
      store,
      fetch: fetchMock as typeof fetch,
      revokeToken: async (_providerId, record) => {
        revoked.push(record.refreshToken ?? record.accessToken ?? '');
        return 'revoked';
      },
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
    expect(revoked).toEqual(['new-refresh']);
  });

  it('does not share an in-flight refresh between different credential stores', async () => {
    const firstStore = makeStore();
    const secondStore = makeStore();
    for (const [store, refreshToken] of [
      [firstStore, 'refresh-one'],
      [secondStore, 'refresh-two'],
    ] as const) {
      store.writeProvider('codex', {
        status: 'logged_in',
        accessToken: 'expired',
        refreshToken,
        expiresAt: '2020-01-01T00:00:00.000Z',
        accountLabel: null,
        chatgptAccountId: null,
        lastError: null,
        updatedAt: '2020-01-01T00:00:00.000Z',
      });
    }
    const refresh = (accessToken: string) =>
      (async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.redirect).toBe('error');
        return new Response(
          JSON.stringify({ access_token: accessToken, refresh_token: `${accessToken}-refresh` }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }) as typeof fetch;

    await expect(
      Promise.all([
        getUsableAccessToken('codex', { store: firstStore, fetch: refresh('access-one') }),
        getUsableAccessToken('codex', { store: secondStore, fetch: refresh('access-two') }),
      ]),
    ).resolves.toEqual(['access-one', 'access-two']);
  });
});
