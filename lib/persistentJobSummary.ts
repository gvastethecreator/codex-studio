import type { ShellActivityJob } from './shellActivityJob';

export function summarizePersistentJobs(jobs: ShellActivityJob[]) {
  const summary = { total: jobs.length, queued: 0, running: 0, completed: 0, attention: 0 };
  for (const job of jobs) {
    switch (job.status) {
      case 'queued':
        summary.queued += 1;
        break;
      case 'running':
        summary.running += 1;
        break;
      case 'completed':
        summary.completed += 1;
        break;
      case 'failed':
      case 'cancelled':
      case 'needs_review':
        summary.attention += 1;
        break;
    }
  }
  return summary;
}
