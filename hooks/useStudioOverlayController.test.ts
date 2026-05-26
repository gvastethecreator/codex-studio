import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import { buildStudioOverlayController } from './useStudioOverlayController';

describe('buildStudioOverlayController', () => {
  it('centralizes overlay counts and transition wrappers', () => {
    const calls: string[] = [];

    const controller = buildStudioOverlayController({
      image: {
        modalImage: null,
        imagesWithConfig: [
          {
            id: 'img-1',
            src: 'file://image-1.png',
            batchId: 'batch-1',
            createdAt: 1,
            config: {
              ...DEFAULT_GENERATION_CONFIG,
              prompt: 'city skyline',
            },
          },
          {
            id: 'img-2',
            src: 'file://image-2.png',
            batchId: 'batch-2',
            createdAt: 2,
            config: {
              ...DEFAULT_GENERATION_CONFIG,
              prompt: 'forest trail',
              aspectRatio: '3:2',
            },
          },
        ],
        activeGenerationConfig: null,
        closeModal: () => calls.push('closeModal'),
        handleDelete: (imageId) => calls.push(`delete:${imageId}`),
        handleGenerate: () => calls.push('generate'),
        handleAddToContext: (image) => calls.push(`context:${image.id}`),
        handleLoadRecipe: (config) => calls.push(`recipe:${config.prompt}`),
        handleToggleFavorite: (imageId) => calls.push(`favorite:${imageId}`),
        setActiveCarouselId: (imageId) => calls.push(`carousel:${imageId}`),
      },
      editor: {
        isEditorOpen: true,
        closeEditor: () => calls.push('closeEditor'),
        imageToEdit: {
          id: 'attachment-1',
          name: 'edit.png',
          dataUrl: 'data:image/png;base64,abc123',
          strength: 1,
        },
        handleExecuteEdit: async () => {
          calls.push('executeEdit');
        },
        isEditingImage: true,
      },
      debugPanel: {
        isOpen: true,
        close: () => calls.push('closeDebug'),
      },
      dashboard: {
        isOpen: true,
        close: () => calls.push('closeDashboard'),
      },
      activity: {
        mergedLogs: [{ id: 'log-1', message: 'hello', timestamp: 1 }],
        studioJobs: [
          {
            id: 'job-1',
            projectId: 'default',
            kind: 'dry_run',
            providerId: null,
            sourceSpec: null,
            status: 'queued',
            execution: null,
            originalPrompt: 'hello',
            expandedPrompt: null,
            finalPromptUsed: 'hello',
            error: null,
            createdAt: '2026-05-07T00:00:00.000Z',
            updatedAt: '2026-05-07T00:00:00.000Z',
            completedAt: null,
          },
        ],
        selectedJobDetail: null,
        isLoadingSelectedJob: false,
        onInspectJob: (jobId) => calls.push(`inspect:${jobId}`),
        onClearSelectedJob: () => calls.push('clearSelectedJob'),
      },
      vault: {
        handleExportWorkspaceSnapshot: () => {
          calls.push('exportWorkspaceSnapshot');
        },
        handleDeepScan: () => {
          calls.push('deepScan');
        },
      },
      onboarding: {
        apiBase: 'http://localhost:4317',
        error: null,
        health: null,
        localCodexSession: null,
        readiness: {
          stage: 'checking',
          isReady: false,
          nextAction: null,
          title: 'Desktop runtime checking',
          description:
            'Refreshing backend health, app-server diagnostics, and the Local Codex Session.',
          checks: [],
        },
        isChecking: false,
        isDesktopRuntime: false,
        isOpen: true,
        isReady: false,
        isStartingAppServer: false,
        close: () => calls.push('closeOnboarding'),
        complete: () => calls.push('completeOnboarding'),
        refreshHealth: () => {
          calls.push('refreshOnboardingHealth');
        },
        ensureAppServer: () => {
          calls.push('ensureAppServer');
        },
      },
      settings: {
        isOpen: false,
        close: () => calls.push('closeSettings'),
        settings: null,
        error: null,
        isLoading: false,
        isSaving: false,
        providerCapabilities: null,
        providerRuntimePreflight: null,
        outputSources: null,
        outputSourceFiles: {},
        isLoadingOutputSources: false,
        loadingOutputSourceFiles: {},
        isRegisteringOutputSource: false,
        importingOutputSources: {},
        libraryDir: 'D:/AI-Studio-Library',
        refresh: () => {
          calls.push('refreshSettings');
        },
        update: () => {
          calls.push('updateSettings');
        },
        registerOutputSource: () => {
          calls.push('registerOutputSource');
        },
        loadOutputSourceFiles: () => {
          calls.push('loadOutputSourceFiles');
        },
        importOutputSourceFiles: () => {
          calls.push('importOutputSourceFiles');
        },
        isBackgroundEnabled: true,
        onToggleBackground: () => calls.push('toggleBackground'),
        onResetStudio: () => {
          calls.push('resetStudio');
        },
        isResettingStudio: false,
      },
      workspace: {
        catalogVisualGroupCount: 3,
        workspaces: [{ id: 'default', name: 'Default', createdAt: 1 }],
        trash: [
          {
            id: 'trash-1',
            workspaceId: 'default',
            createdAt: 1,
            prompt: 'archived one',
            model: 'codex-imagegen',
            imageCount: 1,
          },
          {
            id: 'trash-2',
            workspaceId: 'default',
            createdAt: 2,
            prompt: 'archived two',
            model: 'codex-imagegen',
            imageCount: 2,
          },
        ],
        restoreFromTrash: (batchId) => calls.push(`restore:${batchId}`),
        isTrashModalOpen: true,
        closeTrash: () => calls.push('closeTrash'),
      },
      workspaceActions: {
        requestRestoreAllTrash: (count) => calls.push(`restoreAll:${count}`),
        requestEmptyTrash: (count) => calls.push(`emptyTrash:${count}`),
      },
      confirmation: {
        pendingConfirmation: {
          title: 'Confirm reset',
          description: 'Danger zone.',
          confirmLabel: 'Do it',
        },
        closeConfirmation: () => calls.push('closeConfirmation'),
        confirmPendingAction: () => {
          calls.push('confirmPendingAction');
        },
      },
      startTransition: (callback) => {
        calls.push('transition');
        callback();
      },
    });

    expect(controller.systemOverlays.imagesCount).toBe(2);
    expect(controller.systemOverlays.visualGroupsCount).toBe(3);

    controller.systemOverlays.closeOnboarding();
    controller.systemOverlays.completeOnboarding();
    controller.systemOverlays.refreshOnboardingHealth();
    controller.systemOverlays.ensureAppServer();
    controller.systemOverlays.closeSettings();
    controller.systemOverlays.handleExportWorkspaceSnapshot();
    void controller.systemOverlays.refreshSettings();
    controller.workspaceOverlays.restoreAllFromTrash();
    controller.workspaceOverlays.emptyTrash();

    expect(calls).toEqual([
      'transition',
      'closeOnboarding',
      'transition',
      'completeOnboarding',
      'refreshOnboardingHealth',
      'ensureAppServer',
      'closeSettings',
      'exportWorkspaceSnapshot',
      'refreshSettings',
      'restoreAll:2',
      'emptyTrash:2',
    ]);
    expect(controller.confirmationOverlay.pendingConfirmation?.title).toBe('Confirm reset');
    expect(controller.imageOverlays.isEditorOpen).toBe(true);
  });
});
