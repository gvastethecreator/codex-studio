import React, { useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import type { StudioDiagnosticsSnapshot } from '../../lib/studioDiagnostics';
import type { Job as StudioJob } from '../../packages/shared/src';
import type { QueueJob } from '../../types';
import { QueuePanel } from '../QueuePanel';

export interface StudioOperationsRailProps {
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
    diagnostics: StudioDiagnosticsSnapshot;
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
    onInspectJob,
}) => {
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
        </div>
    );
};
