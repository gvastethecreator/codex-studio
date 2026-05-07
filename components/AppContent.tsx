import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';

import { useImageManager } from '../hooks/useImageManager';
import { useHashRouter } from '../hooks/useHashRouter';
import { useImageInputSurface } from '../hooks/useImageInputSurface';
import { useStudioDiagnostics } from '../hooks/useStudioDiagnostics';
import { useStudioJobInspector } from '../hooks/useStudioJobInspector';
import { useStudioNavigation } from '../hooks/useStudioNavigation';
import { useStudioReset } from '../hooks/useStudioReset';
import { useVaultTransfer } from '../hooks/useVaultTransfer';
import { useWorkspaceStrip } from '../hooks/useWorkspaceStrip';

import { detectRecipeFromContext } from '../utils/recipeUtils';
import { startViewTransition } from '../utils/transitionUtils';
import { cancelStudioJob } from '../services/localStudioService';
import { DEFAULT_GENERATION_CONFIG } from '../constants';

import type {
  ImageGenerationConfig,
  GeneratedImageWithConfig,
  Attachment,
  AspectRatio,
  RecipeId,
} from '../types';

import { AppOverlays } from './AppOverlays';
import { BottomToolbar } from './ui/BottomToolbar';
import { Toolbar } from './Toolbar';
import { HeaderToolbar } from './HeaderToolbar';
import LiquidBlackBackground from './LiquidBlackBackground';
import ToastContainer from './ToastContainer';
import DropZoneOverlay from './DropZoneOverlay';
import { RecipePage } from './RecipePage';
import { RecipesView } from './RecipesView';
import { StudioPage } from './StudioPage';
import { useGlobal } from '../contexts/GlobalContext';
import { useGeneration } from '../contexts/GenerationContext';
import { useQueueManager } from '../hooks/useQueueManager';
import { useStudioOnboarding } from '../hooks/useStudioOnboarding';
import { useLocalStudioSync } from '../hooks/useLocalStudioSync';

const viewVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98,
    filter: 'blur(4px)',
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      x: { type: 'spring' as const, stiffness: 260, damping: 26 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.4 },
      filter: { duration: 0.4 },
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '50%' : '-50%',
    opacity: 0,
    scale: 0.98,
    filter: 'blur(4px)',
    transition: {
      x: { type: 'spring' as const, stiffness: 260, damping: 26 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.4 },
      filter: { duration: 0.4 },
    },
  }),
};

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

  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [hasDismissedLimitModal, setHasDismissedLimitModal] = useState(false);

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

  const [isQueueOpen, setIsQueueOpen] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<Attachment | null>(null);
  const [previewRatio, setPreviewRatio] = useState<AspectRatio | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
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
  const clearGenerationState = useCallback(() => {
    config.setGenerationConfig({
      ...DEFAULT_GENERATION_CONFIG,
      attachments: [],
      recipeParams: null,
    });
  }, [config]);
  const clearStudioUiState = useCallback(() => {
    recipe.setActiveRecipe(null);
    ui.setIsInteractingWithToolbar(false);
    ui.setIsKeyPopoverOpen(false);
    modal.closeModal();
    navigateToStudio();
    closeOverlay();
    clearSelectedJob();
    setIsQueueOpen(true);
    setIsEditorOpen(false);
    setImageToEdit(null);
    setPreviewRatio(null);
    setIsToolbarVisible(true);
    setIsEnhancingPrompt(false);
    setIsEditingImage(false);
    setIsDashboardModalOpen(false);
    setIsTrashModalOpen(false);
    setIsLimitModalOpen(false);
    setHasDismissedLimitModal(false);
  }, [clearSelectedJob, closeOverlay, modal, navigateToStudio, recipe, ui]);
  const { isResettingStudio, resetStudio } = useStudioReset({
    addToast,
    resetStudioState,
    resetQueue,
    refreshOnboardingHealth,
    refreshDiagnostics,
    clearGenerationState,
    clearUiState: clearStudioUiState,
  });
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

  const workspaceBatches = useMemo(() => {
    return batches.filter(
      (b) =>
        b.workspaceId === activeWorkspaceId || (!b.workspaceId && activeWorkspaceId === 'default'),
    );
  }, [batches, activeWorkspaceId]);

  const {
    allImages,
    selectedImageIds,
    handleSelectionChange,
    handleDelete,
    handleDeleteSelected,
    handleSelectAll,
    handleDeselectAll,
    handleToggleFavorite,
    handleClearWorkspace,
  } = useImageManager({
    batches: workspaceBatches,
    deleteImage,
    deleteImages,
    toggleImageFavorite,
    clearWorkspace,
    log,
    modalImage: modal.modalImage,
    handleCloseModal,
  });

  const imagesWithConfig = useMemo(() => {
    return allImages
      .map((img) => {
        const batch = batches.find((b) => b.id === img.batchId);
        return { ...img, config: batch?.config } as GeneratedImageWithConfig;
      })
      .sort((a, b) => {
        if (a.isFavorite === b.isFavorite) return b.createdAt - a.createdAt;
        return a.isFavorite ? -1 : 1;
      });
  }, [allImages, batches]);

  const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useImageInputSurface({
    onFiles: config.handlePastedFiles,
  });

  const handleGenerate = useCallback(
    (
      promptOverride?: string,
      configOverrides?: Partial<ImageGenerationConfig>,
      options?: { force?: boolean; preventModal?: boolean },
    ) => {
      if (modal.isModalOpen && !options?.preventModal) {
        handleCloseModal();
      }

      const finalPrompt =
        (promptOverride !== undefined ? promptOverride : config.generationConfig.prompt)?.trim() ??
        '';
      if (!finalPrompt) {
        addToast('Type a prompt before generating', 'info');
        return;
      }

      const finalConfig: ImageGenerationConfig = {
        ...config.generationConfig,
        ...configOverrides,
        prompt: finalPrompt,
      };
      enqueue(finalPrompt, finalConfig, options?.force);
    },
    [addToast, config.generationConfig, enqueue, handleCloseModal, modal.isModalOpen],
  );

  const handleEnhancePrompt = useCallback(async () => {
    if (isEnhancingPrompt) return;
    setIsEnhancingPrompt(true);
    try {
      const currentPrompt = (config.generationConfig.prompt ?? '').trim();
      if (!currentPrompt) {
        addToast('Type a prompt before refining it', 'info');
        return;
      }

      config.updateGenerationConfig(
        'prompt',
        [
          currentPrompt,
          '',
          'Refinement notes:',
          '- High-quality local image generation through Codex ImageGen.',
          '- Preserve the requested subject, composition, lighting, material detail, and aspect ratio.',
        ].join('\n'),
      );
      addToast('Prompt preparado para Codex ImageGen', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Prompt refinement failed', 'error');
    } finally {
      setIsEnhancingPrompt(false);
    }
  }, [addToast, config, isEnhancingPrompt]);

  const handleExecuteEdit = useCallback(
    async (original: Attachment, mask: string, prompt: string) => {
      setIsEditingImage(true);
      try {
        await pipeline.executeEdit(original, mask, prompt);
        closeOverlay();
        setIsEditorOpen(false);
        setImageToEdit(null);
      } catch {
        // Pipeline already reports failures.
      } finally {
        setIsEditingImage(false);
      }
    },
    [closeOverlay, pipeline],
  );

  const handleLoadRecipe = useCallback(
    (nextConfig: ImageGenerationConfig) => {
      config.setGenerationConfig(nextConfig);
      addToast('Recipe restored', 'success');

      const detectedRecipe =
        nextConfig.recipeId ?? detectRecipeFromContext(nextConfig.recipeContext);
      if (detectedRecipe) {
        handleRecipeSelection(detectedRecipe);
      } else {
        handleViewChange('studio');
      }
    },
    [addToast, config, handleRecipeSelection, handleViewChange],
  );
  useEffect(() => {
    if (batches.length > 100 && !hasDismissedLimitModal && !isLimitModalOpen) {
      setIsLimitModalOpen(true);
    }
  }, [batches.length, hasDismissedLimitModal, isLimitModalOpen]);

  const handleDownloadAndClear = useCallback(async () => {
    const didClear = await downloadAndClearWorkspace();
    if (!didClear) return;

    setIsLimitModalOpen(false);
    setHasDismissedLimitModal(true);
  }, [downloadAndClearWorkspace]);

  const handleDismissLimitModal = () => {
    setIsLimitModalOpen(false);
    setHasDismissedLimitModal(true);
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
          imageCount={allImages.length}
          selectedImageCount={selectedImageIds.length}
          isGenerating={pipeline.isGenerating}
          isToolbarVisible={isToolbarVisible}
          onToggleToolbar={() => startViewTransition(() => setIsToolbarVisible((p) => !p))}
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
          onOpenDashboard={() => startViewTransition(() => setIsDashboardModalOpen(true))}
          onOpenOnboarding={() => startViewTransition(() => openOnboarding())}
          onOpenTrash={() => startViewTransition(() => setIsTrashModalOpen(true))}
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
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          {route.view === 'recipe' && recipe.activeRecipe ? (
            <motion.div
              key={`recipe-${recipe.activeRecipe}`}
              custom={direction}
              variants={viewVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              <RecipePage
                activeRecipe={recipe.activeRecipe}
                generationConfig={config.generationConfig}
                updateGenerationConfig={config.updateGenerationConfig}
                updateAttachment={config.updateAttachment}
                handlePastedFiles={config.handlePastedFiles}
                handleGenerate={handleGenerate}
                isGenerating={pipeline.isGenerating}
                imagesWithConfig={imagesWithConfig}
                openModal={handleOpenModal}
                handleAddToContext={config.handleAddToContext}
              />
            </motion.div>
          ) : route.view === 'studio' ? (
            <motion.div
              key="studio"
              custom={direction}
              variants={viewVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full flex flex-row overflow-hidden"
            >
              <StudioPage
                isModalOpen={modal.isModalOpen}
                workspaces={workspaces}
                mergedLogs={mergedLogs}
                batchesCount={batches.length}
                allImages={allImages}
                imagesWithConfig={imagesWithConfig}
                selectedImageIds={selectedImageIds}
                activeWorkspaceId={activeWorkspaceId}
                openModal={handleOpenModal}
                handleSelectionChange={handleSelectionChange}
                handleGenerate={handleGenerate}
                handleAddToContext={config.handleAddToContext}
                handleLoadRecipe={handleLoadRecipe}
                handleDelete={handleDelete}
                handleToggleFavorite={handleToggleFavorite}
                isGenerating={pipeline.isGenerating}
                transitioningImageId={modal.transitioningImageId}
                activeModalImageId={modal.activeCarouselId}
                handleSelectAll={handleSelectAll}
                handleDeselectAll={handleDeselectAll}
                handleDeleteSelected={handleDeleteSelected}
                handleClearWorkspace={handleClearWorkspace}
                previewRatio={previewRatio}
                generationAspectRatio={config.generationConfig.aspectRatio}
                isInteractingWithToolbar={ui.isInteractingWithToolbar}
                isQueueOpen={isQueueOpen}
                setIsQueueOpen={setIsQueueOpen}
                jobs={jobs}
                studioJobs={studioJobs}
                selectedStudioJobId={selectedStudioJobId}
                retry={retry}
                cancelJob={cancelJob}
                cancelPersistentJob={(jobId) => void handleCancelPersistentJob(jobId)}
                removeJob={removeJob}
                clearCompleted={clearCompleted}
                isResting={isResting}
                batchesForExport={imagesWithConfig}
                exportBatches={exportVault}
                handleImportVault={importVault}
                isBackgroundEnabled={isBackgroundEnabled}
                setBackgroundEnabled={setBackgroundEnabled}
                activeServerJobCount={activeServerJobCount}
                onInspectJob={handleInspectStudioJob}
                health={effectiveStudioHealth}
                isBackendConnected={isBackendConnected}
                onResetStudio={resetStudio}
                isResettingStudio={isResettingStudio}
              />
            </motion.div>
          ) : (
            <motion.div
              key="recipes-list"
              custom={direction}
              variants={viewVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              <RecipesView onSelectRecipe={handleRecipeSelection} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {isToolbarVisible &&
        !modal.isModalOpen &&
        (route.view === 'studio' || recipe.activeRecipe) && (
          <BottomToolbar className="w-full relative z-30 shrink-0">
            <DropZoneOverlay isVisible={isDragging} />
            <Toolbar
              generationConfig={config.generationConfig}
              updateConfig={config.updateGenerationConfig}
              updateAttachment={config.updateAttachment}
              onGenerate={handleGenerate}
              isGenerating={pipeline.isGenerating}
              generationStartTime={pipeline.generationStartTime}
              onFileSelect={config.handleFileSelect}
              onFilesDrop={config.handlePastedFiles}
              onRemoveAttachment={config.handleRemoveAttachment}
              isEnhancingPrompt={isEnhancingPrompt}
              onEnhancePrompt={handleEnhancePrompt}
              setPreviewRatio={setPreviewRatio}
              setIsInteracting={ui.setIsInteractingWithToolbar}
              onOpenEditor={(att) => {
                startViewTransition(() => {
                  setImageToEdit(att);
                  setIsEditorOpen(true);
                  openEditorRoute();
                });
              }}
              isKeyPopoverOpen={ui.isKeyPopoverOpen}
              onOpenKeySelector={() =>
                startViewTransition(() => ui.setIsKeyPopoverOpen(!ui.isKeyPopoverOpen))
              }
              onSelectKey={async () => {
                await verifyCodexSession();
                startViewTransition(() => ui.setIsKeyPopoverOpen(false));
              }}
              maxAttachments={config.maxAttachments}
            />
          </BottomToolbar>
        )}

      <AppOverlays
        modalImage={modal.modalImage}
        imagesWithConfig={imagesWithConfig}
        activeGenerationConfig={pipeline.activeGenerationConfig}
        closeModal={handleCloseModal}
        handleDelete={handleDelete}
        handleGenerate={handleGenerate}
        handleAddToContext={config.handleAddToContext}
        handleLoadRecipe={handleLoadRecipe}
        handleToggleFavorite={handleToggleFavorite}
        setActiveCarouselId={modal.setActiveCarouselId}
        isEditorOpen={isEditorOpen}
        closeEditor={() => {
          startViewTransition(() => {
            setIsEditorOpen(false);
            setImageToEdit(null);
            closeOverlay();
          });
        }}
        imageToEdit={imageToEdit}
        handleExecuteEdit={handleExecuteEdit}
        isEditingImage={isEditingImage}
        isDebugPanelOpen={isDebugPanelOpen}
        closeDebugPanel={closeDebugPanel}
        mergedLogs={mergedLogs}
        isDashboardModalOpen={isDashboardModalOpen}
        closeDashboard={() => startViewTransition(() => setIsDashboardModalOpen(false))}
        batches={batches}
        workspaces={workspaces}
        studioJobs={studioJobs}
        selectedJobDetail={selectedJobDetail}
        isLoadingSelectedJob={isLoadingSelectedJob}
        onInspectJob={handleInspectStudioJob}
        onClearSelectedJob={clearSelectedJob}
        handleImportVault={importVault}
        handleDeepScan={recoverOrphanedBatches}
        apiBase={apiBase}
        onboardingError={onboardingError}
        onboardingHealth={effectiveStudioHealth}
        isCheckingOnboarding={isCheckingOnboarding}
        isDesktopRuntime={isDesktopRuntime}
        isOnboardingOpen={isOnboardingOpen}
        isOnboardingReady={isOnboardingReady}
        isStartingAppServer={isStartingAppServer}
        closeOnboarding={() => startViewTransition(() => closeOnboarding())}
        completeOnboarding={() => startViewTransition(() => completeOnboarding())}
        refreshOnboardingHealth={() => void refreshOnboardingHealth()}
        ensureAppServer={() => void ensureAppServer()}
        isTrashModalOpen={isTrashModalOpen}
        closeTrash={() => startViewTransition(() => setIsTrashModalOpen(false))}
        trash={trash}
        restoreFromTrash={restoreFromTrash}
        restoreAllFromTrash={restoreAllFromTrash}
        emptyTrash={emptyTrash}
        isLimitModalOpen={isLimitModalOpen}
        handleDismissLimitModal={handleDismissLimitModal}
        handleDownloadAndClear={handleDownloadAndClear}
      />
    </div>
  );
};
