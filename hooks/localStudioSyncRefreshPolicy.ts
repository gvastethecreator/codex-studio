export interface LocalStudioSyncRefreshPolicy {
  onAssetAdded: () => void;
  onConnectionChange: (connected: boolean) => void;
}

export type LocalStudioSyncRefreshTrigger =
  | 'asset_added'
  | 'connection_lost'
  | 'connection_restored';

interface CreateLocalStudioSyncRefreshPolicyOptions {
  refreshBackendState: () => Promise<void>;
  scheduleRetry?: (callback: () => void, delayMs: number) => void;
}

export function createLocalStudioSyncRefreshPolicy({
  refreshBackendState,
  scheduleRetry = (callback, delayMs) => {
    setTimeout(callback, delayMs);
  },
}: CreateLocalStudioSyncRefreshPolicyOptions): LocalStudioSyncRefreshPolicy {
  let refreshInFlight = false;
  let queuedTrigger: LocalStudioSyncRefreshTrigger | null = null;
  let reconnectRetryScheduled = false;
  let lastConnectionState: boolean | null = null;

  const triggerPriority: Record<LocalStudioSyncRefreshTrigger, number> = {
    asset_added: 0,
    connection_lost: 1,
    connection_restored: 2,
  };

  const queueTrigger = (trigger: LocalStudioSyncRefreshTrigger) => {
    if (!queuedTrigger || triggerPriority[trigger] > triggerPriority[queuedTrigger]) {
      queuedTrigger = trigger;
    }
  };

  const scheduleReconnectRetry = () => {
    if (reconnectRetryScheduled) {
      return;
    }

    reconnectRetryScheduled = true;
    scheduleRetry(() => {
      reconnectRetryScheduled = false;
      requestRefresh('connection_restored');
    }, 300);
  };

  const requestRefresh = (_trigger: LocalStudioSyncRefreshTrigger) => {
    if (refreshInFlight) {
      queueTrigger(_trigger);
      return;
    }

    refreshInFlight = true;
    void refreshBackendState()
      .catch(() => {
        if (_trigger === 'connection_restored') {
          scheduleReconnectRetry();
        }
      })
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

      if (!connected) {
        requestRefresh('connection_lost');
        return;
      }

      if (previousConnectionState === false && connected) {
        requestRefresh('connection_restored');
      }
    },
  };
}
