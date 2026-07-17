import { describe, expect, it, vi } from 'vite-plus/test';
import { createSessionPool } from './sessionPool';

vi.mock('../logger', () => ({
  log: vi.fn(),
}));

vi.mock('../library', () => ({
  resolveLibraryPath: (...parts: string[]) => `D:/tmp/${parts.join('/')}`,
}));

describe('createSessionPool.getSessionKey', () => {
  it('prefers explicit SESSION field over PACK field', () => {
    const pool = createSessionPool();

    expect(
      pool.getSessionKey(`PACK: Fashion & Costume
CATEGORY: 5. Fabric & Texture Focus
SESSION: fashion_costume_retry_a`),
    ).toBe('fashion_costume_retry_a');
  });

  it('falls back to PACK field when SESSION is absent', () => {
    const pool = createSessionPool();

    expect(
      pool.getSessionKey(`PACK: Fashion & Costume
CATEGORY: 5. Fabric & Texture Focus`),
    ).toBe('fashion_costume');
  });
});

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createTestClient(connect: () => Promise<void>) {
  return {
    connect: vi.fn(connect),
    request: vi.fn(async (method: string) =>
      method === 'initialize' ? { codexHome: 'D:/codex-home' } : { thread: { id: 'thread-1' } },
    ),
    notify: vi.fn(),
    close: vi.fn(),
  };
}

describe('createSessionPool concurrency', () => {
  it('shares one in-flight session creation for the same key', async () => {
    const connected = createDeferred<void>();
    const client = createTestClient(() => connected.promise);
    const createClient = vi.fn(() => client as never);
    const registryRoot = `${process.cwd()}/.scratch/test-runtime/session-pool-${Math.random()}`;
    const pool = createSessionPool({
      createClient,
      resolveLibraryPath: (...parts) => `${registryRoot}/${parts.join('/')}`,
    });

    const first = pool.getOrCreateSession('shared');
    const second = pool.getOrCreateSession('shared');

    expect(createClient).toHaveBeenCalledTimes(1);
    connected.resolve();
    const [firstSession, secondSession] = await Promise.all([first, second]);

    expect(firstSession).toBe(secondSession);
    expect(client.request).toHaveBeenCalledWith('thread/start', expect.any(Object));
  });

  it('clears a failed creation so the same key can be retried', async () => {
    const firstClient = createTestClient(async () => {
      throw new Error('connect failed');
    });
    const secondClient = createTestClient(async () => {});
    const createClient = vi
      .fn()
      .mockReturnValueOnce(firstClient as never)
      .mockReturnValueOnce(secondClient as never);
    const registryRoot = `${process.cwd()}/.scratch/test-runtime/session-pool-${Math.random()}`;
    const pool = createSessionPool({
      createClient,
      resolveLibraryPath: (...parts) => `${registryRoot}/${parts.join('/')}`,
    });

    await expect(pool.getOrCreateSession('retryable')).rejects.toThrow('connect failed');
    await expect(pool.getOrCreateSession('retryable')).resolves.toMatchObject({
      sessionKey: 'retryable',
      threadId: 'thread-1',
    });

    expect(createClient).toHaveBeenCalledTimes(2);
    expect(firstClient.close).toHaveBeenCalledTimes(1);
  });
});
