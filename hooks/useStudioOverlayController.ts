import { startViewTransition } from '../utils/transitionUtils';
import type { GenerationBatch } from '../types';

import type {
  StudioConfirmationOverlayProps,
  StudioImageOverlaysProps,
  StudioOverlayController,
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
  isOpen: StudioSystemOverlaysProps['isDebugPanelOpen'];
  close: StudioSystemOverlaysProps['closeDebugPanel'];
}

interface StudioOverlayDashboardContext {
  isOpen: StudioSystemOverlaysProps['isDashboardModalOpen'];
  close: StudioSystemOverlaysProps['closeDashboard'];
}

interface StudioOverlayActivityContext {
  mergedLogs: StudioSystemOverlaysProps['mergedLogs'];
  studioJobs: StudioSystemOverlaysProps['studioJobs'];
  selectedJobDetail: StudioSystemOverlaysProps['selectedJobDetail'];
  isLoadingSelectedJob: StudioSystemOverlaysProps['isLoadingSelectedJob'];
  onInspectJob: StudioSystemOverlaysProps['onInspectJob'];
  onClearSelectedJob: StudioSystemOverlaysProps['onClearSelectedJob'];
}

interface StudioOverlayVaultContext {
  handleImportVault: StudioSystemOverlaysProps['handleImportVault'];
  handleExportWorkspaceSnapshot: StudioSystemOverlaysProps['handleExportWorkspaceSnapshot'];
  handleDeepScan: StudioSystemOverlaysProps['handleDeepScan'];
}

interface StudioOverlayOnboardingContext {
  apiBase: StudioSystemOverlaysProps['apiBase'];
  error: StudioSystemOverlaysProps['onboardingError'];
  health: StudioSystemOverlaysProps['onboardingHealth'];
  localCodexSession: StudioSystemOverlaysProps['localCodexSession'];
  readiness: StudioSystemOverlaysProps['readiness'];
  isChecking: StudioSystemOverlaysProps['isCheckingOnboarding'];
  isDesktopRuntime: StudioSystemOverlaysProps['isDesktopRuntime'];
  isOpen: StudioSystemOverlaysProps['isOnboardingOpen'];
  isReady: StudioSystemOverlaysProps['isOnboardingReady'];
  isStartingAppServer: StudioSystemOverlaysProps['isStartingAppServer'];
  close: () => void;
  complete: () => void;
  refreshHealth: () => void | Promise<void>;
  ensureAppServer: () => void | Promise<void>;
}

interface StudioOverlaySettingsContext {
  isOpen: StudioSystemOverlaysProps['isSettingsModalOpen'];
  close: StudioSystemOverlaysProps['closeSettings'];
  settings: StudioSystemOverlaysProps['settings'];
  error: StudioSystemOverlaysProps['settingsError'];
  isLoading: StudioSystemOverlaysProps['isLoadingSettings'];
  isSaving: StudioSystemOverlaysProps['isSavingSettings'];
  providerCapabilities: StudioSystemOverlaysProps['providerCapabilities'];
  providerRuntimePreflight: StudioSystemOverlaysProps['providerRuntimePreflight'];
  outputSources: StudioSystemOverlaysProps['outputSources'];
  outputSourceFiles: StudioSystemOverlaysProps['outputSourceFiles'];
  isLoadingOutputSources: StudioSystemOverlaysProps['isLoadingOutputSources'];
  loadingOutputSourceFiles: StudioSystemOverlaysProps['loadingOutputSourceFiles'];
  isRegisteringOutputSource: StudioSystemOverlaysProps['isRegisteringOutputSource'];
  importingOutputSources: StudioSystemOverlaysProps['importingOutputSources'];
  libraryDir: StudioSystemOverlaysProps['settingsLibraryDir'];
  refresh: StudioSystemOverlaysProps['refreshSettings'];
  update: StudioSystemOverlaysProps['updateSettings'];
  registerOutputSource: StudioSystemOverlaysProps['registerOutputSource'];
  loadOutputSourceFiles: StudioSystemOverlaysProps['loadOutputSourceFiles'];
  importOutputSourceFiles: StudioSystemOverlaysProps['importOutputSourceFiles'];
  isBackgroundEnabled: StudioSystemOverlaysProps['isBackgroundEnabled'];
  onToggleBackground: StudioSystemOverlaysProps['onToggleBackground'];
  onResetStudio: StudioSystemOverlaysProps['onResetStudio'];
  isResettingStudio: StudioSystemOverlaysProps['isResettingStudio'];
}

interface StudioOverlayWorkspaceContext {
  catalogVisualBatches: GenerationBatch[];
  workspaces: StudioSystemOverlaysProps['workspaces'];
  trash: StudioWorkspaceOverlaysProps['trash'];
  restoreFromTrash: StudioWorkspaceOverlaysProps['restoreFromTrash'];
  isTrashModalOpen: StudioWorkspaceOverlaysProps['isTrashModalOpen'];
  closeTrash: StudioWorkspaceOverlaysProps['closeTrash'];
  isLimitModalOpen: StudioWorkspaceOverlaysProps['isLimitModalOpen'];
  dismissLimitModal: StudioWorkspaceOverlaysProps['handleDismissLimitModal'];
  handleDownloadAndClear: StudioWorkspaceOverlaysProps['handleDownloadAndClear'];
}

interface StudioOverlayWorkspaceActions {
  requestRestoreAllTrash: (groupCount: number) => void;
  requestEmptyTrash: (groupCount: number) => void;
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
  settings: StudioOverlaySettingsContext;
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
  settings,
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
      isDebugPanelOpen: debugPanel.isOpen,
      closeDebugPanel: debugPanel.close,
      mergedLogs: activity.mergedLogs,
      isDashboardModalOpen: dashboard.isOpen,
      closeDashboard: dashboard.close,
      visualGroupsCount: workspace.catalogVisualBatches.length,
      workspaces: workspace.workspaces,
      studioJobs: activity.studioJobs,
      imagesCount: image.imagesWithConfig.length,
      selectedJobDetail: activity.selectedJobDetail,
      isLoadingSelectedJob: activity.isLoadingSelectedJob,
      onInspectJob: activity.onInspectJob,
      onClearSelectedJob: activity.onClearSelectedJob,
      handleImportVault: vault.handleImportVault,
      handleExportWorkspaceSnapshot: vault.handleExportWorkspaceSnapshot,
      handleDeepScan: vault.handleDeepScan,
      apiBase: onboarding.apiBase,
      onboardingError: onboarding.error,
      onboardingHealth: onboarding.health,
      localCodexSession: onboarding.localCodexSession,
      readiness: onboarding.readiness,
      isCheckingOnboarding: onboarding.isChecking,
      isDesktopRuntime: onboarding.isDesktopRuntime,
      isOnboardingOpen: onboarding.isOpen,
      isOnboardingReady: onboarding.isReady,
      isStartingAppServer: onboarding.isStartingAppServer,
      closeOnboarding: () => startTransition(() => onboarding.close()),
      completeOnboarding: () => startTransition(() => onboarding.complete()),
      refreshOnboardingHealth: () => {
        void onboarding.refreshHealth();
      },
      ensureAppServer: () => {
        void onboarding.ensureAppServer();
      },
      isSettingsModalOpen: settings.isOpen,
      closeSettings: settings.close,
      settings: settings.settings,
      settingsError: settings.error,
      isLoadingSettings: settings.isLoading,
      isSavingSettings: settings.isSaving,
      providerCapabilities: settings.providerCapabilities,
      providerRuntimePreflight: settings.providerRuntimePreflight,
      outputSources: settings.outputSources,
      outputSourceFiles: settings.outputSourceFiles,
      isLoadingOutputSources: settings.isLoadingOutputSources,
      loadingOutputSourceFiles: settings.loadingOutputSourceFiles,
      isRegisteringOutputSource: settings.isRegisteringOutputSource,
      importingOutputSources: settings.importingOutputSources,
      settingsLibraryDir: settings.libraryDir,
      refreshSettings: settings.refresh,
      updateSettings: settings.update,
      registerOutputSource: settings.registerOutputSource,
      loadOutputSourceFiles: settings.loadOutputSourceFiles,
      importOutputSourceFiles: settings.importOutputSourceFiles,
      isBackgroundEnabled: settings.isBackgroundEnabled,
      onToggleBackground: settings.onToggleBackground,
      onResetStudio: settings.onResetStudio,
      isResettingStudio: settings.isResettingStudio,
    },
    workspaceOverlays: {
      isTrashModalOpen: workspace.isTrashModalOpen,
      closeTrash: workspace.closeTrash,
      trash: workspace.trash,
      restoreFromTrash: workspace.restoreFromTrash,
      restoreAllFromTrash: () => workspaceActions.requestRestoreAllTrash(workspace.trash.length),
      emptyTrash: () => workspaceActions.requestEmptyTrash(workspace.trash.length),
      isLimitModalOpen: workspace.isLimitModalOpen,
      handleDismissLimitModal: workspace.dismissLimitModal,
      handleDownloadAndClear: workspace.handleDownloadAndClear,
      visualGroupCount: workspace.catalogVisualBatches.length,
    },
    confirmationOverlay: confirmation,
  };
}

export function useStudioOverlayController(
  args: BuildStudioOverlayControllerArgs,
): StudioOverlayController {
  return buildStudioOverlayController(args);
}
