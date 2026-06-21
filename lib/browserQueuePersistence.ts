import type { QueueJob } from '../types';
import {
  filterPersistableInlineAttachments,
  MAX_PERSISTED_INLINE_ATTACHMENT_BYTES,
} from './browserPersistenceBudget';

export const BROWSER_QUEUE_STORAGE_KEY = 'browser-queue-jobs';

const MAX_RESTORED_BROWSER_QUEUE_JOBS = 100;
const MAX_PERSISTED_INLINE_ATTACHMENT_KB = Math.round(MAX_PERSISTED_INLINE_ATTACHMENT_BYTES / 1024);

function isQueueJob(value: unknown): value is QueueJob {
  if (!value || typeof value !== 'object') return false;
  const job = value as Partial<QueueJob>;
  return (
    typeof job.id === 'string' &&
    typeof job.prompt === 'string' &&
    typeof job.workspaceId === 'string' &&
    typeof job.createdAt === 'number' &&
    Boolean(job.config) &&
    Array.isArray(job.config?.attachments) &&
    (job.status === 'pending' ||
      job.status === 'processing' ||
      job.status === 'completed' ||
      job.status === 'failed' ||
      job.status === 'cancelled')
  );
}

export function prepareBrowserQueueJobsForRestore(value: unknown): QueueJob[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isQueueJob)
    .slice(-MAX_RESTORED_BROWSER_QUEUE_JOBS)
    .map((job) => {
      if (job.status !== 'processing') return job;

      if (!job.serverJobId) {
        return {
          ...job,
          status: 'pending',
          error: undefined,
        };
      }

      return {
        ...job,
        status: 'failed',
        error:
          'Browser refreshed after the backend job started. Track the durable job under Backend Session Jobs.',
      };
    });
}

export function prepareBrowserQueueJobsForPersist(jobs: QueueJob[]): QueueJob[] {
  return jobs.slice(-MAX_RESTORED_BROWSER_QUEUE_JOBS).map((job) => {
    const attachments = filterPersistableInlineAttachments(job.config.attachments);
    if (attachments.length === job.config.attachments.length) return job;

    return {
      ...job,
      status: 'failed',
      error: `Reference image omitted from browser queue recovery because it exceeded ${MAX_PERSISTED_INLINE_ATTACHMENT_KB} KB. Re-add the reference and retry.`,
      config: {
        ...job.config,
        attachments,
      },
    };
  });
}
