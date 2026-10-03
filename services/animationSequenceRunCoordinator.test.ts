import { describe, expect, it, vi } from 'vitest';
import type { AnimationSequenceRunView } from '../packages/shared/src';
import { createAnimationSequenceRunCoordinator } from './animationSequenceRunCoordinator';

describe('Animation Sequence Run Coordinator', () => {
  it('records durable dispatch linkage before completion', async () => {
    const attachFrame = vi.fn(async () => ({ id: 'run-1' }) as AnimationSequenceRunView);
    const coordinator = createAnimationSequenceRunCoordinator({ attachFrame });
    await coordinator.recordDispatch('run-1', 'frame-0001', 'job-1');
    expect(attachFrame).toHaveBeenCalledWith('run-1', {
      frameId: 'frame-0001',
      jobId: 'job-1',
    });
  });

  it('reconciles completed jobs to Catalog Entries and blocks failed jobs', async () => {
    const run = {
      id: 'run-1',
      frames: [
        { id: 'frame-0001', jobId: 'job-1', catalogImageId: null, status: 'generating' },
        // A correction keeps the accepted image until its job lands.
        { id: 'frame-0002', jobId: 'job-2', catalogImageId: 'image-old', status: 'correcting' },
        { id: 'frame-0003', jobId: 'job-3', catalogImageId: null, status: 'generating' },
        { id: 'frame-0004', jobId: 'job-4', catalogImageId: null, status: 'generating' },
      ],
    } as AnimationSequenceRunView;
    const attachFrame = vi.fn(async () => run);
    const statuses = {
      'job-1': 'completed',
      'job-2': 'completed',
      'job-3': 'failed',
      'job-4': 'running',
    } as const;
    const coordinator = createAnimationSequenceRunCoordinator({
      attachFrame,
      readJobStatus: async (jobId) => ({
        id: jobId,
        status: statuses[jobId as keyof typeof statuses],
        error: jobId === 'job-3' ? 'provider timeout' : null,
        updatedAt: '2026-09-05',
      }),
      queryCatalogByJob: async (jobId) =>
        ({ images: [{ id: `image-${jobId}` }], total: 1, hasMore: false }) as never,
    });

    await coordinator.reconcile(run);
    expect(attachFrame.mock.calls).toEqual([
      ['run-1', { frameId: 'frame-0001', jobId: 'job-1', catalogImageId: 'image-job-1' }],
      ['run-1', { frameId: 'frame-0002', jobId: 'job-2', catalogImageId: 'image-job-2' }],
      [
        'run-1',
        {
          frameId: 'frame-0003',
          jobId: 'job-3',
          blocked: expect.objectContaining({
            status: 'blocked',
            reasonKind: 'runner_failed',
            userMessage: 'The frame job failed: provider timeout',
          }),
        },
      ],
    ]);
  });
});
