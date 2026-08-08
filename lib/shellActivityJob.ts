import type { Job, JobSummary } from '../packages/shared/src';
import { parsePromptTransport } from '../packages/shared/src/promptTransport';
import type { AspectRatio } from '../types';

export type ShellActivityJobSource = 'backend_summary' | 'backend_event';

export interface ShellActivityJob {
  id: string;
  kind: Job['kind'];
  providerId: Job['providerId'];
  status: Job['status'];
  execution: Job['execution'];
  originalPrompt: string;
  error: string | null;
  promptPreview: string;
  workspaceId: string | null | undefined;
  recipeId: string | null;
  aspectRatio: AspectRatio | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  source: ShellActivityJobSource;
}

function readPromptPreview(job: Job | JobSummary) {
  if ('promptPreview' in job && job.promptPreview.trim()) {
    return job.promptPreview.trim();
  }
  const fullJob = job as Job;
  return (fullJob.finalPromptUsed || fullJob.originalPrompt || '').trim().slice(0, 160);
}

function readMetadataString(value: unknown, key: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === 'string' && candidate.trim() ? candidate : null;
}

export function toShellActivityJob(
  job: Job | JobSummary,
  source: ShellActivityJobSource = 'backend_summary',
): ShellActivityJob {
  const isSummary = 'promptPreview' in job;
  const summaryJob: JobSummary | null = isSummary ? job : null;
  const fullJob: Job | null = isSummary ? null : (job as Job);
  const promptPreview = readPromptPreview(job);
  return {
    id: job.id,
    kind: job.kind,
    providerId: job.providerId,
    status: job.status,
    execution: job.execution,
    originalPrompt: fullJob?.originalPrompt ?? promptPreview,
    error: job.error,
    promptPreview,
    workspaceId:
      summaryJob?.workspaceId ?? readMetadataString(fullJob?.sourceSpec?.metadata, 'workspaceId'),
    recipeId:
      summaryJob?.recipeId ??
      fullJob?.sourceSpec?.recipeId ??
      (fullJob
        ? parsePromptTransport(fullJob.finalPromptUsed || fullJob.originalPrompt).recipeId
        : null),
    aspectRatio:
      (summaryJob?.aspectRatio as AspectRatio | null | undefined) ??
      (fullJob?.sourceSpec?.output.aspectRatio as AspectRatio | null | undefined) ??
      null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
    source,
  };
}

export function mergeShellActivityJobs(
  current: ShellActivityJob[],
  incoming: ShellActivityJob,
  limit = 100,
) {
  return [incoming, ...current.filter((candidate) => candidate.id !== incoming.id)]
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
    .slice(0, limit);
}

export function countActiveShellActivityJobs(jobs: ShellActivityJob[]) {
  return jobs.filter(
    (job) => job.status === 'queued' || job.status === 'running' || job.status === 'needs_review',
  ).length;
}
