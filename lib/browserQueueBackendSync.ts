import type { JobStatus } from '../packages/shared/src';
import type { ShellActivityJob } from './shellActivityJob';
import type { QueueJob, QueueJobStatus } from '../types';

const ACTIVE_BACKEND_STATUSES = new Set<JobStatus>(['queued', 'running', 'needs_review']);
const RUNNING_BACKEND_STATUSES = new Set<JobStatus>(['queued', 'running']);

function uniqueIds(ids: Array<string | null | undefined>) {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

function statusTime(job: ShellActivityJob, now: () => number) {
  const parsed = Date.parse(job.completedAt ?? job.updatedAt);
  return Number.isFinite(parsed) ? parsed : now();
}

function newestStatusTime(jobs: ShellActivityJob[], now: () => number) {
  return jobs.reduce((latest, job) => Math.max(latest, statusTime(job, now)), 0) || now();
}

function sameIds(left: string[] | undefined, right: string[]) {
  return (left ?? []).join('|') === right.join('|');
}

function applyQueueSyncPatch(
  job: QueueJob,
  patch: Partial<
    Pick<QueueJob, 'status' | 'error' | 'completedAt' | 'serverJobId' | 'serverJobIds'>
  >,
) {
  const has = (key: keyof typeof patch) => Object.prototype.hasOwnProperty.call(patch, key);
  const nextServerJobIds = has('serverJobIds') ? patch.serverJobIds : job.serverJobIds;
  const nextServerJobId = has('serverJobId') ? patch.serverJobId : job.serverJobId;
  const nextStatus = has('status') ? patch.status : job.status;
  const nextError = has('error') ? patch.error : job.error;
  const nextCompletedAt = has('completedAt') ? patch.completedAt : job.completedAt;

  if (
    nextStatus === job.status &&
    nextError === job.error &&
    nextCompletedAt === job.completedAt &&
    nextServerJobId === job.serverJobId &&
    sameIds(job.serverJobIds, nextServerJobIds ?? [])
  ) {
    return job;
  }

  return {
    ...job,
    ...patch,
  };
}

export function getQueueJobServerJobIds(
  job: Pick<QueueJob, 'serverJobId' | 'serverJobIds'>,
): string[] {
  return uniqueIds([...(job.serverJobIds ?? []), job.serverJobId ?? null]);
}

export function getPrimaryQueueJobServerJobId(job: Pick<QueueJob, 'serverJobId' | 'serverJobIds'>) {
  const ids = getQueueJobServerJobIds(job);
  return ids.at(-1) ?? null;
}

export function linkQueueJobToBackendJob(job: QueueJob, serverJobId: string): QueueJob {
  const serverJobIds = uniqueIds([...getQueueJobServerJobIds(job), serverJobId]);
  return applyQueueSyncPatch(job, {
    serverJobId,
    serverJobIds,
  });
}

export function normalizeQueueJobBackendLinks(job: QueueJob): QueueJob {
  const serverJobIds = getQueueJobServerJobIds(job);
  if (serverJobIds.length === 0) return job;
  return applyQueueSyncPatch(job, {
    serverJobId: serverJobIds.at(-1) ?? null,
    serverJobIds,
  });
}

function resolveQueueStatusFromBackendJobs(
  linkedBackendJobs: ShellActivityJob[],
): QueueJobStatus | null {
  if (linkedBackendJobs.some((job) => RUNNING_BACKEND_STATUSES.has(job.status))) {
    return 'processing';
  }

  if (linkedBackendJobs.some((job) => job.status === 'needs_review')) {
    return 'needs_review';
  }

  if (linkedBackendJobs.some((job) => job.status === 'failed')) {
    return 'failed';
  }

  if (linkedBackendJobs.some((job) => job.status === 'cancelled')) {
    return 'cancelled';
  }

  if (
    linkedBackendJobs.length > 0 &&
    linkedBackendJobs.every((job) => job.status === 'completed')
  ) {
    return 'completed';
  }

  return null;
}

function backendErrorForStatus(status: QueueJobStatus, linkedBackendJobs: ShellActivityJob[]) {
  if (status === 'failed') {
    const failed = linkedBackendJobs.find((job) => job.status === 'failed');
    return failed?.error ?? `Backend job ${failed?.id ?? 'unknown'} failed.`;
  }

  if (status === 'needs_review') {
    const review = linkedBackendJobs.find((job) => job.status === 'needs_review');
    return review?.error ?? 'Backend job needs review. Inspect backend transcript.';
  }

  return undefined;
}

export function reconcileBrowserQueueJobWithBackendJobs({
  job,
  backendJobsById,
  now = () => Date.now(),
}: {
  job: QueueJob;
  backendJobsById: Map<string, ShellActivityJob>;
  now?: () => number;
}): QueueJob {
  const normalizedJob = normalizeQueueJobBackendLinks(job);
  const serverJobIds = getQueueJobServerJobIds(normalizedJob);
  if (serverJobIds.length === 0) return normalizedJob;

  const linkedBackendJobs = serverJobIds
    .map((serverJobId) => backendJobsById.get(serverJobId))
    .filter((backendJob): backendJob is ShellActivityJob => Boolean(backendJob));
  if (linkedBackendJobs.length === 0) return normalizedJob;

  const nextStatus = resolveQueueStatusFromBackendJobs(linkedBackendJobs);
  if (!nextStatus) return normalizedJob;

  if (nextStatus === 'processing') {
    return applyQueueSyncPatch(normalizedJob, {
      status: 'processing',
      error: undefined,
      completedAt: undefined,
    });
  }

  return applyQueueSyncPatch(normalizedJob, {
    status: nextStatus,
    error: backendErrorForStatus(nextStatus, linkedBackendJobs),
    completedAt: newestStatusTime(linkedBackendJobs, now),
  });
}

export function reconcileBrowserQueueWithBackendJobs(
  jobs: QueueJob[],
  backendJobs: ShellActivityJob[],
  now: () => number = () => Date.now(),
): QueueJob[] {
  if (jobs.length === 0) return jobs;
  const backendJobsById = new Map(backendJobs.map((job) => [job.id, job]));
  let changed = false;
  const nextJobs = jobs.map((job) => {
    const nextJob = reconcileBrowserQueueJobWithBackendJobs({
      job,
      backendJobsById,
      now,
    });
    changed ||= nextJob !== job;
    return nextJob;
  });
  return changed ? nextJobs : jobs;
}

export function countUnlinkedActiveServerJobs(
  backendJobs: ShellActivityJob[],
  browserQueueJobs: QueueJob[],
) {
  const linkedServerJobIds = new Set(browserQueueJobs.flatMap(getQueueJobServerJobIds));
  return backendJobs.filter(
    (job) => ACTIVE_BACKEND_STATUSES.has(job.status) && !linkedServerJobIds.has(job.id),
  ).length;
}
