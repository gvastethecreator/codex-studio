import { useCallback, useMemo } from 'react';

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
import { useStudioActivitySession } from './useStudioActivitySession';
import { useStudioCatalogController } from './useCatalog';
import { useStudioGallery } from './useStudioGallery';
import { useStudioGenerationSession } from './useStudioGenerationSession';
import { useStudioNavigation } from './useStudioNavigation';
import { buildStudioShellOverlayController } from './useStudioOverlayController';
import { useStudioReset } from './useStudioReset';
import { useStudioRuntime } from './useStudioRuntime';
import { useStudioSettings } from './useStudioSettings';
import { useStudioViewState } from './useStudioViewState';
import { useVaultTransfer } from './useVaultTransfer';
import { useWorkspaceStrip } from './useWorkspaceStrip';
import { useGenerationToolbarConfig } from './useGenerationToolbarConfig';
import { buildStudioHeaderToolbarProps } from '../lib/buildStudioHeaderToolbarProps';
import {
  buildStudioPageController,
  buildStudioViewportController,
  type StudioPageController,
} from '../lib/buildStudioPageController';
import { resolveStudioCarouselImage } from '../lib/studioCarouselImage';

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
    resetStudioState,
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
  const {
    activeCatalog,
    workspaceCatalog,
    trashCatalog,
    catalogVisualGroupCount,
    queueResults,
    queueResultPreviews,
    catalogTrashGroups,
    refreshCatalogs,
    deleteCatalogImage,
    deleteCatalogImages,
    toggleCatalogFavorite,
    clearCatalogWorkspace,
    restoreCatalogBatch,
    restoreAllCatalogTrash,
    emptyCatalogTrash,
  } = useStudioCatalogController({
    activeWorkspaceId,
    addToast,
  });

  const studioRuntime = useStudioRuntime({
    logs,
    log,
    addToast,
    shouldAutoOpen: workspaceCatalog.entries.length === 0,
    onCatalogChanged: refreshCatalogs,
  });
  const studioSettings = useStudioSettings({ addToast });

  const activitySession = useStudioActivitySession({
    studioJobs: studioRuntime.activity.studioJobs,
    addToast,
    isDebugPanelOpen,
    openDebugPanel,
    closeDebugPanel,
  });

  const { exportLegacyVisualBatchSnapshot } = useVaultTransfer({
    catalogView: activeCatalog.view,
    addToast,
    log,
  });

  const viewState = useStudioViewState({ closeOverlay });

  const clearStudioUiState = useCallback(() => {
    recipe.setActiveRecipe(null);
    ui.setIsInteractingWithToolbar(false);
    ui.setIsKeyPopoverOpen(false);
    modal.closeModal();
    navigateToStudio();
    activitySession.selection.clearSelectedJob();
    viewState.actions.reset();
  }, [
    activitySession.selection.clearSelectedJob,
    modal.closeModal,
    navigateToStudio,
    recipe.setActiveRecipe,
    ui.setIsInteractingWithToolbar,
    ui.setIsKeyPopoverOpen,
    viewState.actions.reset,
  ]);

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
    recipe: {
      active: recipe.activeRecipe,
      setActive: recipe.setActiveRecipe,
      navigateToRecipes,
      navigateToRecipe,
    },
    modal: {
      isOpen: modal.isModalOpen,
      open: modal.openModal,
      close: modal.closeModal,
      openRoute: openModalRoute,
    },
    editor: {
      image: viewState.editor.image,
      isOpen: viewState.editor.isOpen,
      setIsOpen: viewState.editor.setIsOpen,
      closeState: viewState.editor.closeState,
    },
    shell: {
      navigateToStudio,
      closeOverlay,
    },
  });

  const generationSession = useStudioGenerationSession({
    activeWorkspaceId,
    config,
    pipeline,
    modal,
    addToast,
    closeOverlay,
    closeModal: handleCloseModal,
    onRecipeSelection: handleRecipeSelection,
    onViewChange: handleViewChange,
    setIsEditorOpen: viewState.editor.setIsOpen,
    setImageToEdit: viewState.editor.setImage,
  });
  const {
    jobs,
    retry,
    cancelJob,
    removeJob,
    clearCompleted,
    resetQueue,
    isResting,
    cancelPersistentJob,
  } = generationSession.queue;
  const {
    isEnhancingPrompt,
    isEditingImage,
    handleGenerate,
    handleEnhancePrompt,
    handleExecuteEdit,
    handleLoadRecipe,
    resetGenerationUi,
  } = generationSession.actions;

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
    clearWorkspace: clearCatalogWorkspace,
    deleteWorkspace,
    resetStudio,
    restoreAllFromTrash: restoreAllCatalogTrash,
    emptyTrash: emptyCatalogTrash,
  });

  const { workspacesWithThumbs, handleAddWorkspace, handleDeleteWorkspace, handleRenameWorkspace } =
    useWorkspaceStrip({
      workspaces,
      catalogView: workspaceCatalog.view,
      createWorkspace,
      deleteWorkspace,
      renameWorkspace,
      addToast,
      onRequestDeleteWorkspace: requestDeleteWorkspace,
    });

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
    catalogView: activeCatalog.view,
    activeWorkspaceId,
    deleteImage: deleteCatalogImage,
    deleteImages: deleteCatalogImages,
    toggleImageFavorite: toggleCatalogFavorite,
    clearWorkspace: clearCatalogWorkspace,
    log,
    modalImage: modal.modalImage,
    closeModal: handleCloseModal,
    onRequestClearWorkspace: requestClearWorkspace,
  });
  const activeCarouselImage = useMemo(
    () =>
      resolveStudioCarouselImage({
        activeCarouselId: modal.activeCarouselId,
        modalImage: modal.modalImage,
        images: imagesWithConfig,
      }),
    [imagesWithConfig, modal.activeCarouselId, modal.modalImage],
  );

  const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useImageInputSurface({
    onFiles: config.handlePastedFiles,
  });

  const overlayController = useMemo(
    () =>
      buildStudioShellOverlayController({
        image: {
          modalImage: activeCarouselImage,
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
          isEditorOpen: viewState.editor.isOpen,
          closeEditor: viewState.editor.close,
          imageToEdit: viewState.editor.image,
          handleExecuteEdit,
          isEditingImage,
        },
        chrome: {
          debugPanel: {
            isOpen: isDebugPanelOpen,
            close: closeDebugPanel,
          },
          dashboard: {
            isOpen: viewState.overlays.dashboard.isOpen,
            close: viewState.overlays.dashboard.close,
          },
        },
        runtime: {
          mergedLogs: studioRuntime.activity.mergedLogs,
          studioJobs: studioRuntime.activity.studioJobs,
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
            diagnosticsLibraryDir: studioRuntime.status.diagnostics.health?.libraryDir ?? null,
          },
        },
        activity: {
          selectedJobDetail: activitySession.selection.selectedJobDetail,
          isLoadingSelectedJob: activitySession.selection.isLoadingSelectedJob,
          onInspectJob: activitySession.selection.inspectJob,
          onClearSelectedJob: activitySession.selection.clearSelectedJob,
          onRetryJob: activitySession.selection.retryJob,
        },
        vault: {
          handleExportLegacyVisualBatchSnapshot: exportLegacyVisualBatchSnapshot,
          handleDeepScan: () => {},
        },
        settings: {
          modal: {
            isOpen: viewState.overlays.settings.isOpen,
            close: viewState.overlays.settings.close,
          },
          data: studioSettings.data,
          background: {
            isEnabled: isBackgroundEnabled,
            setEnabled: setBackgroundEnabled,
          },
          reset: {
            onResetStudio: requestResetStudio,
            isResettingStudio,
          },
        },
        workspace: {
          catalogVisualGroupCount,
          workspaces,
          trash: catalogTrashGroups,
          restoreFromTrash: restoreCatalogBatch,
          isTrashModalOpen: viewState.overlays.trash.isOpen,
          closeTrash: viewState.overlays.trash.close,
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
      }),
    [
      activeCarouselImage,
      imagesWithConfig,
      pipeline.activeGenerationConfig,
      handleCloseModal,
      handleDelete,
      handleGenerate,
      config.handleAddToContext,
      handleLoadRecipe,
      handleToggleFavorite,
      modal.setActiveCarouselId,
      viewState.editor.isOpen,
      viewState.editor.close,
      viewState.editor.image,
      handleExecuteEdit,
      isEditingImage,
      isDebugPanelOpen,
      closeDebugPanel,
      viewState.overlays.dashboard.isOpen,
      viewState.overlays.dashboard.close,
      studioRuntime.activity.mergedLogs,
      studioRuntime.activity.studioJobs,
      studioRuntime.onboarding.apiBase,
      studioRuntime.onboarding.error,
      studioRuntime.onboarding.health,
      studioRuntime.status.localCodexSession,
      studioRuntime.status.readiness,
      studioRuntime.onboarding.isChecking,
      studioRuntime.onboarding.isDesktopRuntime,
      studioRuntime.onboarding.isOpen,
      studioRuntime.onboarding.isReady,
      studioRuntime.onboarding.isStartingAppServer,
      studioRuntime.onboarding.close,
      studioRuntime.onboarding.complete,
      studioRuntime.onboarding.refreshHealth,
      studioRuntime.onboarding.ensureAppServer,
      studioRuntime.status.diagnostics.health,
      activitySession.selection.selectedJobDetail,
      activitySession.selection.isLoadingSelectedJob,
      activitySession.selection.inspectJob,
      activitySession.selection.clearSelectedJob,
      activitySession.selection.retryJob,
      exportLegacyVisualBatchSnapshot,
      viewState.overlays.settings.isOpen,
      viewState.overlays.settings.close,
      studioSettings.data,
      isBackgroundEnabled,
      setBackgroundEnabled,
      requestResetStudio,
      isResettingStudio,
      catalogVisualGroupCount,
      workspaces,
      catalogTrashGroups,
      restoreCatalogBatch,
      viewState.overlays.trash.isOpen,
      viewState.overlays.trash.close,
      requestRestoreAllTrash,
      requestEmptyTrash,
      pendingConfirmation,
      closeConfirmation,
      confirmPendingAction,
    ],
  );

  const recipePageProps = useMemo<Omit<RecipePageProps, 'activeRecipe'>>(
    () => ({
      generationConfig: config.generationConfig,
      updateGenerationConfig: config.updateGenerationConfig,
      updateAttachment: config.updateAttachment,
      handlePastedFiles: config.handlePastedFiles,
      handleGenerate,
      isGenerating: pipeline.isGenerating,
      imagesWithConfig,
      openModal: handleOpenModal,
      handleAddToContext: config.handleAddToContext,
    }),
    [
      config.generationConfig,
      config.updateGenerationConfig,
      config.updateAttachment,
      config.handlePastedFiles,
      handleGenerate,
      pipeline.isGenerating,
      imagesWithConfig,
      handleOpenModal,
      config.handleAddToContext,
    ],
  );

  const cancelPersistentJobCb = useCallback(
    (jobId: string) => void cancelPersistentJob(jobId),
    [cancelPersistentJob],
  );

  const studioPageController = useMemo(
    () =>
      buildStudioPageController({
        debug: {
          workspaces,
          mergedLogs: studioRuntime.activity.mergedLogs,
          catalogVisualGroupCount,
        },
        grid: {
          isModalOpen: modal.isModalOpen,
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
          previewRatio: viewState.preview.ratio,
          generationAspectRatio: config.generationConfig.aspectRatio,
          isInteractingWithToolbar: ui.isInteractingWithToolbar,
        },
        operations: {
          isQueueOpen: viewState.queue.isOpen,
          setIsQueueOpen: viewState.queue.setIsOpen,
          jobs,
          queueResults,
          studioJobs: studioRuntime.activity.studioJobs,
          selectedStudioJobId: activitySession.selection.selectedStudioJobId,
          retry,
          retryPersistentJob: activitySession.selection.retryJob,
          cancelJob,
          cancelPersistentJob: cancelPersistentJobCb,
          removeJob,
          clearCompleted,
          isResting,
          exportLegacyVisualBatchSnapshot,
          isBackgroundEnabled,
          setBackgroundEnabled,
          activeServerJobCount: studioRuntime.activity.activeServerJobCount,
          onInspectJob: activitySession.selection.inspectJob,
          diagnostics: studioRuntime.status.diagnostics,
          onResetStudio: requestResetStudio,
          isResettingStudio,
        },
      }),
    [
      workspaces,
      studioRuntime.activity.mergedLogs,
      catalogVisualGroupCount,
      modal.isModalOpen,
      allImages,
      imagesWithConfig,
      selectedImageIds,
      activeWorkspaceId,
      handleOpenModal,
      handleSelectionChange,
      handleGenerate,
      config.handleAddToContext,
      handleLoadRecipe,
      handleDelete,
      handleToggleFavorite,
      pipeline.isGenerating,
      modal.transitioningImageId,
      modal.activeCarouselId,
      handleSelectAll,
      handleDeselectAll,
      handleDeleteSelected,
      handleClearWorkspace,
      viewState.preview.ratio,
      config.generationConfig.aspectRatio,
      ui.isInteractingWithToolbar,
      viewState.queue.isOpen,
      viewState.queue.setIsOpen,
      jobs,
      queueResults,
      studioRuntime.activity.studioJobs,
      activitySession.selection.selectedStudioJobId,
      retry,
      activitySession.selection.retryJob,
      cancelJob,
      cancelPersistentJobCb,
      removeJob,
      clearCompleted,
      isResting,
      exportLegacyVisualBatchSnapshot,
      isBackgroundEnabled,
      setBackgroundEnabled,
      studioRuntime.activity.activeServerJobCount,
      activitySession.selection.inspectJob,
      studioRuntime.status.diagnostics,
      requestResetStudio,
      isResettingStudio,
    ],
  );

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
      setPreviewRatio: viewState.preview.setRatio,
      setIsInteracting: ui.setIsInteractingWithToolbar,
      isKeyPopoverOpen: ui.isKeyPopoverOpen,
      setIsKeyPopoverOpen: ui.setIsKeyPopoverOpen,
    },
    editor: {
      openEditor: viewState.editor.open,
      openEditorRoute,
    },
    sync: {
      verifyCodexSession: studioRuntime.maintenance.verifyCodexSession,
    },
  });

  const viewportController = useMemo(
    () =>
      buildStudioViewportController({
        navigation: {
          routeView: route.view,
          direction,
          activeRecipe: recipe.activeRecipe,
          onSelectRecipe: handleRecipeSelection,
        },
        recipe: {
          recipePageProps,
          studioPageController,
        },
        dock: {
          isModalOpen: modal.isModalOpen,
          isDragging,
          toolbarProps,
        },
      }),
    [
      route.view,
      direction,
      recipe.activeRecipe,
      handleRecipeSelection,
      recipePageProps,
      studioPageController,
      modal.isModalOpen,
      isDragging,
      toolbarProps,
    ],
  );

  const headerToolbarProps = useMemo(
    () =>
      buildStudioHeaderToolbarProps({
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
          onOpenDashboard: viewState.overlays.dashboard.open,
          openOnboarding: studioRuntime.onboarding.open,
          onOpenTrash: viewState.overlays.trash.open,
          trashCount: catalogTrashGroups.length,
          onToggleDebug: activitySession.debugPanel.toggle,
        },
        commandCenter: {
          defaultProviderId: studioSettings.data.settings?.defaultProviderId,
          statusItems: studioRuntime.status.diagnostics.statusItems,
          queueResultPreviews,
          queueJobCount: jobs.length,
          activeServerJobCount: studioRuntime.activity.activeServerJobCount,
          isQueueOpen: viewState.queue.isOpen,
          setIsQueueOpen: viewState.queue.setIsOpen,
          onOpenSettings: viewState.overlays.settings.open,
        },
      }),
    [
      pipeline.isGenerating,
      currentView,
      handleViewChange,
      recipe.activeRecipe,
      handleCloseRecipe,
      studioRuntime.status.diagnostics.usage,
      workspacesWithThumbs,
      activeWorkspaceId,
      setActiveWorkspace,
      handleAddWorkspace,
      handleDeleteWorkspace,
      handleRenameWorkspace,
      viewState.overlays.dashboard.open,
      studioRuntime.onboarding.open,
      viewState.overlays.trash.open,
      catalogTrashGroups.length,
      activitySession.debugPanel.toggle,
      studioSettings.data.settings,
      studioRuntime.status.diagnostics.statusItems,
      queueResultPreviews,
      jobs.length,
      studioRuntime.activity.activeServerJobCount,
      viewState.queue.isOpen,
      viewState.queue.setIsOpen,
      viewState.overlays.settings.open,
    ],
  );

  const onMainClick = useCallback(() => {
    ui.setIsInteractingWithToolbar(false);
    ui.setIsKeyPopoverOpen(false);
  }, [ui.setIsInteractingWithToolbar, ui.setIsKeyPopoverOpen]);

  return useMemo(
    (): StudioShellController => ({
      root: {
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        onMainClick,
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
        isVisible: !modal.isModalOpen,
        props: headerToolbarProps,
      },
      viewport: viewportController.viewport,
      generationDock: viewportController.generationDock,
      overlays: overlayController,
    }),
    [
      handleDragOver,
      handleDragLeave,
      handleDrop,
      onMainClick,
      isBackgroundEnabled,
      pipeline.isGenerating,
      config.generationConfig.model,
      bgConfig,
      toasts,
      removeToast,
      modal.isModalOpen,
      headerToolbarProps,
      viewportController,
      overlayController,
    ],
  );
}
