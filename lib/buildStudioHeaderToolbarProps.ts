import type { Dispatch, SetStateAction } from 'react';

import { startViewTransition } from '../utils/transitionUtils';
import { buildStudioCommandCenterProjection } from './commandCenterProjection';
import { runWorkspaceSwitchLifecycle } from './workspaceLifecycle';

import type { HeaderToolbarProps } from '../components/HeaderToolbar';
import type { StudioRuntimeStatusItem } from './studioDiagnostics';
import type {
  EditableStudioSettings,
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
} from '../packages/shared/src';

type StartTransition = (callback: () => void) => void;

interface StudioHeaderToolbarViewContext {
  isGenerating: HeaderToolbarProps['isGenerating'];
  generationStartTime: HeaderToolbarProps['generationStartTime'];
  currentView: HeaderToolbarProps['currentView'];
  onViewChange: HeaderToolbarProps['onViewChange'];
  activeRecipe: HeaderToolbarProps['activeRecipe'];
  activeRecipeAliasId: HeaderToolbarProps['activeRecipeAliasId'];
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
  onOpenChat: HeaderToolbarProps['onOpenChat'];
  onOpenTrash: HeaderToolbarProps['onOpenTrash'];
  trashCount: HeaderToolbarProps['trashCount'];
  onToggleDebug: HeaderToolbarProps['onToggleDebug'];
}

interface StudioHeaderToolbarCommandCenterContext {
  settings: Pick<EditableStudioSettings, 'defaultProviderId' | 'commandCenterCompactMode'> | null;
  provider: {
    capabilities: GenerationProviderCapabilitiesResponse | null;
    runtimePreflight: GenerationProviderRuntimePreflightResponse | null;
  };
  queue: {
    statusItems: StudioRuntimeStatusItem[];
    queueResultPreviews: HeaderToolbarProps['commandCenter']['queue']['resultPreviews'];
    queueJobCount: number;
    activeServerJobCount: number;
    isQueueOpen: HeaderToolbarProps['isQueueOpen'];
    setIsQueueOpen: Dispatch<SetStateAction<boolean>>;
  };
  actions: {
    onOpenSettings: HeaderToolbarProps['onOpenSettings'];
  };
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
    generationStartTime: view.generationStartTime,
    workspaces: workspace.workspaces,
    activeWorkspaceId: workspace.activeWorkspaceId,
    onSwitchWorkspace: (workspaceId) =>
      startTransition(() => {
        runWorkspaceSwitchLifecycle({
          workspaceId,
          currentView: view.currentView,
          setActiveWorkspace: workspace.setActiveWorkspace,
          onViewChange: view.onViewChange,
        });
      }),
    onAddWorkspace: workspace.onAddWorkspace,
    onDeleteWorkspace: workspace.onDeleteWorkspace,
    onRenameWorkspace: workspace.onRenameWorkspace,
    currentView: view.currentView,
    onViewChange: view.onViewChange,
    activeRecipe: view.activeRecipe,
    activeRecipeAliasId: view.activeRecipeAliasId,
    onCloseRecipe: view.onCloseRecipe,
    onOpenDashboard: overlays.onOpenDashboard,
    onOpenOnboarding: () => startTransition(() => overlays.openOnboarding()),
    onOpenChat: overlays.onOpenChat,
    onOpenTrash: overlays.onOpenTrash,
    trashCount: overlays.trashCount,
    onToggleDebug: overlays.onToggleDebug,
    usage: view.usage,
    commandCenter: buildStudioCommandCenterProjection({
      settings: commandCenter.settings,
      providerCapabilities: commandCenter.provider.capabilities,
      providerRuntimePreflight: commandCenter.provider.runtimePreflight,
      statusItems: commandCenter.queue.statusItems,
      queueResultPreviews: commandCenter.queue.queueResultPreviews,
      queueJobCount: commandCenter.queue.queueJobCount,
      activeServerJobCount: commandCenter.queue.activeServerJobCount,
      isQueueOpen: commandCenter.queue.isQueueOpen,
      isGenerating: view.isGenerating,
    }),
    isQueueOpen: commandCenter.queue.isQueueOpen,
    onToggleQueue: () => commandCenter.queue.setIsQueueOpen((previous) => !previous),
    onOpenSettings: commandCenter.actions.onOpenSettings,
  };
}
