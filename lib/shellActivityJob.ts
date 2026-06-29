import type { Job, JobSummary } from '../packages/shared/src';
import { parsePromptTransport } from '../packages/shared/src/promptTransport';
import type { AspectRatio } from '../types';

export type ShellActivityJobSource = 'backend_summary' | 'backend_event' | 'browser_queue';

export interface ShellActivityJob {
  id: string;
  projectId: string;
  kind: Job['kind'];
  providerId: Job['providerId'];
  status: Job['status'];
  execution: Job['execution'];
  originalPrompt: string;
  error: string | null;
  promptPreview: string;
  workspaceId: string | null;
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
  return (job.finalPromptUsed || job.originalPrompt || '').trim().slice(0, 160);
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
  return {
    id: job.id,
    projectId: job.projectId,
    kind: job.kind,
    providerId: job.providerId,
    status: job.status,
    execution: job.execution,
    originalPrompt: job.originalPrompt,
    error: job.error,
    promptPreview: readPromptPreview(job),
    workspaceId: readMetadataString(job.sourceSpec?.metadata, 'workspaceId'),
    recipeId:
      job.sourceSpec?.recipeId ??
      parsePromptTransport(job.finalPromptUsed || job.originalPrompt).recipeId,
    aspectRatio: (job.sourceSpec?.output.aspectRatio as AspectRatio | null | undefined) ?? null,
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
