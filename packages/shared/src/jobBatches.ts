import type { CreateJobRequest, Job, JobStatus, JobSummary, JobMetricSummary } from './types';

export interface CreateJobBatchRequest {
  requestId: string;
  items: CreateJobRequest[];
}
export type JobBatchStatus =
  | 'queued'
  | 'running'
  | 'needs_review'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'cancelled';
export interface JobBatchSummary {
  id: string;
  workspaceId: string;
  requestedCount: number;
  createdAt: string;
  status: JobBatchStatus;
  counts: Record<JobStatus, number>;
  retryable: Array<{ jobId: string; attempt: number }>;
}
export interface JobBatchDetail extends JobBatchSummary {
  jobs: Job[];
}
export interface RetryJobBatchRequest {
  requestId: string;
  items: Array<{ jobId: string; attempt: number }>;
}
export interface JobAttemptRecord {
  attempt: number;
  queuedAt: string | null;
  archivedAt: string;
  eventEndId: number;
  job: Job;
  metrics?: JobMetricSummary;
}
export function canRetryFailedBatchItem(job: Pick<Job, 'status' | 'providerId' | 'execution'>) {
  return (
    job.status === 'failed' &&
    (job.providerId !== 'codex' || Boolean(job.execution?.providerOptions?.codex)) &&
    (job.providerId !== 'chatgpt' || Boolean(job.execution?.providerOptions?.chatgpt))
  );
}
export function summarizeJobBatch(
  batch: Pick<JobBatchSummary, 'id' | 'workspaceId' | 'requestedCount' | 'createdAt'>,
  jobs: Array<Job | JobSummary>,
): JobBatchSummary {
  const counts: Record<JobStatus, number> = {
    queued: 0,
    running: 0,
    needs_review: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  };
  for (const job of jobs) counts[job.status] += 1;
  const status: JobBatchStatus = counts.needs_review
    ? 'needs_review'
    : counts.running
      ? 'running'
      : counts.queued
        ? 'queued'
        : counts.completed === batch.requestedCount
          ? 'completed'
          : counts.completed
            ? 'partial'
            : counts.failed
              ? 'failed'
              : 'cancelled';
  return {
    ...batch,
    counts,
    status,
    retryable: jobs
      .filter(canRetryFailedBatchItem)
      .map((job) => ({ jobId: job.id, attempt: job.attempt ?? 1 })),
  };
}
