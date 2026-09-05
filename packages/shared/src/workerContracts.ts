export interface WorkerLimits {
  global: number;
  providers: Record<string, number>;
}

export type JobWaitReason = 'provider_capacity' | 'global_capacity' | 'provider_turn' | 'stopping';

export interface WorkerStatus {
  maxConcurrentJobs: number;
  activeWorkerCount: number;
  queuedJobs: number;
  trackedJobs: number;
  providerLimits: Record<string, number>;
  activeByProvider: Record<string, number>;
  waiting: Array<{ jobId: string; providerId: string; reason: JobWaitReason }>;
  stopping: boolean;
}

export function validateWorkerLimits(limits: WorkerLimits) {
  if (!Number.isInteger(limits.global) || limits.global < 1 || limits.global > 16) {
    throw new Error('Worker global capacity must be an integer from 1 to 16.');
  }
  for (const [provider, limit] of Object.entries(limits.providers)) {
    if (!Number.isInteger(limit) || limit < 1 || limit > limits.global) {
      throw new Error(
        `Worker capacity for ${provider} must be an integer from 1 to the global limit.`,
      );
    }
  }
  return limits;
}
