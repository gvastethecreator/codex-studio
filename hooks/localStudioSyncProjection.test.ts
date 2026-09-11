import { describe, expect, it } from 'vitest';

import { createGenerationTaskSpec, type Job, type JobSummary } from '../packages/shared/src';
import {
  INITIAL_LOCAL_STUDIO_SYNC_BACKEND_STATE,
  countActiveServerJobs,
  localStudioSyncBackendReducer,
} from './localStudioSyncProjection';

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: overrides.id ?? 'job-1',
    workspaceId: overrides.workspaceId ?? 'workspace-1',
    kind: overrides.kind ?? 'image_generate',
    providerId: overrides.providerId ?? 'codex',
    sourceSpec:
      overrides.sourceSpec ??
      createGenerationTaskSpec({
        id: 'spec-1',
        task: 'image_generate',
        providerId: 'codex',
        prompt: 'prompt',
        output: { aspectRatio: '3:2' },
        metadata: { workspaceId: 'workspace-1' },
      }),
    status: overrides.status ?? 'queued',
    execution: overrides.execution ?? null,
    originalPrompt: overrides.originalPrompt ?? 'original prompt',
    expandedPrompt: overrides.expandedPrompt ?? null,
    finalPromptUsed: overrides.finalPromptUsed ?? 'final prompt',
    error: overrides.error ?? null,
    createdAt: overrides.createdAt ?? '2026-06-28T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-06-28T00:00:01.000Z',
    completedAt: overrides.completedAt ?? null,
  };
}

function createJobSummary(job: Job): JobSummary {
  return {
    id: job.id,
    kind: job.kind,
    providerId: job.providerId,
    workspaceId: 'workspace-1',
    recipeId: job.sourceSpec?.recipeId ?? null,
    aspectRatio: job.sourceSpec?.output.aspectRatio ?? null,
    status: job.status,
    execution: job.execution,
    error: job.error,
    promptPreview: 'summary prompt',
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
  };
}

describe('localStudioSyncProjection', () => {
  it('stores summary-first shell activity jobs on refresh', () => {
    const state = localStudioSyncBackendReducer(INITIAL_LOCAL_STUDIO_SYNC_BACKEND_STATE, {
      type: 'refresh',
      requestedAtVersion: 0,
      jobs: [createJobSummary(createJob())],
      logs: [],
    });

    expect(state.jobs).toEqual([
      expect.objectContaining({
        id: 'job-1',
        promptPreview: 'summary prompt',
        workspaceId: 'workspace-1',
        aspectRatio: '3:2',
        source: 'backend_summary',
      }),
    ]);
    expect(countActiveServerJobs(state.jobs)).toBe(1);
  });

  it('merges full job events without requiring hot reads to include sourceSpec', () => {
    const refreshed = localStudioSyncBackendReducer(INITIAL_LOCAL_STUDIO_SYNC_BACKEND_STATE, {
      type: 'refresh',
      requestedAtVersion: 0,
      jobs: [createJobSummary(createJob({ updatedAt: '2026-06-28T00:00:01.000Z' }))],
      logs: [],
    });
    const updated = localStudioSyncBackendReducer(refreshed, {
      type: 'job_update',
      job: createJob({ status: 'running', updatedAt: '2026-06-28T00:00:02.000Z' }),
    });

    expect(updated.jobs).toEqual([
      expect.objectContaining({
        id: 'job-1',
        status: 'running',
        workspaceId: 'workspace-1',
        aspectRatio: '3:2',
        source: 'backend_event',
      }),
    ]);
  });
  it('keeps all open jobs and a terminal event newer than an in-flight refresh', () => {
    const jobs = Array.from({ length: 105 }, (_, index) =>
      createJobSummary(createJob({ id: `job-${index}` })),
    );
    const loaded = localStudioSyncBackendReducer(INITIAL_LOCAL_STUDIO_SYNC_BACKEND_STATE, {
      type: 'refresh',
      requestedAtVersion: 0,
      jobs,
      logs: [],
    });
    const terminal = localStudioSyncBackendReducer(loaded, {
      type: 'job_update',
      job: createJob({ id: 'job-0', status: 'completed', updatedAt: '2026-06-28T00:01:00.000Z' }),
    });
    const reconciled = localStudioSyncBackendReducer(terminal, {
      type: 'refresh',
      requestedAtVersion: loaded.eventVersion,
      jobs,
      logs: [],
    });
    expect(reconciled.jobs).toHaveLength(105);
    expect(countActiveServerJobs(reconciled.jobs)).toBe(104);
    expect(reconciled.jobs.find((job) => job.id === 'job-0')?.status).toBe('completed');
  });
});
