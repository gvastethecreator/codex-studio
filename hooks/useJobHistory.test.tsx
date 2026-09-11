/** @vitest-environment jsdom */
import {
  act,
  cleanup,
  renderHook,
  waitFor,
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { JobListPage, JobSummary } from '../packages/shared/src';
import { toShellActivityJob, type ShellActivityJob } from '../lib/shellActivityJob';
import { mergeJobHistory, useJobHistory } from './useJobHistory';
import { QueueBatchCard } from '../components/QueueBatchCard';

const api = vi.hoisted(() => ({ list: vi.fn(), batch: vi.fn(), retry: vi.fn() }));
const stream = vi.hoisted(() => ({ gaps: new Set<() => void>(), close: vi.fn() }));
vi.mock('../services/studioEventSource', () => ({
  createStudioEventStream: () => ({
    onRevisionGap: (callback: () => void) => {
      stream.gaps.add(callback);
      return () => stream.gaps.delete(callback);
    },
    close: stream.close,
  }),
}));
vi.mock('../services/studio-api/jobs', () => ({
  listStudioJobs: api.list,
  getStudioJobBatchSummary: api.batch,
  retryStudioJobBatch: api.retry,
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const noJobs: ShellActivityJob[] = [];
it('reconciles a fast terminal retry instead of applying a delayed queued acknowledgement', async () => {
  const snapshot = {
    id: 'batch-one',
    requestedCount: 2,
    status: 'partial',
    counts: { completed: 1, failed: 1, queued: 0, running: 0, cancelled: 0, needs_review: 0 },
    retryable: [{ jobId: 'retry-one', attempt: 1 }],
  };
  const next = { ...snapshot, retryable: [{ jobId: 'retry-one', attempt: 2 }] };
  api.batch.mockResolvedValueOnce(snapshot).mockResolvedValue(next);
  let acknowledge!: (value: unknown) => void;
  api.retry.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        acknowledge = resolve;
      }),
  );
  const view = render(<QueueBatchCard batchId="batch-one" revision="1" />);
  fireEvent.click(await screen.findByRole('button', { name: 'Retry failed (1)' }));
  view.rerender(<QueueBatchCard batchId="batch-one" revision="2" />);
  await waitFor(() => expect(api.batch).toHaveBeenCalledTimes(2));
  await act(async () => acknowledge({ ...snapshot, status: 'queued', retryable: [] }));
  await waitFor(() => expect(api.batch).toHaveBeenCalledTimes(3));
  expect(screen.getByRole('button', { name: 'Retry failed (1)' })).toBeTruthy();
  expect(screen.getByText(/1 completed · 1 failed/)).toBeTruthy();
});
const emptyPage: JobListPage = {
  open: [],
  history: [],
  nextCursor: null,
  globalOpenCount: 0,
  workspaces: [{ id: 'a', name: 'A' }],
  counts: {
    queued: 0,
    running: 0,
    needs_review: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    open: 0,
    history: 0,
    total: 0,
  },
};
function job(
  id: string,
  status: JobSummary['status'] = 'failed',
  updatedAt = '2026-09-05T00:00:00.000Z',
): JobSummary {
  return {
    id,
    status,
    updatedAt,
    createdAt: '2026-09-01T00:00:00.000Z',
    completedAt: null,
    workspaceId: 'a',
    kind: 'image_generate',
    providerId: 'codex',
    execution: null,
    error: null,
    recipeId: null,
    aspectRatio: null,
    promptPreview: id,
  };
}

it('keeps loaded pages on an older-page failure and retries the same cursor', async () => {
  api.list
    .mockResolvedValueOnce({ ...emptyPage, history: [job('first')], nextCursor: 'page-2' })
    .mockRejectedValueOnce(new Error('History unavailable'))
    .mockResolvedValueOnce({ ...emptyPage, history: [job('older', 'cancelled')] });
  const known = [toShellActivityJob(job('active', 'running'))];
  const { result, rerender } = renderHook(({ jobs }) => useJobHistory(jobs, '', ''), {
    initialProps: { jobs: known },
  });
  await waitFor(() => expect(result.current.history).toHaveLength(1));
  act(() => result.current.loadMore());
  await waitFor(() => expect(result.current.error).toBe('History unavailable'));
  expect(result.current.history.map((row) => row.id)).toEqual(['first']);
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.history).toHaveLength(2));
  expect(api.list.mock.calls[2][0].cursor).toBe('page-2');
  expect(result.current.nextCursor).toBeNull();
  rerender({ jobs: known.map((row) => ({ ...row })) });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
  expect(api.list).toHaveBeenCalledTimes(3);
  expect(result.current.history).toHaveLength(2);
  expect(result.current.nextCursor).toBeNull();
});

it('ignores an old filter response and keeps known open work on a failed first read', async () => {
  let resolveOld!: (value: JobListPage) => void;
  api.list
    .mockImplementationOnce(
      () =>
        new Promise<JobListPage>((done) => {
          resolveOld = done;
        }),
    )
    .mockRejectedValueOnce(new Error('Offline'));
  const known = [toShellActivityJob({ ...job('active', 'running'), workspaceId: 'b' })];
  const { result, rerender } = renderHook(({ workspace }) => useJobHistory(known, workspace, ''), {
    initialProps: { workspace: 'a' },
  });
  rerender({ workspace: 'b' });
  await waitFor(() => expect(result.current.error).toBe('Offline'));
  await act(async () => resolveOld({ ...emptyPage, history: [job('wrong-filter')] }));
  expect(result.current.history).toEqual([]);
  expect(result.current.open.map((row) => row.id)).toEqual(['active']);
});

it('deduplicates terminal events and never replaces a newer open snapshot with old history', () => {
  const terminal = toShellActivityJob(
    job('active', 'completed', '2026-09-05T00:01:00.000Z'),
    'backend_event',
  );
  const first = mergeJobHistory(
    [],
    { ...emptyPage, history: [job('active', 'completed')] },
    [terminal],
    '',
    '',
  );
  expect(first).toHaveLength(1);
  expect(first[0].updatedAt).toBe(terminal.updatedAt);
  const resumed = { ...emptyPage, open: [job('active', 'running', '2026-09-05T00:02:00.000Z')] };
  expect(mergeJobHistory(first, resumed, [terminal], '', '')).toEqual([]);
});

it('projects new and completed events even when refreshing an existing page fails', async () => {
  api.list
    .mockResolvedValueOnce({ ...emptyPage, open: [job('old-active', 'running')] })
    .mockRejectedValue(new Error('Refresh unavailable'));
  const { result, rerender } = renderHook(({ jobs }) => useJobHistory(jobs, '', ''), {
    initialProps: { jobs: noJobs },
  });
  await waitFor(() => expect(result.current.open).toHaveLength(1));
  rerender({
    jobs: [
      toShellActivityJob(job('new-active', 'queued'), 'backend_event'),
      toShellActivityJob(
        job('old-active', 'completed', '2026-09-05T00:01:00.000Z'),
        'backend_event',
      ),
    ],
  });
  await waitFor(() => expect(result.current.error).toBe('Refresh unavailable'));
  expect(result.current.open.map((row) => row.id)).toEqual(['new-active']);
  expect(result.current.history.map((row) => row.id)).toEqual(['old-active']);
});

it('reconciles older terminal changes after a revision gap with an identical recent summary', async () => {
  const head = { ...emptyPage, history: [job('recent')], nextCursor: 'page-2' };
  const changedCounts = { ...emptyPage.counts, cancelled: 1, failed: 1, history: 2, total: 2 };
  api.list
    .mockResolvedValueOnce(head)
    .mockResolvedValueOnce({ ...emptyPage, history: [job('older')] })
    .mockResolvedValueOnce({ ...head, counts: changedCounts })
    .mockResolvedValueOnce({
      ...emptyPage,
      counts: changedCounts,
      history: [job('older', 'cancelled', '2026-09-05T00:02:00.000Z')],
    });
  const known = [toShellActivityJob(job('recent'))];
  const { result, unmount } = renderHook(() => useJobHistory(known, '', ''));
  await waitFor(() => expect(result.current.history).toHaveLength(1));
  act(() => result.current.loadMore());
  await waitFor(() => expect(result.current.history).toHaveLength(2));
  expect(result.current.nextCursor).toBeNull();
  act(() => stream.gaps.forEach((callback) => callback()));
  await waitFor(() => expect(result.current.nextCursor).toBe('page-2'));
  expect(result.current.page?.counts).toEqual(changedCounts);
  expect(result.current.history.map((row) => row.id)).toContain('older');
  act(() => result.current.loadMore());
  await waitFor(() =>
    expect(result.current.history.find((row) => row.id === 'older')?.status).toBe('cancelled'),
  );
  expect(api.list.mock.calls[3][0].cursor).toBe('page-2');
  expect(result.current.nextCursor).toBeNull();
  unmount();
  expect(stream.gaps.size).toBe(0);
  expect(stream.close).toHaveBeenCalledOnce();
});
