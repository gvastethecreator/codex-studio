/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueuePanel } from './QueuePanel';
import { useJobHistory } from '../hooks/useJobHistory';
import { getStudioJobBatchSummary } from '../services/studio-api/jobs';

vi.mock('../hooks/useJobHistory', () => ({ useJobHistory: vi.fn() }));
vi.mock('../hooks/useWorkerDiagnostics', () => ({
  useWorkerDiagnostics: () => ({ status: null, error: false }),
}));
vi.mock('../services/studio-api/jobs', () => ({
  getStudioJobBatchSummary: vi.fn(),
  retryStudioJobBatch: vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

import { summarizePersistentJobs } from '../lib/persistentJobSummary';
import type { ShellActivityJob } from '../lib/shellActivityJob';

function job(id: string, status: ShellActivityJob['status']): ShellActivityJob {
  return {
    id,
    workspaceId: 'default',
    kind: 'image_generate',
    providerId: 'codex',
    status,
    execution: null,
    originalPrompt: 'Prompt',
    error: null,
    promptPreview: 'Prompt',
    recipeId: null,
    aspectRatio: '1:1',
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
    completedAt: status === 'completed' ? '2026-07-18T00:00:01.000Z' : null,
    source: 'backend_summary',
  };
}

describe('summarizePersistentJobs', () => {
  it('projects backend lifecycle states without browser queue state', () => {
    expect(
      summarizePersistentJobs([
        job('queued', 'queued'),
        job('running', 'running'),
        job('completed', 'completed'),
        job('failed', 'failed'),
        job('review', 'needs_review'),
      ]),
    ).toEqual({
      total: 5,
      queued: 1,
      running: 1,
      completed: 1,
      attention: 2,
    });
  });
});

describe('QueuePanel views', () => {
  it('keeps review backlog separate and preserves job inspection and recovery', () => {
    const review = Array.from({ length: 25 }, (_, index) => ({
      ...job(`review-${index}`, 'needs_review'),
      batchId: `batch-${index}`,
      originalPrompt: `Review image ${index}`,
    }));
    const queued = { ...job('queued', 'queued'), originalPrompt: 'Queued image' };
    const failed = {
      ...job('failed', 'failed'),
      providerId: 'google' as const,
      originalPrompt: 'Failed image',
    };
    const state: ReturnType<typeof useJobHistory> = {
      key: '',
      page: null,
      open: [queued, ...review],
      history: [failed],
      nextCursor: 'older',
      seenHistoryIds: [],
      knownAtRequest: [],
      workspaces: [],
      loading: false,
      error: null,
      loadMore: vi.fn(),
      retry: vi.fn(),
    };
    vi.mocked(useJobHistory).mockReturnValue(state);
    const inspect = vi.fn();
    const retry = vi.fn();
    const cancel = vi.fn();
    const { rerender } = render(
      React.createElement(QueuePanel, {
        onInspectJob: inspect,
        onRetryServerJob: retry,
        onCancelServerJob: cancel,
      }),
    );
    expect(screen.getByText('Queued image')).toBeTruthy();
    expect(screen.queryByText('Review image 0')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel backend job queued' }));
    expect(cancel).toHaveBeenCalledWith('queued');
    fireEvent.click(screen.getByRole('button', { name: /Review\s*25/ }));
    expect(screen.queryByText('Queued image')).toBeNull();
    expect(screen.getAllByRole('article')).toHaveLength(20);
    expect(getStudioJobBatchSummary).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Show more · 20 of 25' }));
    expect(screen.getAllByRole('article')).toHaveLength(25);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect job: Review image 0' }));
    expect(inspect).toHaveBeenCalledWith('review-0');
    fireEvent.click(screen.getByRole('button', { name: 'History' }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry backend job failed' }));
    expect(retry).toHaveBeenCalledWith('failed');
    fireEvent.click(screen.getByRole('button', { name: 'Load older jobs' }));
    expect(state.loadMore).toHaveBeenCalledOnce();
    state.error = 'Connection lost';
    fireEvent.click(screen.getByRole('button', { name: /Active\s*1/ }));
    rerender(React.createElement(QueuePanel, { onInspectJob: inspect, onCancelServerJob: cancel }));
    expect(screen.getByRole('alert').textContent).toContain('Connection lost');
    expect(screen.getByText('Queued image')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh jobs' }));
    expect(state.retry).toHaveBeenCalledOnce();
  });
});
