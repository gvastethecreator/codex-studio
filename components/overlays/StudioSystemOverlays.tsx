import React, { Suspense } from 'react';

import { ErrorBoundary } from '../ErrorBoundary';
import { LazySurfaceFallback } from '../ui/LazySurfaceFallback';
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
const StudioChatPanel = React.lazy(() =>
  import('../StudioChatPanel').then((m) => ({ default: m.StudioChatPanel })),
);

export const StudioSystemOverlays: React.FC<StudioSystemOverlaysProps> = ({
  flags: {
    isDebugPanelOpen,
    isDashboardModalOpen,
    isChatPanelOpen,
    isLoadingSelectedJob,
    isCheckingOnboarding,
    isDesktopRuntime,
    isOnboardingOpen,
    isOnboardingReady,
    isStartingAppServer,
    isSettingsModalOpen,
  },
  closeDebugPanel,
  closeChatPanel,
  mergedLogs,
  closeDashboard,
  visualGroupsCount,
  workspaces,
  studioJobs,
  imagesCount,
  selectedJobDetail,
  onInspectJob,
  onClearSelectedJob,
  onRetryJob,
  handleGenerate,
  isGenerating,
  activeProviderId,
  handleExportLegacyVisualBatchSnapshot,
  apiBase,
  onboardingError,
  onboardingHealth,
  localCodexSession,
  readiness,
  closeOnboarding,
  completeOnboarding,
  refreshOnboardingHealth,
  ensureAppServer,
  settingsModule,
}) => {
  const {
    close: closeSettings,
    settingsDomain: {
      settings,
      error: settingsError,
      isLoading: isLoadingSettings,
      isSaving: isSavingSettings,
      refresh: refreshSettings,
      update: updateSettings,
    },
    providerDomain: {
      capabilities: providerCapabilities,
      runtimePreflight: providerRuntimePreflight,
    },
    outputSourcesDomain: {
      outputSources,
      outputSourceFiles,
      isLoadingOutputSources,
      loadingOutputSourceFiles,
      isRegisteringOutputSource,
      importingOutputSources,
      registerOutputSource,
      loadOutputSourceFiles,
      importOutputSourceFiles,
    },
    maintenanceDomain,
    libraryDir: settingsLibraryDir,
    onResetStudio,
    isResettingStudio,
  } = settingsModule;

  const mountedSurfaces = getMountedSystemSurfaceKeys({
    isDebugPanelOpen,
    isDashboardModalOpen,
    isOnboardingOpen,
    isSettingsModalOpen,
    isChatPanelOpen,
  });

  return (
    <>
      {mountedSurfaces.includes('debug') ? (
        <ErrorBoundary fallbackMessage="Could not load studio activity.">
          <Suspense
            fallback={
              <LazySurfaceFallback
                label="Loading activity"
                className="fixed inset-y-0 left-0 z-50 grid w-96 max-w-full place-items-center border-r border-white/10 bg-black/80 text-zinc-400"
              />
            }
          >
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
              onRetryJob={onRetryJob}
            />
          </Suspense>
        </ErrorBoundary>
      ) : null}
      {mountedSurfaces.includes('dashboard') ? (
        <ErrorBoundary fallbackMessage="Could not load the dashboard.">
          <Suspense
            fallback={
              <LazySurfaceFallback
                label="Loading dashboard"
                className="fixed inset-0 z-50 grid place-items-center bg-black/60 text-zinc-400"
              />
            }
          >
            <DashboardModal
              isOpen={isDashboardModalOpen}
              onClose={closeDashboard}
              imagesCount={imagesCount}
              workspaces={workspaces}
              onExportLegacyVisualBatchSnapshot={handleExportLegacyVisualBatchSnapshot}
            />
          </Suspense>
        </ErrorBoundary>
      ) : null}
      {mountedSurfaces.includes('onboarding') ? (
        <ErrorBoundary fallbackMessage="Could not load setup.">
          <Suspense
            fallback={
              <LazySurfaceFallback
                label="Loading setup"
                className="fixed inset-0 z-50 grid place-items-center bg-black/60 text-zinc-400"
              />
            }
          >
            <OnboardingModal
              apiBase={apiBase}
              error={onboardingError}
              health={onboardingHealth}
              localCodexSession={localCodexSession}
              readiness={readiness}
              status={
                isOnboardingReady
                  ? 'ready'
                  : isCheckingOnboarding
                    ? 'checking'
                    : isStartingAppServer
                      ? 'starting'
                      : 'idle'
              }
              isDesktopRuntime={isDesktopRuntime}
              isOpen={isOnboardingOpen}
              onClose={closeOnboarding}
              onComplete={completeOnboarding}
              onRefresh={refreshOnboardingHealth}
              onStartAppServer={ensureAppServer}
            />
          </Suspense>
        </ErrorBoundary>
      ) : null}
      {mountedSurfaces.includes('settings') ? (
        <ErrorBoundary fallbackMessage="Could not load studio settings.">
          <Suspense
            fallback={
              <LazySurfaceFallback
                label="Loading settings"
                className="fixed inset-0 z-50 grid place-items-center bg-black/60 text-zinc-400"
              />
            }
          >
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
              onRefresh={refreshSettings}
              onUpdate={updateSettings}
              onRegisterOutputSource={registerOutputSource}
              onLoadOutputSourceFiles={loadOutputSourceFiles}
              onImportOutputSourceFiles={importOutputSourceFiles}
              maintenance={maintenanceDomain}
              onResetStudio={onResetStudio}
              isResettingStudio={isResettingStudio}
            />
          </Suspense>
        </ErrorBoundary>
      ) : null}
      {mountedSurfaces.includes('chat') ? (
        <ErrorBoundary fallbackMessage="Could not load Codex chat.">
          <Suspense
            fallback={
              <LazySurfaceFallback
                label="Loading chat"
                className="fixed inset-0 z-50 grid place-items-center bg-black/60 text-zinc-400"
              />
            }
          >
            <StudioChatPanel
              isOpen={isChatPanelOpen}
              onClose={closeChatPanel}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              providerId={activeProviderId}
              studioJobs={studioJobs}
              logs={mergedLogs}
            />
          </Suspense>
        </ErrorBoundary>
      ) : null}
    </>
  );
};
