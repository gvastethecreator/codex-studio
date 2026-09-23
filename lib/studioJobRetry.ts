import type { Job } from '../packages/shared/src';
export { canResumeStudioJob } from '../packages/shared/src/jobRecovery';

const RETRYABLE_JOB_STATUSES = new Set<Job['status']>(['failed', 'cancelled']);

export function canRetryStudioJob(
  job: Pick<Job, 'status' | 'providerId' | 'execution' | 'batchId'>,
) {
  return (
    RETRYABLE_JOB_STATUSES.has(job.status) &&
    !(job.batchId && job.status === 'cancelled') &&
    (job.providerId !== 'codex' || Boolean(job.execution?.providerOptions?.codex)) &&
    (job.providerId !== 'chatgpt' || Boolean(job.execution?.providerOptions?.chatgpt))
  );
}
