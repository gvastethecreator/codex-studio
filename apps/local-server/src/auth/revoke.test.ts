import { describe, expect, it } from 'vitest';

import {
  CODEX_OAUTH_CLIENT_ID,
  CODEX_OAUTH_REVOKE_URL,
  GOOGLE_OAUTH_REVOKE_URL,
} from './constants';
import { revokeSubscriptionToken } from './revoke';

function requestUrl(input: RequestInfo | URL) {
  if (typeof input === 'string') return input;
  return input instanceof URL ? input.href : input.url;
}

function formBody(value: BodyInit | null | undefined) {
  if (typeof value !== 'string') throw new Error('Expected a form body.');
  return new URLSearchParams(value);
}

describe('subscription token revocation', () => {
  it('revokes the Codex refresh token without following redirects', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const result = await revokeSubscriptionToken(
      'codex',
      { accessToken: 'access-secret', refreshToken: 'refresh-secret' },
      {
        fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
          calls.push({ url: requestUrl(input), init });
          return new Response(null, { status: 200 });
        }) as typeof fetch,
      },
    );

    expect(result).toBe('revoked');
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(CODEX_OAUTH_REVOKE_URL);
    expect(calls[0]?.init?.redirect).toBe('error');
    const body = calls[0]?.init?.body;
    expect(typeof body).toBe('string');
    expect(JSON.parse(body as string)).toEqual({
      token: 'refresh-secret',
      token_type_hint: 'refresh_token',
      client_id: CODEX_OAUTH_CLIENT_ID,
    });
  });

  it('skips revocation when no token exists', async () => {
    await expect(
      revokeSubscriptionToken('xai', { accessToken: null, refreshToken: null }),
    ).resolves.toBe('skipped');
  });

  it('revokes a Google refresh token with a form body', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    await expect(
      revokeSubscriptionToken(
        'google',
        { accessToken: 'access-secret', refreshToken: 'refresh-secret' },
        {
          fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
            calls.push({ url: requestUrl(input), init });
            return new Response(null, { status: 200 });
          }) as typeof fetch,
        },
      ),
    ).resolves.toBe('revoked');

    expect(calls[0]?.url).toBe(GOOGLE_OAUTH_REVOKE_URL);
    expect(formBody(calls[0]?.init?.body).get('token')).toBe('refresh-secret');
    expect(calls[0]?.init?.redirect).toBe('error');
  });

  it('rejects an unsafe Google revocation endpoint before network access', async () => {
    let called = false;
    await expect(
      revokeSubscriptionToken(
        'google',
        { accessToken: 'access-secret', refreshToken: 'refresh-secret' },
        {
          env: { GOOGLE_OAUTH_REVOKE_URL: 'http://example.com/revoke' },
          fetch: (async (_input: RequestInfo | URL, _init?: RequestInit) => {
            called = true;
            return new Response(null, { status: 200 });
          }) as typeof fetch,
        },
      ),
    ).resolves.toBe('failed');
    expect(called).toBe(false);
  });
});
