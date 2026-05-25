import React from 'react';

import { exportToJson } from '../../utils/fileUtils';
import { DashboardModal } from '../DashboardModal';
import { DebugPanel } from '../DebugPanel';
import { OnboardingModal } from '../OnboardingModal';
import { StudioSettingsModal } from '../StudioSettingsModal';
import type { StudioSystemOverlaysProps } from './types';

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
  batches,
  workspaces,
  studioJobs,
  imagesCount,
  selectedJobDetail,
  isLoadingSelectedJob,
  onInspectJob,
  onClearSelectedJob,
  handleImportVault,
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
        <DebugPanel
          isOpen={isDebugPanelOpen}
          onClose={closeDebugPanel}
          logs={mergedLogs}
          workspaces={workspaces}
          studioJobs={studioJobs}
          batchesCount={batches.length}
          imagesCount={imagesCount}
          selectedJobDetail={selectedJobDetail}
          isLoadingSelectedJob={isLoadingSelectedJob}
          onInspectJob={onInspectJob}
          onClearSelectedJob={onClearSelectedJob}
        />
      ) : null}
      {mountedSurfaces.includes('dashboard') ? (
        <DashboardModal
          isOpen={isDashboardModalOpen}
          onClose={closeDashboard}
          batches={batches}
          workspaces={workspaces}
          onImportVault={handleImportVault}
          onExportVault={() => exportToJson(batches, `vault-export-${Date.now()}.json`)}
          onDeepScan={handleDeepScan}
        />
      ) : null}
      {mountedSurfaces.includes('onboarding') ? (
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
      ) : null}
      {mountedSurfaces.includes('settings') ? (
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
      ) : null}
    </>
  );
};
