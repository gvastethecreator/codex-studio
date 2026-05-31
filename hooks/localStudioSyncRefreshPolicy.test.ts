import { describe, expect, it, vi } from 'vite-plus/test';
import { createLocalStudioSyncRefreshPolicy } from './localStudioSyncRefreshPolicy';

function createDeferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((settle) => {
    resolve = () => settle();
  });

  return { promise, resolve };
}

describe('localStudioSyncRefreshPolicy', () => {
  it('triggers backend refresh when an asset arrives', () => {
    const refreshBackendState = vi.fn(async () => {});

    const policy = createLocalStudioSyncRefreshPolicy({
      refreshBackendState,
    });

    policy.onAssetAdded();

    expect(refreshBackendState).toHaveBeenCalledTimes(1);
  });

  it('coalesces asset refreshes while a refresh is in flight', async () => {
    const deferred = createDeferred();
    const refreshBackendState = vi.fn(() => deferred.promise);

    const policy = createLocalStudioSyncRefreshPolicy({
      refreshBackendState,
    });

    policy.onAssetAdded();
    policy.onAssetAdded();
    policy.onAssetAdded();

    expect(refreshBackendState).toHaveBeenCalledTimes(1);

    deferred.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(refreshBackendState).toHaveBeenCalledTimes(2);
  });

  it('coalesces disconnect refreshes while a refresh is in flight', async () => {
    const deferred = createDeferred();
    const refreshBackendState = vi.fn(() => deferred.promise);

    const policy = createLocalStudioSyncRefreshPolicy({
      refreshBackendState,
    });

    policy.onConnectionChange(false);
    policy.onConnectionChange(false);
    policy.onConnectionChange(false);

    expect(refreshBackendState).toHaveBeenCalledTimes(1);

    deferred.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(refreshBackendState).toHaveBeenCalledTimes(2);
  });

  it('triggers backend refresh when connection is restored after a disconnect', async () => {
    const refreshBackendState = vi.fn(async () => {});

    const policy = createLocalStudioSyncRefreshPolicy({
      refreshBackendState,
    });

    policy.onConnectionChange(false);
    policy.onConnectionChange(true);

    await Promise.resolve();
    await Promise.resolve();

    expect(refreshBackendState).toHaveBeenCalledTimes(2);
  });

  it('coalesces mixed burst triggers while one refresh is in flight', async () => {
    const deferred = createDeferred();
    const refreshBackendState = vi.fn(() => deferred.promise);

    const policy = createLocalStudioSyncRefreshPolicy({
      refreshBackendState,
    });

    policy.onAssetAdded();
    policy.onConnectionChange(false);
    policy.onConnectionChange(true);
    policy.onAssetAdded();

    expect(refreshBackendState).toHaveBeenCalledTimes(1);

    deferred.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(refreshBackendState).toHaveBeenCalledTimes(2);
  });

  it('retries reconnect refresh with backoff when the first reconnect refresh fails', async () => {
    const retryDelays: number[] = [];
    let refreshAttempt = 0;
    const refreshBackendState = vi.fn(async () => {
      refreshAttempt += 1;
      if (refreshAttempt === 2) {
        throw new Error('temporary reconnect failure');
      }
    });

    const policy = createLocalStudioSyncRefreshPolicy({
      refreshBackendState,
      scheduleRetry: (callback, delayMs) => {
        retryDelays.push(delayMs);
        callback();
      },
    });

    policy.onConnectionChange(false);
    policy.onConnectionChange(true);

    for (let index = 0; index < 8; index += 1) {
      await Promise.resolve();
    }

    expect(refreshBackendState).toHaveBeenCalledTimes(3);
    expect(retryDelays).toEqual([300]);
  });

  it('does not schedule reconnect retry for asset refresh failures', async () => {
    const scheduleRetry = vi.fn((_callback: () => void, _delayMs: number) => {});
    const refreshBackendState = vi.fn(async () => {
      throw new Error('asset refresh failed');
    });

    const policy = createLocalStudioSyncRefreshPolicy({
      refreshBackendState,
      scheduleRetry,
    });

    policy.onAssetAdded();

    await Promise.resolve();
    await Promise.resolve();

    expect(scheduleRetry).toHaveBeenCalledTimes(0);
  });

  it('ignores connected events', () => {
    const refreshBackendState = vi.fn(async () => {});

    const policy = createLocalStudioSyncRefreshPolicy({
      refreshBackendState,
    });

    policy.onConnectionChange(true);

    expect(refreshBackendState).toHaveBeenCalledTimes(0);
  });
});
