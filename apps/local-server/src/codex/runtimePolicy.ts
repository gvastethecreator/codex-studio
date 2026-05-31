export interface CodexRetryPolicy {
  maxAttempts: number;
  retryDelayMs: number;
}

export const DEFAULT_CODEX_RETRY_POLICY: CodexRetryPolicy = {
  maxAttempts: 2,
  retryDelayMs: 1500,
};

export function normalizeCodexRetryPolicy(policy: Partial<CodexRetryPolicy>): CodexRetryPolicy {
  return {
    maxAttempts: Math.max(
      1,
      Math.floor(policy.maxAttempts ?? DEFAULT_CODEX_RETRY_POLICY.maxAttempts),
    ),
    retryDelayMs: Math.max(
      0,
      Math.floor(policy.retryDelayMs ?? DEFAULT_CODEX_RETRY_POLICY.retryDelayMs),
    ),
  };
}

export function isTransientCodexRuntimeErrorMessage(message: string) {
  return /stream disconnected|Timed out waiting for Codex notification|thread.+not found|unknown thread|invalid thread|socket is not open|socket closed|websocket/i.test(
    message,
  );
}
