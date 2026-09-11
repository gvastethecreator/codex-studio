import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Hono } from 'hono';
import { afterEach, describe, expect, it } from 'vitest';

import { createSubscriptionAuthRoutes } from './authRoutes';
import { createSubscriptionAuthController } from './controller';
import { createSubscriptionAuthStore } from './store';
import {
  CODEX_DEVICE_TOKEN_URL,
  CODEX_DEVICE_USERCODE_URL,
  CODEX_OAUTH_REVOKE_URL,
  CODEX_OAUTH_TOKEN_URL,
  XAI_OAUTH_REVOKE_URL,
} from './constants';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function requestUrl(input: RequestInfo | URL) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

describe('subscription auth routes', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it('starts ChatGPT device-code login, polls to tokens, and never returns secrets', async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'studio-oauth-routes-'));
    dirs.push(dir);
    const store = createSubscriptionAuthStore({
      resolveFilePath: () => path.join(dir, 'studio-oauth.json'),
    });
    const calls: string[] = [];
    const fetchMock = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      calls.push(`${init?.method ?? 'GET'} ${url}`);
      if (url === CODEX_DEVICE_USERCODE_URL) {
        return jsonResponse({ user_code: 'ABCD-1234', device_auth_id: 'device-1', interval: 1 });
      }
      if (url === CODEX_DEVICE_TOKEN_URL) {
        return jsonResponse({ authorization_code: 'auth-code', code_verifier: 'verifier' });
      }
      if (url === CODEX_OAUTH_TOKEN_URL) {
        return jsonResponse({
          access_token: 'access-secret',
          refresh_token: 'refresh-secret',
          expires_in: 3600,
        });
      }
      return jsonResponse({ error: 'unexpected' }, 500);
    };
    const published: unknown[] = [];
    const controller = createSubscriptionAuthController({
      store,
      fetch: fetchMock as typeof fetch,
      now: () => Date.parse('2026-09-01T00:00:00.000Z'),
      sleep: async () => undefined,
      ensureCredentialStoreWritable: () => undefined,
      publish: (_type, payload) => published.push(payload),
    });
    const app = new Hono().route('/api/auth', createSubscriptionAuthRoutes(controller));

    const started = await app.request('/api/auth/codex/start', { method: 'POST' });
    const startBody = await started.json();
    expect(started.status).toBe(200);
    expect(started.headers.get('cache-control')).toBe('no-store');
    expect(startBody).toMatchObject({
      providerId: 'codex',
      status: 'pending',
      userCode: 'ABCD-1234',
    });
    expect(JSON.stringify(startBody)).not.toContain('access-secret');
    expect(JSON.stringify(startBody)).not.toContain('refresh-secret');

    await new Promise((resolve) => setTimeout(resolve, 20));
    const status = await app.request('/api/auth/codex');
    const statusBody = await status.json();
    expect(statusBody).toMatchObject({ providerId: 'codex', status: 'logged_in' });
    expect(JSON.stringify(statusBody)).not.toContain('access-secret');
    expect(JSON.stringify(statusBody)).not.toContain('refresh-secret');
    expect(JSON.stringify(published)).not.toContain('access-secret');
    expect(store.readProvider('codex').accessToken).toBe('access-secret');
    expect(calls.some((call) => call.includes(CODEX_OAUTH_TOKEN_URL))).toBe(true);
  });

  it('starts Google browser authorization without a device code', async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'studio-oauth-routes-'));
    dirs.push(dir);
    const store = createSubscriptionAuthStore({
      resolveFilePath: () => path.join(dir, 'studio-oauth.json'),
    });
    const controller = createSubscriptionAuthController({
      store,
      ensureCredentialStoreWritable: () => undefined,
      publish: () => undefined,
      startGoogle: async () => ({
        providerId: 'google',
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?state=safe',
        expiresAt: '2026-09-02T00:15:00.000Z',
        poll: async () => ({
          status: 'logged_in',
          accessToken: 'google-access-secret',
          refreshToken: 'google-refresh-secret',
          expiresAt: '2026-09-02T01:00:00.000Z',
          accountLabel: 'user@example.com',
          chatgptAccountId: null,
          lastError: null,
          updatedAt: '2026-09-02T00:00:00.000Z',
        }),
      }),
    });
    const app = new Hono().route('/api/auth', createSubscriptionAuthRoutes(controller));

    const response = await app.request('/api/auth/google/start', { method: 'POST' });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      providerId: 'google',
      status: 'pending',
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?state=safe',
      verificationUrl: null,
      userCode: null,
    });
    expect(JSON.stringify(body)).not.toContain('google-access-secret');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(await (await app.request('/api/auth/google')).json()).toMatchObject({
      status: 'logged_in',
      accountLabel: 'user@example.com',
    });
  });

  it('rejects start when the private credential store is not writable', async () => {
    const controller = createSubscriptionAuthController({
      ensureCredentialStoreWritable: () => {
        throw new Error('read only');
      },
    });
    const app = new Hono().route('/api/auth', createSubscriptionAuthRoutes(controller));
    const response = await app.request('/api/auth/xai/start', { method: 'POST' });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'credential_store_not_writable' });
  });

  it('does not report logged_in when the stored access token is missing', async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'studio-oauth-routes-'));
    dirs.push(dir);
    const store = createSubscriptionAuthStore({
      resolveFilePath: () => path.join(dir, 'studio-oauth.json'),
    });
    store.writeProvider('codex', {
      status: 'logged_in',
      accessToken: null,
      refreshToken: 'refresh-secret',
      expiresAt: null,
      accountLabel: 'user@example.com',
      chatgptAccountId: null,
      lastError: null,
      updatedAt: '2026-09-01T00:00:00.000Z',
    });
    const controller = createSubscriptionAuthController({
      store,
      ensureCredentialStoreWritable: () => undefined,
    });
    const app = new Hono().route('/api/auth', createSubscriptionAuthRoutes(controller));
    const response = await app.request('/api/auth/codex');
    const body = await response.json();
    expect(body).toMatchObject({
      providerId: 'codex',
      status: 'logged_out',
    });
    expect(JSON.stringify(body)).not.toContain('refresh-secret');
  });

  it('rejects a second Sign in while already logged in', async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'studio-oauth-routes-'));
    dirs.push(dir);
    const store = createSubscriptionAuthStore({
      resolveFilePath: () => path.join(dir, 'studio-oauth.json'),
    });
    store.writeProvider('codex', {
      status: 'logged_in',
      accessToken: 'access-secret',
      refreshToken: 'refresh-secret',
      expiresAt: '2026-09-02T00:00:00.000Z',
      accountLabel: 'user@example.com',
      chatgptAccountId: null,
      lastError: null,
      updatedAt: '2026-09-01T00:00:00.000Z',
    });
    const app = new Hono().route(
      '/api/auth',
      createSubscriptionAuthRoutes(
        createSubscriptionAuthController({
          store,
          ensureCredentialStoreWritable: () => undefined,
        }),
      ),
    );
    const response = await app.request('/api/auth/codex/start', { method: 'POST' });
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: 'already_signed_in' });
  });

  it('does not write tokens after cancel', async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'studio-oauth-routes-'));
    dirs.push(dir);
    const store = createSubscriptionAuthStore({
      resolveFilePath: () => path.join(dir, 'studio-oauth.json'),
    });
    let releaseToken: (() => void) | undefined;
    let revoked = false;
    const tokenGate = new Promise<void>((resolve) => {
      releaseToken = resolve;
    });
    const fetchMock = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      if (url === CODEX_DEVICE_USERCODE_URL) {
        return jsonResponse({ user_code: 'ABCD-1234', device_auth_id: 'device-1', interval: 1 });
      }
      if (url === CODEX_DEVICE_TOKEN_URL) {
        return jsonResponse({ authorization_code: 'auth-code', code_verifier: 'verifier' });
      }
      if (url === CODEX_OAUTH_TOKEN_URL) {
        await tokenGate;
        return jsonResponse({
          access_token: 'access-secret',
          refresh_token: 'refresh-secret',
          expires_in: 3600,
        });
      }
      if (url === CODEX_OAUTH_REVOKE_URL) {
        revoked = true;
        return new Response(null, { status: 200 });
      }
      return jsonResponse({ error: 'unexpected' }, 500);
    };
    const app = new Hono().route(
      '/api/auth',
      createSubscriptionAuthRoutes(
        createSubscriptionAuthController({
          store,
          fetch: fetchMock as typeof fetch,
          now: () => Date.parse('2026-09-01T00:00:00.000Z'),
          sleep: async () => undefined,
          ensureCredentialStoreWritable: () => undefined,
        }),
      ),
    );

    const started = await app.request('/api/auth/codex/start', { method: 'POST' });
    expect(started.status).toBe(200);
    const cancelled = await app.request('/api/auth/codex/cancel', { method: 'POST' });
    expect(cancelled.status).toBe(200);
    releaseToken?.();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(store.readProvider('codex').accessToken).toBeNull();
    expect(revoked).toBe(true);
    const status = await app.request('/api/auth/codex');
    expect(await status.json()).toMatchObject({ status: 'logged_out' });
  });

  it('revokes newly issued tokens when credential persistence fails', async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'studio-oauth-routes-'));
    dirs.push(dir);
    const backingStore = createSubscriptionAuthStore({
      resolveFilePath: () => path.join(dir, 'studio-oauth.json'),
    });
    const store = {
      ...backingStore,
      writeProvider(
        providerId: Parameters<typeof backingStore.writeProvider>[0],
        record: Parameters<typeof backingStore.writeProvider>[1],
      ) {
        if (record.accessToken === 'issued-access') throw new Error('disk full');
        backingStore.writeProvider(providerId, record);
      },
    };
    const fetchMock = async (input: RequestInfo | URL) => {
      const url = requestUrl(input);
      if (url === CODEX_DEVICE_USERCODE_URL) {
        return jsonResponse({ user_code: 'ABCD-1234', device_auth_id: 'device-1', interval: 1 });
      }
      if (url === CODEX_DEVICE_TOKEN_URL) {
        return jsonResponse({ authorization_code: 'auth-code', code_verifier: 'verifier' });
      }
      return jsonResponse({
        access_token: 'issued-access',
        refresh_token: 'issued-refresh',
        expires_in: 3600,
      });
    };
    const revoked: string[] = [];
    const controller = createSubscriptionAuthController({
      store,
      fetch: fetchMock as typeof fetch,
      sleep: async () => undefined,
      ensureCredentialStoreWritable: () => undefined,
      revokeToken: async (_providerId, record) => {
        revoked.push(record.refreshToken ?? record.accessToken ?? '');
        return 'revoked';
      },
    });
    const app = new Hono().route('/api/auth', createSubscriptionAuthRoutes(controller));

    expect((await app.request('/api/auth/codex/start', { method: 'POST' })).status).toBe(200);
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(revoked).toEqual(['issued-refresh']);
    expect(backingStore.readProvider('codex')).toMatchObject({
      status: 'logged_out',
      accessToken: null,
      lastError: 'disk full',
    });
  });

  it('cancels device-code discovery before polling starts', async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'studio-oauth-routes-'));
    dirs.push(dir);
    const store = createSubscriptionAuthStore({
      resolveFilePath: () => path.join(dir, 'studio-oauth.json'),
    });
    let requestSignal!: AbortSignal;
    const fetchMock = async (_input: RequestInfo | URL, init?: RequestInit) => {
      requestSignal = init?.signal as AbortSignal;
      return await new Promise<Response>((_resolve, reject) => {
        requestSignal?.addEventListener(
          'abort',
          () => {
            const error = new Error('cancelled');
            error.name = 'AbortError';
            reject(error);
          },
          { once: true },
        );
      });
    };
    const controller = createSubscriptionAuthController({
      store,
      fetch: fetchMock as typeof fetch,
      ensureCredentialStoreWritable: () => undefined,
    });

    const start = controller.start('codex');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(requestSignal.aborted).toBe(false);
    expect(controller.cancel('codex')).toMatchObject({ status: 'logged_out' });
    await expect(start).resolves.toMatchObject({ status: 'logged_out' });
    expect(requestSignal.aborted).toBe(true);
  });

  it('clears xAI credentials before best-effort provider revocation', async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'studio-oauth-routes-'));
    dirs.push(dir);
    const store = createSubscriptionAuthStore({
      resolveFilePath: () => path.join(dir, 'studio-oauth.json'),
    });
    store.writeProvider('xai', {
      status: 'logged_in',
      accessToken: 'xai-access',
      refreshToken: 'xai-refresh',
      expiresAt: '2026-09-02T00:00:00.000Z',
      accountLabel: 'grok-user',
      chatgptAccountId: null,
      lastError: null,
      updatedAt: '2026-09-01T00:00:00.000Z',
    });
    const fetchMock = async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(requestUrl(input)).toBe(XAI_OAUTH_REVOKE_URL);
      expect(store.readProvider('xai').refreshToken).toBeNull();
      expect(init?.redirect).toBe('error');
      const body = await new Response(init?.body ?? null).text();
      expect(new URLSearchParams(body).get('token')).toBe('xai-refresh');
      return new Response(null, { status: 503 });
    };
    const controller = createSubscriptionAuthController({
      store,
      fetch: fetchMock as typeof fetch,
      ensureCredentialStoreWritable: () => undefined,
    });
    const app = new Hono().route('/api/auth', createSubscriptionAuthRoutes(controller));

    const response = await app.request('/api/auth/xai/logout', { method: 'POST' });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'logged_out' });
    expect(store.readProvider('xai')).toMatchObject({
      accessToken: null,
      refreshToken: null,
    });
  });
});
