import React, { useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import type { HealthResponse, Job as StudioJob } from '../../packages/shared/src';
import type { QueueJob } from '../../types';
import { QueuePanel } from '../QueuePanel';
import { RightSystemPanel } from '../RightSystemPanel';

interface StudioOperationsRailProps {
    isModalOpen: boolean;
    isQueueOpen: boolean;
    setIsQueueOpen: React.Dispatch<React.SetStateAction<boolean>>;
    jobs: QueueJob[];
    studioJobs: StudioJob[];
    selectedStudioJobId: string | null;
    retry: (jobId: string) => void;
    cancelJob: (jobId: string) => void;
    cancelPersistentJob: (jobId: string) => void;
    removeJob: (jobId: string) => void;
    clearCompleted: () => void;
    isResting: boolean;
    exportBatches: () => void;
    handleImportVault: (event: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
    isBackgroundEnabled: boolean;
    setBackgroundEnabled: (enabled: boolean) => void;
    activeServerJobCount: number;
    onInspectJob: (jobId: string) => void;
    health: HealthResponse | null;
    isBackendConnected: boolean;
    onResetStudio: () => void | Promise<void>;
    isResettingStudio: boolean;
}

export const StudioOperationsRail: React.FC<StudioOperationsRailProps> = ({
    isModalOpen,
    isQueueOpen,
    setIsQueueOpen,
    jobs,
    studioJobs,
    selectedStudioJobId,
    retry,
    cancelJob,
    cancelPersistentJob,
    removeJob,
    clearCompleted,
    isResting,
    exportBatches,
    handleImportVault,
    isBackgroundEnabled,
    setBackgroundEnabled,
    activeServerJobCount,
    onInspectJob,
    health,
    isBackendConnected,
    onResetStudio,
    isResettingStudio,
}) => {
    const handleToggleBackground = useCallback(() => {
        setBackgroundEnabled(!isBackgroundEnabled);
    }, [isBackgroundEnabled, setBackgroundEnabled]);

    const handleToggleQueue = useCallback(() => {
        setIsQueueOpen((previous) => !previous);
    }, [setIsQueueOpen]);

    if (isModalOpen) {
        return null;
    }

    return (
        <div className="flex h-full">
            <AnimatePresence>
                {isQueueOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="h-full overflow-hidden"
                    >
                        <QueuePanel
                            jobs={jobs}
                            serverJobs={studioJobs}
                            selectedJobId={selectedStudioJobId}
                            onRetry={retry}
                            onCancel={cancelJob}
                            onCancelServerJob={cancelPersistentJob}
                            onRemove={removeJob}
                            onClearCompleted={clearCompleted}
                            onInspectJob={onInspectJob}
                            onClose={handleToggleQueue}
                            isResting={isResting}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <RightSystemPanel
                onImportVault={handleImportVault}
                onExportVault={exportBatches}
                isBackgroundEnabled={isBackgroundEnabled}
                onToggleBackground={handleToggleBackground}
                isQueueOpen={isQueueOpen}
                onToggleQueue={handleToggleQueue}
                queueCount={jobs.length + activeServerJobCount}
                health={health}
                isBackendConnected={isBackendConnected}
                onResetStudio={onResetStudio}
                isResettingStudio={isResettingStudio}
            />
        </div>
    );
};
