import React from 'react';

import { exportToJson } from '../../utils/fileUtils';
import { DashboardModal } from '../DashboardModal';
import { DebugPanel } from '../DebugPanel';
import { OnboardingModal } from '../OnboardingModal';
import type { StudioSystemOverlaysProps } from './types';

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
    isCheckingOnboarding,
    isDesktopRuntime,
    isOnboardingOpen,
    isOnboardingReady,
    isStartingAppServer,
    closeOnboarding,
    completeOnboarding,
    refreshOnboardingHealth,
    ensureAppServer,
}) => {
    return (
        <>
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
            <DashboardModal
                isOpen={isDashboardModalOpen}
                onClose={closeDashboard}
                batches={batches}
                workspaces={workspaces}
                onImportVault={handleImportVault}
                onExportVault={() => exportToJson(batches, `vault-export-${Date.now()}.json`)}
                onDeepScan={handleDeepScan}
            />
            <OnboardingModal
                apiBase={apiBase}
                error={onboardingError}
                health={onboardingHealth}
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
        </>
    );
};
