export interface LocalStudioSyncRefreshPolicy {
  onAssetAdded: () => void;
  onConnectionChange: (connected: boolean) => void;
  onRevisionGap: () => void;
  dispose: () => void;
}

export type LocalStudioSyncRefreshTrigger = 'asset_added' | 'connection_restored' | 'revision_gap';

interface CreateLocalStudioSyncRefreshPolicyOptions {
  refreshBackendState: () => Promise<void>;
  onConnectionRestored?: () => void;
  scheduleRetry?: (callback: () => void, delayMs: number) => unknown;
  cancelRetry?: (handle: unknown) => void;
  maxRetryAttempts?: number;
}

export function createLocalStudioSyncRefreshPolicy({
  refreshBackendState,
  onConnectionRestored,
  scheduleRetry = (callback, delayMs) => {
    return setTimeout(callback, delayMs);
  },
  cancelRetry = (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  maxRetryAttempts = 2,
}: CreateLocalStudioSyncRefreshPolicyOptions): LocalStudioSyncRefreshPolicy {
  let disposed = false;
  let refreshInFlight = false;
  let queuedTrigger: LocalStudioSyncRefreshTrigger | null = null;
  let retryScheduled = false;
  let retryHandle: unknown = null;
  let retryAttempts = 0;
  let lastConnectionState: boolean | null = null;
  let hasConnected = false;

  const triggerPriority: Record<LocalStudioSyncRefreshTrigger, number> = {
    asset_added: 0,
    connection_restored: 1,
    revision_gap: 2,
  };

  const queueTrigger = (trigger: LocalStudioSyncRefreshTrigger) => {
    if (!queuedTrigger || triggerPriority[trigger] > triggerPriority[queuedTrigger]) {
      queuedTrigger = trigger;
    }
  };

  const scheduleRefreshRetry = (
    trigger: Extract<LocalStudioSyncRefreshTrigger, 'connection_restored' | 'revision_gap'>,
  ) => {
    if (disposed || retryScheduled || retryAttempts >= maxRetryAttempts) {
      return;
    }

    retryAttempts += 1;
    retryScheduled = true;
    retryHandle = scheduleRetry(
      () => {
        retryScheduled = false;
        retryHandle = null;
        requestRefresh(trigger);
      },
      300 * 2 ** (retryAttempts - 1),
    );
  };

  const requestRefresh = (_trigger: LocalStudioSyncRefreshTrigger) => {
    if (disposed) return;
    if (refreshInFlight) {
      queueTrigger(_trigger);
      return;
    }

    refreshInFlight = true;
    void refreshBackendState()
      .then(
        () => {
          retryAttempts = 0;
        },
        () => {
          if (_trigger === 'connection_restored' || _trigger === 'revision_gap') {
            scheduleRefreshRetry(_trigger);
          }
        },
      )
      .finally(() => {
        refreshInFlight = false;

        if (!queuedTrigger) return;
        const nextTrigger = queuedTrigger;
        queuedTrigger = null;
        requestRefresh(nextTrigger);
      });
  };

  return {
    onAssetAdded: () => {
      requestRefresh('asset_added');
    },
    onConnectionChange: (connected: boolean) => {
      const previousConnectionState = lastConnectionState;
      lastConnectionState = connected;

      if (connected && hasConnected && previousConnectionState === false) {
        onConnectionRestored?.();
        requestRefresh('connection_restored');
      }
      if (connected) hasConnected = true;
    },
    onRevisionGap: () => {
      requestRefresh('revision_gap');
    },
    dispose: () => {
      disposed = true;
      queuedTrigger = null;
      if (retryScheduled && retryHandle !== null) cancelRetry(retryHandle);
      retryScheduled = false;
      retryHandle = null;
    },
  };
}
