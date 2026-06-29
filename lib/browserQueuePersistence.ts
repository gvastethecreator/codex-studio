import type { QueueJob } from '../types';
import {
  MAX_PERSISTED_INLINE_ATTACHMENT_BYTES,
  preparePersistableAttachments,
} from './browserPersistenceBudget';
import { getQueueJobServerJobIds, normalizeQueueJobBackendLinks } from './browserQueueBackendSync';

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
      job.status === 'cancelled' ||
      job.status === 'needs_review')
  );
}

export function prepareBrowserQueueJobsForRestore(value: unknown): QueueJob[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isQueueJob)
    .slice(-MAX_RESTORED_BROWSER_QUEUE_JOBS)
    .map((restoredJob) => {
      const job = normalizeQueueJobBackendLinks(restoredJob);
      if (job.status !== 'processing') return job;

      const serverJobIds = getQueueJobServerJobIds(job);
      if (serverJobIds.length === 0) {
        return {
          ...job,
          status: 'pending',
          error: undefined,
        };
      }

      return {
        ...job,
        status: 'failed',
        serverJobId: serverJobIds.at(-1) ?? job.serverJobId,
        serverJobIds,
        error:
          'Browser refreshed after the backend job started. Track the durable job under Backend Session Jobs.',
      };
    });
}

export function prepareBrowserQueueJobsForPersist(jobs: QueueJob[]): QueueJob[] {
  return jobs.slice(-MAX_RESTORED_BROWSER_QUEUE_JOBS).map((job) => {
    const { attachments, omittedInlineCount } = preparePersistableAttachments(
      job.config.attachments,
    );
    if (omittedInlineCount === 0) {
      return {
        ...job,
        config: {
          ...job.config,
          attachments,
        },
      };
    }

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
