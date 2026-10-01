import { Effect, Semaphore } from 'effect';
import { providerSync, providerPromise, providerFailure } from '../providers/providerEffect';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    copyFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

vi.mock('../logger', () => ({
  log: vi.fn(),
}));

vi.mock('../library', () => ({
  resolveLibraryPath: (...parts: string[]) => `D:/tmp/${parts.join('/')}`,
}));

let createCodexTurn: typeof import('./turn').createCodexTurn;

beforeAll(async () => {
  ({ createCodexTurn } = await import('./turn'));
}, 30_000);

describe('createCodexTurn', () => {
  it('times out a hung turn completion, invalidates the persisted session, and retries', async () => {
    const closeSession = vi.fn();
    const getSession = vi.fn().mockImplementation(() =>
      providerSync(() => ({
        client: {
          getNotificationCount: () => 0,
          request: vi.fn().mockReturnValue(Effect.succeed({ turn: { id: 'turn-1' } })),
          waitForNotification: vi.fn((_predicate: unknown, timeoutMs: number) =>
            providerPromise(
              () =>
                new Promise((_, reject) => {
                  setTimeout(
                    () => reject(new Error('Timed out waiting for Codex notification')),
                    timeoutMs,
                  );
                }) as Promise<{ method: string; params?: unknown }>,
            ),
          ),
          getNotificationsSince: () => [],
        },
        codexHome: null,
        threadId: 'thread-1',
        sessionKey: 'pack_14',
        lock: Semaphore.makeUnsafe(1),
      })),
    );

    const turn = createCodexTurn({
      getSession,
      closeSession,
      getSessionKey: () => 'pack_14',
      resolveLibraryPath: (...parts) => `D:/tmp/${parts.join('/')}`,
      resolveProcessCwd: () => 'D:/DEV/cozy-studio',
      createAssetExtractor: () => ({ extract: async () => [] }),
      resolveExecutionOptions: () => ({
        model: 'gpt-5.4-mini',
        reasoningEffort: 'low',
        serviceTier: null,
      }),
      sleep: () => providerSync(() => {}),
      maxAttempts: 2,
      retryDelayMs: 0,
      turnCompletionTimeoutMs: 20,
    });

    await expect(
      Effect.runPromise(
        Effect.scoped(
          turn.runTurn({
            jobId: 'job-1',
            prompt: 'PACK: Mythic Noir Curated Vault',
          }),
        ),
      ),
    ).rejects.toThrow('Timed out waiting for Codex notification');

    expect(getSession).toHaveBeenCalledTimes(2);
    expect(closeSession).toHaveBeenCalledTimes(2);
    expect(closeSession).toHaveBeenNthCalledWith(1, 'pack_14', {
      invalidatePersistedThread: true,
    });
    expect(closeSession).toHaveBeenNthCalledWith(2, 'pack_14', {
      invalidatePersistedThread: true,
    });
  });

  it('invalidates the persisted session when codex socket closes mid-turn', async () => {
    const closeSession = vi.fn();
    const getSession = vi.fn().mockImplementation(() =>
      providerSync(() => ({
        client: {
          getNotificationCount: () => 0,
          request: vi
            .fn()
            .mockReturnValue(
              Effect.fail(providerFailure(new Error('Codex app-server socket closed'))),
            ),
          waitForNotification: vi.fn(),
          getNotificationsSince: () => [],
        },
        codexHome: null,
        threadId: 'thread-1',
        sessionKey: 'pack_08',
        lock: Semaphore.makeUnsafe(1),
      })),
    );

    const turn = createCodexTurn({
      getSession,
      closeSession,
      getSessionKey: () => 'pack_08',
      resolveLibraryPath: (...parts) => `D:/tmp/${parts.join('/')}`,
      resolveProcessCwd: () => 'D:/DEV/cozy-studio',
      createAssetExtractor: () => ({ extract: async () => [] }),
      resolveExecutionOptions: () => ({
        model: 'gpt-5.4-mini',
        reasoningEffort: 'low',
        serviceTier: null,
      }),
      sleep: () => providerSync(() => {}),
      maxAttempts: 1,
      retryDelayMs: 0,
    });

    await expect(
      Effect.runPromise(
        Effect.scoped(
          turn.runTurn({
            jobId: 'job-socket',
            prompt: 'PACK: Fashion & Costume',
          }),
        ),
      ),
    ).rejects.toThrow('Codex app-server socket closed');

    expect(closeSession).toHaveBeenCalledTimes(1);
    expect(closeSession).toHaveBeenCalledWith('pack_08', {
      invalidatePersistedThread: true,
    });
  });

  it('surfaces an actionable error when app-server reports exhausted model usage', async () => {
    const closeSession = vi.fn();
    const request = vi.fn().mockReturnValue(Effect.succeed({ turn: { id: 'turn-usage' } }));
    const getSession = vi.fn().mockReturnValue(
      Effect.succeed({
        client: {
          getNotificationCount: () => 0,
          request,
          waitForNotification: vi.fn().mockReturnValue(
            Effect.succeed({
              method: 'turn/completed',
              params: { turn: { id: 'turn-usage' } },
            }),
          ),
          getNotificationsSince: () => [
            {
              method: 'turn/completed',
              params: {
                turn: {
                  id: 'turn-usage',
                  error: { codexErrorInfo: 'usageLimitExceeded' },
                },
              },
            },
          ],
        },
        codexHome: null,
        threadId: 'thread-usage',
        sessionKey: 'pack_usage',
        lock: Semaphore.makeUnsafe(1),
      }),
    );

    const turn = createCodexTurn({
      getSession,
      closeSession,
      getSessionKey: () => 'pack_usage',
      resolveLibraryPath: (...parts) => `D:/tmp/${parts.join('/')}`,
      resolveProcessCwd: () => 'D:/DEV/cozy-studio',
      createAssetExtractor: () => ({ extract: async () => [] }),
      resolveExecutionOptions: () => ({
        model: 'gpt-5.6-luna',
        reasoningEffort: 'max',
        serviceTier: 'fast',
      }),
      maxAttempts: 1,
      retryDelayMs: 0,
    });

    await expect(
      Effect.runPromise(
        Effect.scoped(
          turn.runTurn({
            jobId: 'job-usage',
            prompt: 'PACK: Luna Reserve usage check',
          }),
        ),
      ),
    ).rejects.toThrow(
      'Select GPT-Reserve to use the available Luna Reserve bucket, or wait for the regular bucket to reset.',
    );

    expect(request).toHaveBeenCalledWith(
      'turn/start',
      expect.objectContaining({
        model: 'gpt-5.6-luna',
        effort: 'max',
        serviceTier: 'fast',
      }),
    );
  });
});
