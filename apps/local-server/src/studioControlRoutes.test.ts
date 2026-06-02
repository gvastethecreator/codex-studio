import { describe, expect, it, vi } from 'vite-plus/test';
import { createStudioControlRoutes } from './studioControlRoutes';

describe('studioControlRoutes', () => {
  it('delegates reset to resetStudioData with the provided worker seam', async () => {
    const worker = {
      resetWorkerState: vi.fn(async () => {}),
    };
    const resetStudioData = vi.fn(async () => ({
      ok: true,
      resetAt: '2026-05-29T00:00:00.000Z',
      libraryDir: 'D:/library',
      defaultProjectId: 'project-1',
    }));

    const routes = createStudioControlRoutes({ resetStudioData, worker });

    const response = await routes.request('/reset', { method: 'POST' });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: true, defaultProjectId: 'project-1' }),
    );
    expect(resetStudioData).toHaveBeenCalledWith(worker);
  });
});
