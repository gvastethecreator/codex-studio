import { describe, expect, it } from 'vite-plus/test';
import { createLocalApiSecurityMiddleware, isAllowedLocalApiOrigin } from './localApiSecurity';
import { Hono } from 'hono';

describe('localApiSecurity', () => {
  it('allows standard default loopback origins on port 17222 and 17223', () => {
    expect(isAllowedLocalApiOrigin('http://localhost:17222')).toBe(true);
    expect(isAllowedLocalApiOrigin('http://127.0.0.1:17222')).toBe(true);
    expect(isAllowedLocalApiOrigin('http://[::1]:17222')).toBe(true);
    expect(isAllowedLocalApiOrigin('http://localhost:17223')).toBe(true);
    expect(isAllowedLocalApiOrigin('http://127.0.0.1:17223')).toBe(true);
  });

  it('allows dynamic loopback origins on any port for localhost, 127.0.0.1, and [::1]', () => {
    expect(isAllowedLocalApiOrigin('http://localhost:5173')).toBe(true);
    expect(isAllowedLocalApiOrigin('http://localhost:17225')).toBe(true);
    expect(isAllowedLocalApiOrigin('http://127.0.0.1:18000')).toBe(true);
    expect(isAllowedLocalApiOrigin('http://[::1]:5174')).toBe(true);
  });

  it('rejects external or non-loopback origins', () => {
    expect(isAllowedLocalApiOrigin('https://example.com')).toBe(false);
    expect(isAllowedLocalApiOrigin('http://evil.attacker.org:17222')).toBe(false);
    expect(isAllowedLocalApiOrigin('http://192.168.1.100:17222')).toBe(false);
    expect(isAllowedLocalApiOrigin('invalid-url')).toBe(false);
  });

  it('middleware returns 403 on forbidden origin and 200 on allowed dynamic loopback origin', async () => {
    const app = new Hono();
    app.use('*', createLocalApiSecurityMiddleware());
    app.get('/test', (c) => c.json({ ok: true }));

    const allowedResponse = await app.request('/test', {
      headers: { Origin: 'http://localhost:17225' },
    });
    expect(allowedResponse.status).toBe(200);
    expect(allowedResponse.headers.get('Access-Control-Allow-Origin')).toBe(
      'http://localhost:17225',
    );

    const forbiddenResponse = await app.request('/test', {
      headers: { Origin: 'https://malicious.org' },
    });
    expect(forbiddenResponse.status).toBe(403);
    await expect(forbiddenResponse.json()).resolves.toEqual({
      error: 'Forbidden origin',
      code: 'forbidden_origin',
    });
  });
});
