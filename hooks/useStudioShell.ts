import { useCallback } from 'react';

import type { HeaderToolbarProps } from '../components/HeaderToolbar';
import type { StudioOverlayController } from '../components/AppOverlays';
import type { RecipePageProps } from '../components/RecipePage';
import type { ToolbarProps } from '../components/Toolbar';
import type { BackgroundConfig, RecipeId } from '../types';
import type { ToastMessage } from './useToasts';
import { useGlobal } from '../contexts/GlobalContext';
import { useGeneration } from '../contexts/GenerationContext';
import { useHashRouter, type AppPageView } from './useHashRouter';
import { useImageInputSurface } from './useImageInputSurface';
import { useStudioActionConfirmations } from './useStudioActionConfirmations';
import { useStudioGallery } from './useStudioGallery';
import { useStudioGenerationActions } from './useStudioGenerationActions';
import { useStudioHeaderToolbarConfig } from './useStudioHeaderToolbarConfig';
import { useStudioJobInspector } from './useStudioJobInspector';
import { useStudioNavigation } from './useStudioNavigation';
import { useStudioOverlayController } from './useStudioOverlayController';
import { useStudioPageController, type StudioPageController } from './useStudioPageController';
import { useStudioReset } from './useStudioReset';
import { useStudioRuntime } from './useStudioRuntime';
import { useStudioViewState } from './useStudioViewState';
import { useVaultTransfer } from './useVaultTransfer';
import { useWorkspaceStrip } from './useWorkspaceStrip';
import { useGenerationToolbarConfig } from './useGenerationToolbarConfig';
import { useQueueManager } from './useQueueManager';
import { cancelStudioJob } from '../services/localStudioService';

export interface StudioShellController {
  root: {
    onDragOver: ReturnType<typeof useImageInputSurface>['handleDragOver'];
    onDragLeave: ReturnType<typeof useImageInputSurface>['handleDragLeave'];
    onDrop: ReturnType<typeof useImageInputSurface>['handleDrop'];
    onMainClick: () => void;
  };
  background: {
    isGenerating: boolean;
    activeModel: ReturnType<typeof useGeneration>['config']['generationConfig']['model'];
    config: BackgroundConfig;
  } | null;
  toasts: {
    items: ToastMessage[];
    onDismiss: (id: string) => void;
  };
  headerToolbar: {
    isVisible: boolean;
    props: HeaderToolbarProps;
  };
  viewport: {
    routeView: AppPageView;
    direction: number;
    activeRecipe: RecipeId | null;
    recipePageProps: Omit<RecipePageProps, 'activeRecipe'>;
    studioPageController: StudioPageController;
    onSelectRecipe: (recipeId: RecipeId) => void;
  };
  generationDock: {
    isModalOpen: boolean;
    currentView: AppPageView;
    activeRecipe: RecipeId | null;
    isDragging: boolean;
    toolbarProps: ToolbarProps;
  };
  overlays: StudioOverlayController;
}

/**
 * Materialize the full Studio Shell from context + runtime seams so AppContent
 * only renders the shell instead of stitching the whole Studio inline.
 */
export function useStudioShell(): StudioShellController {
  const {
    logs,
    log,
    workspaces,
    createWorkspace,
    deleteWorkspace,
    renameWorkspace,
    activeWorkspaceId,
    setActiveWorkspace,
    batches,
    mergeBatches,
    replaceBatches,
    archiveBatches,
    deleteImage,
    deleteImages,
    toggleImageFavorite,
    clearWorkspace,
    clearAllBatches,
    resetStudioState,
    trash,
    restoreFromTrash,
    restoreAllFromTrash,
    emptyTrash,
    isBackgroundEnabled,
    setBackgroundEnabled,
    bgConfig,
    toasts,
    removeToast,
    addToast,
    isDebugPanelOpen,
    openDebugPanel,
    closeDebugPanel,
  } = useGlobal();

  const {
    route,
    navigateToStudio,
    navigateToRecipes,
    navigateToRecipe,
    openEditor: openEditorRoute,
    openModal: openModalRoute,
    closeOverlay,
  } = useHashRouter();

  const { config, pipeline, recipe, ui, modal } = useGeneration();

  const handleCancelPersistentJob = useCallback(
    async (jobId: string) => {
      const job = await cancelStudioJob(jobId);
      addToast(job.status === 'cancelled' ? 'Backend job cancelled' : 'Cancellation requested', 'info');
    },
    [addToast],
  );

  const { jobs, enqueue, retry, cancelJob, removeJob, clearCompleted, resetQueue, isResting } =
    useQueueManager({
      executeGeneration: pipeline.executeGeneration,
      isGenerating: pipeline.isGenerating,
      addToast,
      cancelPersistentJob: handleCancelPersistentJob,
    });

  const studioRuntime = useStudioRuntime({
    logs,
    log,
    batches,
    mergeBatches,
    addToast,
    shouldAutoOpen: batches.length === 0,
  });

  const {
    selectedStudioJobId,
    selectedJobDetail,
    isLoadingSelectedJob,
    inspectStudioJob,
    clearSelectedJob,
  } = useStudioJobInspector({
    studioJobs: studioRuntime.activity.studioJobs,
    addToast,
  });

  const { importVault, exportVault, downloadAndClearWorkspace } = useVaultTransfer({
    batches,
    replaceBatches,
    archiveBatches,
    clearAllBatches,
    addToast,
    log,
  });

  const {
    isQueueOpen,
    setIsQueueOpen,
    isEditorOpen,
    setIsEditorOpen,
    imageToEdit,
    setImageToEdit,
    previewRatio,
    setPreviewRatio,
    isDashboardModalOpen,
    openDashboard,
    closeDashboard,
    isTrashModalOpen,
    openTrash,
    closeTrash,
    isLimitModalOpen,
    openEditor,
    closeEditor,
    dismissLimitModal,
    handleDownloadAndClear,
    resetViewState,
  } = useStudioViewState({
    batchCount: batches.length,
    downloadAndClearWorkspace,
    closeOverlay,
  });

  const clearStudioUiState = useCallback(() => {
    recipe.setActiveRecipe(null);
    ui.setIsInteractingWithToolbar(false);
    ui.setIsKeyPopoverOpen(false);
    modal.closeModal();
    navigateToStudio();
    clearSelectedJob();
    resetViewState();
  }, [clearSelectedJob, modal, navigateToStudio, recipe, resetViewState, ui]);

  const {
    direction,
    currentView,
    handleViewChange,
    handleRecipeSelection,
    handleCloseRecipe,
    handleOpenModal,
    handleCloseModal,
  } = useStudioNavigation({
    route,
    activeRecipe: recipe.activeRecipe,
    setActiveRecipe: recipe.setActiveRecipe,
    modalImage: modal.modalImage,
    isModalOpen: modal.isModalOpen,
    openModal: modal.openModal,
    closeModal: modal.closeModal,
    imageToEdit,
    isEditorOpen,
    setIsEditorOpen,
    setImageToEdit,
    navigateToStudio,
    navigateToRecipes,
    navigateToRecipe,
    openModalRoute,
    closeOverlay,
  });

  const {
    isEnhancingPrompt,
    isEditingImage,
    handleGenerate,
    handleEnhancePrompt,
    handleExecuteEdit,
    handleLoadRecipe,
    resetGenerationUi,
  } = useStudioGenerationActions({
    generationConfig: config.generationConfig,
    setGenerationConfig: config.setGenerationConfig,
    updateGenerationConfig: config.updateGenerationConfig,
    executeEdit: pipeline.executeEdit,
    enqueue,
    addToast,
    closeModal: handleCloseModal,
    closeOverlay,
    isModalOpen: modal.isModalOpen,
    onRecipeSelection: handleRecipeSelection,
    onViewChange: handleViewChange,
    onEditSettled: () => {
      setIsEditorOpen(false);
      setImageToEdit(null);
    },
  });

  const { isResettingStudio, resetStudio } = useStudioReset({
    addToast,
    resetStudioState,
    resetQueue,
    refreshRuntime: studioRuntime.maintenance.refreshRuntime,
    clearGenerationState: resetGenerationUi,
    clearUiState: clearStudioUiState,
  });

  const {
    pendingConfirmation,
    closeConfirmation,
    confirmPendingAction,
    requestClearWorkspace,
    requestDeleteWorkspace,
    requestRestoreAllTrash,
    requestEmptyTrash,
    requestResetStudio,
  } = useStudioActionConfirmations({
    clearWorkspace,
    deleteWorkspace,
    resetStudio,
    restoreAllFromTrash,
    emptyTrash,
  });

  const {
    workspacesWithThumbs,
    handleAddWorkspace,
    handleDeleteWorkspace,
    handleRenameWorkspace,
  } = useWorkspaceStrip({
    workspaces,
    batches,
    createWorkspace,
    deleteWorkspace,
    renameWorkspace,
    addToast,
    onRequestDeleteWorkspace: requestDeleteWorkspace,
  });

  const handleInspectStudioJob = useCallback(
    (jobId: string) => {
      inspectStudioJob(jobId);
      openDebugPanel();
    },
    [inspectStudioJob, openDebugPanel],
  );

  const handleToggleDebugPanel = useCallback(() => {
    if (isDebugPanelOpen) {
      closeDebugPanel();
      return;
    }

    clearSelectedJob();
    openDebugPanel();
  }, [clearSelectedJob, closeDebugPanel, isDebugPanelOpen, openDebugPanel]);

  const {
    allImages,
    imagesWithConfig,
    selectedImageIds,
    handleSelectionChange,
    handleDelete,
    handleDeleteSelected,
    handleSelectAll,
    handleDeselectAll,
    handleToggleFavorite,
    handleClearWorkspace,
  } = useStudioGallery({
    batches,
    activeWorkspaceId,
    deleteImage,
    deleteImages,
    toggleImageFavorite,
    clearWorkspace,
    log,
    modalImage: modal.modalImage,
    closeModal: handleCloseModal,
    onRequestClearWorkspace: requestClearWorkspace,
  });

  const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useImageInputSurface({
    onFiles: config.handlePastedFiles,
  });

  const overlayController = useStudioOverlayController({
    image: {
      modalImage: modal.modalImage,
      imagesWithConfig,
      activeGenerationConfig: pipeline.activeGenerationConfig,
      closeModal: handleCloseModal,
      handleDelete,
      handleGenerate,
      handleAddToContext: config.handleAddToContext,
      handleLoadRecipe,
      handleToggleFavorite,
      setActiveCarouselId: modal.setActiveCarouselId,
    },
    editor: {
      isEditorOpen,
      closeEditor,
      imageToEdit,
      handleExecuteEdit,
      isEditingImage,
    },
    debugPanel: {
      isOpen: isDebugPanelOpen,
      close: closeDebugPanel,
    },
    dashboard: {
      isOpen: isDashboardModalOpen,
      close: closeDashboard,
    },
    activity: {
      mergedLogs: studioRuntime.activity.mergedLogs,
      studioJobs: studioRuntime.activity.studioJobs,
      selectedJobDetail,
      isLoadingSelectedJob,
      onInspectJob: handleInspectStudioJob,
      onClearSelectedJob: clearSelectedJob,
    },
    vault: {
      handleImportVault: importVault,
      handleDeepScan: studioRuntime.maintenance.recoverWorkspace,
    },
    onboarding: {
      apiBase: studioRuntime.onboarding.apiBase,
      error: studioRuntime.onboarding.error,
      health: studioRuntime.onboarding.health,
      localCodexSession: studioRuntime.status.localCodexSession,
      readiness: studioRuntime.status.readiness,
      isChecking: studioRuntime.onboarding.isChecking,
      isDesktopRuntime: studioRuntime.onboarding.isDesktopRuntime,
      isOpen: studioRuntime.onboarding.isOpen,
      isReady: studioRuntime.onboarding.isReady,
      isStartingAppServer: studioRuntime.onboarding.isStartingAppServer,
      close: studioRuntime.onboarding.close,
      complete: studioRuntime.onboarding.complete,
      refreshHealth: studioRuntime.onboarding.refreshHealth,
      ensureAppServer: studioRuntime.onboarding.ensureAppServer,
    },
    workspace: {
      batches,
      workspaces,
      trash,
      restoreFromTrash,
      isTrashModalOpen,
      closeTrash,
      isLimitModalOpen,
      dismissLimitModal,
      handleDownloadAndClear,
    },
    workspaceActions: {
      requestRestoreAllTrash,
      requestEmptyTrash,
    },
    confirmation: {
      pendingConfirmation,
      closeConfirmation,
      confirmPendingAction,
    },
  });

  const recipePageProps: Omit<RecipePageProps, 'activeRecipe'> = {
    generationConfig: config.generationConfig,
    updateGenerationConfig: config.updateGenerationConfig,
    updateAttachment: config.updateAttachment,
    handlePastedFiles: config.handlePastedFiles,
    handleGenerate,
    isGenerating: pipeline.isGenerating,
    imagesWithConfig,
    openModal: handleOpenModal,
    handleAddToContext: config.handleAddToContext,
  };

  const studioPageController = useStudioPageController({
    isModalOpen: modal.isModalOpen,
    workspaces,
    mergedLogs: studioRuntime.activity.mergedLogs,
    batchesCount: batches.length,
    allImages,
    imagesWithConfig,
    selectedImageIds,
    activeWorkspaceId,
    openModal: handleOpenModal,
    handleSelectionChange,
    handleGenerate,
    handleAddToContext: config.handleAddToContext,
    handleLoadRecipe,
    handleDelete,
    handleToggleFavorite,
    isGenerating: pipeline.isGenerating,
    transitioningImageId: modal.transitioningImageId,
    activeModalImageId: modal.activeCarouselId,
    handleSelectAll,
    handleDeselectAll,
    handleDeleteSelected,
    handleClearWorkspace,
    previewRatio,
    generationAspectRatio: config.generationConfig.aspectRatio,
    isInteractingWithToolbar: ui.isInteractingWithToolbar,
    isQueueOpen,
    setIsQueueOpen,
    jobs,
    studioJobs: studioRuntime.activity.studioJobs,
    selectedStudioJobId,
    retry,
    cancelJob,
    cancelPersistentJob: (jobId) => void handleCancelPersistentJob(jobId),
    removeJob,
    clearCompleted,
    isResting,
    exportBatches: exportVault,
    handleImportVault: importVault,
    isBackgroundEnabled,
    setBackgroundEnabled,
    activeServerJobCount: studioRuntime.activity.activeServerJobCount,
    onInspectJob: handleInspectStudioJob,
    diagnostics: studioRuntime.status.diagnostics,
    onResetStudio: requestResetStudio,
    isResettingStudio,
  });

  const toolbarProps = useGenerationToolbarConfig({
    config: {
      generationConfig: config.generationConfig,
      updateConfig: config.updateGenerationConfig,
      updateAttachment: config.updateAttachment,
      onFileSelect: config.handleFileSelect,
      onFilesDrop: config.handlePastedFiles,
      onRemoveAttachment: config.handleRemoveAttachment,
      maxAttachments: config.maxAttachments,
    },
    actions: {
      onGenerate: handleGenerate,
      isGenerating: pipeline.isGenerating,
      generationStartTime: pipeline.generationStartTime,
      isEnhancingPrompt,
      onEnhancePrompt: handleEnhancePrompt,
    },
    ui: {
      setPreviewRatio,
      setIsInteracting: ui.setIsInteractingWithToolbar,
      isKeyPopoverOpen: ui.isKeyPopoverOpen,
      setIsKeyPopoverOpen: ui.setIsKeyPopoverOpen,
    },
    editor: {
      openEditor,
      openEditorRoute,
    },
    sync: {
      verifyCodexSession: studioRuntime.maintenance.verifyCodexSession,
    },
  });

  const headerToolbarProps = useStudioHeaderToolbarConfig({
    view: {
      isGenerating: pipeline.isGenerating,
      currentView,
      onViewChange: handleViewChange,
      activeRecipe: recipe.activeRecipe,
      onCloseRecipe: handleCloseRecipe,
      usage: studioRuntime.status.diagnostics.usage,
    },
    workspace: {
      workspaces: workspacesWithThumbs,
      activeWorkspaceId,
      setActiveWorkspace,
      onAddWorkspace: handleAddWorkspace,
      onDeleteWorkspace: handleDeleteWorkspace,
      onRenameWorkspace: handleRenameWorkspace,
    },
    overlays: {
      onOpenDashboard: openDashboard,
      openOnboarding: studioRuntime.onboarding.open,
      onOpenTrash: openTrash,
      trashCount: trash.length,
      onToggleDebug: handleToggleDebugPanel,
    },
  });

  return {
    root: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      onMainClick: () => {
        ui.setIsInteractingWithToolbar(false);
        ui.setIsKeyPopoverOpen(false);
      },
    },
    background: isBackgroundEnabled
      ? {
          isGenerating: pipeline.isGenerating,
          activeModel: config.generationConfig.model,
          config: bgConfig,
        }
      : null,
    toasts: {
      items: toasts,
      onDismiss: removeToast,
    },
    headerToolbar: {
      isVisible: !modal.isModalOpen && !pipeline.isGenerating,
      props: headerToolbarProps,
    },
    viewport: {
      routeView: route.view,
      direction,
      activeRecipe: recipe.activeRecipe,
      recipePageProps,
      studioPageController,
      onSelectRecipe: handleRecipeSelection,
    },
    generationDock: {
      isModalOpen: modal.isModalOpen,
      currentView: route.view,
      activeRecipe: recipe.activeRecipe,
      isDragging,
      toolbarProps,
    },
    overlays: overlayController,
  };
}
