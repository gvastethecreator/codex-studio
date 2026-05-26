import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStudioJobDetail } from '../services/localStudioService';
import type { Job as StudioJob, JobDetailResponse } from '../packages/shared/src';

interface UseStudioJobInspectorProps {
  studioJobs: StudioJob[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

/**
 * Keep the selected backend job detail synchronized with the live job list so
 * debug surfaces can inspect one persistent job without embedding fetch logic
 * inside AppContent.
 */
interface JobDetailState {
  detail: JobDetailResponse | null;
  isLoading: boolean;
}

export function useStudioJobInspector({ studioJobs, addToast }: UseStudioJobInspectorProps) {
  const [selectedStudioJobId, setSelectedStudioJobId] = useState<string | null>(null);
  const [jobDetailState, setJobDetailState] = useState<JobDetailState>({
    detail: null,
    isLoading: false,
  });

  const selectedStudioJobUpdatedAt = useMemo(
    () => studioJobs.find((job) => job.id === selectedStudioJobId)?.updatedAt ?? null,
    [selectedStudioJobId, studioJobs],
  );

  useEffect(() => {
    let cancelled = false;

    if (!selectedStudioJobId) {
      setJobDetailState({ detail: null, isLoading: false });
      return () => {
        cancelled = true;
      };
    }

    setJobDetailState((prev) => ({ ...prev, isLoading: true }));

    void getStudioJobDetail(selectedStudioJobId)
      .then((detail) => {
        if (!cancelled) {
          setJobDetailState({ detail, isLoading: false });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setJobDetailState({ detail: null, isLoading: false });
          addToast(
            error instanceof Error ? error.message : 'Unable to load the selected job detail',
            'error',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStudioJobId, selectedStudioJobUpdatedAt, addToast]);

  const inspectStudioJob = useCallback((jobId: string) => {
    setSelectedStudioJobId(jobId);
  }, []);

  const clearSelectedJob = useCallback(() => {
    setSelectedStudioJobId(null);
    setJobDetailState({ detail: null, isLoading: false });
  }, []);

  return {
    selectedStudioJobId,
    selectedJobDetail: jobDetailState.detail,
    isLoadingSelectedJob: jobDetailState.isLoading,
    inspectStudioJob,
    clearSelectedJob,
  };
}
