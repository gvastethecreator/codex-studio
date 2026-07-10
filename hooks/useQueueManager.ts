import { useState, useCallback, useEffect, useRef } from 'react';
import type { ImageGenerationConfig, QueueJob } from '../types';
import type { Job as StudioJob } from '../packages/shared/src';
import { startViewTransition } from '../utils/transitionUtils';
import {
  selectJobsToStart,
  startQueuedJobExecution,
  type QueueJobExecuteGeneration,
} from '../lib/queueStateMachine';
import {
  linkQueueJobToBackendJob,
  reconcileBrowserQueueWithBackendJobs,
} from '../lib/browserQueueBackendSync';
import type { ShellActivityJob } from '../lib/shellActivityJob';
import { useLazyRef } from './useLazyRef';

interface UseQueueManagerProps {
  executeGeneration: QueueJobExecuteGeneration;
  isGenerating: boolean;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  cancelPersistentJob: (jobId: string) => Promise<void>;
  backendJobs?: ShellActivityJob[];
}

export function createQueueJob(
  prompt: string,
  config: ImageGenerationConfig,
  workspaceId: string,
  force: boolean = false,
): QueueJob {
  return {
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    prompt,
    workspaceId,
    config: {
      ...config,
      attachments: config.attachments.map((attachment) => ({ ...attachment })),
      prompt,
    },
    status: 'pending',
    createdAt: Date.now(),
    isForced: force,
  };
}

export const useQueueManager = ({
  executeGeneration,
  isGenerating,
  addToast,
  cancelPersistentJob,
  backendJobs = [],
}: UseQueueManagerProps) => {
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [queueTick, setQueueTick] = useState(0);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllersRef = useLazyRef(() => new Map<string, AbortController>());
  const linkedServerJobIdsRef = useLazyRef(() => new Map<string, string[]>());
  const processingJobsRef = useLazyRef(() => new Set<string>());
  const jobCreatedCallbacksRef = useLazyRef(
    () => new Map<string, ((job: StudioJob) => void) | undefined>(),
  );
  const backendJobsRef = useRef<ShellActivityJob[]>(backendJobs);

  useEffect(() => {
    backendJobsRef.current = backendJobs;
    setJobs((currentJobs) => reconcileBrowserQueueWithBackendJobs(currentJobs, backendJobs));
  }, [backendJobs]);

  const enqueue = useCallback(
    (
      prompt: string,
      config: ImageGenerationConfig,
      workspaceId: string,
      force: boolean = false,
      onJobCreated?: (job: StudioJob) => void,
    ) => {
      const newJob = createQueueJob(prompt, config, workspaceId, force);
      jobCreatedCallbacksRef.current.set(newJob.id, onJobCreated);
      startViewTransition(() => {
        setJobs((prev) => [...prev, newJob]);
        addToast(force ? 'Forcing job execution...' : 'Job added to queue', 'info');
      });
      return newJob.id;
    },
    [addToast, jobCreatedCallbacksRef],
  );

  const retry = useCallback(
    (jobId: string) => {
      startViewTransition(() => {
        linkedServerJobIdsRef.current.delete(jobId);
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: 'pending',
                  serverJobId: null,
                  serverJobIds: [],
                  error: undefined,
                  completedAt: undefined,
                }
              : job,
          ),
        );
        addToast('Retrying job...', 'info');
      });
    },
    [addToast, linkedServerJobIdsRef],
  );

  const cancelJob = useCallback(
    (jobId: string) => {
      const controller = abortControllersRef.current.get(jobId);
      const linkedServerJobIds = linkedServerJobIdsRef.current.get(jobId) ?? [];
      if (controller) {
        controller.abort();
        abortControllersRef.current.delete(jobId);
      }

      for (const linkedServerJobId of linkedServerJobIds) {
        void cancelPersistentJob(linkedServerJobId).catch((error) => {
          addToast(
            error instanceof Error ? error.message : 'Unable to cancel backend job',
            'error',
          );
        });
      }

      startViewTransition(() => {
        setJobs((prev) =>
          prev.map((job) => (job.id === jobId ? { ...job, status: 'cancelled' } : job)),
        );
        addToast('Job cancelled', 'info');
      });
    },
    [abortControllersRef, addToast, cancelPersistentJob, linkedServerJobIdsRef],
  );

  const removeJob = useCallback(
    (jobId: string) => {
      const controller = abortControllersRef.current.get(jobId);
      if (controller) {
        controller.abort();
        abortControllersRef.current.delete(jobId);
      }
      linkedServerJobIdsRef.current.delete(jobId);
      jobCreatedCallbacksRef.current.delete(jobId);

      startViewTransition(() => {
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
      });
    },
    [abortControllersRef, jobCreatedCallbacksRef, linkedServerJobIdsRef],
  );

  const clearCompleted = useCallback(() => {
    startViewTransition(() => {
      const remaining = new Set<string>();
      setJobs((prev) =>
        prev.filter((job) => {
          const keep =
            job.status !== 'completed' &&
            job.status !== 'cancelled' &&
            job.status !== 'needs_review';
          if (keep) remaining.add(job.id);
          return keep;
        }),
      );
      for (const key of [...linkedServerJobIdsRef.current.keys()]) {
        if (!remaining.has(key)) {
          linkedServerJobIdsRef.current.delete(key);
        }
      }
    });
  }, [linkedServerJobIdsRef]);

  const resetQueue = useCallback(() => {
    if (restTimerRef.current) {
      clearTimeout(restTimerRef.current);
      restTimerRef.current = null;
    }

    for (const controller of abortControllersRef.current.values()) {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    }

    abortControllersRef.current.clear();
    linkedServerJobIdsRef.current.clear();
    processingJobsRef.current.clear();
    jobCreatedCallbacksRef.current.clear();
    setIsResting(false);
    setQueueTick(0);

    startViewTransition(() => {
      setJobs([]);
    });
  }, [abortControllersRef, jobCreatedCallbacksRef, linkedServerJobIdsRef, processingJobsRef]);

  useEffect(() => {
    const pendingJobs = jobs.filter((j) => j.status === 'pending');
    if (pendingJobs.length === 0) return;

    const jobsToStart = selectJobsToStart(pendingJobs);
    if (jobsToStart.length === 0) return;

    void Promise.all(
      jobsToStart.map(async (nextJob) => {
        if (processingJobsRef.current.has(nextJob.id)) return;
        processingJobsRef.current.add(nextJob.id);

        const execution = startQueuedJobExecution(nextJob, {
          executeGeneration,
          onJobCreated: (studioJob) => {
            jobCreatedCallbacksRef.current.get(nextJob.id)?.(studioJob);
            const linkedIds = linkedServerJobIdsRef.current.get(nextJob.id) ?? [];
            if (!linkedIds.includes(studioJob.id)) {
              linkedServerJobIdsRef.current.set(nextJob.id, [...linkedIds, studioJob.id]);
            }
            setJobs((prev) =>
              prev.map((job) =>
                job.id === nextJob.id ? linkQueueJobToBackendJob(job, studioJob.id) : job,
              ),
            );
          },
        });

        abortControllersRef.current.set(nextJob.id, execution.controller);

        setJobs((prev) =>
          prev.map((j) => (j.id === nextJob.id ? { ...j, status: 'processing' } : j)),
        );

        try {
          const result = await execution.run();

          if (result.status === 'completed') {
            setJobs((prev) =>
              reconcileBrowserQueueWithBackendJobs(
                prev.map((j) =>
                  j.id === nextJob.id
                    ? {
                        ...j,
                        status: 'completed',
                        completedAt: result.completedAt,
                        error: undefined,
                      }
                    : j,
                ),
                backendJobsRef.current,
              ),
            );

            if (!nextJob.isForced) {
              setIsResting(true);
              if (restTimerRef.current) clearTimeout(restTimerRef.current);
              restTimerRef.current = setTimeout(() => {
                setIsResting(false);
              }, 1000);
            }

            return;
          }

          if (result.status === 'cancelled') {
            setJobs((prev) =>
              reconcileBrowserQueueWithBackendJobs(
                prev.map((j) =>
                  j.id === nextJob.id ? { ...j, status: 'cancelled', error: undefined } : j,
                ),
                backendJobsRef.current,
              ),
            );
            return;
          }

          setJobs((prev) =>
            reconcileBrowserQueueWithBackendJobs(
              prev.map((j) =>
                j.id === nextJob.id
                  ? {
                      ...j,
                      status: 'failed',
                      error: result.error,
                    }
                  : j,
              ),
              backendJobsRef.current,
            ),
          );
        } finally {
          jobCreatedCallbacksRef.current.delete(nextJob.id);
          processingJobsRef.current.delete(nextJob.id);
          abortControllersRef.current.delete(nextJob.id);
          setQueueTick((t) => t + 1);
        }
      }),
    );

    const restTimer = restTimerRef.current;
    return () => {
      if (restTimer) clearTimeout(restTimer);
    };
  }, [
    abortControllersRef,
    executeGeneration,
    jobCreatedCallbacksRef,
    jobs,
    linkedServerJobIdsRef,
    processingJobsRef,
    queueTick,
  ]);

  return {
    jobs,
    enqueue,
    retry,
    cancelJob,
    removeJob,
    clearCompleted,
    resetQueue,
    isResting,
  };
};
