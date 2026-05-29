import { describe, expect, it, vi } from "vite-plus/test";
import { createLocalStudioSyncRefreshPolicy } from "./localStudioSyncRefreshPolicy";

describe("localStudioSyncRefreshPolicy", () => {
  it("triggers catalog refresh when an asset arrives", () => {
    const onCatalogChanged = vi.fn();
    const refreshBackendState = vi.fn(async () => {});

    const policy = createLocalStudioSyncRefreshPolicy({
      onCatalogChanged,
      refreshBackendState,
    });

    policy.onAssetAdded();

    expect(onCatalogChanged).toHaveBeenCalledTimes(1);
    expect(refreshBackendState).toHaveBeenCalledTimes(0);
  });

  it("coalesces disconnect refreshes while a refresh is in flight", async () => {
    let resolveRefresh: (() => void) | null = null;
    const refreshBackendState = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    const policy = createLocalStudioSyncRefreshPolicy({
      refreshBackendState,
    });

    policy.onConnectionChange(false);
    policy.onConnectionChange(false);
    policy.onConnectionChange(false);

    expect(refreshBackendState).toHaveBeenCalledTimes(1);

    resolveRefresh?.();
    await Promise.resolve();
    await Promise.resolve();

    expect(refreshBackendState).toHaveBeenCalledTimes(2);
  });

  it("ignores connected events", () => {
    const refreshBackendState = vi.fn(async () => {});

    const policy = createLocalStudioSyncRefreshPolicy({
      refreshBackendState,
    });

    policy.onConnectionChange(true);

    expect(refreshBackendState).toHaveBeenCalledTimes(0);
  });
});
