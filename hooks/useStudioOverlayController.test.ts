import { describe, expect, it } from 'vite-plus/test';

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
            config: {
              prompt: 'city skyline',
              aspectRatio: '1:1',
              numberOfImages: 1,
              seed: 1,
              safetyChecker: false,
            },
          },
          {
            id: 'img-2',
            src: 'file://image-2.png',
            config: {
              prompt: 'forest trail',
              aspectRatio: '16:9',
              numberOfImages: 1,
              seed: 2,
              safetyChecker: false,
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
          type: 'image',
          mimeType: 'image/png',
          base64: 'abc123',
          name: 'edit.png',
          dataUrl: 'data:image/png;base64,abc123',
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
        mergedLogs: [{ id: 'log-1', message: 'hello', type: 'info', timestamp: 1 }],
        studioJobs: [
          {
            id: 'job-1',
            kind: 'dry_run',
            status: 'queued',
            createdAt: '2026-05-07T00:00:00.000Z',
            updatedAt: '2026-05-07T00:00:00.000Z',
          },
        ],
        selectedJobDetail: null,
        isLoadingSelectedJob: false,
        onInspectJob: (jobId) => calls.push(`inspect:${jobId}`),
        onClearSelectedJob: () => calls.push('clearSelectedJob'),
      },
      vault: {
        handleImportVault: () => calls.push('importVault'),
        handleDeepScan: () => calls.push('deepScan'),
      },
      onboarding: {
        apiBase: 'http://localhost:4317',
        error: null,
        health: null,
        isChecking: false,
        isDesktopRuntime: false,
        isOpen: true,
        isReady: false,
        isStartingAppServer: false,
        close: () => calls.push('closeOnboarding'),
        complete: () => calls.push('completeOnboarding'),
        refreshHealth: () => calls.push('refreshOnboardingHealth'),
        ensureAppServer: () => calls.push('ensureAppServer'),
      },
      workspace: {
        batches: [
          {
            id: 'batch-1',
            timestamp: 1,
            images: [],
            prompt: 'prompt',
            aspectRatio: '1:1',
          },
          {
            id: 'batch-2',
            timestamp: 2,
            images: [],
            prompt: 'prompt',
            aspectRatio: '1:1',
          },
          {
            id: 'batch-3',
            timestamp: 3,
            images: [],
            prompt: 'prompt',
            aspectRatio: '1:1',
          },
        ],
        workspaces: [{ id: 'default', name: 'Default' }],
        trash: [
          {
            id: 'trash-1',
            timestamp: 1,
            images: [],
            prompt: 'prompt',
            aspectRatio: '1:1',
          },
          {
            id: 'trash-2',
            timestamp: 2,
            images: [],
            prompt: 'prompt',
            aspectRatio: '1:1',
          },
        ],
        restoreFromTrash: (batchId) => calls.push(`restore:${batchId}`),
        isTrashModalOpen: true,
        closeTrash: () => calls.push('closeTrash'),
        isLimitModalOpen: true,
        dismissLimitModal: () => calls.push('dismissLimit'),
        handleDownloadAndClear: () => calls.push('downloadAndClear'),
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
        confirmPendingAction: () => calls.push('confirmPendingAction'),
      },
      startTransition: (callback) => {
        calls.push('transition');
        callback();
      },
    });

    expect(controller.systemOverlays.imagesCount).toBe(2);
    expect(controller.workspaceOverlays.batchCount).toBe(3);

    controller.systemOverlays.closeOnboarding();
    controller.systemOverlays.completeOnboarding();
    controller.systemOverlays.refreshOnboardingHealth();
    controller.systemOverlays.ensureAppServer();
    controller.workspaceOverlays.restoreAllFromTrash();
    controller.workspaceOverlays.emptyTrash();

    expect(calls).toEqual([
      'transition',
      'closeOnboarding',
      'transition',
      'completeOnboarding',
      'refreshOnboardingHealth',
      'ensureAppServer',
      'restoreAll:2',
      'emptyTrash:2',
    ]);
    expect(controller.confirmationOverlay.pendingConfirmation?.title).toBe('Confirm reset');
    expect(controller.imageOverlays.isEditorOpen).toBe(true);
  });
});