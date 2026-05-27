import { describe, expect, it } from 'vite-plus/test';

import type { Job as StudioJob } from '../packages/shared/src';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import { startQueuedJobExecution } from '../lib/queueStateMachine';
import { createQueueJob } from './useQueueManager';

function createStudioJob(overrides: Partial<StudioJob> = {}): StudioJob {
  return {
    id: 'server-job-1',
    projectId: 'project-1',
    kind: 'image_generate',
    providerId: 'codex',
    sourceSpec: null,
    status: 'queued',
    execution: null,
    originalPrompt: 'A neon alley',
    expandedPrompt: null,
    finalPromptUsed: 'A neon alley',
    error: null,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
    completedAt: null,
    ...overrides,
  };
}

describe('createQueueJob', () => {
  it('binds the queued job to the workspace active at enqueue time', () => {
    const job = createQueueJob(
      'A neon alley',
      { ...DEFAULT_GENERATION_CONFIG, prompt: 'Original prompt' },
      'workspace-42',
    );

    expect(job.workspaceId).toBe('workspace-42');
    expect(job.prompt).toBe('A neon alley');
    expect(job.config.prompt).toBe('A neon alley');
    expect(job.status).toBe('pending');
  });

  it('snapshots attachments so clearing the composer does not mutate queued jobs', () => {
    const attachment = {
      id: 'att-1',
      name: 'ref.png',
      dataUrl: 'data:image/png;base64,AAAA',
      strength: 0.25,
    };
    const job = createQueueJob(
      'A neon alley',
      { ...DEFAULT_GENERATION_CONFIG, attachments: [attachment] },
      'workspace-42',
    );

    attachment.strength = 0.75;

    expect(job.config.attachments).toEqual([
      {
        id: 'att-1',
        name: 'ref.png',
        dataUrl: 'data:image/png;base64,AAAA',
        strength: 0.25,
      },
    ]);
  });
});

describe('startQueuedJobExecution', () => {
  it('returns a completed result and forwards onJobCreated details', async () => {
    const calls: string[] = [];
    const job = createQueueJob(
      'A neon alley',
      { ...DEFAULT_GENERATION_CONFIG, prompt: 'Original prompt' },
      'workspace-1',
    );

    const execution = startQueuedJobExecution(job, {
      executeGeneration: async (_config, options) => {
        calls.push(`preventModal:${String(options?.preventModal)}`);
        calls.push(`workspaceId:${options?.workspaceId ?? 'missing'}`);

        expect(options?.signal).toBe(execution.controller.signal);

        options?.onJobCreated?.(createStudioJob());
      },
      onJobCreated: (studioJob) => {
        calls.push(`serverJob:${studioJob.id}`);
      },
      now: () => 42,
    });

    const result = await execution.run();

    expect(result).toEqual({
      status: 'completed',
      completedAt: 42,
      serverJobId: 'server-job-1',
    });
    expect(calls).toEqual([
      'preventModal:true',
      'workspaceId:workspace-1',
      'serverJob:server-job-1',
    ]);
  });

  it('maps abort-like errors to a cancelled result', async () => {
    const job = createQueueJob(
      'A neon alley',
      { ...DEFAULT_GENERATION_CONFIG, prompt: 'Original prompt' },
      'workspace-1',
    );
    const execution = startQueuedJobExecution(job, {
      executeGeneration: async (_config, options) => {
        await new Promise<void>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            const error = new Error('Operation cancelled by user');
            error.name = 'AbortError';
            reject(error);
          });
        });
      },
    });

    const resultPromise = execution.run();
    execution.controller.abort();

    await expect(resultPromise).resolves.toEqual({
      status: 'cancelled',
      serverJobId: null,
    });
  });

  it('maps non-abort failures to a failed result with message', async () => {
    const job = createQueueJob(
      'A neon alley',
      { ...DEFAULT_GENERATION_CONFIG, prompt: 'Original prompt' },
      'workspace-1',
    );
    const execution = startQueuedJobExecution(job, {
      executeGeneration: async () => {
        throw new Error('Backend exploded');
      },
    });

    const result = await execution.run();

    expect(result).toEqual({
      status: 'failed',
      error: 'Backend exploded',
      serverJobId: null,
    });
  });
});
