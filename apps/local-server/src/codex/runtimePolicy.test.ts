import { describe, expect, it } from 'vite-plus/test';
import { isTransientCodexRuntimeErrorMessage, normalizeCodexRetryPolicy } from './runtimePolicy';

describe('runtimePolicy', () => {
  it('normalizes retry policy values', () => {
    expect(normalizeCodexRetryPolicy({})).toEqual({ maxAttempts: 2, retryDelayMs: 1500 });
    expect(normalizeCodexRetryPolicy({ maxAttempts: 0, retryDelayMs: -5 })).toEqual({
      maxAttempts: 1,
      retryDelayMs: 0,
    });
    expect(normalizeCodexRetryPolicy({ maxAttempts: 3.7, retryDelayMs: 250.8 })).toEqual({
      maxAttempts: 3,
      retryDelayMs: 250,
    });
  });

  it('classifies transient Codex runtime messages', () => {
    expect(isTransientCodexRuntimeErrorMessage('stream disconnected during turn')).toBe(true);
    expect(isTransientCodexRuntimeErrorMessage('Timed out waiting for Codex notification')).toBe(
      true,
    );
    expect(isTransientCodexRuntimeErrorMessage('socket is not open')).toBe(true);
    expect(isTransientCodexRuntimeErrorMessage('validation failed')).toBe(false);
  });
});
