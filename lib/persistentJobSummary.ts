import type { ShellActivityJob } from './shellActivityJob';

export function summarizePersistentJobs(jobs: ShellActivityJob[]) {
  return {
    total: jobs.length,
    queued: jobs.filter((job) => job.status === 'queued').length,
    running: jobs.filter((job) => job.status === 'running').length,
    completed: jobs.filter((job) => job.status === 'completed').length,
    attention: jobs.filter(
      (job) =>
        job.status === 'failed' || job.status === 'cancelled' || job.status === 'needs_review',
    ).length,
  };
}
