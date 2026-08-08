import React, {
  createContext,
  use,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { usePanelManager } from '../hooks/usePanelManager';
import type { ToastMessage } from '../hooks/useToasts';
import {
  addToastToStore,
  getToastsSnapshot,
  removeToastFromStore,
  subscribeToasts,
} from './toastStore';

export interface ToastUiActionsValue {
  addToast: (
    msg: string,
    type?: 'success' | 'error' | 'info' | 'warning',
    duration?: number,
  ) => void;
  removeToast: (id: string) => void;
  isDebugPanelOpen: boolean;
  toggleDebugPanel: () => void;
  openDebugPanel: () => void;
  closeDebugPanel: () => void;
}

export interface ToastUiListValue {
  toasts: ToastMessage[];
}

const ToastUiActionsContext = createContext<ToastUiActionsValue | undefined>(undefined);

/**
 * Actions + debug panel only. Toast *list* is external-store leaf via useToastList().
 * Parent must not re-render the workspace tree on every toast append.
 */
export const ToastUiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isDebugPanelOpen, toggleDebugPanel, openDebugPanel, closeDebugPanel } = usePanelManager();

  const addToast = useCallback(
    (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 4000) => {
      addToastToStore(msg, type, duration);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    removeToastFromStore(id);
  }, []);

  const actions = useMemo<ToastUiActionsValue>(
    () => ({
      addToast,
      removeToast,
      isDebugPanelOpen,
      toggleDebugPanel,
      openDebugPanel,
      closeDebugPanel,
    }),
    [addToast, removeToast, isDebugPanelOpen, toggleDebugPanel, openDebugPanel, closeDebugPanel],
  );

  return (
    <ToastUiActionsContext.Provider value={actions}>{children}</ToastUiActionsContext.Provider>
  );
};

/** Stable toast actions + debug panel chrome. */
export function useToastUi() {
  const context = use(ToastUiActionsContext);
  if (!context) {
    throw new Error('useToastUi must be used within a ToastUiProvider');
  }
  return context;
}

/** Leaf toast list subscription for ToastContainer only. */
export function useToastList(): ToastUiListValue {
  useToastUi();
  const toasts = useSyncExternalStore(subscribeToasts, getToastsSnapshot, getToastsSnapshot);
  return { toasts };
}
