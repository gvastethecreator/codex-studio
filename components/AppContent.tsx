import React, { useCallback } from 'react';

import { useHashRouter } from '../hooks/useHashRouter';
import { useImageInputSurface } from '../hooks/useImageInputSurface';
import { useStudioActionConfirmations } from '../hooks/useStudioActionConfirmations';
import { useStudioGallery } from '../hooks/useStudioGallery';
import { useStudioGenerationActions } from '../hooks/useStudioGenerationActions';
import { useStudioJobInspector } from '../hooks/useStudioJobInspector';
import { useStudioNavigation } from '../hooks/useStudioNavigation';
import { useStudioReset } from '../hooks/useStudioReset';
import { useStudioRuntime } from '../hooks/useStudioRuntime';
import { useVaultTransfer } from '../hooks/useVaultTransfer';
import { useStudioViewState } from '../hooks/useStudioViewState';
import { useWorkspaceStrip } from '../hooks/useWorkspaceStrip';

import { startViewTransition } from '../utils/transitionUtils';
import { cancelStudioJob } from '../services/localStudioService';

import type { RecipeId } from '../types';

import {
  AppOverlays,
  type StudioConfirmationOverlayProps,
  type StudioImageOverlaysProps,
  type StudioSystemOverlaysProps,
  type StudioWorkspaceOverlaysProps,
} from './AppOverlays';
import { type RecipePageProps } from './RecipePage';
import { type StudioPageProps } from './StudioPage';
import { StudioGenerationDock } from './shell/StudioGenerationDock';
import { StudioViewport } from './shell/StudioViewport';
import { type ToolbarProps } from './Toolbar';
import { HeaderToolbar } from './HeaderToolbar';
import LiquidBlackBackground from './LiquidBlackBackground';
import ToastContainer from './ToastContainer';
import { useGlobal } from '../contexts/GlobalContext';
import { useGeneration } from '../contexts/GenerationContext';
import { useQueueManager } from '../hooks/useQueueManager';

interface AppContentProps { }

export const AppContent: React.FC<AppContentProps> = () => {
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
  const { sync, onboarding, diagnostics, refreshRuntime } = useStudioRuntime({
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
    studioJobs: sync.studioJobs,
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
    refreshRuntime,
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
  const imageOverlays: StudioImageOverlaysProps = {
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
    isEditorOpen,
    closeEditor,
    imageToEdit,
    handleExecuteEdit,
    isEditingImage,
  };
  const systemOverlays: StudioSystemOverlaysProps = {
    isDebugPanelOpen,
    closeDebugPanel,
    mergedLogs: sync.mergedLogs,
    isDashboardModalOpen,
    closeDashboard,
    batches,
    workspaces,
    studioJobs: sync.studioJobs,
    imagesCount: imagesWithConfig.length,
    selectedJobDetail,
    isLoadingSelectedJob,
    onInspectJob: handleInspectStudioJob,
    onClearSelectedJob: clearSelectedJob,
    handleImportVault: importVault,
    handleDeepScan: sync.recoverOrphanedBatches,
    apiBase: onboarding.apiBase,
    onboardingError: onboarding.error,
    onboardingHealth: diagnostics.health,
    isCheckingOnboarding: onboarding.isChecking,
    isDesktopRuntime: onboarding.isDesktopRuntime,
    isOnboardingOpen: onboarding.isOpen,
    isOnboardingReady: onboarding.isReady,
    isStartingAppServer: onboarding.isStartingAppServer,
    closeOnboarding: () => startViewTransition(() => onboarding.closeOnboarding()),
    completeOnboarding: () => startViewTransition(() => onboarding.completeOnboarding()),
    refreshOnboardingHealth: () => void onboarding.refreshHealth(),
    ensureAppServer: () => void onboarding.ensureAppServer(),
  };
  const workspaceOverlays: StudioWorkspaceOverlaysProps = {
    isTrashModalOpen,
    closeTrash,
    trash,
    restoreFromTrash,
    restoreAllFromTrash: () => requestRestoreAllTrash(trash.length),
    emptyTrash: () => requestEmptyTrash(trash.length),
    isLimitModalOpen,
    handleDismissLimitModal: dismissLimitModal,
    handleDownloadAndClear,
    batchCount: batches.length,
  };
  const confirmationOverlay: StudioConfirmationOverlayProps = {
    pendingConfirmation,
    closeConfirmation,
    confirmPendingAction,
  };
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
  const studioPageProps: StudioPageProps = {
    isModalOpen: modal.isModalOpen,
    workspaces,
    mergedLogs: sync.mergedLogs,
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
    studioJobs,
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
    activeServerJobCount: sync.activeServerJobCount,
    onInspectJob: handleInspectStudioJob,
    diagnostics,
    onResetStudio: requestResetStudio,
    isResettingStudio,
  };
  const toolbarProps: ToolbarProps = {
    generationConfig: config.generationConfig,
    updateConfig: config.updateGenerationConfig,
    updateAttachment: config.updateAttachment,
    onGenerate: handleGenerate,
    isGenerating: pipeline.isGenerating,
    generationStartTime: pipeline.generationStartTime,
    onFileSelect: config.handleFileSelect,
    onFilesDrop: config.handlePastedFiles,
    onRemoveAttachment: config.handleRemoveAttachment,
    isEnhancingPrompt,
    onEnhancePrompt: handleEnhancePrompt,
    setPreviewRatio,
    setIsInteracting: ui.setIsInteractingWithToolbar,
    onOpenEditor: (att) => openEditor(att, openEditorRoute),
    isKeyPopoverOpen: ui.isKeyPopoverOpen,
    onOpenKeySelector: () =>
      startViewTransition(() => ui.setIsKeyPopoverOpen(!ui.isKeyPopoverOpen)),
    onSelectKey: async () => {
      await sync.verifyCodexSession();
      startViewTransition(() => ui.setIsKeyPopoverOpen(false));
    },
    maxAttachments: config.maxAttachments,
  };

  return (
    <div
      className="fixed inset-0 text-white font-sans flex flex-col selection:bg-accent-500/35 selection:text-white overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isBackgroundEnabled && (
        <LiquidBlackBackground
          isGenerating={pipeline.isGenerating}
          activeModel={config.generationConfig.model}
          config={bgConfig}
        />
      )}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {!modal.isModalOpen && !pipeline.isGenerating && (
        <HeaderToolbar
          isGenerating={pipeline.isGenerating}
          workspaces={workspacesWithThumbs}
          activeWorkspaceId={activeWorkspaceId}
          onSwitchWorkspace={(id) => startViewTransition(() => setActiveWorkspace(id))}
          onAddWorkspace={handleAddWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          onRenameWorkspace={handleRenameWorkspace}
          currentView={currentView}
          onViewChange={handleViewChange}
          activeRecipe={recipe.activeRecipe}
          onCloseRecipe={handleCloseRecipe}
          onOpenDashboard={openDashboard}
          onOpenOnboarding={() => startViewTransition(() => onboarding.openOnboarding())}
          onOpenTrash={openTrash}
          trashCount={trash.length}
          onToggleDebug={handleToggleDebugPanel}
          usage={diagnostics.usage}
        />
      )}

      <main
        className="flex-1 relative overflow-hidden z-10 w-full min-h-0"
        onClick={() => {
          ui.setIsInteractingWithToolbar(false);
          ui.setIsKeyPopoverOpen(false);
        }}
      >
        <StudioViewport
          routeView={route.view}
          direction={direction}
          activeRecipe={recipe.activeRecipe}
          recipePageProps={recipePageProps}
          studioPageProps={studioPageProps}
          onSelectRecipe={handleRecipeSelection}
        />
      </main>

      <StudioGenerationDock
        isModalOpen={modal.isModalOpen}
        currentView={route.view}
        activeRecipe={recipe.activeRecipe}
        isDragging={isDragging}
        toolbarProps={toolbarProps}
      />

      <AppOverlays
        imageOverlays={imageOverlays}
        systemOverlays={systemOverlays}
        workspaceOverlays={workspaceOverlays}
        confirmationOverlay={confirmationOverlay}
      />
    </div>
  );
};
