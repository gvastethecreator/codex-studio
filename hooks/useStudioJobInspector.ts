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
export function useStudioJobInspector({ studioJobs, addToast }: UseStudioJobInspectorProps) {
  const [selectedStudioJobId, setSelectedStudioJobId] = useState<string | null>(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState<JobDetailResponse | null>(null);
  const [isLoadingSelectedJob, setIsLoadingSelectedJob] = useState(false);

  const selectedStudioJobUpdatedAt = useMemo(
    () => studioJobs.find((job) => job.id === selectedStudioJobId)?.updatedAt ?? null,
    [selectedStudioJobId, studioJobs],
  );

  useEffect(() => {
    let cancelled = false;

    if (!selectedStudioJobId) {
      setSelectedJobDetail(null);
      setIsLoadingSelectedJob(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoadingSelectedJob(true);

    void getStudioJobDetail(selectedStudioJobId)
      .then((detail) => {
        if (!cancelled) {
          setSelectedJobDetail(detail);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setSelectedJobDetail(null);
          addToast(
            error instanceof Error ? error.message : 'Unable to load the selected job detail',
            'error',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSelectedJob(false);
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
    setSelectedJobDetail(null);
  }, []);

  return {
    selectedStudioJobId,
    selectedJobDetail,
    isLoadingSelectedJob,
    inspectStudioJob,
    clearSelectedJob,
  };
}