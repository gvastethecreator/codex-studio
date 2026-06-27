import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { QueueJob } from '../types';
import {
  prepareBrowserQueueJobsForPersist,
  prepareBrowserQueueJobsForRestore,
} from './browserQueuePersistence';

function createBrowserQueueJob(overrides: Partial<QueueJob> = {}): QueueJob {
  return {
    id: 'job-1',
    prompt: 'A neon alley',
    workspaceId: 'workspace-1',
    config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'A neon alley' },
    status: 'pending',
    createdAt: 42,
    ...overrides,
  };
}

describe('browser queue persistence', () => {
  it('restores pending browser queue jobs without changing their generation snapshot', () => {
    const restored = prepareBrowserQueueJobsForRestore([
      createBrowserQueueJob({
        config: {
          ...DEFAULT_GENERATION_CONFIG,
          prompt: 'Queued prompt',
          attachments: [
            {
              id: 'att-1',
              name: 'ref.png',
              dataUrl: 'data:image/png;base64,AAAA',
              strength: 0.4,
            },
          ],
        },
      }),
    ]);

    expect(restored).toHaveLength(1);
    expect(restored[0]?.status).toBe('pending');
    expect(restored[0]?.config.attachments).toEqual([
      {
        id: 'att-1',
        name: 'ref.png',
        dataUrl: 'data:image/png;base64,AAAA',
        strength: 0.4,
      },
    ]);
  });

  it('returns interrupted browser-only processing jobs to pending after refresh', () => {
    const restored = prepareBrowserQueueJobsForRestore([
      createBrowserQueueJob({
        status: 'processing',
        serverJobId: null,
        error: 'Old transient state',
      }),
    ]);

    expect(restored[0]).toMatchObject({
      status: 'pending',
      error: undefined,
    });
  });

  it('does not duplicate already-durable backend jobs after refresh', () => {
    const restored = prepareBrowserQueueJobsForRestore([
      createBrowserQueueJob({
        status: 'processing',
        serverJobId: 'server-job-1',
      }),
    ]);

    expect(restored[0]).toMatchObject({
      status: 'failed',
      serverJobId: 'server-job-1',
    });
    expect(restored[0]?.error).toContain('Backend Session Jobs');
  });

  it('drops malformed persisted payloads', () => {
    expect(
      prepareBrowserQueueJobsForRestore([
        createBrowserQueueJob(),
        { id: 'broken', status: 'pending' },
        null,
      ]),
    ).toEqual([createBrowserQueueJob()]);
  });

  it('caps persisted queue size', () => {
    const jobs = Array.from({ length: 101 }, (_, index) =>
      createBrowserQueueJob({ id: `job-${index}` }),
    );

    const persisted = prepareBrowserQueueJobsForPersist(jobs);

    expect(persisted).toHaveLength(100);
    expect(persisted[0]?.id).toBe('job-1');
  });

  it('marks jobs with oversized inline references as failed for recovery', () => {
    const persisted = prepareBrowserQueueJobsForPersist([
      createBrowserQueueJob({
        config: {
          ...DEFAULT_GENERATION_CONFIG,
          attachments: [
            {
              id: 'large-ref',
              name: 'large.png',
              dataUrl: `data:image/png;base64,${'A'.repeat(600 * 1024)}`,
              strength: 1,
            },
          ],
        },
      }),
    ]);

    expect(persisted[0]?.status).toBe('failed');
    expect(persisted[0]?.config.attachments).toEqual([]);
    expect(persisted[0]?.error).toContain('exceeded 512 KB');
  });

  it('keeps oversized references when a durable handoff path exists', () => {
    const persisted = prepareBrowserQueueJobsForPersist([
      createBrowserQueueJob({
        config: {
          ...DEFAULT_GENERATION_CONFIG,
          attachments: [
            {
              id: 'large-ref',
              name: 'large.png',
              dataUrl: `data:image/png;base64,${'A'.repeat(600 * 1024)}`,
              localPath: 'D:/AI-Studio-Library/.studio/references/handoff-1/large.png',
              sourceUrl: 'http://127.0.0.1:4317/library/.studio/references/handoff-1/large.png',
              strength: 1,
            },
          ],
        },
      }),
    ]);

    expect(persisted[0]?.status).toBe('pending');
    expect(persisted[0]?.error).toBeUndefined();
    expect(persisted[0]?.config.attachments).toEqual([
      {
        id: 'large-ref',
        name: 'large.png',
        dataUrl: 'http://127.0.0.1:4317/library/.studio/references/handoff-1/large.png',
        localPath: 'D:/AI-Studio-Library/.studio/references/handoff-1/large.png',
        sourceUrl: 'http://127.0.0.1:4317/library/.studio/references/handoff-1/large.png',
        strength: 1,
      },
    ]);
  });
});
