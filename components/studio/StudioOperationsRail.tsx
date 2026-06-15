import React from 'react';

import type { StudioQueueResultPreview } from '../../lib/studioQueueResults';
import type { StudioDiagnosticsSnapshot } from '../../lib/studioDiagnostics';
import type { Job as StudioJob } from '../../packages/shared/src';
import type { QueueJob } from '../../types';

const QueuePanel = React.lazy(() =>
  import('../QueuePanel').then((module) => ({ default: module.QueuePanel })),
);

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

  if (!isQueueOpen) {
    return null;
  }

  return (
    <div className="flex h-full shrink-0 overflow-hidden animate-in fade-in-0 slide-in-from-right-3 duration-200">
      <React.Suspense
        fallback={<div className="h-full w-80 border-l border-white/10 bg-black/40" />}
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
      </React.Suspense>
    </div>
  );
};
