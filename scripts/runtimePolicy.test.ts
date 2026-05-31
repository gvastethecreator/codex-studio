import { Effect } from 'effect';
import { describe, expect, it } from 'vite-plus/test';
import {
  normalizeScriptPollingPolicy,
  normalizeScriptRetryPolicy,
  pollWithScriptTimeout,
  runWithScriptRetry,
} from './runtimePolicy';

describe('runtimePolicy', () => {
  it('normalizes retry policy with safe defaults', () => {
    expect(normalizeScriptRetryPolicy({ attempts: -2, delayMs: -10 })).toEqual({
      attempts: 1,
      delayMs: 0,
    });
    expect(normalizeScriptRetryPolicy({ attempts: 3, delayMs: 250 })).toEqual({
      attempts: 3,
      delayMs: 250,
    });
  });

  it('retries effect factory until it succeeds', async () => {
    let attempts = 0;
    const result = await runWithScriptRetry(
      () =>
        Effect.try({
          try: () => {
            attempts += 1;
            if (attempts < 3) {
              throw new Error('temporary failure');
            }
            return 'ok';
          },
          catch: (error) => (error instanceof Error ? error : new Error(String(error))),
        }),
      { attempts: 3, delayMs: 0 },
    );

    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });

  it('times out polling when terminal condition is never reached', async () => {
    const policy = normalizeScriptPollingPolicy({ pollMs: 10, timeoutMs: 30 });
    let tick = 0;

    await expect(
      Effect.runPromise(
        pollWithScriptTimeout(
          () =>
            Effect.succeed({
              status: (tick++ > 10_000 ? 'completed' : 'running') as 'running' | 'completed',
            }),
          {
            pollMs: policy.pollMs,
            timeoutMs: policy.timeoutMs,
            timeoutMessage: 'poll timeout',
            isTerminal: (value) => value.status === 'completed',
          },
        ),
      ),
    ).rejects.toThrow('poll timeout');
  });
});
