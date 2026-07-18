import { describe, expect, it } from 'vite-plus/test';

import type { StudioOverlayController } from '../components/overlays/types';
import { hasMountedStudioOverlay } from './studioOverlayVisibility';

function createController(): StudioOverlayController {
  return {
    imageOverlays: {
      modalImage: null,
      imagesWithConfig: [],
      activeGenerationConfig: null,
      closeModal: () => {},
      handleDelete: () => {},
      handleGenerate: () => {},
      handleAddToContext: () => {},
      handleLoadRecipe: () => {},
      handleToggleFavorite: () => {},
      setActiveCarouselId: () => {},
      isEditorOpen: false,
      closeEditor: () => {},
      imageToEdit: null,
      handleExecuteEdit: async () => {},
      isEditingImage: false,
    },
    systemOverlays: {
      flags: {
        isDebugPanelOpen: false,
        isDashboardModalOpen: false,
        isChatPanelOpen: false,
        isLoadingSelectedJob: false,
        isCheckingOnboarding: false,
        isDesktopRuntime: false,
        isOnboardingOpen: false,
        isOnboardingReady: false,
        isStartingAppServer: false,
        isSettingsModalOpen: false,
        isLoadingSettings: false,
        isSavingSettings: false,
        isLoadingOutputSources: false,
        isRegisteringOutputSource: false,
        isResettingStudio: false,
      },
      closeDebugPanel: () => {},
      closeChatPanel: () => {},
      mergedLogs: [],
      closeDashboard: () => {},
      visualGroupsCount: 0,
      workspaces: [],
      studioJobs: [],
      imagesCount: 0,
      selectedJobDetail: null,
      onInspectJob: () => {},
      onClearSelectedJob: () => {},
      handleGenerate: () => {},
      isGenerating: false,
      activeProviderId: 'codex',
      handleExportLegacyWorkspaceSnapshot: () => {},
      apiBase: 'http://127.0.0.1:17223',
      onboardingError: null,
      onboardingHealth: null,
      localCodexSession: null,
      readiness: null as never,
      closeOnboarding: () => {},
      completeOnboarding: () => {},
      refreshOnboardingHealth: () => {},
      ensureAppServer: () => {},
      settingsModule: null as never,
    },
    workspaceOverlays: {
      isTrashModalOpen: false,
      closeTrash: () => {},
      trash: [],
      restoreFromTrash: () => {},
      restoreAllFromTrash: () => {},
      emptyTrash: () => {},
    },
    confirmationOverlay: {
      pendingConfirmation: null,
      closeConfirmation: () => {},
      confirmPendingAction: () => {},
    },
  };
}

describe('hasMountedStudioOverlay', () => {
  it('keeps the overlay chunk unmounted while every surface is closed', () => {
    expect(hasMountedStudioOverlay(createController())).toBe(false);
  });

  it.each([
    'isDebugPanelOpen',
    'isDashboardModalOpen',
    'isChatPanelOpen',
    'isOnboardingOpen',
    'isSettingsModalOpen',
  ] as const)('mounts the overlay chunk for %s', (flag) => {
    const controller = createController();
    controller.systemOverlays.flags[flag] = true;

    expect(hasMountedStudioOverlay(controller)).toBe(true);
  });

  it('mounts for image, editor, trash, and confirmation surfaces', () => {
    const imageController = createController();
    imageController.imageOverlays.modalImage = {} as never;
    expect(hasMountedStudioOverlay(imageController)).toBe(true);

    const editorController = createController();
    editorController.imageOverlays.isEditorOpen = true;
    expect(hasMountedStudioOverlay(editorController)).toBe(true);

    const trashController = createController();
    trashController.workspaceOverlays.isTrashModalOpen = true;
    expect(hasMountedStudioOverlay(trashController)).toBe(true);

    const confirmationController = createController();
    confirmationController.confirmationOverlay.pendingConfirmation = {} as never;
    expect(hasMountedStudioOverlay(confirmationController)).toBe(true);
  });
});
