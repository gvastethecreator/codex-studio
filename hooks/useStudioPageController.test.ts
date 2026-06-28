import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  buildStudioGenerationPlaceholders,
  buildStudioPageController,
  buildStudioViewportController,
} from '../lib/buildStudioPageController';
import { createGenerationTaskSpec, type Job } from '../packages/shared/src';
import { toShellActivityJob } from '../lib/shellActivityJob';

describe('buildStudioPageController', () => {
  it('concentrates debug, grid, and operations props behind one controller', () => {
    const controller = buildStudioPageController({
      debug: {
        workspaces: [{ id: 'default', name: 'Default', createdAt: 1 }],
        mergedLogs: [{ id: 'log-1', message: 'hello', timestamp: 1 }],
        catalogVisualGroupCount: 2,
      },
      grid: {
        isModalOpen: false,
        allImages: [
          {
            id: 'img-1',
            src: 'file://image-1.png',
            batchId: 'batch-1',
            createdAt: 1,
          },
        ],
        imagesWithConfig: [
          {
            id: 'img-1',
            src: 'file://image-1.png',
            batchId: 'batch-1',
            createdAt: 1,
            config: DEFAULT_GENERATION_CONFIG,
          },
        ],
        selectedImageIds: ['img-1'],
        activeWorkspaceId: 'default',
        openModal: () => {},
        handleSelectionChange: () => {},
        handleGenerate: () => {},
        handleAddToContext: () => {},
        handleLoadRecipe: () => {},
        handleDelete: () => {},
        handleToggleFavorite: () => {},
        isGenerating: false,
        transitioningImageId: null,
        activeModalImageId: null,
        handleSelectAll: () => {},
        handleDeselectAll: () => {},
        handleDeleteSelected: () => {},
        handleClearWorkspace: () => {},
        previewRatio: null,
        generationAspectRatio: '1:1',
        isInteractingWithToolbar: false,
        catalogTotal: 250,
        catalogHasMore: true,
        isCatalogLoading: false,
        catalogError: null,
        loadMoreCatalog: () => {},
        refreshCatalog: () => {},
      },
      operations: {
        isQueueOpen: true,
        setIsQueueOpen: () => {},
        jobs: [
          {
            id: 'job-1',
            workspaceId: 'default',
            prompt: 'Neon skyline',
            config: DEFAULT_GENERATION_CONFIG,
            status: 'processing',
            createdAt: 1,
          },
        ],
        studioJobs: [],
        selectedStudioJobId: null,
        queueResults: [],
        retry: () => {},
        retryPersistentJob: () => {},
        cancelJob: () => {},
        cancelPersistentJob: () => {},
        removeJob: () => {},
        clearCompleted: () => {},
        isResting: false,
        onInspectJob: () => {},
      },
    });

    expect(controller.debugPanel.isVisible).toBe(false);
    expect(controller.debugPanel.props.imagesCount).toBe(1);
    expect(controller.grid.generation.isGenerating).toBe(true);
    expect(controller.grid.catalog.hasMore).toBe(true);
    expect(controller.grid.catalog.total).toBe(250);
    expect(controller.grid.generation.placeholders).toEqual([
      {
        id: 'local-job-1',
        status: 'processing',
        aspectRatio: '1:1',
        prompt: 'Neon skyline',
        createdAt: 1,
      },
    ]);
  });

  it('projects active generation jobs into grid placeholders', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-batch-1-1-1',
      task: 'image_generate',
      providerId: 'codex',
      prompt: 'Server prompt',
      output: { aspectRatio: '2:3' },
      metadata: { workspaceId: 'default' },
    });
    const runningJob: Job = {
      id: 'studio-1',
      projectId: 'project-1',
      kind: 'image_generate',
      providerId: 'codex',
      sourceSpec,
      status: 'running',
      execution: null,
      originalPrompt: 'Server prompt',
      expandedPrompt: null,
      finalPromptUsed: 'Server prompt',
      error: null,
      createdAt: '2026-06-22T10:00:00.000Z',
      updatedAt: '2026-06-22T10:00:01.000Z',
      completedAt: null,
    };

    expect(
      buildStudioGenerationPlaceholders({
        activeWorkspaceId: 'default',
        fallbackAspectRatio: '1:1',
        studioJobs: [
          toShellActivityJob(runningJob, 'backend_event'),
          toShellActivityJob({ ...runningJob, id: 'done-1', status: 'completed' }, 'backend_event'),
        ],
        jobs: [
          {
            id: 'queued-1',
            workspaceId: 'default',
            prompt: 'Local prompt',
            config: { ...DEFAULT_GENERATION_CONFIG, aspectRatio: '3:2' },
            status: 'pending',
            createdAt: Date.parse('2026-06-22T10:00:02.000Z'),
          },
          {
            id: 'linked-1',
            workspaceId: 'default',
            prompt: 'Linked prompt',
            config: DEFAULT_GENERATION_CONFIG,
            status: 'processing',
            serverJobId: 'studio-1',
            createdAt: Date.parse('2026-06-22T10:00:01.000Z'),
          },
          {
            id: 'other-workspace',
            workspaceId: 'archive',
            prompt: 'Hidden prompt',
            config: DEFAULT_GENERATION_CONFIG,
            status: 'pending',
            createdAt: Date.parse('2026-06-22T10:00:03.000Z'),
          },
        ],
      }),
    ).toEqual([
      {
        id: 'local-queued-1',
        status: 'pending',
        aspectRatio: '3:2',
        prompt: 'Local prompt',
        createdAt: Date.parse('2026-06-22T10:00:02.000Z'),
      },
      {
        id: 'server-studio-1',
        status: 'running',
        aspectRatio: '2:3',
        prompt: 'Server prompt',
        createdAt: Date.parse('2026-06-22T10:00:00.000Z'),
      },
    ]);
  });

  it('builds viewport and generation dock surfaces from one presentation seam', () => {
    const studioPageController = buildStudioPageController({
      debug: {
        workspaces: [{ id: 'default', name: 'Default', createdAt: 1 }],
        mergedLogs: [],
        catalogVisualGroupCount: 0,
      },
      grid: {
        isModalOpen: true,
        allImages: [],
        imagesWithConfig: [],
        selectedImageIds: [],
        activeWorkspaceId: 'default',
        openModal: () => {},
        handleSelectionChange: () => {},
        handleGenerate: () => {},
        handleAddToContext: () => {},
        handleLoadRecipe: () => {},
        handleDelete: () => {},
        handleToggleFavorite: () => {},
        isGenerating: false,
        transitioningImageId: null,
        activeModalImageId: null,
        handleSelectAll: () => {},
        handleDeselectAll: () => {},
        handleDeleteSelected: () => {},
        handleClearWorkspace: () => {},
        previewRatio: null,
        generationAspectRatio: '1:1',
        isInteractingWithToolbar: false,
        catalogTotal: 0,
        catalogHasMore: false,
        isCatalogLoading: false,
        catalogError: null,
        loadMoreCatalog: () => {},
        refreshCatalog: () => {},
      },
      operations: {
        isQueueOpen: true,
        setIsQueueOpen: () => {},
        jobs: [],
        studioJobs: [],
        selectedStudioJobId: null,
        queueResults: [],
        retry: () => {},
        retryPersistentJob: () => {},
        cancelJob: () => {},
        cancelPersistentJob: () => {},
        removeJob: () => {},
        clearCompleted: () => {},
        isResting: false,
        onInspectJob: () => {},
      },
    });

    const controller = buildStudioViewportController({
      navigation: {
        routeView: 'recipe',
        direction: 1,
        activeRecipe: 'camera',
        activeRecipeAliasId: null,
        onSelectRecipe: () => {},
      },
      recipe: {
        recipePageProps: {
          generationConfig: DEFAULT_GENERATION_CONFIG,
          updateGenerationConfig: () => {},
          updateAttachment: () => {},
          handlePastedFiles: () => {},
          handleGenerate: () => {},
          isGenerating: true,
          imagesWithConfig: [],
          openModal: () => {},
          handleAddToContext: () => {},
        },
        studioPageController,
      },
      dock: {
        isModalOpen: true,
        isDragging: true,
        toolbarProps: {
          generationConfig: DEFAULT_GENERATION_CONFIG,
          updateConfig: () => {},
          updateAttachment: () => {},
          onFileSelect: () => {},
          onFilesDrop: () => {},
          onRemoveAttachment: () => {},
          onGenerate: () => {},
          onEnhancePrompt: () => {},
          isGenerating: false,
          generationStartTime: null,
          isEnhancingPrompt: false,
          setPreviewRatio: () => {},
          setIsInteracting: () => {},
          onOpenEditor: () => {},
          isKeyPopoverOpen: false,
          onOpenKeySelector: () => {},
          onSelectKey: async () => {},
          maxAttachments: 8,
          codexModelCatalog: null,
          isLoadingCodexModelCatalog: false,
          codexModelCatalogError: null,
        },
      },
    });

    expect(controller.viewport.routeView).toBe('recipe');
    expect(controller.viewport.activeRecipe).toBe('camera');
    expect(controller.viewport.studioPageController).toBe(studioPageController);
    expect(controller.generationDock.currentView).toBe('recipe');
    expect(controller.generationDock.isModalOpen).toBe(true);
    expect(controller.generationDock.isDragging).toBe(true);
  });
});
