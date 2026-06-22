import type { LeftDebugPanelProps } from '../components/LeftDebugPanel';
import type { RecipePageProps } from '../components/RecipePage';
import type { ToolbarProps } from '../components/Toolbar';
import type { StudioGridSurfaceProps } from '../components/studio/StudioGridSurface';
import type { StudioOperationsRailProps } from '../components/studio/StudioOperationsRail';
import type { Job as StudioJob, JobStatus } from '../packages/shared/src';
import type { AppPageView } from '../hooks/useHashRouter';
import type {
  AspectRatio,
  QueueJob,
  QueueJobStatus,
  RecipeId,
  StudioGenerationPlaceholder,
} from '../types';

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
  catalogTotal: StudioGridSurfaceProps['catalogTotal'];
  catalogHasMore: StudioGridSurfaceProps['catalogHasMore'];
  isCatalogLoading: StudioGridSurfaceProps['isCatalogLoading'];
  catalogError: StudioGridSurfaceProps['catalogError'];
  loadMoreCatalog: StudioGridSurfaceProps['loadMoreCatalog'];
  refreshCatalog: StudioGridSurfaceProps['refreshCatalog'];
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
  onInspectJob: NonNullable<LeftDebugPanelProps['onInspectJob']>;
}

export interface BuildStudioPageControllerArgs {
  debug: StudioPageDebugContext;
  grid: StudioPageGridContext;
  operations: StudioPageOperationsContext;
}

const ACTIVE_LOCAL_JOB_STATUSES = new Set<QueueJobStatus>(['pending', 'processing']);
const ACTIVE_SERVER_JOB_STATUSES = new Set<JobStatus>(['queued', 'running', 'needs_review']);

function createdAtMs(value: string | number) {
  return typeof value === 'number' ? value : Date.parse(value) || Date.now();
}

function readJobWorkspaceId(job: StudioJob) {
  const value = job.sourceSpec?.metadata?.workspaceId;
  return typeof value === 'string' && value.trim() ? value : null;
}

function readJobAspectRatio(job: StudioJob, linkedLocalJob: QueueJob | undefined) {
  return job.sourceSpec?.output.aspectRatio ?? linkedLocalJob?.config.aspectRatio ?? null;
}

export function buildStudioGenerationPlaceholders({
  jobs,
  studioJobs,
  activeWorkspaceId,
  fallbackAspectRatio,
}: {
  jobs: QueueJob[];
  studioJobs: StudioJob[];
  activeWorkspaceId: string;
  fallbackAspectRatio: AspectRatio;
}): StudioGenerationPlaceholder[] {
  const linkedLocalJobs = new Map(
    jobs.flatMap((job) => (job.serverJobId ? [[job.serverJobId, job] as const] : [])),
  );
  const activeServerJobs = studioJobs.filter((job) => ACTIVE_SERVER_JOB_STATUSES.has(job.status));
  const activeServerJobIds = new Set(activeServerJobs.map((job) => job.id));

  return [
    ...activeServerJobs.flatMap((job) => {
      const linkedLocalJob = linkedLocalJobs.get(job.id);
      const workspaceId = readJobWorkspaceId(job) ?? linkedLocalJob?.workspaceId ?? null;
      if (workspaceId && workspaceId !== activeWorkspaceId) return [];

      return [
        {
          id: `server-${job.id}`,
          status: job.status,
          aspectRatio: readJobAspectRatio(job, linkedLocalJob) ?? fallbackAspectRatio,
          prompt: job.originalPrompt || linkedLocalJob?.prompt || 'Generating image',
          createdAt: createdAtMs(job.createdAt),
        },
      ];
    }),
    ...jobs.flatMap((job) => {
      if (!ACTIVE_LOCAL_JOB_STATUSES.has(job.status)) return [];
      if (job.workspaceId !== activeWorkspaceId) return [];
      if (job.serverJobId && activeServerJobIds.has(job.serverJobId)) return [];

      return [
        {
          id: `local-${job.id}`,
          status: job.status,
          aspectRatio: job.config.aspectRatio,
          prompt: job.prompt,
          createdAt: job.createdAt,
        },
      ];
    }),
  ].toSorted((left, right) => right.createdAt - left.createdAt || left.id.localeCompare(right.id));
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
  const generationPlaceholders = buildStudioGenerationPlaceholders({
    jobs: args.operations.jobs,
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
      isGenerating:
        args.grid.isGenerating || hasProcessingJobs || generationPlaceholders.length > 0,
      transitioningImageId: args.grid.transitioningImageId,
      activeModalImageId: args.grid.activeModalImageId,
      generationPlaceholders,
      handleSelectAll: args.grid.handleSelectAll,
      handleDeselectAll: args.grid.handleDeselectAll,
      handleDeleteSelected: args.grid.handleDeleteSelected,
      handleClearWorkspace: args.grid.handleClearWorkspace,
      previewRatio: args.grid.previewRatio,
      generationAspectRatio: args.grid.generationAspectRatio,
      isInteractingWithToolbar: args.grid.isInteractingWithToolbar,
      catalogTotal: args.grid.catalogTotal,
      catalogHasMore: args.grid.catalogHasMore,
      isCatalogLoading: args.grid.isCatalogLoading,
      catalogError: args.grid.catalogError,
      loadMoreCatalog: args.grid.loadMoreCatalog,
      refreshCatalog: args.grid.refreshCatalog,
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
