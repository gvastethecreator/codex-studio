import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { QueueJob } from '../types';
import { selectJobsToStart } from './queueStateMachine';

function createPendingJob(id: string, isForced = false): QueueJob {
  return {
    id,
    prompt: id,
    workspaceId: 'workspace-1',
    config: { ...DEFAULT_GENERATION_CONFIG, prompt: id },
    status: 'pending',
    createdAt: 1,
    isForced,
  };
}

describe('queueStateMachine durable dispatch', () => {
  it('dispatches every pending presentation item so backend intake owns the queue', () => {
    const pending = Array.from({ length: 30 }, (_, index) =>
      createPendingJob(`job-${index}`, index === 29),
    );

    expect(selectJobsToStart(pending).map((job) => job.id)).toEqual([
      'job-29',
      ...pending.slice(0, 29).map((job) => job.id),
    ]);
  });
});
