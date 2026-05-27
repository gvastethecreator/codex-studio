import { useCallback } from 'react';
import { cancelStudioJob } from '../services/localStudioService';
import type { useGeneration } from '../contexts/GenerationContext';
import type { ToastMessage } from './useToasts';

interface UseStudioGenerationLifecycleOptions {
  pipeline: ReturnType<typeof useGeneration>['pipeline'];
  addToast: (message: string, type?: ToastMessage['type']) => void;
}

export function useStudioGenerationLifecycle({
  pipeline,
  addToast,
}: UseStudioGenerationLifecycleOptions) {
  const cancelPersistentJob = useCallback(
    async (jobId: string) => {
      const job = await cancelStudioJob(jobId);
      addToast(
        job.status === 'cancelled' ? 'Backend job cancelled' : 'Cancellation requested',
        'info',
      );
    },
    [addToast],
  );

  return {
    executeGeneration: pipeline.executeGeneration,
    executeEdit: pipeline.executeEdit,
    isGenerating: pipeline.isGenerating,
    cancelPersistentJob,
  };
}
