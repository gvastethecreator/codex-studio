import type { Dispatch, SetStateAction } from 'react';

import { startViewTransition } from '../utils/transitionUtils';

import type { HeaderToolbarProps } from '../components/HeaderToolbar';
import type { StudioRuntimeStatusItem } from './studioDiagnostics';

type StartTransition = (callback: () => void) => void;

interface StudioHeaderToolbarViewContext {
  isGenerating: HeaderToolbarProps['isGenerating'];
  currentView: HeaderToolbarProps['currentView'];
  onViewChange: HeaderToolbarProps['onViewChange'];
  activeRecipe: HeaderToolbarProps['activeRecipe'];
  onCloseRecipe: HeaderToolbarProps['onCloseRecipe'];
  usage: HeaderToolbarProps['usage'];
}

interface StudioHeaderToolbarWorkspaceContext {
  workspaces: HeaderToolbarProps['workspaces'];
  activeWorkspaceId: HeaderToolbarProps['activeWorkspaceId'];
  setActiveWorkspace: (workspaceId: string) => void;
  onAddWorkspace: HeaderToolbarProps['onAddWorkspace'];
  onDeleteWorkspace: HeaderToolbarProps['onDeleteWorkspace'];
  onRenameWorkspace: HeaderToolbarProps['onRenameWorkspace'];
}

interface StudioHeaderToolbarOverlayContext {
  onOpenDashboard: HeaderToolbarProps['onOpenDashboard'];
  openOnboarding: () => void;
  onOpenTrash: HeaderToolbarProps['onOpenTrash'];
  trashCount: HeaderToolbarProps['trashCount'];
  onToggleDebug: HeaderToolbarProps['onToggleDebug'];
}

interface StudioHeaderToolbarCommandCenterContext {
  defaultProviderId: HeaderToolbarProps['activeProviderId'] | null | undefined;
  statusItems: StudioRuntimeStatusItem[];
  queueResultPreviews: HeaderToolbarProps['queueResultPreviews'];
  queueJobCount: number;
  activeServerJobCount: number;
  isQueueOpen: HeaderToolbarProps['isQueueOpen'];
  setIsQueueOpen: Dispatch<SetStateAction<boolean>>;
  onOpenSettings: HeaderToolbarProps['onOpenSettings'];
}

export interface BuildStudioHeaderToolbarPropsArgs {
  view: StudioHeaderToolbarViewContext;
  workspace: StudioHeaderToolbarWorkspaceContext;
  overlays: StudioHeaderToolbarOverlayContext;
  commandCenter: StudioHeaderToolbarCommandCenterContext;
  startTransition?: StartTransition;
}

function summarizeRuntimeStatus(
  statusItems: StudioRuntimeStatusItem[],
): HeaderToolbarProps['runtimeStatus'] {
  if (statusItems.length === 0) {
    return { label: 'Checking', tone: 'warning' };
  }

  if (statusItems.some((item) => item.tone === 'danger')) {
    return { label: 'Attention', tone: 'danger' };
  }

  if (statusItems.some((item) => item.tone === 'warning')) {
    return { label: 'Standby', tone: 'warning' };
  }

  return { label: 'Ready', tone: 'success' };
}

/**
 * Centralize header-toolbar actions that need transitions so the shell can
 * expose one stable toolbar interface instead of wiring view/UI glue inline.
 */
export function buildStudioHeaderToolbarProps({
  view,
  workspace,
  overlays,
  commandCenter,
  startTransition = startViewTransition,
}: BuildStudioHeaderToolbarPropsArgs): HeaderToolbarProps {
  return {
    isGenerating: view.isGenerating,
    workspaces: workspace.workspaces,
    activeWorkspaceId: workspace.activeWorkspaceId,
    onSwitchWorkspace: (workspaceId) =>
      startTransition(() => {
        workspace.setActiveWorkspace(workspaceId);
        if (view.currentView !== 'studio') {
          view.onViewChange('studio');
        }
      }),
    onAddWorkspace: workspace.onAddWorkspace,
    onDeleteWorkspace: workspace.onDeleteWorkspace,
    onRenameWorkspace: workspace.onRenameWorkspace,
    currentView: view.currentView,
    onViewChange: view.onViewChange,
    activeRecipe: view.activeRecipe,
    onCloseRecipe: view.onCloseRecipe,
    onOpenDashboard: overlays.onOpenDashboard,
    onOpenOnboarding: () => startTransition(() => overlays.openOnboarding()),
    onOpenTrash: overlays.onOpenTrash,
    trashCount: overlays.trashCount,
    onToggleDebug: overlays.onToggleDebug,
    usage: view.usage,
    activeProviderId: commandCenter.defaultProviderId ?? 'codex',
    runtimeStatus: summarizeRuntimeStatus(commandCenter.statusItems),
    queueResultPreviews: commandCenter.queueResultPreviews,
    queueCount: commandCenter.queueJobCount + commandCenter.activeServerJobCount,
    isQueueOpen: commandCenter.isQueueOpen,
    onToggleQueue: () => commandCenter.setIsQueueOpen((previous) => !previous),
    onOpenSettings: commandCenter.onOpenSettings,
  };
}
