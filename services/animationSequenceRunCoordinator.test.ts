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

  it('reconciles completed jobs to Catalog Entries', async () => {
    const run = {
      id: 'run-1',
      frames: [{ id: 'frame-0001', jobId: 'job-1', catalogImageId: null }],
    } as AnimationSequenceRunView;
    const attachFrame = vi.fn(async () => run);
    const coordinator = createAnimationSequenceRunCoordinator({
      attachFrame,
      readJobStatus: async () => ({
        id: 'job-1',
        status: 'completed',
        error: null,
        updatedAt: '2026-09-05',
      }),
      queryCatalogByJob: async () =>
        ({ images: [{ id: 'image-1' }], total: 1, hasMore: false }) as never,
    });

    await coordinator.reconcile(run);
    expect(attachFrame).toHaveBeenCalledWith('run-1', {
      frameId: 'frame-0001',
      jobId: 'job-1',
      catalogImageId: 'image-1',
    });
  });
});
