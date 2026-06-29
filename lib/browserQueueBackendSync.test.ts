import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { ShellActivityJob } from './shellActivityJob';
import type { QueueJob } from '../types';
import {
  countUnlinkedActiveServerJobs,
  getQueueJobServerJobIds,
  linkQueueJobToBackendJob,
  reconcileBrowserQueueWithBackendJobs,
} from './browserQueueBackendSync';

function createQueueJob(overrides: Partial<QueueJob> = {}): QueueJob {
  return {
    id: 'browser-job-1',
    prompt: 'A neon alley',
    workspaceId: 'workspace-1',
    config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'A neon alley' },
    status: 'pending',
    createdAt: Date.parse('2026-06-29T10:00:00.000Z'),
    ...overrides,
  };
}

function createBackendJob(overrides: Partial<ShellActivityJob> = {}): ShellActivityJob {
  return {
    id: 'server-job-1',
    projectId: 'project-1',
    kind: 'image_generate',
    providerId: 'codex',
    status: 'running',
    execution: null,
    originalPrompt: 'A neon alley',
    error: null,
    promptPreview: 'A neon alley',
    workspaceId: 'workspace-1',
    recipeId: null,
    aspectRatio: '1:1',
    createdAt: '2026-06-29T10:00:01.000Z',
    updatedAt: '2026-06-29T10:00:02.000Z',
    completedAt: null,
    source: 'backend_summary',
    ...overrides,
  };
}

describe('browserQueueBackendSync', () => {
  it('keeps all backend ids linked to one browser queue job', () => {
    const first = linkQueueJobToBackendJob(createQueueJob(), 'server-job-1');
    const second = linkQueueJobToBackendJob(first, 'server-job-2');

    expect(getQueueJobServerJobIds(second)).toEqual(['server-job-1', 'server-job-2']);
    expect(second.serverJobId).toBe('server-job-2');
  });

  it('lets completed backend state repair a stale browser failure', () => {
    const reconciled = reconcileBrowserQueueWithBackendJobs(
      [
        createQueueJob({
          status: 'failed',
          serverJobId: 'server-job-1',
          error: 'Local studio job server-job-1 timed out',
        }),
      ],
      [
        createBackendJob({
          status: 'completed',
          completedAt: '2026-06-29T10:01:00.000Z',
          updatedAt: '2026-06-29T10:01:00.000Z',
        }),
      ],
    );

    expect(reconciled[0]).toMatchObject({
      status: 'completed',
      error: undefined,
      completedAt: Date.parse('2026-06-29T10:01:00.000Z'),
    });
  });

  it('aggregates multi-job batch state before declaring the browser job complete', () => {
    const browserJob = createQueueJob({
      status: 'processing',
      serverJobIds: ['server-job-1', 'server-job-2'],
    });

    expect(
      reconcileBrowserQueueWithBackendJobs(
        [browserJob],
        [
          createBackendJob({
            id: 'server-job-1',
            status: 'completed',
            completedAt: '2026-06-29T10:01:00.000Z',
          }),
          createBackendJob({ id: 'server-job-2', status: 'running' }),
        ],
      )[0]?.status,
    ).toBe('processing');

    expect(
      reconcileBrowserQueueWithBackendJobs(
        [browserJob],
        [
          createBackendJob({
            id: 'server-job-1',
            status: 'completed',
            completedAt: '2026-06-29T10:01:00.000Z',
          }),
          createBackendJob({
            id: 'server-job-2',
            status: 'completed',
            completedAt: '2026-06-29T10:02:00.000Z',
          }),
        ],
      )[0],
    ).toMatchObject({
      status: 'completed',
      completedAt: Date.parse('2026-06-29T10:02:00.000Z'),
    });
  });

  it('counts only active backend jobs not already linked to browser queue items', () => {
    expect(
      countUnlinkedActiveServerJobs(
        [
          createBackendJob({ id: 'server-job-1', status: 'running' }),
          createBackendJob({ id: 'server-job-2', status: 'queued' }),
          createBackendJob({ id: 'server-job-3', status: 'completed' }),
        ],
        [createQueueJob({ serverJobIds: ['server-job-1'] })],
      ),
    ).toBe(1);
  });
});
