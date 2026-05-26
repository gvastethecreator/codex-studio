import { useCallback, useEffect, useReducer, useMemo, useRef } from 'react';
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

type JobDetailAction =
  | { type: 'reset' }
  | { type: 'loading' }
  | { type: 'loaded'; detail: JobDetailResponse }
  | { type: 'error' };

const INITIAL_JOB_DETAIL: JobDetailState = { detail: null, isLoading: false };

function jobDetailReducer(state: JobDetailState, action: JobDetailAction): JobDetailState {
  switch (action.type) {
    case 'reset':
      return INITIAL_JOB_DETAIL;
    case 'loading':
      return { detail: null, isLoading: true };
    case 'loaded':
      return { detail: action.detail, isLoading: false };
    case 'error':
      return { detail: null, isLoading: false };
  }
}

export function useStudioJobInspector({ studioJobs, addToast }: UseStudioJobInspectorProps) {
  const [selectedStudioJobId, setSelectedStudioJobId] = useReducer(
    (_prev: string | null, next: string | null) => next,
    null,
  );
  const [jobDetailState, dispatchJobDetail] = useReducer(jobDetailReducer, INITIAL_JOB_DETAIL);
  const addToastRef = useRef(addToast);
  addToastRef.current = addToast;

  const selectedStudioJobUpdatedAt = useMemo(
    () => studioJobs.find((job) => job.id === selectedStudioJobId)?.updatedAt ?? null,
    [selectedStudioJobId, studioJobs],
  );

  useEffect(() => {
    let cancelled = false;

    if (!selectedStudioJobId) {
      dispatchJobDetail({ type: 'reset' });
      return () => {
        cancelled = true;
      };
    }

    dispatchJobDetail({ type: 'loading' });

    void getStudioJobDetail(selectedStudioJobId)
      .then((detail) => {
        if (!cancelled) {
          dispatchJobDetail({ type: 'loaded', detail });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          dispatchJobDetail({ type: 'error' });
          addToastRef.current(
            error instanceof Error ? error.message : 'Unable to load the selected job detail',
            'error',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStudioJobId, selectedStudioJobUpdatedAt]);

  const inspectStudioJob = useCallback((jobId: string) => {
    setSelectedStudioJobId(jobId);
  }, []);

  const clearSelectedJob = useCallback(() => {
    setSelectedStudioJobId(null);
    dispatchJobDetail({ type: 'reset' });
  }, []);

  return {
    selectedStudioJobId,
    selectedJobDetail: jobDetailState.detail,
    isLoadingSelectedJob: jobDetailState.isLoading,
    inspectStudioJob,
    clearSelectedJob,
  };
}
