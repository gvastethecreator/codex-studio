import React, { useCallback } from 'react';

import { useHashRouter } from '../hooks/useHashRouter';
import { useImageInputSurface } from '../hooks/useImageInputSurface';
import { useStudioDiagnostics } from '../hooks/useStudioDiagnostics';
import { useStudioGallery } from '../hooks/useStudioGallery';
import { useStudioGenerationActions } from '../hooks/useStudioGenerationActions';
import { useStudioJobInspector } from '../hooks/useStudioJobInspector';
import { useStudioNavigation } from '../hooks/useStudioNavigation';
import { useStudioReset } from '../hooks/useStudioReset';
import { useVaultTransfer } from '../hooks/useVaultTransfer';
import { useStudioViewState } from '../hooks/useStudioViewState';
import { useWorkspaceStrip } from '../hooks/useWorkspaceStrip';

import { startViewTransition } from '../utils/transitionUtils';
import { cancelStudioJob } from '../services/localStudioService';

import type { RecipeId } from '../types';

import {
  AppOverlays,
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
import { useStudioOnboarding } from '../hooks/useStudioOnboarding';
import { useLocalStudioSync } from '../hooks/useLocalStudioSync';

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
  const {
    studioJobs,
    mergedLogs,
    activeServerJobCount,
    isBackendConnected,
    verifyCodexSession,
    recoverOrphanedBatches,
  } = useLocalStudioSync({
    logs,
    log,
    batches,
    mergeBatches,
    addToast,
  });
  const {
    apiBase,
    closeOnboarding,
    completeOnboarding,
    ensureAppServer,
    error: onboardingError,
    health: onboardingHealth,
    isChecking: isCheckingOnboarding,
    isDesktopRuntime,
    isOpen: isOnboardingOpen,
    isReady: isOnboardingReady,
    isStartingAppServer,
    openOnboarding,
    refreshHealth: refreshOnboardingHealth,
  } = useStudioOnboarding({
    log,
    addToast,
    shouldAutoOpen: batches.length === 0,
  });
  const { systemHealth, codexAccountStatus, hasFetchedDiagnostics, refreshDiagnostics } =
    useStudioDiagnostics({
      initialHealth: onboardingHealth,
    });

  const effectiveStudioHealth = systemHealth ?? onboardingHealth;
  const {
    selectedStudioJobId,
    selectedJobDetail,
    isLoadingSelectedJob,
    inspectStudioJob,
    clearSelectedJob,
  } = useStudioJobInspector({
    studioJobs,
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
    refreshOnboardingHealth,
    refreshDiagnostics,
    clearGenerationState: resetGenerationUi,
    clearUiState: clearStudioUiState,
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
    mergedLogs,
    isDashboardModalOpen,
    closeDashboard,
    batches,
    workspaces,
    studioJobs,
    imagesCount: imagesWithConfig.length,
    selectedJobDetail,
    isLoadingSelectedJob,
    onInspectJob: handleInspectStudioJob,
    onClearSelectedJob: clearSelectedJob,
    handleImportVault: importVault,
    handleDeepScan: recoverOrphanedBatches,
    apiBase,
    onboardingError,
    onboardingHealth: effectiveStudioHealth,
    isCheckingOnboarding,
    isDesktopRuntime,
    isOnboardingOpen,
    isOnboardingReady,
    isStartingAppServer,
    closeOnboarding: () => startViewTransition(() => closeOnboarding()),
    completeOnboarding: () => startViewTransition(() => completeOnboarding()),
    refreshOnboardingHealth: () => void refreshOnboardingHealth(),
    ensureAppServer: () => void ensureAppServer(),
  };
  const workspaceOverlays: StudioWorkspaceOverlaysProps = {
    isTrashModalOpen,
    closeTrash,
    trash,
    restoreFromTrash,
    restoreAllFromTrash,
    emptyTrash,
    isLimitModalOpen,
    handleDismissLimitModal: dismissLimitModal,
    handleDownloadAndClear,
    batchCount: batches.length,
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
    mergedLogs,
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
    activeServerJobCount,
    onInspectJob: handleInspectStudioJob,
    health: effectiveStudioHealth,
    isBackendConnected,
    onResetStudio: resetStudio,
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
      await verifyCodexSession();
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
          onOpenOnboarding={() => startViewTransition(() => openOnboarding())}
          onOpenTrash={openTrash}
          trashCount={trash.length}
          onToggleDebug={handleToggleDebugPanel}
          codexAccountStatus={codexAccountStatus}
          isUsageLoading={!hasFetchedDiagnostics}
          isBackendConnected={isBackendConnected}
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
      />
    </div>
  );
};
