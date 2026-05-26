import { useState, useCallback, useEffect, useRef } from 'react';
import type { ImageGenerationConfig, QueueJob } from '../types';
import type { Job as StudioJob } from '../packages/shared/src';
import { startViewTransition } from '../utils/transitionUtils';
import { isAbortLikeError, selectJobsToStart } from '../lib/queueStateMachine';

interface UseQueueManagerProps {
  executeGeneration: (
    config: Partial<ImageGenerationConfig>,
    options?: {
      preventModal?: boolean;
      workspaceId?: string;
      signal?: AbortSignal;
      onJobCreated?: (job: StudioJob) => void;
    },
  ) => Promise<void>;
  isGenerating: boolean;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  cancelPersistentJob: (jobId: string) => Promise<void>;
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
}: UseQueueManagerProps) => {
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [queueTick, setQueueTick] = useState(0);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const linkedServerJobIdsRef = useRef<Map<string, string>>(new Map());
  const processingJobsRef = useRef<Set<string>>(new Set());

  const enqueue = useCallback(
    (
      prompt: string,
      config: ImageGenerationConfig,
      workspaceId: string,
      force: boolean = false,
    ) => {
      startViewTransition(() => {
        const newJob = createQueueJob(prompt, config, workspaceId, force);
        setJobs((prev) => [...prev, newJob]);
        addToast(force ? 'Forcing job execution...' : 'Job added to queue', 'info');
      });
    },
    [addToast],
  );

  const retry = useCallback(
    (jobId: string) => {
      startViewTransition(() => {
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId ? { ...job, status: 'pending', error: undefined } : job,
          ),
        );
        addToast('Retrying job...', 'info');
      });
    },
    [addToast],
  );

  const cancelJob = useCallback(
    (jobId: string) => {
      const controller = abortControllersRef.current.get(jobId);
      const linkedServerJobId = linkedServerJobIdsRef.current.get(jobId);
      if (controller) {
        controller.abort();
        abortControllersRef.current.delete(jobId);
      }

      if (linkedServerJobId) {
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
    [addToast, cancelPersistentJob],
  );

  const removeJob = useCallback((jobId: string) => {
    const controller = abortControllersRef.current.get(jobId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(jobId);
    }
    linkedServerJobIdsRef.current.delete(jobId);

    startViewTransition(() => {
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    });
  }, []);

  const clearCompleted = useCallback(() => {
    startViewTransition(() => {
      const remaining = new Set<string>();
      setJobs((prev) =>
        prev.filter((job) => {
          const keep = job.status !== 'completed' && job.status !== 'cancelled';
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
  }, []);

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
    setIsResting(false);
    setQueueTick(0);

    startViewTransition(() => {
      setJobs([]);
    });
  }, []);

  useEffect(() => {
    const pendingJobs = jobs.filter((j) => j.status === 'pending');
    if (pendingJobs.length === 0) return;

    const processingJobs = jobs.filter((j) => j.status === 'processing');
    const activeJobsCount = Math.max(processingJobs.length, processingJobsRef.current.size);

    const jobsToStart = selectJobsToStart(pendingJobs, activeJobsCount, isResting);
    if (jobsToStart.length === 0) return;

    jobsToStart.forEach(async (nextJob) => {
      if (processingJobsRef.current.has(nextJob.id)) return;
      processingJobsRef.current.add(nextJob.id);

      const controller = new AbortController();
      abortControllersRef.current.set(nextJob.id, controller);

      setJobs((prev) =>
        prev.map((j) => (j.id === nextJob.id ? { ...j, status: 'processing' } : j)),
      );

      try {
        await executeGeneration(nextJob.config, {
          preventModal: true,
          workspaceId: nextJob.workspaceId,
          signal: controller.signal,
          onJobCreated: (studioJob) => {
            linkedServerJobIdsRef.current.set(nextJob.id, studioJob.id);
            setJobs((prev) =>
              prev.map((job) =>
                job.id === nextJob.id ? { ...job, serverJobId: studioJob.id } : job,
              ),
            );
          },
        });

        setJobs((prev) =>
          prev.map((j) =>
            j.id === nextJob.id
              ? {
                  ...j,
                  status: 'completed',
                  completedAt: Date.now(),
                }
              : j,
          ),
        );

        if (!nextJob.isForced) {
          setIsResting(true);
          if (restTimerRef.current) clearTimeout(restTimerRef.current);
          restTimerRef.current = setTimeout(() => {
            setIsResting(false);
          }, 1000);
        }
      } catch (error: unknown) {
        const isAbort = isAbortLikeError(error);

        setJobs((prev) =>
          prev.map((j) => {
            if (j.id !== nextJob.id) return j;

            if (isAbort) {
              return { ...j, status: 'cancelled' };
            }

            return {
              ...j,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }),
        );
      } finally {
        processingJobsRef.current.delete(nextJob.id);
        abortControllersRef.current.delete(nextJob.id);
        setQueueTick((t) => t + 1);
      }
    });

    return () => {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [jobs, isResting, executeGeneration, queueTick]);

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
