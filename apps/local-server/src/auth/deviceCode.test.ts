import { describe, expect, it } from 'vite-plus/test';

import { isAllowedXaiAuthUrl } from './deviceCode';

describe('xAI auth URL allowlist', () => {
  it('accepts only https://auth.x.ai', () => {
    expect(isAllowedXaiAuthUrl('https://auth.x.ai/oauth2/token')).toBe(true);
    expect(isAllowedXaiAuthUrl('https://auth.x.ai')).toBe(true);
    expect(isAllowedXaiAuthUrl('https://evil.example/x.ai')).toBe(false);
    expect(isAllowedXaiAuthUrl('https://auth.x.ai.evil.example/oauth2/token')).toBe(false);
    expect(isAllowedXaiAuthUrl('http://auth.x.ai/oauth2/token')).toBe(false);
  });
});
