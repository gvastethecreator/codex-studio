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
import { useStudioGallery } from './useStudioGallery';
import { useStudioGenerationSession } from './useStudioGenerationSession';
import { useStudioHeaderToolbarConfig } from './useStudioHeaderToolbarConfig';
import { useStudioNavigation } from './useStudioNavigation';
import { useStudioOverlayController } from './useStudioOverlayController';
import { useStudioPageController, type StudioPageController } from './useStudioPageController';
import { useStudioReset } from './useStudioReset';
import { useStudioRuntime } from './useStudioRuntime';
import { useStudioSettings } from './useStudioSettings';
import { useStudioViewState } from './useStudioViewState';
import { useVaultTransfer } from './useVaultTransfer';
import { useWorkspaceStrip } from './useWorkspaceStrip';
import { useGenerationToolbarConfig } from './useGenerationToolbarConfig';
import { useCatalog } from './useCatalog';
import { buildArchivedImageGroupsFromCatalog } from '../lib/studioCatalogTrashView';
import { materializeVisualBatchesFromCatalog } from '../lib/studioCatalogVisualBatchAdapter';
import { buildStudioQueueResultPreviews } from '../lib/studioQueueResults';
import {
  deleteCatalogImage as deleteCatalogImageRequest,
  purgeCatalogImage as purgeCatalogImageRequest,
  restoreCatalogImage as restoreCatalogImageRequest,
  toStudioAssetUrl,
  updateCatalogImage as updateCatalogImageRequest,
} from '../services/localStudioService';

function summarizeRuntimeStatus(
  statusItems: ReturnType<typeof useStudioRuntime>['status']['diagnostics']['statusItems'],
): HeaderToolbarProps['runtimeStatus'] {
  if (statusItems.length === 0) {
    return { label: 'Checking', tone: 'warning' };
  }

  if (statusItems.some((item) => item.tone === 'danger')) {
    return { label: 'Attention', tone: 'danger' };
  }

  if (statusItems.some((item) => item.tone === 'warning')) {
    return { label: 'Standby', tone: 'warning' };
  }

  return { label: 'Ready', tone: 'success' };
}

function belongsToWorkspace(workspaceId: string, entryWorkspaceId?: string | null) {
  return entryWorkspaceId === workspaceId || (!entryWorkspaceId && workspaceId === 'default');
}

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
    legacyVisualBatches,
    mergeLegacyVisualBatches,
    importLegacyVisualBatches,
    archiveLegacyVisualBatches,
    deleteLegacyVisualImage,
    deleteLegacyVisualImages,
    toggleLegacyVisualImageFavorite,
    clearLegacyVisualWorkspace,
    clearAllLegacyVisualBatches,
    resetStudioState,
    restoreLegacyVisualBatchFromTrash,
    restoreAllLegacyVisualBatchesFromTrash,
    emptyLegacyVisualTrash,
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
  const activeCatalog = useCatalog({
    workspaceId: activeWorkspaceId,
    deleted: false,
  });
  const workspaceCatalog = useCatalog({
    deleted: false,
  });
  const trashCatalog = useCatalog({
    deleted: true,
  });
  const catalogVisualBatches = useMemo(
    () => materializeVisualBatchesFromCatalog(activeCatalog.view),
    [activeCatalog.view],
  );
  const queueResults = useMemo(
    () =>
      buildStudioQueueResultPreviews(activeCatalog.entries, {
        toAssetUrl: toStudioAssetUrl,
      }),
    [activeCatalog.entries],
  );
  const catalogTrashGroups = useMemo(
    () => buildArchivedImageGroupsFromCatalog(trashCatalog.view),
    [trashCatalog.view],
  );
  const refreshCatalogs = useCallback(() => {
    void activeCatalog.refresh();
    void workspaceCatalog.refresh();
    void trashCatalog.refresh();
  }, [activeCatalog.refresh, trashCatalog.refresh, workspaceCatalog.refresh]);

  const deleteCatalogImage = useCallback(
    (imageId: string) => {
      void deleteCatalogImageRequest(imageId)
        .then(() => {
          deleteLegacyVisualImage(imageId);
          refreshCatalogs();
        })
        .catch((error) => {
          addToast(
            error instanceof Error ? error.message : `Unable to archive image ${imageId}`,
            'error',
          );
        });
    },
    [addToast, deleteLegacyVisualImage, refreshCatalogs],
  );

  const deleteCatalogImages = useCallback(
    (imageIds: string[]) => {
      void Promise.all(imageIds.map((imageId) => deleteCatalogImageRequest(imageId)))
        .then(() => {
          deleteLegacyVisualImages(imageIds);
          refreshCatalogs();
        })
        .catch((error) => {
          addToast(
            error instanceof Error ? error.message : 'Unable to archive selected images',
            'error',
          );
        });
    },
    [addToast, deleteLegacyVisualImages, refreshCatalogs],
  );

  const toggleCatalogFavorite = useCallback(
    (imageId: string) => {
      const current = activeCatalog.view.byId.get(imageId);
      void updateCatalogImageRequest(imageId, {
        isFavorite: !(current?.isFavorite ?? false),
      })
        .then(() => {
          toggleLegacyVisualImageFavorite(imageId);
          refreshCatalogs();
        })
        .catch((error) => {
          addToast(error instanceof Error ? error.message : 'Unable to update favorite', 'error');
        });
    },
    [activeCatalog.view.byId, addToast, refreshCatalogs, toggleLegacyVisualImageFavorite],
  );

  const clearCatalogWorkspace = useCallback(
    (workspaceId: string) => {
      const imageIds = activeCatalog.entries
        .filter((entry) => belongsToWorkspace(workspaceId, entry.workspaceId))
        .map((entry) => entry.id);

      if (imageIds.length === 0) return;

      void Promise.all(imageIds.map((imageId) => deleteCatalogImageRequest(imageId)))
        .then(() => {
          clearLegacyVisualWorkspace(workspaceId);
          refreshCatalogs();
        })
        .catch((error) => {
          addToast(
            error instanceof Error ? error.message : 'Unable to archive workspace images',
            'error',
          );
        });
    },
    [activeCatalog.entries, addToast, clearLegacyVisualWorkspace, refreshCatalogs],
  );

  const restoreCatalogBatch = useCallback(
    (batchId: string) => {
      const entries = trashCatalog.view.byBatchId.get(batchId) ?? [];
      void Promise.all(entries.map((entry) => restoreCatalogImageRequest(entry.id)))
        .then(() => {
          restoreLegacyVisualBatchFromTrash(batchId);
          refreshCatalogs();
        })
        .catch((error) => {
          addToast(
            error instanceof Error ? error.message : 'Unable to restore catalog batch',
            'error',
          );
        });
    },
    [addToast, refreshCatalogs, restoreLegacyVisualBatchFromTrash, trashCatalog.view.byBatchId],
  );

  const restoreAllCatalogTrash = useCallback(() => {
    void Promise.all(trashCatalog.entries.map((entry) => restoreCatalogImageRequest(entry.id)))
      .then(() => {
        restoreAllLegacyVisualBatchesFromTrash();
        refreshCatalogs();
      })
      .catch((error) => {
        addToast(
          error instanceof Error ? error.message : 'Unable to restore catalog trash',
          'error',
        );
      });
  }, [addToast, refreshCatalogs, restoreAllLegacyVisualBatchesFromTrash, trashCatalog.entries]);

  const emptyCatalogTrash = useCallback(() => {
    void Promise.all(trashCatalog.entries.map((entry) => purgeCatalogImageRequest(entry.id)))
      .then(() => {
        emptyLegacyVisualTrash();
        refreshCatalogs();
      })
      .catch((error) => {
        addToast(error instanceof Error ? error.message : 'Unable to empty catalog trash', 'error');
      });
  }, [addToast, emptyLegacyVisualTrash, refreshCatalogs, trashCatalog.entries]);

  const studioRuntime = useStudioRuntime({
    logs,
    log,
    legacyVisualBatches,
    mergeLegacyVisualBatches,
    addToast,
    shouldAutoOpen: workspaceCatalog.entries.length === 0 && legacyVisualBatches.length === 0,
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

  const { importVault, exportWorkspaceSnapshot, downloadAndClearWorkspace } = useVaultTransfer({
    catalogView: activeCatalog.view,
    legacyVisualBatches,
    importLegacyVisualBatches,
    archiveLegacyVisualBatches,
    clearAllLegacyVisualBatches,
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
    isLimitModalOpen,
    openEditor,
    closeEditor,
    dismissLimitModal,
    handleDownloadAndClear,
    resetViewState,
  } = useStudioViewState({
    visualGroupCount: catalogVisualBatches.length,
    downloadAndClearWorkspace,
    closeOverlay,
  });
  const toggleQueue = useCallback(() => {
    setIsQueueOpen((previous) => !previous);
  }, [setIsQueueOpen]);

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
    navigateToStudio,
    navigateToRecipes,
    navigateToRecipe,
    openModalRoute,
    closeOverlay,
  });

  const generationSession = useStudioGenerationSession({
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
    clearWorkspace: clearLegacyVisualWorkspace,
    deleteWorkspace,
    resetStudio,
    restoreAllFromTrash: restoreAllCatalogTrash,
    emptyTrash: emptyCatalogTrash,
  });

  const { workspacesWithThumbs, handleAddWorkspace, handleDeleteWorkspace, handleRenameWorkspace } =
    useWorkspaceStrip({
      workspaces,
      catalogView: workspaceCatalog.view,
      legacyVisualBatches,
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
    legacyVisualBatches,
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
      selectedJobDetail: activitySession.selectedJobDetail,
      isLoadingSelectedJob: activitySession.isLoadingSelectedJob,
      onInspectJob: activitySession.handleInspectStudioJob,
      onClearSelectedJob: activitySession.clearSelectedJob,
    },
    vault: {
      handleImportVault: importVault,
      handleExportWorkspaceSnapshot: exportWorkspaceSnapshot,
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
      catalogVisualBatches,
      workspaces,
      trash: catalogTrashGroups,
      restoreFromTrash: restoreCatalogBatch,
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
    catalogVisualGroupCount: catalogVisualBatches.length,
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
    handleImportVault: importVault,
    isBackgroundEnabled,
    setBackgroundEnabled,
    activeServerJobCount: studioRuntime.activity.activeServerJobCount,
    onInspectJob: activitySession.handleInspectStudioJob,
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
      trashCount: catalogTrashGroups.length,
      onToggleDebug: activitySession.handleToggleDebugPanel,
    },
    commandCenter: {
      activeProviderId: studioSettings.settings?.defaultProviderId ?? 'codex',
      runtimeStatus: summarizeRuntimeStatus(studioRuntime.status.diagnostics.statusItems),
      queueCount: jobs.length + studioRuntime.activity.activeServerJobCount,
      isQueueOpen,
      onToggleQueue: toggleQueue,
      onOpenSettings: openSettings,
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
      isVisible: !modal.isModalOpen,
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
