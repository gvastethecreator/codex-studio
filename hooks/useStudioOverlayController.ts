import { startViewTransition } from '../utils/transitionUtils';

import type {
  StudioConfirmationOverlayProps,
  StudioImageOverlaysProps,
  StudioOverlayController,
  StudioSystemOverlayFlags,
  StudioSystemOverlaysProps,
  StudioWorkspaceOverlaysProps,
} from '../components/overlays/types';

interface StudioOverlayImageContext {
  modalImage: StudioImageOverlaysProps['modalImage'];
  imagesWithConfig: StudioImageOverlaysProps['imagesWithConfig'];
  activeGenerationConfig: StudioImageOverlaysProps['activeGenerationConfig'];
  closeModal: StudioImageOverlaysProps['closeModal'];
  handleDelete: StudioImageOverlaysProps['handleDelete'];
  handleGenerate: StudioImageOverlaysProps['handleGenerate'];
  handleAddToContext: StudioImageOverlaysProps['handleAddToContext'];
  handleLoadRecipe: StudioImageOverlaysProps['handleLoadRecipe'];
  handleToggleFavorite: StudioImageOverlaysProps['handleToggleFavorite'];
  setActiveCarouselId: StudioImageOverlaysProps['setActiveCarouselId'];
}

interface StudioOverlayEditorContext {
  isEditorOpen: StudioImageOverlaysProps['isEditorOpen'];
  closeEditor: StudioImageOverlaysProps['closeEditor'];
  imageToEdit: StudioImageOverlaysProps['imageToEdit'];
  handleExecuteEdit: StudioImageOverlaysProps['handleExecuteEdit'];
  isEditingImage: StudioImageOverlaysProps['isEditingImage'];
}

interface StudioOverlayDebugPanelContext {
  isOpen: StudioSystemOverlayFlags['isDebugPanelOpen'];
  close: StudioSystemOverlaysProps['closeDebugPanel'];
}

interface StudioOverlayDashboardContext {
  isOpen: StudioSystemOverlayFlags['isDashboardModalOpen'];
  close: StudioSystemOverlaysProps['closeDashboard'];
}

interface StudioOverlayActivityContext {
  mergedLogs: StudioSystemOverlaysProps['mergedLogs'];
  studioJobs: StudioSystemOverlaysProps['studioJobs'];
  selectedJobDetail: StudioSystemOverlaysProps['selectedJobDetail'];
  isLoadingSelectedJob: StudioSystemOverlayFlags['isLoadingSelectedJob'];
  onInspectJob: StudioSystemOverlaysProps['onInspectJob'];
  onClearSelectedJob: StudioSystemOverlaysProps['onClearSelectedJob'];
  onRetryJob?: StudioSystemOverlaysProps['onRetryJob'];
}

interface StudioOverlayVaultContext {
  handleExportLegacyVisualBatchSnapshot: StudioSystemOverlaysProps['handleExportLegacyVisualBatchSnapshot'];
  handleDeepScan: StudioSystemOverlaysProps['handleDeepScan'];
}

interface StudioOverlayOnboardingContext {
  apiBase: StudioSystemOverlaysProps['apiBase'];
  error: StudioSystemOverlaysProps['onboardingError'];
  health: StudioSystemOverlaysProps['onboardingHealth'];
  localCodexSession: StudioSystemOverlaysProps['localCodexSession'];
  readiness: StudioSystemOverlaysProps['readiness'];
  isChecking: StudioSystemOverlayFlags['isCheckingOnboarding'];
  isDesktopRuntime: StudioSystemOverlayFlags['isDesktopRuntime'];
  isOpen: StudioSystemOverlayFlags['isOnboardingOpen'];
  isReady: StudioSystemOverlayFlags['isOnboardingReady'];
  isStartingAppServer: StudioSystemOverlayFlags['isStartingAppServer'];
  close: () => void;
  complete: () => void;
  refreshHealth: () => void | Promise<void>;
  ensureAppServer: () => void | Promise<void>;
  diagnosticsLibraryDir: string | null;
}

type StudioOverlaySettingsContext = StudioSystemOverlaysProps['settingsModule'];

interface StudioOverlayWorkspaceContext {
  catalogVisualGroupCount: number;
  workspaces: StudioSystemOverlaysProps['workspaces'];
  trash: StudioWorkspaceOverlaysProps['trash'];
  restoreFromTrash: StudioWorkspaceOverlaysProps['restoreFromTrash'];
  isTrashModalOpen: StudioWorkspaceOverlaysProps['isTrashModalOpen'];
  closeTrash: StudioWorkspaceOverlaysProps['closeTrash'];
}

interface StudioOverlayWorkspaceActions {
  requestRestoreAllTrash: (groupCount: number) => void;
  requestEmptyTrash: (groupCount: number) => void;
}

interface StudioShellOverlayChromeContext {
  debugPanel: StudioOverlayDebugPanelContext;
  dashboard: StudioOverlayDashboardContext;
}

interface StudioShellOverlayRuntimeContext {
  mergedLogs: StudioSystemOverlaysProps['mergedLogs'];
  studioJobs: StudioSystemOverlaysProps['studioJobs'];
  onboarding: StudioOverlayOnboardingContext;
}

interface StudioShellOverlayActivityContext {
  selectedJobDetail: StudioSystemOverlaysProps['selectedJobDetail'];
  isLoadingSelectedJob: StudioSystemOverlayFlags['isLoadingSelectedJob'];
  onInspectJob: StudioSystemOverlaysProps['onInspectJob'];
  onClearSelectedJob: StudioSystemOverlaysProps['onClearSelectedJob'];
  onRetryJob?: StudioSystemOverlaysProps['onRetryJob'];
}

type StartTransition = (callback: () => void) => void;

export interface BuildStudioOverlayControllerArgs {
  image: StudioOverlayImageContext;
  editor: StudioOverlayEditorContext;
  debugPanel: StudioOverlayDebugPanelContext;
  dashboard: StudioOverlayDashboardContext;
  activity: StudioOverlayActivityContext;
  vault: StudioOverlayVaultContext;
  onboarding: StudioOverlayOnboardingContext;
  isSettingsModalOpen: boolean;
  settingsModule: StudioOverlaySettingsContext;
  workspace: StudioOverlayWorkspaceContext;
  workspaceActions: StudioOverlayWorkspaceActions;
  confirmation: StudioConfirmationOverlayProps;
  startTransition?: StartTransition;
}

export interface BuildStudioShellOverlayControllerArgs {
  image: StudioOverlayImageContext;
  editor: StudioOverlayEditorContext;
  chrome: StudioShellOverlayChromeContext;
  runtime: StudioShellOverlayRuntimeContext;
  activity: StudioShellOverlayActivityContext;
  vault: StudioOverlayVaultContext;
  isSettingsModalOpen: boolean;
  settingsModule: StudioOverlaySettingsContext;
  workspace: StudioOverlayWorkspaceContext;
  workspaceActions: StudioOverlayWorkspaceActions;
  confirmation: StudioConfirmationOverlayProps;
  startTransition?: StartTransition;
}

/**
 * Consolidate the shell's overlay choreography so AppContent only wires one
 * controller into AppOverlays instead of rebuilding four prop objects inline.
 */
export function buildStudioOverlayController({
  image,
  editor,
  debugPanel,
  dashboard,
  activity,
  vault,
  onboarding,
  isSettingsModalOpen,
  settingsModule,
  workspace,
  workspaceActions,
  confirmation,
  startTransition = startViewTransition,
}: BuildStudioOverlayControllerArgs): StudioOverlayController {
  return {
    imageOverlays: {
      modalImage: image.modalImage,
      imagesWithConfig: image.imagesWithConfig,
      activeGenerationConfig: image.activeGenerationConfig,
      closeModal: image.closeModal,
      handleDelete: image.handleDelete,
      handleGenerate: image.handleGenerate,
      handleAddToContext: image.handleAddToContext,
      handleLoadRecipe: image.handleLoadRecipe,
      handleToggleFavorite: image.handleToggleFavorite,
      setActiveCarouselId: image.setActiveCarouselId,
      isEditorOpen: editor.isEditorOpen,
      closeEditor: editor.closeEditor,
      imageToEdit: editor.imageToEdit,
      handleExecuteEdit: editor.handleExecuteEdit,
      isEditingImage: editor.isEditingImage,
    },
    systemOverlays: {
      flags: {
        isDebugPanelOpen: debugPanel.isOpen,
        isDashboardModalOpen: dashboard.isOpen,
        isLoadingSelectedJob: activity.isLoadingSelectedJob,
        isCheckingOnboarding: onboarding.isChecking,
        isDesktopRuntime: onboarding.isDesktopRuntime,
        isOnboardingOpen: onboarding.isOpen,
        isOnboardingReady: onboarding.isReady,
        isStartingAppServer: onboarding.isStartingAppServer,
        isSettingsModalOpen,
        isLoadingSettings: settingsModule.settingsDomain.isLoading,
        isSavingSettings: settingsModule.settingsDomain.isSaving,
        isLoadingOutputSources: settingsModule.outputSourcesDomain.isLoadingOutputSources,
        isRegisteringOutputSource: settingsModule.outputSourcesDomain.isRegisteringOutputSource,
        isBackgroundEnabled: settingsModule.isBackgroundEnabled,
        isResettingStudio: settingsModule.isResettingStudio,
      },
      closeDebugPanel: debugPanel.close,
      mergedLogs: activity.mergedLogs,
      closeDashboard: dashboard.close,
      visualGroupsCount: workspace.catalogVisualGroupCount,
      workspaces: workspace.workspaces,
      studioJobs: activity.studioJobs,
      imagesCount: image.imagesWithConfig.length,
      selectedJobDetail: activity.selectedJobDetail,
      onInspectJob: activity.onInspectJob,
      onClearSelectedJob: activity.onClearSelectedJob,
      onRetryJob: activity.onRetryJob,
      handleExportLegacyVisualBatchSnapshot: vault.handleExportLegacyVisualBatchSnapshot,
      handleDeepScan: vault.handleDeepScan,
      apiBase: onboarding.apiBase,
      onboardingError: onboarding.error,
      onboardingHealth: onboarding.health,
      localCodexSession: onboarding.localCodexSession,
      readiness: onboarding.readiness,
      closeOnboarding: () => startTransition(() => onboarding.close()),
      completeOnboarding: () => startTransition(() => onboarding.complete()),
      refreshOnboardingHealth: () => {
        void onboarding.refreshHealth();
      },
      ensureAppServer: () => {
        void onboarding.ensureAppServer();
      },
      settingsModule: {
        ...settingsModule,
        libraryDir:
          settingsModule.libraryDir ??
          onboarding.diagnosticsLibraryDir ??
          onboarding.health?.libraryDir ??
          null,
      },
    },
    workspaceOverlays: {
      isTrashModalOpen: workspace.isTrashModalOpen,
      closeTrash: workspace.closeTrash,
      trash: workspace.trash,
      restoreFromTrash: workspace.restoreFromTrash,
      restoreAllFromTrash: () => workspaceActions.requestRestoreAllTrash(workspace.trash.length),
      emptyTrash: () => workspaceActions.requestEmptyTrash(workspace.trash.length),
    },
    confirmationOverlay: confirmation,
  };
}

export function buildStudioShellOverlayController({
  image,
  editor,
  chrome,
  runtime,
  activity,
  vault,
  isSettingsModalOpen,
  settingsModule,
  workspace,
  workspaceActions,
  confirmation,
  startTransition,
}: BuildStudioShellOverlayControllerArgs): StudioOverlayController {
  return buildStudioOverlayController({
    image,
    editor,
    debugPanel: chrome.debugPanel,
    dashboard: chrome.dashboard,
    activity: {
      mergedLogs: runtime.mergedLogs,
      studioJobs: runtime.studioJobs,
      selectedJobDetail: activity.selectedJobDetail,
      isLoadingSelectedJob: activity.isLoadingSelectedJob,
      onInspectJob: activity.onInspectJob,
      onClearSelectedJob: activity.onClearSelectedJob,
      onRetryJob: activity.onRetryJob,
    },
    vault,
    onboarding: runtime.onboarding,
    isSettingsModalOpen,
    settingsModule,
    workspace,
    workspaceActions,
    confirmation,
    startTransition,
  });
}

export function useStudioOverlayController(
  args: BuildStudioOverlayControllerArgs,
): StudioOverlayController {
  return buildStudioOverlayController(args);
}
