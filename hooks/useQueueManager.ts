import { useState, useCallback, useEffect, useRef } from 'react';
import type { ImageGenerationConfig, QueueJob, QueueJobStatus } from '../types';
import type { Job as StudioJob } from '../packages/shared/src';
import { startViewTransition } from '../utils/transitionUtils';

interface UseQueueManagerProps {
  executeGeneration: (
    config: Partial<ImageGenerationConfig>,
    options?: {
      preventModal?: boolean;
      signal?: AbortSignal;
      onJobCreated?: (job: StudioJob) => void;
    },
  ) => Promise<void>;
  isGenerating: boolean;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  cancelPersistentJob: (jobId: string) => Promise<void>;
}

const MAX_CONCURRENT_JOBS = 3;

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
    (prompt: string, config: ImageGenerationConfig, force: boolean = false) => {
      startViewTransition(() => {
        const newJob: QueueJob = {
          id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          prompt,
          config: { ...config, prompt },
          status: 'pending',
          createdAt: Date.now(),
          isForced: force,
        };
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

  // Queue Processing Logic
  useEffect(() => {
    // We don't return early on isResting here because we might have forced jobs
    // that should bypass the resting period or we might need to check the queue.

    const pendingJobs = jobs.filter((j) => j.status === 'pending');
    if (pendingJobs.length === 0) return;

    // Use the actual jobs state AND the processing ref to determine concurrency
    // This prevents over-concurrency when the effect re-runs before state updates
    const processingJobs = jobs.filter((j) => j.status === 'processing');
    const activeJobsCount = Math.max(processingJobs.length, processingJobsRef.current.size);

    // Separate forced jobs from regular jobs
    const forcedJobs = pendingJobs.filter((j) => j.isForced);
    const regularJobs = pendingJobs.filter((j) => !j.isForced);

    // Forced jobs bypass the slot limit, but we still want to limit them slightly to avoid browser crashes
    const TOTAL_MAX_CONCURRENT = 15;
    const HARD_MAX_LIMIT = 25; // Hard limit for forced jobs

    let jobsToStart: QueueJob[] = [];

    // 1. Prioritize forced jobs (they bypass isResting and normal concurrency)
    const forcedAvailableSlots = HARD_MAX_LIMIT - activeJobsCount;
    if (forcedJobs.length > 0 && forcedAvailableSlots > 0) {
      jobsToStart = [...forcedJobs.slice(0, forcedAvailableSlots)];
    }

    // 2. Add regular jobs if not resting and slots are available
    if (!isResting && regularJobs.length > 0) {
      const availableSlots = MAX_CONCURRENT_JOBS - activeJobsCount - jobsToStart.length;
      if (availableSlots > 0) {
        // Fill remaining slots with regular jobs, but don't exceed total max
        const remainingTotalSlots = TOTAL_MAX_CONCURRENT - activeJobsCount - jobsToStart.length;
        const slotsToFill = Math.min(availableSlots, remainingTotalSlots);

        if (slotsToFill > 0) {
          jobsToStart = [...jobsToStart, ...regularJobs.slice(0, slotsToFill)];
        }
      }
    }

    if (jobsToStart.length === 0) return;

    jobsToStart.forEach(async (nextJob) => {
      // Guard against double-processing
      if (processingJobsRef.current.has(nextJob.id)) return;
      processingJobsRef.current.add(nextJob.id);

      const controller = new AbortController();
      abortControllersRef.current.set(nextJob.id, controller);

      // Update status to processing
      setJobs((prev) =>
        prev.map((j) => (j.id === nextJob.id ? { ...j, status: 'processing' } : j)),
      );

      try {
        await executeGeneration(nextJob.config, {
          preventModal: true,
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

        // Only trigger resting period for regular jobs to keep the UI snappy for forced ones
        if (!nextJob.isForced) {
          setIsResting(true);
          if (restTimerRef.current) clearTimeout(restTimerRef.current);
          restTimerRef.current = setTimeout(() => {
            setIsResting(false);
          }, 1000);
        }
      } catch (error: any) {
        const isAbort =
          error.name === 'AbortError' ||
          error.message === 'Operation cancelled by user' ||
          /job cancelled/i.test(error.message || '');

        setJobs((prev) =>
          prev.map((j) => {
            if (j.id !== nextJob.id) return j;

            if (isAbort) {
              return { ...j, status: 'cancelled' };
            }

            return {
              ...j,
              status: 'failed',
              error: error.message || 'Unknown error',
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
      // We don't clear the timer here to allow it to finish even if the effect re-runs
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
