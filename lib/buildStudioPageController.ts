import type { LeftDebugPanelProps } from '../components/LeftDebugPanel';
import type { StudioGridSurfaceProps } from '../components/studio/StudioGridSurface';
import type { StudioOperationsRailProps } from '../components/studio/StudioOperationsRail';

export interface StudioPageController {
  debugPanel: {
    isVisible: boolean;
    props: LeftDebugPanelProps;
  };
  grid: StudioGridSurfaceProps;
  operations: StudioOperationsRailProps;
}

export interface BuildStudioPageControllerArgs {
  isModalOpen: boolean;
  workspaces: LeftDebugPanelProps['workspaces'];
  mergedLogs: LeftDebugPanelProps['logs'];
  catalogVisualGroupCount: LeftDebugPanelProps['visualGroupsCount'];
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
  isQueueOpen: StudioOperationsRailProps['isQueueOpen'];
  setIsQueueOpen: StudioOperationsRailProps['setIsQueueOpen'];
  jobs: StudioOperationsRailProps['jobs'];
  queueResults: StudioOperationsRailProps['queueResults'];
  studioJobs: StudioOperationsRailProps['studioJobs'];
  selectedStudioJobId: StudioOperationsRailProps['selectedStudioJobId'];
  retry: StudioOperationsRailProps['retry'];
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

export function buildStudioPageController(
  args: BuildStudioPageControllerArgs,
): StudioPageController {
  const hasProcessingJobs = args.jobs.some((job) => job.status === 'processing');

  return {
    debugPanel: {
      isVisible: false,
      props: {
        workspaces: args.workspaces,
        logs: args.mergedLogs,
        studioJobs: args.studioJobs,
        visualGroupsCount: args.catalogVisualGroupCount,
        imagesCount: args.allImages.length,
        onInspectJob: args.onInspectJob,
        selectedJobId: args.selectedStudioJobId,
      },
    },
    grid: {
      isModalOpen: args.isModalOpen,
      activeWorkspaceId: args.activeWorkspaceId,
      allImages: args.allImages,
      imagesWithConfig: args.imagesWithConfig,
      selectedImageIds: args.selectedImageIds,
      openModal: args.openModal,
      handleSelectionChange: args.handleSelectionChange,
      handleGenerate: args.handleGenerate,
      handleAddToContext: args.handleAddToContext,
      handleLoadRecipe: args.handleLoadRecipe,
      handleDelete: args.handleDelete,
      handleToggleFavorite: args.handleToggleFavorite,
      isGenerating: args.isGenerating || hasProcessingJobs,
      transitioningImageId: args.transitioningImageId,
      activeModalImageId: args.activeModalImageId,
      handleSelectAll: args.handleSelectAll,
      handleDeselectAll: args.handleDeselectAll,
      handleDeleteSelected: args.handleDeleteSelected,
      handleClearWorkspace: args.handleClearWorkspace,
      previewRatio: args.previewRatio,
      generationAspectRatio: args.generationAspectRatio,
      isInteractingWithToolbar: args.isInteractingWithToolbar,
    },
    operations: {
      isModalOpen: args.isModalOpen,
      isQueueOpen: args.isQueueOpen,
      setIsQueueOpen: args.setIsQueueOpen,
      jobs: args.jobs,
      queueResults: args.queueResults,
      studioJobs: args.studioJobs,
      selectedStudioJobId: args.selectedStudioJobId,
      retry: args.retry,
      cancelJob: args.cancelJob,
      cancelPersistentJob: args.cancelPersistentJob,
      removeJob: args.removeJob,
      clearCompleted: args.clearCompleted,
      isResting: args.isResting,
      exportWorkspaceSnapshot: args.exportWorkspaceSnapshot,
      isBackgroundEnabled: args.isBackgroundEnabled,
      setBackgroundEnabled: args.setBackgroundEnabled,
      activeServerJobCount: args.activeServerJobCount,
      onInspectJob: args.onInspectJob,
      diagnostics: args.diagnostics,
      onResetStudio: args.onResetStudio,
      isResettingStudio: args.isResettingStudio,
    },
  };
}
