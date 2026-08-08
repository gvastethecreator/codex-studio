import { describe, expect, it } from 'vite-plus/test';

import { summarizePersistentJobs } from '../lib/persistentJobSummary';
import type { ShellActivityJob } from '../lib/shellActivityJob';

function job(id: string, status: ShellActivityJob['status']): ShellActivityJob {
  return {
    id,
    projectId: 'project-1',
    kind: 'image_generate',
    providerId: 'codex',
    status,
    execution: null,
    originalPrompt: 'Prompt',
    error: null,
    promptPreview: 'Prompt',
    workspaceId: 'default',
    recipeId: null,
    aspectRatio: '1:1',
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
    completedAt: status === 'completed' ? '2026-07-18T00:00:01.000Z' : null,
    source: 'backend_summary',
  };
}

describe('summarizePersistentJobs', () => {
  it('projects backend lifecycle states without browser queue state', () => {
    expect(
      summarizePersistentJobs([
        job('queued', 'queued'),
        job('running', 'running'),
        job('completed', 'completed'),
        job('failed', 'failed'),
        job('review', 'needs_review'),
      ]),
    ).toEqual({
      total: 5,
      queued: 1,
      running: 1,
      completed: 1,
      attention: 2,
    });
  });
});
