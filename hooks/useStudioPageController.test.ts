import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  buildStudioPageController,
  buildStudioViewportController,
} from '../lib/buildStudioPageController';

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
        exportLegacyVisualBatchSnapshot: () => {},
        activeServerJobCount: 1,
        onInspectJob: () => {},
        diagnostics: {
          health: null,
          backendConnected: true,
          hasFetchedDiagnostics: true,
          localCodexSession: null,
          statusItems: [],
          usage: {
            value: '120',
            meta: 'ChatGPT Pro',
            tooltip: 'Available usage for ChatGPT Pro',
            unitLabel: 'credits',
            limits: [],
            tone: 'available',
            isLoading: false,
          },
        },
        onResetStudio: () => {},
        isResettingStudio: false,
      },
    });

    expect(controller.debugPanel.isVisible).toBe(false);
    expect(controller.debugPanel.props.imagesCount).toBe(1);
    expect(controller.grid.isGenerating).toBe(true);
    expect(controller.operations.activeServerJobCount).toBe(1);
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
        exportLegacyVisualBatchSnapshot: () => {},
        activeServerJobCount: 0,
        onInspectJob: () => {},
        diagnostics: {
          health: null,
          backendConnected: true,
          hasFetchedDiagnostics: true,
          localCodexSession: null,
          statusItems: [],
          usage: {
            value: '120',
            meta: 'ChatGPT Pro',
            tooltip: 'Available usage for ChatGPT Pro',
            unitLabel: 'credits',
            limits: [],
            tone: 'available',
            isLoading: false,
          },
        },
        onResetStudio: () => {},
        isResettingStudio: false,
      },
    });

    const controller = buildStudioViewportController({
      navigation: {
        routeView: 'recipe',
        direction: 1,
        activeRecipe: 'camera',
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
