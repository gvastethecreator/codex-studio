import type { Job as StudioJob } from '../packages/shared/src';
import type { GenerationExecutionOutcome, ImageGenerationConfig, QueueJob } from '../types';

export function selectJobsToStart(pendingJobs: QueueJob[]): QueueJob[] {
  const forcedJobs = pendingJobs.filter((j) => j.isForced);
  const regularJobs = pendingJobs.filter((j) => !j.isForced);
  // Persistent Job Intake and the backend worker own admission/concurrency.
  // Dispatch every browser presentation item immediately so none remain only
  // in React state and disappear on refresh.
  return [...forcedJobs, ...regularJobs];
}

function isAbortLikeError(error: unknown): boolean {
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
