import { describe, expect, it } from 'vite-plus/test';
import {
  getExternalProviderRetryDelayMs,
  isRetryableProviderStatus,
  normalizeExternalProviderRetryPolicy,
} from './externalProviderRetryPolicy';

describe('externalProviderRetryPolicy', () => {
  it('normalizes retry policy bounds', () => {
    expect(
      normalizeExternalProviderRetryPolicy({
        maxAttempts: 0,
        retryDelayMs: -100,
      }),
    ).toEqual({ maxAttempts: 1, retryDelayMs: 0 });

    expect(
      normalizeExternalProviderRetryPolicy({
        maxAttempts: 3.8,
        retryDelayMs: 250.9,
      }),
    ).toEqual({ maxAttempts: 3, retryDelayMs: 250 });
  });

  it('marks retryable HTTP status codes', () => {
    expect(isRetryableProviderStatus(408)).toBe(true);
    expect(isRetryableProviderStatus(429)).toBe(true);
    expect(isRetryableProviderStatus(500)).toBe(true);
    expect(isRetryableProviderStatus(503)).toBe(true);
    expect(isRetryableProviderStatus(400)).toBe(false);
    expect(isRetryableProviderStatus(404)).toBe(false);
  });

  it('computes linear retry backoff delay', () => {
    expect(getExternalProviderRetryDelayMs(100, 1)).toBe(100);
    expect(getExternalProviderRetryDelayMs(100, 2)).toBe(200);
    expect(getExternalProviderRetryDelayMs(0, 3)).toBe(0);
    expect(getExternalProviderRetryDelayMs(-50, 2)).toBe(0);
  });
});
