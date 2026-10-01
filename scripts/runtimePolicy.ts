import { Duration, Effect, Schedule } from 'effect';

export interface ScriptRetryPolicy {
  attempts: number;
  delayMs: number;
}

export interface ScriptPollingPolicy {
  pollMs: number;
  timeoutMs: number;
}

export function normalizeScriptRetryPolicy(policy: Partial<ScriptRetryPolicy>): ScriptRetryPolicy {
  const attempts = Number.isFinite(policy.attempts) ? Math.trunc(policy.attempts as number) : 1;
  const delayMs = Number.isFinite(policy.delayMs) ? Math.max(0, Number(policy.delayMs)) : 0;
  return {
    attempts: Math.max(1, attempts),
    delayMs,
  };
}

export function normalizeScriptPollingPolicy(
  policy: Partial<ScriptPollingPolicy>,
): ScriptPollingPolicy {
  const pollMs = Number.isFinite(policy.pollMs) ? Math.max(1, Number(policy.pollMs)) : 1_000;
  const timeoutMs = Number.isFinite(policy.timeoutMs)
    ? Math.max(pollMs, Number(policy.timeoutMs))
    : 15 * 60_000;
  return {
    pollMs,
    timeoutMs,
  };
}

function withScriptRetry<T>(
  factory: () => Effect.Effect<T, unknown>,
  policyInput: Partial<ScriptRetryPolicy> & {
    shouldRetry?: (error: unknown) => boolean;
  },
) {
  const policy = normalizeScriptRetryPolicy(policyInput);
  const shouldRetry = policyInput.shouldRetry ?? (() => true);

  return Effect.suspend(factory).pipe(
    Effect.retry({
      times: policy.attempts - 1,
      schedule: Schedule.spaced(policy.delayMs),
      while: shouldRetry,
    }),
  );
}

export async function runWithScriptRetry<T>(
  factory: () => Effect.Effect<T, unknown>,
  policyInput: Partial<ScriptRetryPolicy> & {
    shouldRetry?: (error: unknown) => boolean;
  },
) {
  return Effect.runPromise(withScriptRetry(factory, policyInput));
}

export async function sleepWithEffect(durationMs: number) {
  await Effect.runPromise(Effect.sleep(Duration.millis(Math.max(0, durationMs))));
}

export function pollWithScriptTimeout<T>(
  poll: () => Effect.Effect<T, unknown>,
  options: Partial<ScriptPollingPolicy> & {
    isTerminal: (value: T) => boolean;
    timeoutMessage: string;
  },
) {
  const policy = normalizeScriptPollingPolicy(options);

  return Effect.gen(function* () {
    const startedAt = Date.now();

    while (true) {
      const value = yield* poll();
      if (options.isTerminal(value)) {
        return value;
      }

      if (Date.now() - startedAt > policy.timeoutMs) {
        return yield* Effect.fail(new Error(options.timeoutMessage));
      }

      yield* Effect.sleep(Duration.millis(policy.pollMs));
    }
  });
}
