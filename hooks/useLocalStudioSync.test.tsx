/** @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vite-plus/test';
import type { JobListPage, JobSummary, SystemLog } from '../packages/shared/src';
import { useLocalStudioSync } from './useLocalStudioSync';

const api = vi.hoisted(() => ({ jobs: vi.fn(), logs: vi.fn() }));
vi.mock('../services/studio-api/jobs', () => ({ listStudioJobs: api.jobs }));
vi.mock('../services/studio-api/logs', () => ({ listStudioLogs: api.logs }));
vi.mock('../services/studioEventSource', () => {
  const subscribe = () => () => {};
  return {
    watchJob: vi.fn(),
    createStudioEventStream: () => ({
      close: () => {},
      onJobUpdate: subscribe,
      onAssetAdded: subscribe,
      onCatalogChanged: subscribe,
      onLogAdded: subscribe,
      onConnectionChange: subscribe,
      onRevisionGap: subscribe,
    }),
  };
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it('ignores an old running snapshot when a later refresh already confirmed completion', async () => {
  const running: JobSummary = {
    id: 'job',
    status: 'running',
    workspaceId: 'a',
    kind: 'image_generate',
    providerId: 'codex',
    execution: null,
    error: null,
    recipeId: null,
    aspectRatio: null,
    promptPreview: 'prompt',
    createdAt: '2026-09-01',
    updatedAt: '2026-09-01',
    completedAt: null,
  };
  const page: JobListPage = {
    open: [running],
    history: [],
    nextCursor: null,
    globalOpenCount: 1,
    workspaces: [],
    counts: {
      queued: 0,
      running: 1,
      needs_review: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      open: 1,
      history: 0,
      total: 1,
    },
  };
  let releaseOldLogs!: (logs: SystemLog[]) => void;
  api.jobs.mockResolvedValueOnce(page).mockResolvedValue({
    ...page,
    open: [],
    history: [{ ...running, status: 'completed', updatedAt: '2026-09-02' }],
  });
  api.logs
    .mockImplementationOnce(
      () =>
        new Promise<SystemLog[]>((resolve) => {
          releaseOldLogs = resolve;
        }),
    )
    .mockResolvedValue([]);
  const log = vi.fn();
  const { result } = renderHook(() => useLocalStudioSync({ logs: [], log }));
  await waitFor(() => expect(api.jobs).toHaveBeenCalledTimes(1));
  await act(async () => result.current.refreshBackendState());
  expect(result.current.activity.studioJobs[0].status).toBe('completed');
  await act(async () => releaseOldLogs([]));
  expect(result.current.activity.studioJobs[0].status).toBe('completed');
  expect(result.current.activity.activeServerJobCount).toBe(0);
});
