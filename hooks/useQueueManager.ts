import { useState, useCallback, useEffect, useRef } from 'react';
import type { ImageGenerationConfig, QueueJob } from '../types';
import { startViewTransition } from '../utils/transitionUtils';
import {
  selectJobsToStart,
  startQueuedJobExecution,
  type QueueJobExecuteGeneration,
} from '../lib/queueStateMachine';
import {
  BROWSER_QUEUE_STORAGE_KEY,
  prepareBrowserQueueJobsForPersist,
  prepareBrowserQueueJobsForRestore,
} from '../lib/browserQueuePersistence';
import { get, set } from '../utils/idb';
import { runtimeLogger } from '../utils/runtimeLogger';
import { useLazyRef } from './useLazyRef';

interface UseQueueManagerProps {
  executeGeneration: QueueJobExecuteGeneration;
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
  const abortControllersRef = useLazyRef(() => new Map<string, AbortController>());
  const linkedServerJobIdsRef = useLazyRef(() => new Map<string, string>());
  const processingJobsRef = useLazyRef(() => new Set<string>());
  const hasHydratedPersistedQueueRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    get<QueueJob[]>(BROWSER_QUEUE_STORAGE_KEY)
      .then((storedJobs) => {
        if (!isMounted) return;

        const restoredJobs = prepareBrowserQueueJobsForRestore(storedJobs);
        linkedServerJobIdsRef.current.clear();
        for (const job of restoredJobs) {
          if (job.serverJobId) {
            linkedServerJobIdsRef.current.set(job.id, job.serverJobId);
          }
        }

        setJobs((currentJobs) => (currentJobs.length > 0 ? currentJobs : restoredJobs));
      })
      .catch((error) => {
        runtimeLogger.warn('Unable to restore browser queue from IndexedDB', error);
      })
      .finally(() => {
        if (isMounted) {
          hasHydratedPersistedQueueRef.current = true;
        }
      });

    return () => {
      isMounted = false;
    };
  }, [linkedServerJobIdsRef]);

  useEffect(() => {
    if (!hasHydratedPersistedQueueRef.current) return;

    set(BROWSER_QUEUE_STORAGE_KEY, prepareBrowserQueueJobsForPersist(jobs)).catch((error) => {
      runtimeLogger.warn('Unable to persist browser queue to IndexedDB', error);
    });
  }, [jobs]);

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

      startViewTransition(() => {
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
      });
    },
    [abortControllersRef, linkedServerJobIdsRef],
  );

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
    setIsResting(false);
    setQueueTick(0);

    startViewTransition(() => {
      setJobs([]);
    });
  }, [abortControllersRef, linkedServerJobIdsRef, processingJobsRef]);

  useEffect(() => {
    const pendingJobs = jobs.filter((j) => j.status === 'pending');
    if (pendingJobs.length === 0) return;

    const processingJobs = jobs.filter((j) => j.status === 'processing');
    const activeJobsCount = Math.max(processingJobs.length, processingJobsRef.current.size);

    const jobsToStart = selectJobsToStart(pendingJobs, activeJobsCount, isResting);
    if (jobsToStart.length === 0) return;

    void Promise.all(
      jobsToStart.map(async (nextJob) => {
        if (processingJobsRef.current.has(nextJob.id)) return;
        processingJobsRef.current.add(nextJob.id);

        const execution = startQueuedJobExecution(nextJob, {
          executeGeneration,
          onJobCreated: (studioJob) => {
            linkedServerJobIdsRef.current.set(nextJob.id, studioJob.id);
            setJobs((prev) =>
              prev.map((job) =>
                job.id === nextJob.id ? { ...job, serverJobId: studioJob.id } : job,
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
              prev.map((j) =>
                j.id === nextJob.id
                  ? {
                      ...j,
                      status: 'completed',
                      completedAt: result.completedAt,
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

            return;
          }

          if (result.status === 'cancelled') {
            setJobs((prev) =>
              prev.map((j) => (j.id === nextJob.id ? { ...j, status: 'cancelled' } : j)),
            );
            return;
          }

          setJobs((prev) =>
            prev.map((j) =>
              j.id === nextJob.id
                ? {
                    ...j,
                    status: 'failed',
                    error: result.error,
                  }
                : j,
            ),
          );
        } finally {
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
    isResting,
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
