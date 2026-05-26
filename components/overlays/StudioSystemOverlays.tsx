import React, { Suspense } from 'react';

import type { StudioSystemOverlaysProps } from './types';

const DebugPanel = React.lazy(() =>
  import('../DebugPanel').then((m) => ({ default: m.DebugPanel })),
);
const DashboardModal = React.lazy(() =>
  import('../DashboardModal').then((m) => ({ default: m.DashboardModal })),
);
const OnboardingModal = React.lazy(() =>
  import('../OnboardingModal').then((m) => ({ default: m.OnboardingModal })),
);
const StudioSettingsModal = React.lazy(() =>
  import('../StudioSettingsModal').then((m) => ({ default: m.StudioSettingsModal })),
);

type SystemSurfaceKey = 'debug' | 'dashboard' | 'onboarding' | 'settings';

export function getMountedSystemSurfaceKeys(flags: {
  isDebugPanelOpen: boolean;
  isDashboardModalOpen: boolean;
  isOnboardingOpen: boolean;
  isSettingsModalOpen: boolean;
}): SystemSurfaceKey[] {
  const keys: SystemSurfaceKey[] = [];
  if (flags.isDebugPanelOpen) keys.push('debug');
  if (flags.isDashboardModalOpen) keys.push('dashboard');
  if (flags.isOnboardingOpen) keys.push('onboarding');
  if (flags.isSettingsModalOpen) keys.push('settings');
  return keys;
}

export const StudioSystemOverlays: React.FC<StudioSystemOverlaysProps> = ({
  isDebugPanelOpen,
  closeDebugPanel,
  mergedLogs,
  isDashboardModalOpen,
  closeDashboard,
  visualGroupsCount,
  workspaces,
  studioJobs,
  imagesCount,
  selectedJobDetail,
  isLoadingSelectedJob,
  onInspectJob,
  onClearSelectedJob,
  handleExportWorkspaceSnapshot,
  handleDeepScan,
  apiBase,
  onboardingError,
  onboardingHealth,
  localCodexSession,
  readiness,
  isCheckingOnboarding,
  isDesktopRuntime,
  isOnboardingOpen,
  isOnboardingReady,
  isStartingAppServer,
  closeOnboarding,
  completeOnboarding,
  refreshOnboardingHealth,
  ensureAppServer,
  isSettingsModalOpen,
  closeSettings,
  settings,
  settingsError,
  isLoadingSettings,
  isSavingSettings,
  providerCapabilities,
  providerRuntimePreflight,
  outputSources,
  outputSourceFiles,
  isLoadingOutputSources,
  loadingOutputSourceFiles,
  isRegisteringOutputSource,
  importingOutputSources,
  settingsLibraryDir,
  refreshSettings,
  updateSettings,
  registerOutputSource,
  loadOutputSourceFiles,
  importOutputSourceFiles,
  isBackgroundEnabled,
  onToggleBackground,
  onResetStudio,
  isResettingStudio,
}) => {
  const mountedSurfaces = getMountedSystemSurfaceKeys({
    isDebugPanelOpen,
    isDashboardModalOpen,
    isOnboardingOpen,
    isSettingsModalOpen,
  });

  return (
    <>
      {mountedSurfaces.includes('debug') ? (
        <Suspense fallback={null}>
          <DebugPanel
            isOpen={isDebugPanelOpen}
            onClose={closeDebugPanel}
            logs={mergedLogs}
            workspaces={workspaces}
            studioJobs={studioJobs}
            visualGroupsCount={visualGroupsCount}
            imagesCount={imagesCount}
            selectedJobDetail={selectedJobDetail}
            isLoadingSelectedJob={isLoadingSelectedJob}
            onInspectJob={onInspectJob}
            onClearSelectedJob={onClearSelectedJob}
          />
        </Suspense>
      ) : null}
      {mountedSurfaces.includes('dashboard') ? (
        <Suspense fallback={null}>
          <DashboardModal
            isOpen={isDashboardModalOpen}
            onClose={closeDashboard}
            imagesCount={imagesCount}
            workspaces={workspaces}
            onExportWorkspaceSnapshot={handleExportWorkspaceSnapshot}
            onDeepScan={handleDeepScan}
          />
        </Suspense>
      ) : null}
      {mountedSurfaces.includes('onboarding') ? (
        <Suspense fallback={null}>
          <OnboardingModal
            apiBase={apiBase}
            error={onboardingError}
            health={onboardingHealth}
            localCodexSession={localCodexSession}
            readiness={readiness}
            isChecking={isCheckingOnboarding}
            isDesktopRuntime={isDesktopRuntime}
            isOpen={isOnboardingOpen}
            isReady={isOnboardingReady}
            isStartingAppServer={isStartingAppServer}
            onClose={closeOnboarding}
            onComplete={completeOnboarding}
            onRefresh={refreshOnboardingHealth}
            onStartAppServer={ensureAppServer}
          />
        </Suspense>
      ) : null}
      {mountedSurfaces.includes('settings') ? (
        <Suspense fallback={null}>
          <StudioSettingsModal
            isOpen={isSettingsModalOpen}
            onClose={closeSettings}
            settings={settings}
            libraryDir={settingsLibraryDir}
            isLoading={isLoadingSettings}
            isSaving={isSavingSettings}
            providerCapabilities={providerCapabilities}
            providerRuntimePreflight={providerRuntimePreflight}
            outputSources={outputSources}
            outputSourceFiles={outputSourceFiles}
            isLoadingOutputSources={isLoadingOutputSources}
            loadingOutputSourceFiles={loadingOutputSourceFiles}
            isRegisteringOutputSource={isRegisteringOutputSource}
            importingOutputSources={importingOutputSources}
            error={settingsError}
            isBackgroundEnabled={isBackgroundEnabled}
            onToggleBackground={onToggleBackground}
            onRefresh={refreshSettings}
            onUpdate={updateSettings}
            onRegisterOutputSource={registerOutputSource}
            onLoadOutputSourceFiles={loadOutputSourceFiles}
            onImportOutputSourceFiles={importOutputSourceFiles}
            onResetStudio={onResetStudio}
            isResettingStudio={isResettingStudio}
          />
        </Suspense>
      ) : null}
    </>
  );
};
