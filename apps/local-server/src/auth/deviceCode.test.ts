import { describe, expect, it } from 'vite-plus/test';

import {
  XAI_OAUTH_DEVICE_CODE_URL,
  XAI_OAUTH_DISCOVERY_URL,
  XAI_OAUTH_ISSUER,
  XAI_OAUTH_TOKEN_URL,
} from './constants';
import { isAllowedXaiAuthUrl, isAllowedXaiVerificationUrl, startDeviceCode } from './deviceCode';

function response(body: unknown, status = 200) {
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

describe('xAI device-code auth', () => {
  it('keeps token discovery on auth.x.ai and browser verification on x.ai HTTPS hosts', () => {
    expect(isAllowedXaiAuthUrl('https://auth.x.ai/oauth2/token')).toBe(true);
    expect(isAllowedXaiAuthUrl('https://auth.x.ai')).toBe(true);
    expect(isAllowedXaiAuthUrl('https://evil.example/x.ai')).toBe(false);
    expect(isAllowedXaiAuthUrl('https://auth.x.ai.evil.example/oauth2/token')).toBe(false);
    expect(isAllowedXaiAuthUrl('http://auth.x.ai/oauth2/token')).toBe(false);
    expect(isAllowedXaiAuthUrl('https://user@auth.x.ai/oauth2/token')).toBe(false);

    expect(isAllowedXaiVerificationUrl('https://accounts.x.ai/device')).toBe(true);
    expect(isAllowedXaiVerificationUrl('https://auth.x.ai/device')).toBe(true);
    expect(isAllowedXaiVerificationUrl('https://x.ai/device')).toBe(true);
    expect(isAllowedXaiVerificationUrl('https://x.ai.evil.example/device')).toBe(false);
    expect(isAllowedXaiVerificationUrl('http://accounts.x.ai/device')).toBe(false);
  });

  it('waits before polling and adds five seconds after slow_down', async () => {
    const sleeps: number[] = [];
    const pollRequests: RequestInit[] = [];
    let polls = 0;
    const fetchMock = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      if (url === XAI_OAUTH_DISCOVERY_URL) {
        return response({ issuer: XAI_OAUTH_ISSUER, token_endpoint: XAI_OAUTH_TOKEN_URL });
      }
      if (url === XAI_OAUTH_DEVICE_CODE_URL) {
        expect(init?.redirect).toBe('error');
        const body = await new Response(init?.body ?? null).text();
        expect(new URLSearchParams(body).get('referrer')).toBe('grok-build');
        return response({
          user_code: 'ABCD-1234',
          device_code: 'device-secret',
          verification_uri: 'https://accounts.x.ai/device',
          interval: 1,
          expires_in: 900,
        });
      }
      if (url === XAI_OAUTH_TOKEN_URL) {
        polls += 1;
        pollRequests.push(init ?? {});
        if (polls === 1) return response({ error: 'slow_down' }, 400);
        return response({ access_token: 'access-secret', refresh_token: 'refresh-secret' });
      }
      return response({ error: 'unexpected' }, 500);
    };

    const started = await startDeviceCode('xai', {
      fetch: fetchMock as typeof fetch,
      now: () => 0,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
    });
    const tokens = await started.poll(new AbortController().signal);

    expect(tokens.accessToken).toBe('access-secret');
    expect(sleeps).toEqual([1000, 6000]);
    expect(pollRequests.every((request) => request.redirect === 'error')).toBe(true);
  });

  it('rejects an untrusted verification URL returned by xAI', async () => {
    const fetchMock = async (input: RequestInfo | URL) => {
      const url = requestUrl(input);
      if (url === XAI_OAUTH_DISCOVERY_URL) {
        return response({ issuer: XAI_OAUTH_ISSUER, token_endpoint: XAI_OAUTH_TOKEN_URL });
      }
      return response({
        user_code: 'ABCD-1234',
        device_code: 'device-secret',
        verification_uri: 'https://phishing.example/device',
      });
    };

    await expect(startDeviceCode('xai', { fetch: fetchMock as typeof fetch })).rejects.toThrow(
      'response was incomplete',
    );
  });
});
