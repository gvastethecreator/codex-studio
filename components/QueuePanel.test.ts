import { describe, expect, it } from 'vite-plus/test';
import type { QueueJob } from '../types';

const JOB_CREATED_AT = new Date('2025-01-01T00:00:00Z').getTime();

function createJob(overrides: Partial<QueueJob> = {}): QueueJob {
  return {
    id: 'job-1',
    prompt: 'test prompt',
    workspaceId: 'default',
    config: {} as import('../types').ImageGenerationConfig,
    createdAt: JOB_CREATED_AT,
    status: 'pending',
    ...overrides,
  };
}

function getQueueStats(jobs: QueueJob[]) {
  return {
    pending: jobs.filter((j) => j.status === 'pending').length,
    processing: jobs.filter((j) => j.status === 'processing').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    failed: jobs.filter((j) => j.status === 'failed' || j.status === 'cancelled').length,
    total: jobs.length,
  };
}

function hasPendingOrProcessing(jobs: QueueJob[]) {
  return jobs.some((j) => j.status === 'pending' || j.status === 'processing');
}

function hasCompletedOrFailed(jobs: QueueJob[]) {
  return jobs.some(
    (j) => j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled',
  );
}

describe('QueuePanel stats', () => {
  it('counts pending, processing, completed, and failed jobs', () => {
    const jobs = [
      createJob({ id: 'j1', status: 'pending' }),
      createJob({ id: 'j2', status: 'processing' }),
      createJob({ id: 'j3', status: 'completed' }),
      createJob({ id: 'j4', status: 'failed' }),
      createJob({ id: 'j5', status: 'cancelled' }),
    ];

    const stats = getQueueStats(jobs);

    expect(stats).toEqual({
      pending: 1,
      processing: 1,
      completed: 1,
      failed: 2,
      total: 5,
    });
  });

  it('returns correct clear-eligible flag', () => {
    expect(hasCompletedOrFailed([])).toBe(false);
    expect(hasCompletedOrFailed([createJob({ status: 'pending' })])).toBe(false);
    expect(hasCompletedOrFailed([createJob({ status: 'completed' })])).toBe(true);
    expect(hasCompletedOrFailed([createJob({ status: 'failed' })])).toBe(true);
    expect(hasCompletedOrFailed([createJob({ status: 'cancelled' })])).toBe(true);
  });

  it('returns correct active-queue flag', () => {
    expect(hasPendingOrProcessing([])).toBe(false);
    expect(hasPendingOrProcessing([createJob({ status: 'completed' })])).toBe(false);
    expect(hasPendingOrProcessing([createJob({ status: 'pending' })])).toBe(true);
    expect(hasPendingOrProcessing([createJob({ status: 'processing' })])).toBe(true);
    expect(
      hasPendingOrProcessing([
        createJob({ id: 'j1', status: 'completed' }),
        createJob({ id: 'j2', status: 'processing' }),
      ]),
    ).toBe(true);
  });
});
