import React, { type ReactNode } from 'react';
import { ToastUiProvider, useToastList, useToastUi } from './ToastUiContext';
import { RuntimeLogProvider, useRuntimeLogActions, useRuntimeLogs } from './RuntimeLogContext';
import { WorkspaceProvider, useWorkspaceState } from './WorkspaceContext';

/**
 * Compatibility facade over split contexts.
 * Prefer useWorkspaceState / useRuntimeLogActions / useRuntimeLogs / useToastUi
 * so consumers only re-render for the domains they subscribe to.
 */
export function useGlobal() {
  const workspace = useWorkspaceState();
  const { log, resetLogs } = useRuntimeLogActions();
  // Leaf subscription: only re-renders useGlobal() callers, not the provider tree.
  const { logs } = useRuntimeLogs();
  const toastUi = useToastUi();
  const { toasts } = useToastList();

  return {
    logs,
    log,
    workspaces: workspace.workspaces,
    createWorkspace: workspace.createWorkspace,
    deleteWorkspace: workspace.deleteWorkspace,
    renameWorkspace: workspace.renameWorkspace,
    activeWorkspaceId: workspace.activeWorkspaceId,
    setActiveWorkspace: workspace.setActiveWorkspace,
    resetStudioState: () => {
      workspace.resetWorkspaces();
      resetLogs();
    },
    toasts,
    addToast: toastUi.addToast,
    removeToast: toastUi.removeToast,
    isDebugPanelOpen: toastUi.isDebugPanelOpen,
    toggleDebugPanel: toastUi.toggleDebugPanel,
    openDebugPanel: toastUi.openDebugPanel,
    closeDebugPanel: toastUi.closeDebugPanel,
  };
}

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ToastUiProvider>
      <RuntimeLogProvider>
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </RuntimeLogProvider>
    </ToastUiProvider>
  );
};

export { useWorkspaceState } from './WorkspaceContext';
export { useRuntimeLogActions, useRuntimeLogs } from './RuntimeLogContext';
export { useToastUi, useToastList } from './ToastUiContext';
