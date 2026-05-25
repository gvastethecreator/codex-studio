import { useCallback } from 'react';
import { useStudioJobInspector } from './useStudioJobInspector';
import type { ToastMessage } from './useToasts';
import type { Job } from '../packages/shared/src';

interface UseStudioActivitySessionOptions {
  studioJobs: Job[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  isDebugPanelOpen: boolean;
  openDebugPanel: () => void;
  closeDebugPanel: () => void;
}

export function useStudioActivitySession({
  studioJobs,
  addToast,
  isDebugPanelOpen,
  openDebugPanel,
  closeDebugPanel,
}: UseStudioActivitySessionOptions) {
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

  return {
    selectedStudioJobId,
    selectedJobDetail,
    isLoadingSelectedJob,
    clearSelectedJob,
    handleInspectStudioJob,
    handleToggleDebugPanel,
  };
}
