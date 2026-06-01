import React from 'react';
import { AnimatePresence, MotionDiv } from 'motion/react';

import type { StudioQueueResultPreview } from '../../lib/studioQueueResults';
import type { StudioDiagnosticsSnapshot } from '../../lib/studioDiagnostics';
import type { Job as StudioJob } from '../../packages/shared/src';
import type { QueueJob } from '../../types';
import { QueuePanel } from '../QueuePanel';

export interface StudioOperationsRailProps {
  isModalOpen: boolean;
  isQueueOpen: boolean;
  setIsQueueOpen: React.Dispatch<React.SetStateAction<boolean>>;
  jobs: QueueJob[];
  queueResults: StudioQueueResultPreview[];
  studioJobs: StudioJob[];
  selectedStudioJobId: string | null;
  retry: (jobId: string) => void;
  retryPersistentJob?: (jobId: string) => void;
  cancelJob: (jobId: string) => void;
  cancelPersistentJob: (jobId: string) => void;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;
  isResting: boolean;
  exportLegacyVisualBatchSnapshot: () => void;
  activeServerJobCount: number;
  onInspectJob: (jobId: string) => void;
  diagnostics: StudioDiagnosticsSnapshot;
  onResetStudio: () => void | Promise<void>;
  isResettingStudio: boolean;
}

export const StudioOperationsRail: React.FC<StudioOperationsRailProps> = ({
  isModalOpen,
  isQueueOpen,
  jobs,
  queueResults,
  studioJobs,
  selectedStudioJobId,
  retry,
  retryPersistentJob,
  cancelJob,
  cancelPersistentJob,
  removeJob,
  clearCompleted,
  isResting,
  onInspectJob,
}) => {
  if (isModalOpen) {
    return null;
  }

  return (
    <AnimatePresence initial={false}>
      {isQueueOpen ? (
        <MotionDiv
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="flex h-full shrink-0 overflow-hidden"
        >
          <QueuePanel
            jobs={jobs}
            results={queueResults}
            serverJobs={studioJobs}
            selectedJobId={selectedStudioJobId}
            onRetry={retry}
            onRetryServerJob={retryPersistentJob}
            onCancel={cancelJob}
            onCancelServerJob={cancelPersistentJob}
            onRemove={removeJob}
            onClearCompleted={clearCompleted}
            onInspectJob={onInspectJob}
            isResting={isResting}
          />
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
};
