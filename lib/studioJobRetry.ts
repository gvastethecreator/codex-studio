import type { Job } from '../packages/shared/src';
export { canResumeStudioJob } from '../packages/shared/src/jobRecovery';

const RETRYABLE_JOB_STATUSES = new Set<Job['status']>(['failed', 'cancelled']);

export function canRetryStudioJob(status: Job['status']) {
  return RETRYABLE_JOB_STATUSES.has(status);
}
