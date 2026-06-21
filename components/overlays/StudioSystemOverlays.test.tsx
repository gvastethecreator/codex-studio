import { describe, expect, it } from 'vite-plus/test';

import { getMountedSystemSurfaceKeys } from './studioSystemOverlaysUtils';

describe('StudioSystemOverlays', () => {
  it('mounts only the Demand-Mounted Surfaces that are open', () => {
    expect(
      getMountedSystemSurfaceKeys({
        isDebugPanelOpen: false,
        isDashboardModalOpen: false,
        isOnboardingOpen: false,
        isSettingsModalOpen: false,
        isChatPanelOpen: false,
      }),
    ).toEqual([]);

    expect(
      getMountedSystemSurfaceKeys({
        isDebugPanelOpen: true,
        isDashboardModalOpen: false,
        isOnboardingOpen: true,
        isSettingsModalOpen: false,
        isChatPanelOpen: true,
      }),
    ).toEqual(['debug', 'onboarding', 'chat']);
  });
});
