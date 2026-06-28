import React from 'react';

import type { StudioQueueResultPreview } from '../../lib/studioQueueResults';
import type { ShellActivityJob as StudioJob } from '../../lib/shellActivityJob';
import type { QueueJob } from '../../types';

const QueuePanel = React.lazy(() =>
  import('../QueuePanel').then((module) => ({ default: module.QueuePanel })),
);

export interface StudioOperationsRailProps {
  hasGenerationDock?: boolean;
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
  hasGenerationDock = false,
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
    <div
      className="fixed inset-x-2 z-40 flex overflow-hidden rounded-2xl border border-white/10 shadow-2xl studio-route-enter studio-route-enter-forward sm:static sm:h-full sm:shrink-0 sm:rounded-none sm:border-none sm:shadow-none"
      style={{
        top: 'var(--studio-mobile-header-height)',
        bottom: hasGenerationDock
          ? 'calc(var(--studio-mobile-dock-height) + 0.5rem)'
          : 'max(0.75rem, var(--studio-mobile-safe-bottom))',
      }}
    >
      <React.Suspense
        fallback={
          <div className="h-full w-full border-l border-white/10 bg-black/40 sm:w-[304px]" />
        }
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
