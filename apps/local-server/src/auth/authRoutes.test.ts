import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Hono } from 'hono';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { createSubscriptionAuthRoutes } from './authRoutes';
import { createSubscriptionAuthController } from './controller';
import { createSubscriptionAuthStore } from './store';
import {
  CODEX_DEVICE_TOKEN_URL,
  CODEX_DEVICE_USERCODE_URL,
  CODEX_OAUTH_TOKEN_URL,
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
      inspectLibraryWritable: () => true,
      publish: (_type, payload) => published.push(payload),
    });
    const app = new Hono().route('/api/auth', createSubscriptionAuthRoutes(controller));

    const started = await app.request('/api/auth/codex/start', { method: 'POST' });
    const startBody = await started.json();
    expect(started.status).toBe(200);
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

  it('rejects start when the Studio Library is not writable', async () => {
    const controller = createSubscriptionAuthController({
      inspectLibraryWritable: () => false,
    });
    const app = new Hono().route('/api/auth', createSubscriptionAuthRoutes(controller));
    const response = await app.request('/api/auth/xai/start', { method: 'POST' });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'library_not_writable' });
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
      inspectLibraryWritable: () => true,
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
          inspectLibraryWritable: () => true,
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
          inspectLibraryWritable: () => true,
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
    const status = await app.request('/api/auth/codex');
    expect(await status.json()).toMatchObject({ status: 'logged_out' });
  });
});
