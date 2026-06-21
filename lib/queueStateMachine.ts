import type { Job as StudioJob } from '../packages/shared/src';
import type { GenerationExecutionOutcome, ImageGenerationConfig, QueueJob } from '../types';

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

export interface QueueJobExecuteGenerationOptions {
  preventModal?: boolean;
  workspaceId?: string;
  signal?: AbortSignal;
  onJobCreated?: (job: StudioJob) => void;
}

export type QueueJobExecuteGeneration = (
  config: Partial<ImageGenerationConfig>,
  options?: QueueJobExecuteGenerationOptions,
) => Promise<GenerationExecutionOutcome>;

export type QueueJobExecutionResult =
  | {
      status: 'completed';
      completedAt: number;
      serverJobId: string | null;
    }
  | {
      status: 'cancelled';
      serverJobId: string | null;
    }
  | {
      status: 'failed';
      error: string;
      serverJobId: string | null;
    };

export interface QueueJobExecution {
  controller: AbortController;
  run: () => Promise<QueueJobExecutionResult>;
}

interface StartQueuedJobExecutionOptions {
  executeGeneration: QueueJobExecuteGeneration;
  onJobCreated?: (job: StudioJob) => void;
  now?: () => number;
}

export function startQueuedJobExecution(
  job: Pick<QueueJob, 'config' | 'workspaceId'>,
  { executeGeneration, onJobCreated, now = () => Date.now() }: StartQueuedJobExecutionOptions,
): QueueJobExecution {
  const controller = new AbortController();
  let serverJobId: string | null = null;

  return {
    controller,
    run: async () => {
      try {
        const outcome = await executeGeneration(job.config, {
          preventModal: true,
          workspaceId: job.workspaceId,
          signal: controller.signal,
          onJobCreated: (studioJob) => {
            serverJobId = studioJob.id;
            onJobCreated?.(studioJob);
          },
        });

        if (outcome.status === 'cancelled') {
          return {
            status: 'cancelled',
            serverJobId,
          };
        }

        if (outcome.status === 'failed') {
          return {
            status: 'failed',
            error: outcome.message,
            serverJobId,
          };
        }

        return {
          status: 'completed',
          completedAt: now(),
          serverJobId,
        };
      } catch (error: unknown) {
        if (isAbortLikeError(error)) {
          return {
            status: 'cancelled',
            serverJobId,
          };
        }

        return {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          serverJobId,
        };
      }
    },
  };
}
