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

  it('offers a completed catalog image for confirmation', async () => {
    const run = {
      id: 'run-1',
      rows: [{ id: 'idle', jobId: 'job-1', status: 'generating', catalogImageId: null, rawPath: null }],
    } as SpriteAtlasRun;
    const coordinator = createSpriteAtlasRunCoordinator({
      readJobStatus: async () => ({
        id: 'job-1',
        status: 'completed',
        error: null,
        updatedAt: '2026-09-26',
      }),
      queryCatalogByJob: async () =>
        ({ images: [{ id: 'image-1' }], total: 1, hasMore: false }) as never,
    });

    await expect(coordinator.reconcile(run)).resolves.toEqual({
      run,
      ready: [{ rowId: 'idle', jobId: 'job-1', catalogImageId: 'image-1' }],
    });
  });
});
