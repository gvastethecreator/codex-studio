import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec, type Job, type JobSummary } from '../packages/shared/src';
import {
  INITIAL_LOCAL_STUDIO_SYNC_BACKEND_STATE,
  countActiveServerJobs,
  localStudioSyncBackendReducer,
} from './localStudioSyncProjection';

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: overrides.id ?? 'job-1',
    projectId: overrides.projectId ?? 'project-1',
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
    ...job,
    sourceSpec: null,
    promptPreview: 'summary prompt',
  };
}

describe('localStudioSyncProjection', () => {
  it('stores summary-first shell activity jobs on refresh', () => {
    const state = localStudioSyncBackendReducer(INITIAL_LOCAL_STUDIO_SYNC_BACKEND_STATE, {
      type: 'refresh',
      jobs: [createJobSummary(createJob())],
      logs: [],
    });

    expect(state.jobs).toEqual([
      expect.objectContaining({
        id: 'job-1',
        promptPreview: 'summary prompt',
        workspaceId: null,
        aspectRatio: null,
        source: 'backend_summary',
      }),
    ]);
    expect(countActiveServerJobs(state.jobs)).toBe(1);
  });

  it('merges full job events without requiring hot reads to include sourceSpec', () => {
    const refreshed = localStudioSyncBackendReducer(INITIAL_LOCAL_STUDIO_SYNC_BACKEND_STATE, {
      type: 'refresh',
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
});
