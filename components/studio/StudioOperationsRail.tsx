import React from 'react';

import type { StudioQueueResultPreview } from '../../lib/studioQueueResults';
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
  onInspectJob: (jobId: string) => void;
}

export const StudioOperationsRail: React.FC<StudioOperationsRailProps> = ({
  isModalOpen,
  isQueueOpen,
  setIsQueueOpen,
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
    <div className="fixed inset-x-0 bottom-[116px] top-24 z-40 flex overflow-hidden animate-in fade-in-0 slide-in-from-right-3 duration-200 sm:static sm:h-full sm:shrink-0">
      <React.Suspense
        fallback={<div className="h-full w-full border-l border-white/10 bg-black/40 sm:w-80" />}
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
          onClose={() => setIsQueueOpen(false)}
        />
      </React.Suspense>
    </div>
  );
};
