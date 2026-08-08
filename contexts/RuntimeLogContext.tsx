import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { LogEntry } from '../types';
import {
  appendRuntimeLog,
  clearRuntimeLogs,
  getRuntimeLogsSnapshot,
  hydrateRuntimeLogsFromIdb,
  subscribeRuntimeLogs,
} from './runtimeLogStore';

export interface RuntimeLogActionsValue {
  log: (message: string) => void;
  resetLogs: () => void;
}

const RuntimeLogActionsContext = createContext<RuntimeLogActionsValue | undefined>(undefined);

/**
 * Actions-only provider. Must NOT subscribe to the log list (no useSyncExternalStore).
 * Log-list subscription belongs in leaf consumers via useRuntimeLogs().
 */
export const RuntimeLogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => hydrateRuntimeLogsFromIdb(), []);

  const log = useCallback((message: string) => {
    appendRuntimeLog(message);
  }, []);

  const resetLogs = useCallback(() => {
    clearRuntimeLogs();
  }, []);

  // Stable identity: only depends on stable callbacks, never on the log list.
  const actions = useMemo<RuntimeLogActionsValue>(
    () => ({
      log,
      resetLogs,
    }),
    [log, resetLogs],
  );

  return (
    <RuntimeLogActionsContext.Provider value={actions}>
      {children}
    </RuntimeLogActionsContext.Provider>
  );
};

/** Stable actions only — does not re-render when the log list changes. */
export function useRuntimeLogActions() {
  const context = use(RuntimeLogActionsContext);
  if (context === undefined) {
    throw new Error('useRuntimeLogActions must be used within a RuntimeLogProvider');
  }
  return context;
}

/**
 * Log list subscription for display surfaces only (e.g. StudioSystemOverlays).
 * Subscribes via useSyncExternalStore on the external store — not through a parent provider.
 */
export function useRuntimeLogs(): { logs: LogEntry[] } {
  // Ensure provider is mounted (actions context available) so hydrate/actions exist.
  useRuntimeLogActions();
  const logs = useSyncExternalStore(
    subscribeRuntimeLogs,
    getRuntimeLogsSnapshot,
    getRuntimeLogsSnapshot,
  );
  return { logs };
}
