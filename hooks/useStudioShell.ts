import { useCallback, useMemo } from 'react';

import type { HeaderToolbarProps } from '../components/HeaderToolbar';
import type { StudioOverlayController } from '../components/AppOverlays';
import type { RecipePageRuntimeProps } from '../components/RecipePage';
import type { GenerationToolbarRuntimeArgs } from '../components/shell/StudioGenerationDock';
import type { RecipeAliasId } from '../lib/recipeAliases';
import type { RecipeId } from '../types';
import { useRuntimeLogActions, useToastUi, useWorkspaceState } from '../contexts/GlobalContext';
import {
  useGenerationChrome,
  useGenerationModal,
  useGenerationRun,
  useGenerationShell,
} from '../contexts/GenerationContext';
import { useHashRouter, type AppPageView } from './useHashRouter';
import { useImageInputSurface } from './useImageInputSurface';
import { useStudioActionConfirmations } from './useStudioActionConfirmations';
import { useStudioActivitySession } from './useStudioActivitySession';
import { useStudioCatalogController } from './useCatalog';
import { useStudioGallery } from './useStudioGallery';
import { useCatalogModalDetailHydration } from './useCatalogModalDetailHydration';
import { useGenerationQueueController } from './useGenerationQueueController';
import { useStudioGenerationActions } from './useStudioGenerationActions';
import { useStudioNavigation } from './useStudioNavigation';
import { buildStudioShellOverlayController } from './useStudioOverlayController';
import { useStudioReset } from './useStudioReset';
import { useStudioRuntime } from './useStudioRuntime';
import { useStudioSettings } from './useStudioSettings';
import { useSettingsSurface } from './useSettingsSurface';
import { useStudioViewState } from './useStudioViewState';
import { useVaultTransfer } from './useVaultTransfer';
import { useWorkspaceStrip } from './useWorkspaceStrip';
import { buildStudioHeaderToolbarProps } from '../lib/buildStudioHeaderToolbarProps';
import {
  buildStudioPageController,
  buildStudioViewportController,
  type StudioPageController,
} from '../lib/buildStudioPageController';
import { resolveStudioCarouselImage } from '../lib/studioCarouselImage';
import type { LogEntry } from '../types';

const EMPTY_RUNTIME_LOGS: LogEntry[] = [];

export interface StudioShellController {
  root: {
    onDragOver: ReturnType<typeof useImageInputSurface>['handleDragOver'];
    onDragLeave: ReturnType<typeof useImageInputSurface>['handleDragLeave'];
    onDrop: ReturnType<typeof useImageInputSurface>['handleDrop'];
    onMainClick: () => void;
    isUiChromeSuppressed: boolean;
  };
  headerToolbar: {
    isVisible: boolean;
    props: HeaderToolbarProps;
  };
  viewport: {
    routeView: AppPageView;
    direction: number;
    activeRecipe: RecipeId | null;
    activeRecipeAliasId: RecipeAliasId | null;
    recipePageProps: RecipePageRuntimeProps;
    studioPageController: StudioPageController;
    onSelectRecipe: (recipeId: RecipeId, aliasId?: RecipeAliasId | null) => void;
  };
  generationDock: {
    isModalOpen: boolean;
    isUiChromeSuppressed: boolean;
    currentView: AppPageView;
    activeRecipe: RecipeId | null;
    isDragging: boolean;
    toolbarArgs: GenerationToolbarRuntimeArgs;
  };
  overlays: StudioOverlayController;
}

/**
 * Materialize the full Studio Shell from context + runtime seams so AppContent
 * only renders the shell instead of stitching the whole Studio inline.
 */
export function useStudioShell(): StudioShellController {
  // Selective subscriptions: workspace + toast + stable log actions only.
  // Runtime log *list* updates must not re-render this shell (log-list hook is overlay-only).
  const {
    workspaces,
    createWorkspace,
    deleteWorkspace,
    renameWorkspace,
    activeWorkspaceId,
    setActiveWorkspace,
    resetWorkspaces,
  } = useWorkspaceState();
  const { log } = useRuntimeLogActions();
  const { addToast, isDebugPanelOpen, openDebugPanel, closeDebugPanel } = useToastUi();
  const resetStudioState = resetWorkspaces;

  const {
    route,
    navigateToStudio,
    navigateToRecipes,
    navigateToRecipe,
    openEditor: openEditorRoute,
    openModal: openModalRoute,
    closeOverlay,
  } = useHashRouter();

  const config = useGenerationShell();
  const pipeline = useGenerationRun();
  const { recipe, ui } = useGenerationChrome();
  const modal = useGenerationModal();
  const viewState = useStudioViewState({ closeOverlay });
  const {
    activeCatalog,
    workspaceSummaries,
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
    hydrateCatalogDetail,
  } = useStudioCatalogController({
    activeWorkspaceId,
    isTrashOpen: viewState.overlays.trash.isOpen,
    addToast,
  });

  // Browser session logs are empty here so log-list updates never invalidate the shell.
  // Overlays that display logs subscribe to the log-list context and merge client-side.
  const studioRuntime = useStudioRuntime({
    logs: EMPTY_RUNTIME_LOGS,
    log,
    addToast,
    shouldAutoOpen: workspaceSummaries.length === 0 && route.view === 'studio',
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

  const { exportLegacyWorkspaceSnapshot } = useVaultTransfer({
    catalogView: activeCatalog.view,
    addToast,
    log,
  });

  useGenerationQueueController({
    isGenerating: pipeline.isGenerating,
    isQueueOpen: viewState.queue.isOpen,
    setIsQueueOpen: viewState.queue.setIsOpen,
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

  const onEditSettled = useCallback(() => {
    viewState.editor.setIsOpen(false);
    viewState.editor.setImage(null);
  }, [viewState.editor.setImage, viewState.editor.setIsOpen]);
  const {
    isEnhancingPrompt,
    isEditingImage,
    handleGenerate,
    handleEnhancePrompt,
    handleExecuteEdit,
    handleLoadRecipe,
    resetGenerationUi,
  } = useStudioGenerationActions({
    generationConfigRef: config.generationConfigRef,
    activeWorkspaceId,
    setGenerationConfig: config.setGenerationConfig,
    updateGenerationConfig: config.updateGenerationConfig,
    executeEdit: pipeline.executeEdit,
    executeGeneration: pipeline.executeGeneration,
    addToast,
    closeModal: handleCloseModal,
    closeOverlay,
    isModalOpen: modal.isModalOpen,
    onRecipeSelection: handleRecipeSelection,
    onViewChange: handleViewChange,
    onEditSettled,
  });

  const { isResettingStudio, resetStudio } = useStudioReset({
    addToast,
    resetStudioState,
    refreshRuntime: studioRuntime.maintenance.refreshRuntime,
    clearGenerationState: resetGenerationUi,
    ui: {
      setActiveRecipe: recipe.setActiveRecipe,
      setToolbarInteraction: ui.setIsInteractingWithToolbar,
      setKeyPopoverOpen: ui.setIsKeyPopoverOpen,
      closeModal: modal.closeModal,
      navigateToStudio,
      clearSelectedJob: activitySession.selection.clearSelectedJob,
      resetViewState: viewState.actions.reset,
    },
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

  const settingsSurfaceModule = useSettingsSurface({
    isOpen: viewState.overlays.settings.isOpen,
    close: viewState.overlays.settings.close,
    settingsDomain: studioSettings.data.settingsDomain,
    providerDomain: studioSettings.data.providerDomain,
    outputSourcesDomain: studioSettings.data.outputSourcesDomain,
    maintenanceDomain: studioSettings.data.maintenanceDomain,
    libraryDir: studioRuntime.status.diagnostics.health?.libraryDir ?? null,
    fallbackLibraryDir: studioRuntime.onboarding.health?.libraryDir ?? null,
    onResetStudio: requestResetStudio,
    isResettingStudio,
  });

  const { workspacesWithThumbs, handleAddWorkspace, handleDeleteWorkspace, handleRenameWorkspace } =
    useWorkspaceStrip({
      workspaces,
      workspaceSummaries,
      createWorkspace,
      deleteWorkspace,
      renameWorkspace,
      clearWorkspace: clearCatalogWorkspace,
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

  useCatalogModalDetailHydration({
    isModalOpen: modal.isModalOpen,
    activeImageId: modal.activeCarouselId,
    catalogById: activeCatalog.view.byId,
    hydrateCatalogDetail,
    log,
  });

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
          chatPanel: {
            isOpen: viewState.overlays.chat.isOpen,
            close: viewState.overlays.chat.close,
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
          handleExportLegacyWorkspaceSnapshot: exportLegacyWorkspaceSnapshot,
        },
        isSettingsModalOpen: viewState.overlays.settings.isOpen,
        settingsModule: {
          ...settingsSurfaceModule,
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
      viewState.overlays.chat.isOpen,
      viewState.overlays.chat.close,
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
      activitySession.selection.selectedJobDetail,
      activitySession.selection.isLoadingSelectedJob,
      activitySession.selection.inspectJob,
      activitySession.selection.clearSelectedJob,
      activitySession.selection.retryJob,
      exportLegacyWorkspaceSnapshot,
      viewState.overlays.settings.isOpen,
      settingsSurfaceModule,
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

  const recipePageProps = useMemo<RecipePageRuntimeProps>(
    () => ({
      handleGenerate,
      isGenerating: pipeline.isGenerating,
      imagesWithConfig,
      openModal: handleOpenModal,
    }),
    [handleGenerate, pipeline.isGenerating, imagesWithConfig, handleOpenModal],
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
          generationAspectRatio: config.aspectRatio,
          isInteractingWithToolbar: ui.isInteractingWithToolbar,
          catalogTotal: activeCatalog.total,
          catalogHasMore: activeCatalog.hasMore,
          isCatalogLoading: activeCatalog.isLoading,
          catalogError: activeCatalog.error?.message ?? null,
          loadMoreCatalog: () => activeCatalog.loadMore(),
          refreshCatalog: () => void activeCatalog.refresh(),
        },
        operations: {
          isQueueOpen: viewState.queue.isOpen,
          setIsQueueOpen: viewState.queue.setIsOpen,
          queueResults,
          studioJobs: studioRuntime.activity.studioJobs,
          selectedStudioJobId: activitySession.selection.selectedStudioJobId,
          retryPersistentJob: activitySession.selection.retryJob,
          cancelPersistentJob: activitySession.selection.cancelJob,
          onInspectJob: activitySession.selection.inspectJob,
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
      config.aspectRatio,
      ui.isInteractingWithToolbar,
      activeCatalog.total,
      activeCatalog.hasMore,
      activeCatalog.isLoading,
      activeCatalog.error,
      activeCatalog.loadMore,
      activeCatalog.refresh,
      viewState.queue.isOpen,
      viewState.queue.setIsOpen,
      queueResults,
      studioRuntime.activity.studioJobs,
      activitySession.selection.selectedStudioJobId,
      activitySession.selection.retryJob,
      activitySession.selection.cancelJob,
      activitySession.selection.inspectJob,
    ],
  );

  const toolbarArgs = useMemo<GenerationToolbarRuntimeArgs>(
    () => ({
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
      provider: {
        activeProviderId: studioSettings.data.settingsDomain.settings?.defaultProviderId ?? 'codex',
      },
    }),
    [
      handleGenerate,
      pipeline.isGenerating,
      pipeline.generationStartTime,
      isEnhancingPrompt,
      handleEnhancePrompt,
      viewState.preview.setRatio,
      ui.setIsInteractingWithToolbar,
      ui.isKeyPopoverOpen,
      ui.setIsKeyPopoverOpen,
      viewState.editor.open,
      openEditorRoute,
      studioRuntime.maintenance.verifyCodexSession,
      studioSettings.data.settingsDomain.settings?.defaultProviderId,
    ],
  );

  const viewportController = useMemo(
    () =>
      buildStudioViewportController({
        navigation: {
          routeView: route.view,
          direction,
          activeRecipe: recipe.activeRecipe,
          activeRecipeAliasId: route.activeRecipeAliasId,
          onSelectRecipe: handleRecipeSelection,
        },
        recipe: {
          recipePageProps,
          studioPageController,
        },
        dock: {
          isModalOpen: modal.isModalOpen,
          isDragging,
          toolbarArgs,
        },
      }),
    [
      route.view,
      direction,
      recipe.activeRecipe,
      route.activeRecipeAliasId,
      handleRecipeSelection,
      recipePageProps,
      studioPageController,
      modal.isModalOpen,
      isDragging,
      toolbarArgs,
    ],
  );

  const headerToolbarProps = useMemo(
    () =>
      buildStudioHeaderToolbarProps({
        view: {
          isGenerating: pipeline.isGenerating,
          generationStartTime: pipeline.generationStartTime,
          routeView: route.view,
          currentView,
          onViewChange: handleViewChange,
          activeRecipe: recipe.activeRecipe,
          activeRecipeAliasId: route.activeRecipeAliasId,
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
          onOpenChat: viewState.overlays.chat.open,
          onOpenTrash: viewState.overlays.trash.open,
          trashCount: catalogTrashGroups.length,
          onToggleDebug: activitySession.debugPanel.toggle,
        },
        commandCenter: {
          settings: studioSettings.data.settingsDomain.settings,
          provider: {
            capabilities: studioSettings.data.providerDomain.capabilities,
            runtimePreflight: studioSettings.data.providerDomain.runtimePreflight,
            isSaving: studioSettings.data.settingsDomain.isSaving,
          },
          queue: {
            statusItems: studioRuntime.status.diagnostics.statusItems,
            queueResultPreviews,
            activeJobCount: studioRuntime.activity.activeServerJobCount,
            isQueueOpen: viewState.queue.isOpen,
            setIsQueueOpen: viewState.queue.setIsOpen,
          },
          actions: {
            onOpenSettings: viewState.overlays.settings.open,
            onSelectProvider: (providerId) =>
              studioSettings.data.settingsDomain.update({ defaultProviderId: providerId }),
          },
        },
      }),
    [
      pipeline.isGenerating,
      pipeline.generationStartTime,
      route.view,
      currentView,
      handleViewChange,
      recipe.activeRecipe,
      route.activeRecipeAliasId,
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
      viewState.overlays.chat.open,
      viewState.overlays.trash.open,
      catalogTrashGroups.length,
      activitySession.debugPanel.toggle,
      studioSettings.data.settingsDomain.settings,
      studioSettings.data.providerDomain.capabilities,
      studioSettings.data.providerDomain.runtimePreflight,
      studioSettings.data.settingsDomain.isSaving,
      studioSettings.data.settingsDomain.update,
      studioRuntime.status.diagnostics.statusItems,
      queueResultPreviews,
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

  const isUiChromeSuppressed =
    modal.isModalOpen ||
    viewState.editor.isOpen ||
    viewState.overlays.dashboard.isOpen ||
    viewState.overlays.settings.isOpen ||
    viewState.overlays.trash.isOpen ||
    viewState.overlays.chat.isOpen ||
    studioRuntime.onboarding.isOpen;

  return useMemo(
    (): StudioShellController => ({
      root: {
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        onMainClick,
        isUiChromeSuppressed,
      },
      headerToolbar: {
        isVisible: !isUiChromeSuppressed,
        props: headerToolbarProps,
      },
      viewport: viewportController.viewport,
      generationDock: {
        ...viewportController.generationDock,
        isUiChromeSuppressed,
      },
      overlays: overlayController,
    }),
    [
      handleDragOver,
      handleDragLeave,
      handleDrop,
      onMainClick,
      isUiChromeSuppressed,
      headerToolbarProps,
      viewportController,
      overlayController,
    ],
  );
}
