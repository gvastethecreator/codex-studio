import { describe, expect, it, vi } from 'vitest';
import type { SpriteAtlasRun } from '../packages/shared/src';
import { createSpriteAtlasRunCoordinator } from './spriteAtlasRunCoordinator';

describe('sprite atlas run coordinator', () => {
  it('records the provider job id without importing pixels', async () => {
    const recordDispatchCall = vi.fn(async () => ({ id: 'run-1' }) as SpriteAtlasRun);
    const coordinator = createSpriteAtlasRunCoordinator({ recordDispatchCall });
    await coordinator.recordDispatch('run-1', 'idle', 'job-1');
    expect(recordDispatchCall).toHaveBeenCalledWith('run-1', 'idle', 'job-1');
  });

  it('offers a retried row image and blocks failed jobs for retry', async () => {
    const run = {
      id: 'run-1',
      rows: [
        // A retried row keeps its previous import until the new image is confirmed.
        { id: 'idle', jobId: 'job-1', status: 'generating', catalogImageId: 'old', rawPath: '/r' },
        { id: 'run', jobId: 'job-2', status: 'generating', catalogImageId: null, rawPath: null },
      ],
    } as SpriteAtlasRun;
    const blockedRun = { id: 'run-1', rows: [] } as unknown as SpriteAtlasRun;
    const recordBlockedCall = vi.fn(async () => blockedRun);
    const coordinator = createSpriteAtlasRunCoordinator({
      recordBlockedCall,
      readJobStatus: async (jobId) => ({
        id: jobId,
        status: jobId === 'job-1' ? 'completed' : 'failed',
        error: jobId === 'job-1' ? null : 'Provider refused.',
        updatedAt: '2026-09-26',
      }),
      queryCatalogByJob: async () =>
        ({ images: [{ id: 'image-1' }], total: 1, hasMore: false }) as never,
    });

    await expect(coordinator.reconcile(run)).resolves.toEqual({
      run: blockedRun,
      ready: [{ rowId: 'idle', jobId: 'job-1', catalogImageId: 'image-1' }],
    });
    expect(recordBlockedCall).toHaveBeenCalledWith('run-1', 'run', {
      status: 'blocked',
      reasonKind: 'runner_failed',
      userMessage: 'The run job failed. Provider refused.',
      suggestion: 'Queue run again to retry.',
    });
  });
});
