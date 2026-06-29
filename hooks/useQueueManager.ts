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
import {
  getQueueJobServerJobIds,
  linkQueueJobToBackendJob,
  reconcileBrowserQueueWithBackendJobs,
} from '../lib/browserQueueBackendSync';
import type { ShellActivityJob } from '../lib/shellActivityJob';
import { get, set } from '../utils/idb';
import { runtimeLogger } from '../utils/runtimeLogger';
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
  const hasHydratedPersistedQueueRef = useRef(false);
  const backendJobsRef = useRef<ShellActivityJob[]>(backendJobs);

  useEffect(() => {
    backendJobsRef.current = backendJobs;
    setJobs((currentJobs) => reconcileBrowserQueueWithBackendJobs(currentJobs, backendJobs));
  }, [backendJobs]);

  useEffect(() => {
    let isMounted = true;

    get<QueueJob[]>(BROWSER_QUEUE_STORAGE_KEY)
      .then((storedJobs) => {
        if (!isMounted) return;

        const restoredJobs = prepareBrowserQueueJobsForRestore(storedJobs);
        linkedServerJobIdsRef.current.clear();
        for (const job of restoredJobs) {
          const serverJobIds = getQueueJobServerJobIds(job);
          if (serverJobIds.length > 0) {
            linkedServerJobIdsRef.current.set(job.id, serverJobIds);
          }
        }

        setJobs((currentJobs) =>
          currentJobs.length > 0
            ? currentJobs
            : reconcileBrowserQueueWithBackendJobs(restoredJobs, backendJobsRef.current),
        );
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
