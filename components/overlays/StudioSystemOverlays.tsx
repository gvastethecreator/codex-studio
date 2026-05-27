import React, { Suspense } from 'react';

import type { StudioSystemOverlaysProps } from './types';
import { getMountedSystemSurfaceKeys } from './studioSystemOverlaysUtils';

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

export const StudioSystemOverlays: React.FC<StudioSystemOverlaysProps> = ({
  flags: {
    isDebugPanelOpen,
    isDashboardModalOpen,
    isLoadingSelectedJob,
    isCheckingOnboarding,
    isDesktopRuntime,
    isOnboardingOpen,
    isOnboardingReady,
    isStartingAppServer,
    isSettingsModalOpen,
    isLoadingSettings,
    isSavingSettings,
    isLoadingOutputSources,
    isRegisteringOutputSource,
    isBackgroundEnabled,
    isResettingStudio,
  },
  closeDebugPanel,
  mergedLogs,
  closeDashboard,
  visualGroupsCount,
  workspaces,
  studioJobs,
  imagesCount,
  selectedJobDetail,
  onInspectJob,
  onClearSelectedJob,
  handleExportWorkspaceSnapshot,
  handleDeepScan,
  apiBase,
  onboardingError,
  onboardingHealth,
  localCodexSession,
  readiness,
  closeOnboarding,
  completeOnboarding,
  refreshOnboardingHealth,
  ensureAppServer,
  closeSettings,
  settings,
  settingsError,
  providerCapabilities,
  providerRuntimePreflight,
  outputSources,
  outputSourceFiles,
  loadingOutputSourceFiles,
  importingOutputSources,
  settingsLibraryDir,
  refreshSettings,
  updateSettings,
  registerOutputSource,
  loadOutputSourceFiles,
  importOutputSourceFiles,
  onToggleBackground,
  onResetStudio,
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
            status={isOnboardingReady ? 'ready' : isCheckingOnboarding ? 'checking' : isStartingAppServer ? 'starting' : 'idle'}
            isDesktopRuntime={isDesktopRuntime}
            isOpen={isOnboardingOpen}
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
