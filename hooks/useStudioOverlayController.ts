import { startViewTransition } from '../utils/transitionUtils';

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
  handleDeepScan: StudioSystemOverlaysProps['handleDeepScan'];
}

interface StudioOverlayOnboardingContext {
  apiBase: StudioSystemOverlaysProps['apiBase'];
  error: StudioSystemOverlaysProps['onboardingError'];
  health: StudioSystemOverlaysProps['onboardingHealth'];
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

interface StudioOverlayWorkspaceContext {
  batches: StudioSystemOverlaysProps['batches'];
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
  requestRestoreAllTrash: (batchCount: number) => void;
  requestEmptyTrash: (batchCount: number) => void;
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
      batches: workspace.batches,
      workspaces: workspace.workspaces,
      studioJobs: activity.studioJobs,
      imagesCount: image.imagesWithConfig.length,
      selectedJobDetail: activity.selectedJobDetail,
      isLoadingSelectedJob: activity.isLoadingSelectedJob,
      onInspectJob: activity.onInspectJob,
      onClearSelectedJob: activity.onClearSelectedJob,
      handleImportVault: vault.handleImportVault,
      handleDeepScan: vault.handleDeepScan,
      apiBase: onboarding.apiBase,
      onboardingError: onboarding.error,
      onboardingHealth: onboarding.health,
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
      batchCount: workspace.batches.length,
    },
    confirmationOverlay: confirmation,
  };
}

export function useStudioOverlayController(
  args: BuildStudioOverlayControllerArgs,
): StudioOverlayController {
  return buildStudioOverlayController(args);
}