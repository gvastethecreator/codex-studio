import { useCallback, useMemo, useRef } from 'react';

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
import { useStudioOverlayController } from './useStudioOverlayController';
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

  const { exportWorkspaceSnapshot, downloadAndClearWorkspace } = useVaultTransfer({
    catalogView: activeCatalog.view,
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
    isSettingsModalOpen,
    openSettings,
    closeSettings,
    isTrashModalOpen,
    openTrash,
    closeTrash,
    openEditor,
    closeEditor,
    closeEditorState,
    handleDownloadAndClear,
    resetViewState,
  } = useStudioViewState({
    closeOverlay,
  });

  const clearStudioUiState = useCallback(() => {
    recipe.setActiveRecipe(null);
    ui.setIsInteractingWithToolbar(false);
    ui.setIsKeyPopoverOpen(false);
    modal.closeModal();
    navigateToStudio();
    activitySession.clearSelectedJob();
    resetViewState();
  }, [activitySession, modal, navigateToStudio, recipe, resetViewState, ui]);

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
    closeEditorState,
    navigateToStudio,
    navigateToRecipes,
    navigateToRecipe,
    openModalRoute,
    closeOverlay,
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
    setIsEditorOpen,
    setImageToEdit,
  });
  const {
    jobs,
    retry,
    cancelJob,
    removeJob,
    clearCompleted,
    resetQueue,
    isResting,
    isEnhancingPrompt,
    isEditingImage,
    handleGenerate,
    handleEnhancePrompt,
    handleExecuteEdit,
    handleLoadRecipe,
    resetGenerationUi,
    handleCancelPersistentJob,
  } = generationSession;

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

  const overlayController = useStudioOverlayController({
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
      selectedJobDetail: activitySession.selectedJobDetail,
      isLoadingSelectedJob: activitySession.isLoadingSelectedJob,
      onInspectJob: activitySession.handleInspectStudioJob,
      onClearSelectedJob: activitySession.clearSelectedJob,
    },
    vault: {
      handleExportWorkspaceSnapshot: exportWorkspaceSnapshot,
      handleDeepScan: () => {},
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
    settings: {
      isOpen: isSettingsModalOpen,
      close: closeSettings,
      settings: studioSettings.settings,
      error: studioSettings.error,
      isLoading: studioSettings.isLoading,
      isSaving: studioSettings.isSaving,
      providerCapabilities: studioSettings.providerCapabilities,
      providerRuntimePreflight: studioSettings.providerRuntimePreflight,
      outputSources: studioSettings.outputSources,
      outputSourceFiles: studioSettings.outputSourceFiles,
      isLoadingOutputSources: studioSettings.isLoadingOutputSources,
      loadingOutputSourceFiles: studioSettings.loadingOutputSourceFiles,
      isRegisteringOutputSource: studioSettings.isRegisteringOutputSource,
      importingOutputSources: studioSettings.importingOutputSources,
      libraryDir:
        studioRuntime.status.diagnostics.health?.libraryDir ??
        studioRuntime.onboarding.health?.libraryDir ??
        null,
      refresh: studioSettings.refreshSettings,
      update: studioSettings.updateSettings,
      registerOutputSource: studioSettings.registerOutputSource,
      loadOutputSourceFiles: studioSettings.loadOutputSourceFiles,
      importOutputSourceFiles: studioSettings.importOutputSourceFiles,
      isBackgroundEnabled,
      onToggleBackground: () => setBackgroundEnabled(!isBackgroundEnabled),
      onResetStudio: requestResetStudio,
      isResettingStudio,
    },
    workspace: {
      catalogVisualGroupCount,
      workspaces,
      trash: catalogTrashGroups,
      restoreFromTrash: restoreCatalogBatch,
      isTrashModalOpen,
      closeTrash,
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

  const recipePagePropsRef = useRef(recipePageProps);
  recipePagePropsRef.current = recipePageProps;

  const studioPageController = buildStudioPageController({
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
      previewRatio,
      generationAspectRatio: config.generationConfig.aspectRatio,
      isInteractingWithToolbar: ui.isInteractingWithToolbar,
    },
    operations: {
      isQueueOpen,
      setIsQueueOpen,
      jobs,
      queueResults,
      studioJobs: studioRuntime.activity.studioJobs,
      selectedStudioJobId: activitySession.selectedStudioJobId,
      retry,
      cancelJob,
      cancelPersistentJob: (jobId) => void handleCancelPersistentJob(jobId),
      removeJob,
      clearCompleted,
      isResting,
      exportWorkspaceSnapshot,
      isBackgroundEnabled,
      setBackgroundEnabled,
      activeServerJobCount: studioRuntime.activity.activeServerJobCount,
      onInspectJob: activitySession.handleInspectStudioJob,
      diagnostics: studioRuntime.status.diagnostics,
      onResetStudio: requestResetStudio,
      isResettingStudio,
    },
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

  const headerToolbarProps = buildStudioHeaderToolbarProps({
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
      trashCount: catalogTrashGroups.length,
      onToggleDebug: activitySession.handleToggleDebugPanel,
    },
    commandCenter: {
      defaultProviderId: studioSettings.settings?.defaultProviderId,
      statusItems: studioRuntime.status.diagnostics.statusItems,
      queueResultPreviews,
      queueJobCount: jobs.length,
      activeServerJobCount: studioRuntime.activity.activeServerJobCount,
      isQueueOpen,
      setIsQueueOpen,
      onOpenSettings: openSettings,
    },
  });

  return useMemo(
    (): StudioShellController => ({
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
        isVisible: !modal.isModalOpen,
        props: headerToolbarProps,
      },
      viewport: {
        routeView: route.view,
        direction,
        activeRecipe: recipe.activeRecipe,
        recipePageProps: recipePagePropsRef.current,
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
    }),
    [
      handleDragOver,
      handleDragLeave,
      handleDrop,
      isBackgroundEnabled,
      pipeline.isGenerating,
      config.generationConfig.model,
      bgConfig,
      toasts,
      removeToast,
      modal.isModalOpen,
      headerToolbarProps,
      route.view,
      direction,
      recipe.activeRecipe,
      studioPageController,
      handleRecipeSelection,
      isDragging,
      toolbarProps,
      overlayController,
      ui,
    ],
  );
}
