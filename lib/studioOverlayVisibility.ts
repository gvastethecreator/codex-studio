import type { StudioOverlayController } from '../components/overlays/types';

export function hasMountedStudioOverlay(controller: StudioOverlayController) {
  const { imageOverlays, systemOverlays, workspaceOverlays, confirmationOverlay } = controller;
  const flags = systemOverlays.flags;

  return Boolean(
    imageOverlays.modalImage ||
    imageOverlays.isEditorOpen ||
    flags.isDebugPanelOpen ||
    flags.isDashboardModalOpen ||
    flags.isChatPanelOpen ||
    flags.isOnboardingOpen ||
    flags.isSettingsModalOpen ||
    workspaceOverlays.isTrashModalOpen ||
    confirmationOverlay.pendingConfirmation,
  );
}
