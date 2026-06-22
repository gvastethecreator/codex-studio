import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  buildStudioOverlayController,
  buildStudioShellOverlayController,
} from './useStudioOverlayController';

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
      chatPanel: {
        isOpen: true,
        close: () => calls.push('closeChat'),
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
        handleExportLegacyVisualBatchSnapshot: () => {
          calls.push('exportLegacyVisualBatchSnapshot');
        },
      },
      onboarding: {
        apiBase: 'http://localhost:17223',
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
        diagnosticsLibraryDir: null,
      },
      isSettingsModalOpen: false,
      settingsModule: {
        close: () => calls.push('closeSettings'),
        settingsDomain: {
          settings: null,
          error: null,
          isLoading: false,
          isSaving: false,
          refresh: () => {
            calls.push('refreshSettings');
          },
          update: () => {
            calls.push('updateSettings');
          },
        },
        providerDomain: {
          capabilities: null,
          runtimePreflight: null,
        },
        outputSourcesDomain: {
          outputSources: null,
          outputSourceFiles: {},
          isLoadingOutputSources: false,
          loadingOutputSourceFiles: {},
          isRegisteringOutputSource: false,
          importingOutputSources: {},
          registerOutputSource: () => {
            calls.push('registerOutputSource');
          },
          loadOutputSourceFiles: () => {
            calls.push('loadOutputSourceFiles');
          },
          importOutputSourceFiles: () => {
            calls.push('importOutputSourceFiles');
          },
        },
        maintenanceDomain: {
          audit: null,
          compactResult: null,
          thumbnailBackfillResult: null,
          toolingLogsPruneResult: null,
          isLoadingAudit: false,
          runningAction: null,
          refreshAudit: () => {
            calls.push('refreshMaintenanceAudit');
          },
          compactStorage: () => {
            calls.push('compactStorage');
          },
          backfillThumbnails: () => {
            calls.push('backfillThumbnails');
          },
          pruneToolingLogs: () => {
            calls.push('pruneToolingLogs');
          },
        },
        libraryDir: 'D:/AI-Studio-Library',
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
    controller.systemOverlays.closeChatPanel();
    controller.systemOverlays.refreshOnboardingHealth();
    controller.systemOverlays.ensureAppServer();
    controller.systemOverlays.settingsModule.close();
    controller.systemOverlays.handleExportLegacyVisualBatchSnapshot();
    void controller.systemOverlays.settingsModule.settingsDomain.refresh();
    controller.workspaceOverlays.restoreAllFromTrash();
    controller.workspaceOverlays.emptyTrash();

    expect(calls).toEqual([
      'transition',
      'closeOnboarding',
      'transition',
      'completeOnboarding',
      'closeChat',
      'refreshOnboardingHealth',
      'ensureAppServer',
      'closeSettings',
      'exportLegacyVisualBatchSnapshot',
      'refreshSettings',
      'restoreAll:2',
      'emptyTrash:2',
    ]);
    expect(controller.confirmationOverlay.pendingConfirmation?.title).toBe('Confirm reset');
    expect(controller.imageOverlays.isEditorOpen).toBe(true);
  });

  it('derives shell overlay settings details from runtime and settings modules', () => {
    const calls: string[] = [];

    const controller = buildStudioShellOverlayController({
      image: {
        modalImage: null,
        imagesWithConfig: [],
        activeGenerationConfig: null,
        closeModal: () => {
          calls.push('closeModal');
        },
        handleDelete: () => {
          calls.push('delete');
        },
        handleGenerate: () => {
          calls.push('generate');
        },
        handleAddToContext: () => {
          calls.push('context');
        },
        handleLoadRecipe: () => {
          calls.push('recipe');
        },
        handleToggleFavorite: () => {
          calls.push('favorite');
        },
        setActiveCarouselId: () => {
          calls.push('carousel');
        },
      },
      editor: {
        isEditorOpen: false,
        closeEditor: () => {
          calls.push('closeEditor');
        },
        imageToEdit: null,
        handleExecuteEdit: async () => null,
        isEditingImage: false,
      },
      chrome: {
        debugPanel: {
          isOpen: false,
          close: () => {
            calls.push('closeDebug');
          },
        },
        chatPanel: {
          isOpen: false,
          close: () => {
            calls.push('closeChat');
          },
        },
        dashboard: {
          isOpen: false,
          close: () => {
            calls.push('closeDashboard');
          },
        },
      },
      runtime: {
        mergedLogs: [],
        studioJobs: [],
        onboarding: {
          apiBase: 'http://localhost:17223',
          error: null,
          health: {
            ok: true,
            checkedAt: '2026-05-27T00:00:00.000Z',
            libraryDir: 'D:/from-onboarding',
            runtime: {
              platform: 'win32',
              arch: 'x64',
              bunVersion: '1.3.13',
              nodeVersion: '22.15.0',
              cwd: 'D:/DEV/codex-studio',
              envLocalPath: 'D:/DEV/codex-studio/.env.local',
              envLocalPresent: true,
            },
            config: {
              serverPort: 17223,
              codexWsPort: 17224,
            },
            library: {
              exists: true,
              writable: true,
              readmePresent: true,
              missingFolders: [],
            },
            codexCli: {
              available: true,
              version: '1.0.0',
              command: 'codex',
            },
            appServer: {
              running: true,
              wsUrl: 'ws://127.0.0.1:17224',
              pid: 1234,
              lastExitCode: null,
              lastExitAt: null,
              lastInvocation: null,
              lastStartAt: null,
              lastStartError: null,
              lastEnsureAt: null,
              lastEnsureReason: null,
            },
            checks: {
              libraryReady: true,
              codexReady: true,
              onboardingReady: true,
            },
          },
          localCodexSession: null,
          readiness: {
            stage: 'checking',
            isReady: false,
            nextAction: null,
            title: 'Checking',
            description: 'Checking runtime',
            checks: [],
          },
          isChecking: false,
          isDesktopRuntime: false,
          isOpen: false,
          isReady: false,
          isStartingAppServer: false,
          close: () => {
            calls.push('closeOnboarding');
          },
          complete: () => {
            calls.push('completeOnboarding');
          },
          refreshHealth: () => {
            calls.push('refreshOnboardingHealth');
          },
          ensureAppServer: () => {
            calls.push('ensureAppServer');
          },
          diagnosticsLibraryDir: 'D:/from-diagnostics',
        },
      },
      activity: {
        selectedJobDetail: null,
        isLoadingSelectedJob: false,
        onInspectJob: () => {
          calls.push('inspectJob');
        },
        onClearSelectedJob: () => {
          calls.push('clearSelectedJob');
        },
      },
      vault: {
        handleExportLegacyVisualBatchSnapshot: () => {
          calls.push('exportLegacyVisualBatchSnapshot');
        },
      },
      isSettingsModalOpen: true,
      settingsModule: {
        close: () => {
          calls.push('closeSettings');
        },
        settingsDomain: {
          settings: null,
          error: null,
          isLoading: false,
          isSaving: false,
          refresh: () => {
            calls.push('refreshSettings');
          },
          update: () => {
            calls.push('updateSettings');
          },
        },
        providerDomain: {
          capabilities: null,
          runtimePreflight: null,
        },
        outputSourcesDomain: {
          outputSources: null,
          outputSourceFiles: {},
          isLoadingOutputSources: false,
          loadingOutputSourceFiles: {},
          isRegisteringOutputSource: false,
          importingOutputSources: {},
          registerOutputSource: () => {
            calls.push('registerOutputSource');
          },
          loadOutputSourceFiles: () => {
            calls.push('loadOutputSourceFiles');
          },
          importOutputSourceFiles: () => {
            calls.push('importOutputSourceFiles');
          },
        },
        maintenanceDomain: {
          audit: null,
          compactResult: null,
          thumbnailBackfillResult: null,
          toolingLogsPruneResult: null,
          isLoadingAudit: false,
          runningAction: null,
          refreshAudit: () => {
            calls.push('refreshMaintenanceAudit');
          },
          compactStorage: () => {
            calls.push('compactStorage');
          },
          backfillThumbnails: () => {
            calls.push('backfillThumbnails');
          },
          pruneToolingLogs: () => {
            calls.push('pruneToolingLogs');
          },
        },
        libraryDir: null,
        onResetStudio: () => {
          calls.push('resetStudio');
        },
        isResettingStudio: false,
      },
      workspace: {
        catalogVisualGroupCount: 0,
        workspaces: [],
        trash: [],
        restoreFromTrash: () => {
          calls.push('restoreFromTrash');
        },
        isTrashModalOpen: false,
        closeTrash: () => {
          calls.push('closeTrash');
        },
      },
      workspaceActions: {
        requestRestoreAllTrash: () => {
          calls.push('restoreAllTrash');
        },
        requestEmptyTrash: () => {
          calls.push('emptyTrash');
        },
      },
      confirmation: {
        pendingConfirmation: null,
        closeConfirmation: () => {
          calls.push('closeConfirmation');
        },
        confirmPendingAction: () => {
          calls.push('confirmPendingAction');
        },
      },
    });

    expect(controller.systemOverlays.settingsModule.libraryDir).toBe('D:/from-diagnostics');
  });
});
