import type { Job, JobSummary } from './types';

/** Resume only reads an existing remote execution; it never submits a new one. */
export function canResumeStudioJob(job: Pick<Job | JobSummary, 'status' | 'remoteExecution'>) {
  return (
    job.status === 'needs_review' &&
    job.remoteExecution?.providerId === 'comfy' &&
    ['submitting', 'accepted', 'completed'].includes(job.remoteExecution.phase)
  );
}
