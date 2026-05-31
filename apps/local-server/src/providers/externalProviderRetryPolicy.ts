export interface ExternalProviderRetryPolicy {
  maxAttempts: number;
  retryDelayMs: number;
}

export function normalizeExternalProviderRetryPolicy(
  policy: ExternalProviderRetryPolicy,
): ExternalProviderRetryPolicy {
  return {
    maxAttempts: Math.max(1, Math.floor(policy.maxAttempts)),
    retryDelayMs: Math.max(0, Math.floor(policy.retryDelayMs)),
  };
}

export function isRetryableProviderStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

export function getExternalProviderRetryDelayMs(baseDelayMs: number, attempt: number) {
  return Math.max(0, baseDelayMs * attempt);
}
