import { describe, expect, it, vi } from 'vite-plus/test';
import {
  createCatalogEventRefreshPolicy,
  mergeCatalogRefreshScopes,
} from './catalogEventRefreshPolicy';

function createDeferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

describe('catalogEventRefreshPolicy', () => {
  it('coalesces a burst of 200 events into one refresh', async () => {
    const scheduled: Array<() => void> = [];
    const refreshCatalog = vi.fn(async () => {});
    const policy = createCatalogEventRefreshPolicy({
      refreshCatalog,
      schedule: (callback) => {
        scheduled.push(callback);
        return scheduled.length as unknown as ReturnType<typeof setTimeout>;
      },
    });

    for (let index = 0; index < 200; index += 1) policy.request({ kind: 'active' });
    expect(scheduled).toHaveLength(1);
    scheduled.shift()?.();
    await Promise.resolve();
    await Promise.resolve();

    expect(refreshCatalog).toHaveBeenCalledTimes(1);
    expect(refreshCatalog).toHaveBeenCalledWith({ kind: 'active' });
  });

  it('merges incompatible scopes and permits only one trailing in-flight refresh', async () => {
    const first = createDeferred();
    const scheduled: Array<() => void> = [];
    const refreshCatalog = vi
      .fn<(scope: Parameters<typeof mergeCatalogRefreshScopes>[1]) => Promise<void>>()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValue(undefined);
    const policy = createCatalogEventRefreshPolicy({
      refreshCatalog,
      schedule: (callback) => {
        scheduled.push(callback);
        return scheduled.length as unknown as ReturnType<typeof setTimeout>;
      },
    });

    policy.request({ kind: 'workspace', workspaceId: 'a' });
    scheduled.shift()?.();
    policy.request({ kind: 'trash' });
    policy.request({ kind: 'active' });
    first.resolve();
    for (let index = 0; index < 4; index += 1) await Promise.resolve();

    expect(scheduled).toHaveLength(1);
    scheduled.shift()?.();
    await Promise.resolve();
    expect(refreshCatalog).toHaveBeenCalledTimes(2);
    expect(refreshCatalog).toHaveBeenLastCalledWith({ kind: 'all' });
  });

  it('cancels pending work on dispose', () => {
    const cancel = vi.fn();
    const policy = createCatalogEventRefreshPolicy({
      refreshCatalog: vi.fn(),
      schedule: () => 42 as unknown as ReturnType<typeof setTimeout>,
      cancel,
    });

    policy.request();
    policy.dispose();
    policy.request();

    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('supports StrictMode remount with a fresh policy after cleanup', async () => {
    const refreshCatalog = vi.fn(async () => {});
    const callbacks: Array<() => void> = [];
    const createPolicy = () =>
      createCatalogEventRefreshPolicy({
        refreshCatalog,
        schedule: (callback) => {
          callbacks.push(callback);
          return callbacks.length as unknown as ReturnType<typeof setTimeout>;
        },
      });

    const firstMount = createPolicy();
    firstMount.dispose();
    const secondMount = createPolicy();
    secondMount.request({ kind: 'all' });
    callbacks.shift()?.();
    await Promise.resolve();

    expect(refreshCatalog).toHaveBeenCalledTimes(1);
  });

  it('retries a failed authoritative refresh and recovers without another SSE event', async () => {
    const scheduled: Array<{ callback: () => void; delayMs: number }> = [];
    const refreshCatalog = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('temporary catalog failure'))
      .mockResolvedValue(undefined);
    const policy = createCatalogEventRefreshPolicy({
      refreshCatalog,
      schedule: (callback, delayMs) => {
        scheduled.push({ callback, delayMs });
        return scheduled.length as unknown as ReturnType<typeof setTimeout>;
      },
    });

    policy.request({ kind: 'all' });
    const initialRefresh = scheduled.shift();
    expect(initialRefresh?.delayMs).toBe(25);
    initialRefresh?.callback();
    for (let index = 0; index < 4; index += 1) await Promise.resolve();

    const retry = scheduled.shift();
    expect(retry?.delayMs).toBe(300);
    retry?.callback();
    for (let index = 0; index < 4; index += 1) await Promise.resolve();

    expect(refreshCatalog).toHaveBeenCalledTimes(2);
  });
});
