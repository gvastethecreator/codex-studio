import { AnimatePresence } from '../../lib/gsapMotion';
import React from 'react';

import type { StudioQueueResultPreview } from '../../lib/studioQueueResults';
import type { ShellActivityJob as StudioJob } from '../../lib/shellActivityJob';

const QueuePanel = React.lazy(() =>
  import('../QueuePanel').then((module) => ({ default: module.QueuePanel })),
);

export interface StudioOperationsRailProps {
  hasGenerationDock?: boolean;
  isModalOpen: boolean;
  isQueueOpen: boolean;
  setIsQueueOpen: React.Dispatch<React.SetStateAction<boolean>>;
  queueResults: StudioQueueResultPreview[];
  studioJobs: StudioJob[];
  selectedStudioJobId: string | null;
  retryPersistentJob?: (jobId: string) => void;
  cancelPersistentJob: (jobId: string) => void;
  onInspectJob: (jobId: string) => void;
}

export const StudioOperationsRail: React.FC<StudioOperationsRailProps> = ({
  hasGenerationDock = false,
  isModalOpen,
  isQueueOpen,
  setIsQueueOpen,
  queueResults,
  studioJobs,
  selectedStudioJobId,
  retryPersistentJob,
  cancelPersistentJob,
  onInspectJob,
}) => {
  return (
    <AnimatePresence>
      {!isModalOpen && isQueueOpen && (
        <div
          className="studio-operations-rail studio-surface fixed inset-x-2 z-40 flex overflow-hidden rounded-md border border-[color:var(--wb-line)] shadow-2xl sm:static sm:inset-auto sm:h-full sm:w-[304px] sm:shrink-0 sm:rounded-none sm:border-none sm:shadow-none"
          style={{
            top: 'var(--studio-mobile-header-height)',
            bottom: hasGenerationDock
              ? 'calc(var(--studio-mobile-dock-height) + 0.5rem)'
              : 'max(0.75rem, var(--studio-mobile-safe-bottom))',
          }}
        >
          <React.Suspense
            fallback={
              <div className="h-full w-full border-l border-[color:var(--wb-line)] bg-[color:var(--wb-well)] sm:w-[304px]" />
            }
          >
            <QueuePanel
              results={queueResults}
              serverJobs={studioJobs}
              selectedJobId={selectedStudioJobId}
              onRetryServerJob={retryPersistentJob}
              onCancelServerJob={cancelPersistentJob}
              onInspectJob={onInspectJob}
              onClose={() => setIsQueueOpen(false)}
            />
          </React.Suspense>
        </div>
      )}
    </AnimatePresence>
  );
};
