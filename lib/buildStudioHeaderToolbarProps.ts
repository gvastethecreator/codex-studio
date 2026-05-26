import { startViewTransition } from '../utils/transitionUtils';

import type { HeaderToolbarProps } from '../components/HeaderToolbar';

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
  activeProviderId: HeaderToolbarProps['activeProviderId'];
  runtimeStatus: HeaderToolbarProps['runtimeStatus'];
  queueResultPreviews: HeaderToolbarProps['queueResultPreviews'];
  queueCount: HeaderToolbarProps['queueCount'];
  isQueueOpen: HeaderToolbarProps['isQueueOpen'];
  onToggleQueue: HeaderToolbarProps['onToggleQueue'];
  onOpenSettings: HeaderToolbarProps['onOpenSettings'];
}

export interface BuildStudioHeaderToolbarPropsArgs {
  view: StudioHeaderToolbarViewContext;
  workspace: StudioHeaderToolbarWorkspaceContext;
  overlays: StudioHeaderToolbarOverlayContext;
  commandCenter: StudioHeaderToolbarCommandCenterContext;
  startTransition?: StartTransition;
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
    activeProviderId: commandCenter.activeProviderId,
    runtimeStatus: commandCenter.runtimeStatus,
    queueResultPreviews: commandCenter.queueResultPreviews,
    queueCount: commandCenter.queueCount,
    isQueueOpen: commandCenter.isQueueOpen,
    onToggleQueue: commandCenter.onToggleQueue,
    onOpenSettings: commandCenter.onOpenSettings,
  };
}
