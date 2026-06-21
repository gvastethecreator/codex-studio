export type SystemSurfaceKey = 'debug' | 'dashboard' | 'onboarding' | 'settings' | 'chat';

export function getMountedSystemSurfaceKeys(flags: {
  isDebugPanelOpen: boolean;
  isDashboardModalOpen: boolean;
  isOnboardingOpen: boolean;
  isSettingsModalOpen: boolean;
  isChatPanelOpen: boolean;
}): SystemSurfaceKey[] {
  const keys: SystemSurfaceKey[] = [];
  if (flags.isDebugPanelOpen) keys.push('debug');
  if (flags.isDashboardModalOpen) keys.push('dashboard');
  if (flags.isOnboardingOpen) keys.push('onboarding');
  if (flags.isSettingsModalOpen) keys.push('settings');
  if (flags.isChatPanelOpen) keys.push('chat');
  return keys;
}
