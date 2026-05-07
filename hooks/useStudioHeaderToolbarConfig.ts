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

export interface BuildStudioHeaderToolbarPropsArgs {
  view: StudioHeaderToolbarViewContext;
  workspace: StudioHeaderToolbarWorkspaceContext;
  overlays: StudioHeaderToolbarOverlayContext;
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
  startTransition = startViewTransition,
}: BuildStudioHeaderToolbarPropsArgs): HeaderToolbarProps {
  return {
    isGenerating: view.isGenerating,
    workspaces: workspace.workspaces,
    activeWorkspaceId: workspace.activeWorkspaceId,
    onSwitchWorkspace: (workspaceId) => startTransition(() => workspace.setActiveWorkspace(workspaceId)),
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
  };
}

export function useStudioHeaderToolbarConfig(
  args: BuildStudioHeaderToolbarPropsArgs,
): HeaderToolbarProps {
  return buildStudioHeaderToolbarProps(args);
}