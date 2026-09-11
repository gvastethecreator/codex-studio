import { describe, expect, it } from 'vitest';

import {
  createGooglePkce,
  resolveGoogleOAuthEndpoint,
  startGoogleAuthorizationCode,
} from './googleAuthorizationCode';

function deterministicRandom(size: number) {
  return Buffer.alloc(size, size);
}

function formBody(value: BodyInit | null | undefined) {
  if (typeof value !== 'string') throw new Error('Expected a form body.');
  return new URLSearchParams(value);
}

describe('Google authorization code flow', () => {
  it('uses PKCE and exchanges a matching loopback callback', async () => {
    const tokenRequests: Array<{ url: string; init?: RequestInit }> = [];
    const started = await startGoogleAuthorizationCode({
      env: {
        GOOGLE_OAUTH_CLIENT_ID: 'studio.apps.googleusercontent.com',
        GOOGLE_CLOUD_PROJECT_ID: 'studio-project',
      },
      random: deterministicRandom,
      loginTimeoutMs: 5_000,
      now: () => Date.parse('2026-09-02T00:00:00.000Z'),
      fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        tokenRequests.push({ url, init });
        return new Response(
          JSON.stringify({
            access_token: 'google-access-secret',
            refresh_token: 'google-refresh-secret',
            token_type: 'Bearer',
            expires_in: 3600,
          }),
        );
      }) as typeof fetch,
    });
    const authorizationUrl = new URL(started.authorizationUrl);
    const redirectUri = authorizationUrl.searchParams.get('redirect_uri');
    const state = authorizationUrl.searchParams.get('state');

    expect(authorizationUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(authorizationUrl.searchParams.get('code_challenge')).toBeTruthy();
    expect(authorizationUrl.searchParams.get('scope')).toContain('cloud-platform');
    expect(redirectUri).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/oauth\/google\/callback$/);

    const poll = started.poll(new AbortController().signal);
    const callback = await fetch(`${redirectUri}?state=${encodeURIComponent(state!)}&code=code-1`);
    expect(callback.status).toBe(200);
    await expect(poll).resolves.toMatchObject({
      status: 'logged_in',
      accessToken: 'google-access-secret',
      refreshToken: 'google-refresh-secret',
    });

    expect(tokenRequests).toHaveLength(1);
    expect(tokenRequests[0]?.url).toBe('https://oauth2.googleapis.com/token');
    const body = formBody(tokenRequests[0]?.init?.body);
    expect(body.get('code')).toBe('code-1');
    expect(body.get('redirect_uri')).toBe(redirectUri);
    expect(body.get('code_verifier')).toBeTruthy();
  });

  it('rejects a mismatched callback state and closes the login', async () => {
    const started = await startGoogleAuthorizationCode({
      env: {
        GOOGLE_OAUTH_CLIENT_ID: 'studio.apps.googleusercontent.com',
        GOOGLE_CLOUD_PROJECT_ID: 'studio-project',
      },
      random: deterministicRandom,
      loginTimeoutMs: 5_000,
    });
    const authorizationUrl = new URL(started.authorizationUrl);
    const redirectUri = authorizationUrl.searchParams.get('redirect_uri');
    const poll = expect(started.poll(new AbortController().signal)).rejects.toThrow(
      'state did not match',
    );

    const callback = await fetch(`${redirectUri}?state=wrong&code=code-1`);
    expect(callback.status).toBe(400);
    await poll;
  });

  it('cancels the loopback listener through the poll signal', async () => {
    const started = await startGoogleAuthorizationCode({
      env: {
        GOOGLE_OAUTH_CLIENT_ID: 'studio.apps.googleusercontent.com',
        GOOGLE_CLOUD_PROJECT_ID: 'studio-project',
      },
      random: deterministicRandom,
      loginTimeoutMs: 5_000,
    });
    const controller = new AbortController();
    const poll = expect(started.poll(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    controller.abort();

    await poll;
  });

  it('closes the loopback listener when the start lifecycle is cancelled', async () => {
    const lifecycle = new AbortController();
    const started = await startGoogleAuthorizationCode({
      env: {
        GOOGLE_OAUTH_CLIENT_ID: 'studio.apps.googleusercontent.com',
        GOOGLE_CLOUD_PROJECT_ID: 'studio-project',
      },
      random: deterministicRandom,
      signal: lifecycle.signal,
      loginTimeoutMs: 5_000,
    });
    const poll = expect(started.poll(new AbortController().signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    lifecycle.abort();

    await poll;
  });

  it('rejects credential-bearing and non-loopback HTTP endpoints', () => {
    expect(() => resolveGoogleOAuthEndpoint('https://user:pass@example.com/token', '')).toThrow(
      'credential-free loopback URL',
    );
    expect(() => resolveGoogleOAuthEndpoint('http://example.com/token', '')).toThrow(
      'credential-free loopback URL',
    );
  });

  it('creates a stable S256 challenge for deterministic input', () => {
    expect(createGooglePkce(deterministicRandom)).toEqual(createGooglePkce(deterministicRandom));
  });
});
