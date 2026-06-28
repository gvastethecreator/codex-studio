import { beforeAll, describe, expect, it, vi } from 'vite-plus/test';

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
    const getSession = vi.fn().mockImplementation(async () => ({
      client: {
        getNotificationCount: () => 0,
        request: vi.fn().mockResolvedValue({ turn: { id: 'turn-1' } }),
        waitForNotification: vi.fn(
          (_predicate: unknown, timeoutMs: number) =>
            new Promise((_, reject) => {
              setTimeout(
                () => reject(new Error('Timed out waiting for Codex notification')),
                timeoutMs,
              );
            }) as Promise<{ method: string; params?: unknown }>,
        ),
        getNotificationsSince: () => [],
      },
      codexHome: null,
      threadId: 'thread-1',
      sessionKey: 'pack_14',
      queue: Promise.resolve(),
    }));

    const turn = createCodexTurn({
      getSession,
      closeSession,
      getSessionKey: () => 'pack_14',
      resolveLibraryPath: (...parts) => `D:/tmp/${parts.join('/')}`,
      resolveProcessCwd: () => 'D:/DEV/codex-studio',
      createAssetExtractor: () => ({ extract: async () => [] }),
      resolveExecutionOptions: () => ({
        model: 'gpt-5.4-mini',
        reasoningEffort: 'low',
        serviceTier: null,
      }),
      sleep: async () => {},
      maxAttempts: 2,
      retryDelayMs: 0,
      turnCompletionTimeoutMs: 20,
    });

    await expect(
      turn.runTurn({
        jobId: 'job-1',
        projectId: 'project-1',
        prompt: 'PACK: Mythic Noir Curated Vault',
      }),
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
    const getSession = vi.fn().mockImplementation(async () => ({
      client: {
        getNotificationCount: () => 0,
        request: vi.fn().mockRejectedValue(new Error('Codex app-server socket closed')),
        waitForNotification: vi.fn(),
        getNotificationsSince: () => [],
      },
      codexHome: null,
      threadId: 'thread-1',
      sessionKey: 'pack_08',
      queue: Promise.resolve(),
    }));

    const turn = createCodexTurn({
      getSession,
      closeSession,
      getSessionKey: () => 'pack_08',
      resolveLibraryPath: (...parts) => `D:/tmp/${parts.join('/')}`,
      resolveProcessCwd: () => 'D:/DEV/codex-studio',
      createAssetExtractor: () => ({ extract: async () => [] }),
      resolveExecutionOptions: () => ({
        model: 'gpt-5.4-mini',
        reasoningEffort: 'low',
        serviceTier: null,
      }),
      sleep: async () => {},
      maxAttempts: 1,
      retryDelayMs: 0,
    });

    await expect(
      turn.runTurn({
        jobId: 'job-socket',
        projectId: 'project-1',
        prompt: 'PACK: Fashion & Costume',
      }),
    ).rejects.toThrow('Codex app-server socket closed');

    expect(closeSession).toHaveBeenCalledTimes(1);
    expect(closeSession).toHaveBeenCalledWith('pack_08', {
      invalidatePersistedThread: true,
    });
  });
});
