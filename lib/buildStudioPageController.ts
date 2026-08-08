import type { RecipePageProps } from '../components/RecipePage';
import type { ToolbarProps } from '../components/Toolbar';
import type { StudioGridSurfaceProps } from '../components/studio/StudioGridSurface';
import type { StudioOperationsRailProps } from '../components/studio/StudioOperationsRail';
import type { JobStatus } from '../packages/shared/src';
import type { AppPageView } from '../hooks/useHashRouter';
import type { RecipeAliasId } from './recipeAliases';
import type { ShellActivityJob as StudioJob } from './shellActivityJob';
import type {
  AspectRatio,
  LogEntry,
  RecipeId,
  StudioGenerationPlaceholder,
  Workspace,
} from '../types';

interface LeftDebugPanelProps {
  workspaces: Workspace[];
  logs: LogEntry[];
  studioJobs: StudioJob[];
  visualGroupsCount: number;
  imagesCount: number;
  onInspectJob?: (jobId: string) => void;
  selectedJobId?: string | null;
}

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
    activeRecipeAliasId: RecipeAliasId | null;
    recipePageProps: Omit<RecipePageProps, 'activeRecipe'>;
    studioPageController: StudioPageController;
    onSelectRecipe: (recipeId: RecipeId, aliasId?: RecipeAliasId | null) => void;
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
  isGenerating: boolean;
  transitioningImageId: StudioGridSurfaceProps['transitioningImageId'];
  activeModalImageId: StudioGridSurfaceProps['activeModalImageId'];
  handleSelectAll: StudioGridSurfaceProps['handleSelectAll'];
  handleDeselectAll: StudioGridSurfaceProps['handleDeselectAll'];
  handleDeleteSelected: StudioGridSurfaceProps['handleDeleteSelected'];
  handleClearWorkspace: StudioGridSurfaceProps['handleClearWorkspace'];
  previewRatio: AspectRatio | null;
  generationAspectRatio: AspectRatio;
  isInteractingWithToolbar: boolean;
  catalogTotal: number;
  catalogHasMore: boolean;
  isCatalogLoading: boolean;
  catalogError: string | null;
  loadMoreCatalog: () => void | Promise<void>;
  refreshCatalog: () => void;
}

interface StudioPageOperationsContext {
  isQueueOpen: StudioOperationsRailProps['isQueueOpen'];
  setIsQueueOpen: StudioOperationsRailProps['setIsQueueOpen'];
  queueResults: StudioOperationsRailProps['queueResults'];
  studioJobs: StudioOperationsRailProps['studioJobs'];
  selectedStudioJobId: StudioOperationsRailProps['selectedStudioJobId'];
  retryPersistentJob: StudioOperationsRailProps['retryPersistentJob'];
  cancelPersistentJob: StudioOperationsRailProps['cancelPersistentJob'];
  onInspectJob: NonNullable<LeftDebugPanelProps['onInspectJob']>;
}

export interface BuildStudioPageControllerArgs {
  debug: StudioPageDebugContext;
  grid: StudioPageGridContext;
  operations: StudioPageOperationsContext;
}

const ACTIVE_SERVER_JOB_STATUSES = new Set<JobStatus>(['queued', 'running', 'needs_review']);

function createdAtMs(value: string | number) {
  return typeof value === 'number' ? value : Date.parse(value) || Date.now();
}

export function buildStudioGenerationPlaceholders({
  studioJobs,
  activeWorkspaceId,
  fallbackAspectRatio,
}: {
  studioJobs: StudioJob[];
  activeWorkspaceId: string;
  fallbackAspectRatio: AspectRatio;
}): StudioGenerationPlaceholder[] {
  const activeServerJobs = studioJobs.filter((job) => ACTIVE_SERVER_JOB_STATUSES.has(job.status));

  return activeServerJobs
    .flatMap((job) => {
      if (job.workspaceId && job.workspaceId !== activeWorkspaceId) return [];
      return [
        {
          id: `server-${job.id}`,
          status: job.status,
          aspectRatio: job.aspectRatio ?? fallbackAspectRatio,
          prompt: job.promptPreview || 'Generating image',
          createdAt: createdAtMs(job.createdAt),
        },
      ];
    })
    .toSorted((left, right) => right.createdAt - left.createdAt || left.id.localeCompare(right.id));
}

interface StudioViewportNavigationContext {
  routeView: AppPageView;
  direction: number;
  activeRecipe: RecipeId | null;
  activeRecipeAliasId: RecipeAliasId | null;
  onSelectRecipe: (recipeId: RecipeId, aliasId?: RecipeAliasId | null) => void;
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
  const generationPlaceholders = buildStudioGenerationPlaceholders({
    studioJobs: args.operations.studioJobs,
    activeWorkspaceId: args.grid.activeWorkspaceId,
    fallbackAspectRatio: args.grid.generationAspectRatio,
  });

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
      transitioningImageId: args.grid.transitioningImageId,
      activeModalImageId: args.grid.activeModalImageId,
      handleSelectAll: args.grid.handleSelectAll,
      handleDeselectAll: args.grid.handleDeselectAll,
      handleDeleteSelected: args.grid.handleDeleteSelected,
      handleClearWorkspace: args.grid.handleClearWorkspace,
      chrome: {
        isModalOpen: args.grid.isModalOpen,
        isInteractingWithToolbar: args.grid.isInteractingWithToolbar,
        previewRatio: args.grid.previewRatio,
        generationAspectRatio: args.grid.generationAspectRatio,
      },
      generation: {
        isGenerating: args.grid.isGenerating || generationPlaceholders.length > 0,
        placeholders: generationPlaceholders,
      },
      catalog: {
        total: args.grid.catalogTotal,
        hasMore: args.grid.catalogHasMore,
        isLoading: args.grid.isCatalogLoading,
        error: args.grid.catalogError,
        loadMore: args.grid.loadMoreCatalog,
        refresh: args.grid.refreshCatalog,
      },
    },
    operations: {
      isModalOpen: args.grid.isModalOpen,
      isQueueOpen: args.operations.isQueueOpen,
      setIsQueueOpen: args.operations.setIsQueueOpen,
      queueResults: args.operations.queueResults,
      studioJobs: args.operations.studioJobs,
      selectedStudioJobId: args.operations.selectedStudioJobId,
      retryPersistentJob: args.operations.retryPersistentJob,
      cancelPersistentJob: args.operations.cancelPersistentJob,
      onInspectJob: args.operations.onInspectJob,
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
      activeRecipeAliasId: navigation.activeRecipeAliasId,
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
