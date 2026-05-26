import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import { buildStudioPageController } from '../lib/buildStudioPageController';

describe('buildStudioPageController', () => {
  it('concentrates debug, grid, and operations props behind one controller', () => {
    const controller = buildStudioPageController({
      isModalOpen: false,
      workspaces: [{ id: 'default', name: 'Default', createdAt: 1 }],
      mergedLogs: [{ id: 'log-1', message: 'hello', timestamp: 1 }],
      catalogVisualGroupCount: 2,
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
      cancelJob: () => {},
      cancelPersistentJob: () => {},
      removeJob: () => {},
      clearCompleted: () => {},
      isResting: false,
      exportWorkspaceSnapshot: () => {},
      isBackgroundEnabled: true,
      setBackgroundEnabled: () => {},
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
    });

    expect(controller.debugPanel.isVisible).toBe(false);
    expect(controller.debugPanel.props.imagesCount).toBe(1);
    expect(controller.grid.hasProcessingJobs).toBe(true);
    expect(controller.operations.activeServerJobCount).toBe(1);
  });
});
