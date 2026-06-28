import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec, type Job } from '../packages/shared/src';
import {
  countActiveShellActivityJobs,
  mergeShellActivityJobs,
  toShellActivityJob,
} from './shellActivityJob';

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

describe('shellActivityJob', () => {
  it('projects full jobs and summaries into compact shell activity jobs', () => {
    const full = toShellActivityJob(createJob(), 'backend_event');
    const summary = toShellActivityJob(
      { ...createJob(), sourceSpec: null, promptPreview: 'summary prompt' },
      'backend_summary',
    );

    expect(full).toMatchObject({
      promptPreview: 'final prompt',
      workspaceId: 'workspace-1',
      aspectRatio: '3:2',
      source: 'backend_event',
    });
    expect(summary).toMatchObject({
      promptPreview: 'summary prompt',
      workspaceId: null,
      aspectRatio: null,
      source: 'backend_summary',
    });
  });

  it('merges updates and counts active jobs without sourceSpec detail', () => {
    const queued = toShellActivityJob(createJob({ id: 'job-1', status: 'queued' }));
    const completed = toShellActivityJob(createJob({ id: 'job-2', status: 'completed' }));
    const runningUpdate = toShellActivityJob(
      createJob({
        id: 'job-1',
        status: 'running',
        updatedAt: '2026-06-28T00:00:05.000Z',
      }),
    );

    const merged = mergeShellActivityJobs([queued, completed], runningUpdate);

    expect(merged.map((job) => `${job.id}:${job.status}`)).toEqual([
      'job-1:running',
      'job-2:completed',
    ]);
    expect(countActiveShellActivityJobs(merged)).toBe(1);
  });
});
