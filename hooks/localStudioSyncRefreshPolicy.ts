export interface LocalStudioSyncRefreshPolicy {
  onAssetAdded: () => void;
  onConnectionChange: (connected: boolean) => void;
}

interface CreateLocalStudioSyncRefreshPolicyOptions {
  onCatalogChanged?: () => void;
  refreshBackendState: () => Promise<void>;
}

export function createLocalStudioSyncRefreshPolicy({
  onCatalogChanged,
  refreshBackendState,
}: CreateLocalStudioSyncRefreshPolicyOptions): LocalStudioSyncRefreshPolicy {
  let refreshInFlight = false;
  let queuedRefresh = false;

  const requestRefresh = () => {
    if (refreshInFlight) {
      queuedRefresh = true;
      return;
    }

    refreshInFlight = true;
    void refreshBackendState().finally(() => {
      refreshInFlight = false;

      if (!queuedRefresh) return;
      queuedRefresh = false;
      requestRefresh();
    });
  };

  return {
    onAssetAdded: () => {
      onCatalogChanged?.();
    },
    onConnectionChange: (connected: boolean) => {
      if (!connected) {
        requestRefresh();
      }
    },
  };
}
