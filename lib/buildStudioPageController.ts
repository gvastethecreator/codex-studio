import type { LeftDebugPanelProps } from '../components/LeftDebugPanel';
import type { RecipePageProps } from '../components/RecipePage';
import type { ToolbarProps } from '../components/Toolbar';
import type { StudioGridSurfaceProps } from '../components/studio/StudioGridSurface';
import type { StudioOperationsRailProps } from '../components/studio/StudioOperationsRail';
import type { AppPageView } from '../hooks/useHashRouter';
import type { RecipeId } from '../types';

export interface StudioPageController {
  debugPanel: {
    isVisible: boolean;
    props: LeftDebugPanelProps;
  };
  grid: StudioGridSurfaceProps;
  operations: StudioOperationsRailProps;
}

export interface StudioViewportController {
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
}

interface StudioPageDebugContext {
  workspaces: LeftDebugPanelProps['workspaces'];
  mergedLogs: LeftDebugPanelProps['logs'];
  catalogVisualGroupCount: LeftDebugPanelProps['visualGroupsCount'];
}

interface StudioPageGridContext {
  isModalOpen: boolean;
  allImages: StudioGridSurfaceProps['allImages'];
  imagesWithConfig: StudioGridSurfaceProps['imagesWithConfig'];
  selectedImageIds: StudioGridSurfaceProps['selectedImageIds'];
  activeWorkspaceId: StudioGridSurfaceProps['activeWorkspaceId'];
  openModal: StudioGridSurfaceProps['openModal'];
  handleSelectionChange: StudioGridSurfaceProps['handleSelectionChange'];
  handleGenerate: StudioGridSurfaceProps['handleGenerate'];
  handleAddToContext: StudioGridSurfaceProps['handleAddToContext'];
  handleLoadRecipe: StudioGridSurfaceProps['handleLoadRecipe'];
  handleDelete: StudioGridSurfaceProps['handleDelete'];
  handleToggleFavorite: StudioGridSurfaceProps['handleToggleFavorite'];
  isGenerating: StudioGridSurfaceProps['isGenerating'];
  transitioningImageId: StudioGridSurfaceProps['transitioningImageId'];
  activeModalImageId: StudioGridSurfaceProps['activeModalImageId'];
  handleSelectAll: StudioGridSurfaceProps['handleSelectAll'];
  handleDeselectAll: StudioGridSurfaceProps['handleDeselectAll'];
  handleDeleteSelected: StudioGridSurfaceProps['handleDeleteSelected'];
  handleClearWorkspace: StudioGridSurfaceProps['handleClearWorkspace'];
  previewRatio: StudioGridSurfaceProps['previewRatio'];
  generationAspectRatio: StudioGridSurfaceProps['generationAspectRatio'];
  isInteractingWithToolbar: StudioGridSurfaceProps['isInteractingWithToolbar'];
}

interface StudioPageOperationsContext {
  isQueueOpen: StudioOperationsRailProps['isQueueOpen'];
  setIsQueueOpen: StudioOperationsRailProps['setIsQueueOpen'];
  jobs: StudioOperationsRailProps['jobs'];
  queueResults: StudioOperationsRailProps['queueResults'];
  studioJobs: StudioOperationsRailProps['studioJobs'];
  selectedStudioJobId: StudioOperationsRailProps['selectedStudioJobId'];
  retry: StudioOperationsRailProps['retry'];
  retryPersistentJob: StudioOperationsRailProps['retryPersistentJob'];
  cancelJob: StudioOperationsRailProps['cancelJob'];
  cancelPersistentJob: StudioOperationsRailProps['cancelPersistentJob'];
  removeJob: StudioOperationsRailProps['removeJob'];
  clearCompleted: StudioOperationsRailProps['clearCompleted'];
  isResting: StudioOperationsRailProps['isResting'];
  exportWorkspaceSnapshot: StudioOperationsRailProps['exportWorkspaceSnapshot'];
  isBackgroundEnabled: StudioOperationsRailProps['isBackgroundEnabled'];
  setBackgroundEnabled: StudioOperationsRailProps['setBackgroundEnabled'];
  activeServerJobCount: StudioOperationsRailProps['activeServerJobCount'];
  onInspectJob: NonNullable<LeftDebugPanelProps['onInspectJob']>;
  diagnostics: StudioOperationsRailProps['diagnostics'];
  onResetStudio: StudioOperationsRailProps['onResetStudio'];
  isResettingStudio: StudioOperationsRailProps['isResettingStudio'];
}

export interface BuildStudioPageControllerArgs {
  debug: StudioPageDebugContext;
  grid: StudioPageGridContext;
  operations: StudioPageOperationsContext;
}

interface StudioViewportNavigationContext {
  routeView: AppPageView;
  direction: number;
  activeRecipe: RecipeId | null;
  onSelectRecipe: (recipeId: RecipeId) => void;
}

interface StudioViewportRecipeContext {
  recipePageProps: Omit<RecipePageProps, 'activeRecipe'>;
  studioPageController: StudioPageController;
}

interface StudioViewportDockContext {
  isModalOpen: boolean;
  isDragging: boolean;
  toolbarProps: ToolbarProps;
}

export interface BuildStudioViewportControllerArgs {
  navigation: StudioViewportNavigationContext;
  recipe: StudioViewportRecipeContext;
  dock: StudioViewportDockContext;
}

export function buildStudioPageController(
  args: BuildStudioPageControllerArgs,
): StudioPageController {
  const hasProcessingJobs = args.operations.jobs.some((job) => job.status === 'processing');

  return {
    debugPanel: {
      isVisible: false,
      props: {
        workspaces: args.debug.workspaces,
        logs: args.debug.mergedLogs,
        studioJobs: args.operations.studioJobs,
        visualGroupsCount: args.debug.catalogVisualGroupCount,
        imagesCount: args.grid.allImages.length,
        onInspectJob: args.operations.onInspectJob,
        selectedJobId: args.operations.selectedStudioJobId,
      },
    },
    grid: {
      isModalOpen: args.grid.isModalOpen,
      activeWorkspaceId: args.grid.activeWorkspaceId,
      allImages: args.grid.allImages,
      imagesWithConfig: args.grid.imagesWithConfig,
      selectedImageIds: args.grid.selectedImageIds,
      openModal: args.grid.openModal,
      handleSelectionChange: args.grid.handleSelectionChange,
      handleGenerate: args.grid.handleGenerate,
      handleAddToContext: args.grid.handleAddToContext,
      handleLoadRecipe: args.grid.handleLoadRecipe,
      handleDelete: args.grid.handleDelete,
      handleToggleFavorite: args.grid.handleToggleFavorite,
      isGenerating: args.grid.isGenerating || hasProcessingJobs,
      transitioningImageId: args.grid.transitioningImageId,
      activeModalImageId: args.grid.activeModalImageId,
      handleSelectAll: args.grid.handleSelectAll,
      handleDeselectAll: args.grid.handleDeselectAll,
      handleDeleteSelected: args.grid.handleDeleteSelected,
      handleClearWorkspace: args.grid.handleClearWorkspace,
      previewRatio: args.grid.previewRatio,
      generationAspectRatio: args.grid.generationAspectRatio,
      isInteractingWithToolbar: args.grid.isInteractingWithToolbar,
    },
    operations: {
      isModalOpen: args.grid.isModalOpen,
      isQueueOpen: args.operations.isQueueOpen,
      setIsQueueOpen: args.operations.setIsQueueOpen,
      jobs: args.operations.jobs,
      queueResults: args.operations.queueResults,
      studioJobs: args.operations.studioJobs,
      selectedStudioJobId: args.operations.selectedStudioJobId,
      retry: args.operations.retry,
      retryPersistentJob: args.operations.retryPersistentJob,
      cancelJob: args.operations.cancelJob,
      cancelPersistentJob: args.operations.cancelPersistentJob,
      removeJob: args.operations.removeJob,
      clearCompleted: args.operations.clearCompleted,
      isResting: args.operations.isResting,
      exportWorkspaceSnapshot: args.operations.exportWorkspaceSnapshot,
      isBackgroundEnabled: args.operations.isBackgroundEnabled,
      setBackgroundEnabled: args.operations.setBackgroundEnabled,
      activeServerJobCount: args.operations.activeServerJobCount,
      onInspectJob: args.operations.onInspectJob,
      diagnostics: args.operations.diagnostics,
      onResetStudio: args.operations.onResetStudio,
      isResettingStudio: args.operations.isResettingStudio,
    },
  };
}

export function buildStudioViewportController({
  navigation,
  recipe,
  dock,
}: BuildStudioViewportControllerArgs): StudioViewportController {
  return {
    viewport: {
      routeView: navigation.routeView,
      direction: navigation.direction,
      activeRecipe: navigation.activeRecipe,
      recipePageProps: recipe.recipePageProps,
      studioPageController: recipe.studioPageController,
      onSelectRecipe: navigation.onSelectRecipe,
    },
    generationDock: {
      isModalOpen: dock.isModalOpen,
      currentView: navigation.routeView,
      activeRecipe: navigation.activeRecipe,
      isDragging: dock.isDragging,
      toolbarProps: dock.toolbarProps,
    },
  };
}
