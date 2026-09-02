import { describe, expect, it } from 'vite-plus/test';

import { readOAuthJson, safeOAuthText } from './oauthHttp';

describe('OAuth response handling', () => {
  it('rejects an oversized provider response before parsing it', async () => {
    const response = new Response('{}', {
      headers: { 'content-length': String(65 * 1024) },
    });
    await expect(readOAuthJson(response)).rejects.toThrow('exceeded the allowed size');
  });

  it('bounds and removes control characters from provider error text', () => {
    expect(safeOAuthText(`bad\r\nmessage\u0000${'x'.repeat(500)}`)).toBe(
      `bad message ${'x'.repeat(288)}`,
    );
  });
});
