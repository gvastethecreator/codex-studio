import { useCallback, useRef } from 'react';
import { useStudioJobInspector } from './useStudioJobInspector';
import type { ToastMessage } from './useToasts';
import type { Job } from '../packages/shared/src';
import { retryStudioJobById } from '../services/localStudioService';

interface UseStudioActivitySessionOptions {
  studioJobs: Job[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  isDebugPanelOpen: boolean;
  openDebugPanel: () => void;
  closeDebugPanel: () => void;
}

export interface StudioActivitySessionController {
  selection: {
    selectedStudioJobId: string | null;
    selectedJobDetail: ReturnType<typeof useStudioJobInspector>['selectedJobDetail'];
    isLoadingSelectedJob: boolean;
    clearSelectedJob: () => void;
    inspectJob: (jobId: string) => void;
    retryJob: (jobId: string) => void;
  };
  debugPanel: {
    toggle: () => void;
  };
}

export function useStudioActivitySession({
  studioJobs,
  addToast,
  isDebugPanelOpen,
  openDebugPanel,
  closeDebugPanel,
}: UseStudioActivitySessionOptions): StudioActivitySessionController {
  const retryingJobIdsRef = useRef(new Set<string>());
  const {
    selectedStudioJobId,
    selectedJobDetail,
    isLoadingSelectedJob,
    inspectStudioJob,
    clearSelectedJob,
  } = useStudioJobInspector({
    studioJobs,
    addToast,
  });

  const handleInspectStudioJob = useCallback(
    (jobId: string) => {
      inspectStudioJob(jobId);
      openDebugPanel();
    },
    [inspectStudioJob, openDebugPanel],
  );

  const handleToggleDebugPanel = useCallback(() => {
    if (isDebugPanelOpen) {
      closeDebugPanel();
      return;
    }

    clearSelectedJob();
    openDebugPanel();
  }, [clearSelectedJob, closeDebugPanel, isDebugPanelOpen, openDebugPanel]);

  const handleRetryStudioJob = useCallback(
    (jobId: string) => {
      if (retryingJobIdsRef.current.has(jobId)) {
        return;
      }

      retryingJobIdsRef.current.add(jobId);
      addToast('Retrying backend job...', 'info');

      void retryStudioJobById(jobId)
        .then((createdJob) => {
          addToast('Retry queued', 'success');

          if (isDebugPanelOpen) {
            inspectStudioJob(createdJob.id);
          }
        })
        .catch((error) => {
          addToast(
            error instanceof Error ? error.message : 'Unable to retry the selected job',
            'error',
          );
        })
        .finally(() => {
          retryingJobIdsRef.current.delete(jobId);
        });
    },
    [addToast, inspectStudioJob, isDebugPanelOpen],
  );

  return {
    selection: {
      selectedStudioJobId,
      selectedJobDetail,
      isLoadingSelectedJob,
      clearSelectedJob,
      inspectJob: handleInspectStudioJob,
      retryJob: handleRetryStudioJob,
    },
    debugPanel: {
      toggle: handleToggleDebugPanel,
    },
  };
}
