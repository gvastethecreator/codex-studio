import type { QueueJob } from '../types';

export const MAX_CONCURRENT_JOBS = 3;
export const TOTAL_MAX_CONCURRENT = 15;
export const HARD_MAX_LIMIT = 25;

export function selectJobsToStart(
  pendingJobs: QueueJob[],
  activeJobsCount: number,
  isResting: boolean,
): QueueJob[] {
  const forcedJobs = pendingJobs.filter((j) => j.isForced);
  const regularJobs = pendingJobs.filter((j) => !j.isForced);

  const jobsToStart: QueueJob[] = [];

  const forcedAvailableSlots = HARD_MAX_LIMIT - activeJobsCount;
  if (forcedJobs.length > 0 && forcedAvailableSlots > 0) {
    jobsToStart.push(...forcedJobs.slice(0, forcedAvailableSlots));
  }

  if (!isResting && regularJobs.length > 0) {
    const availableSlots = MAX_CONCURRENT_JOBS - activeJobsCount - jobsToStart.length;
    if (availableSlots > 0) {
      const remainingTotalSlots = TOTAL_MAX_CONCURRENT - activeJobsCount - jobsToStart.length;
      const slotsToFill = Math.min(availableSlots, remainingTotalSlots);
      if (slotsToFill > 0) {
        jobsToStart.push(...regularJobs.slice(0, slotsToFill));
      }
    }
  }

  return jobsToStart;
}

export function isAbortLikeError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === 'AbortError' ||
    error.message === 'Operation cancelled by user' ||
    /job cancelled/i.test(error.message)
  );
}
