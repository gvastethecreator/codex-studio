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

  it('ignores connected events', () => {
    const refreshBackendState = vi.fn(async () => {});

    const policy = createLocalStudioSyncRefreshPolicy({
      refreshBackendState,
    });

    policy.onConnectionChange(true);

    expect(refreshBackendState).toHaveBeenCalledTimes(0);
  });
});
