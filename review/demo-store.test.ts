// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { createGenerationTaskSpec, type CreateJobRequest } from '../packages/shared/src';
import {
  cancelJob,
  createBatch,
  createJob,
  getBatch,
  getJob,
  getJobDetail,
  resetDemoStore,
  retryJob,
} from './demo-store';

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

it('keeps request identity and dates through partial output, retry, and cancellation', async () => {
  vi.useFakeTimers();
  resetDemoStore({ catalog: 'empty', provider: 'ready', runningJob: false, outcome: 'partial' });
  const request: CreateJobRequest = {
    kind: 'image_generate',
    providerId: 'codex',
    workspaceId: 'ws-noir',
    prompt: 'A ceramic pot under soft light',
    sourceSpec: createGenerationTaskSpec({
      id: 'review-spec',
      task: 'image_generate',
      prompt: 'A ceramic pot under soft light',
      recipeId: 'cinematic',
      recipeParams: { layout: '3x3' },
    }),
  };
  const batch = createBatch({ requestId: 'review-batch', items: [request, request] });
  expect(
    createBatch({ requestId: 'review-batch', items: [request, request] }).jobs.map((job) => job.id),
  ).toEqual(batch.jobs.map((job) => job.id));
  await vi.advanceTimersByTimeAsync(1100);
  expect(getBatch(batch.id)?.status).toBe('partial');
  const detail = getJobDetail(batch.jobs[0].id)!;
  expect(detail.job.originalPrompt).toBe(request.prompt);
  expect(detail.job.sourceSpec).toEqual(request.sourceSpec);
  expect(detail.catalogImages).toHaveLength(1);
  expect(detail.catalogImages[0]).toMatchObject({
    jobId: detail.job.id,
    batchId: batch.id,
    workspaceId: 'ws-noir',
    prompt: request.prompt,
    recipeId: 'cinematic',
    createdAt: detail.job.completedAt,
  });
  expect(Date.parse(detail.job.completedAt!)).toBeGreaterThan(Date.parse(detail.job.createdAt));
  const failed = getJob(batch.jobs[1].id)!;
  expect(getJobDetail(failed.id)?.catalogImages).toHaveLength(0);
  const retried = retryJob(failed.id)!;
  expect(retried).toMatchObject({
    id: failed.id,
    originalPrompt: request.prompt,
    attempt: 2,
  });
  await vi.advanceTimersByTimeAsync(1100);
  expect(getBatch(batch.id)?.status).toBe('completed');
  expect(Date.parse(getJob(failed.id)!.completedAt!)).toBeGreaterThan(
    Date.parse(failed.completedAt!),
  );
  const cancelled = createJob(request);
  cancelJob(cancelled.id);
  await vi.advanceTimersByTimeAsync(1100);
  expect(getJob(cancelled.id)?.status).toBe('cancelled');
  expect(getJobDetail(cancelled.id)?.catalogImages).toHaveLength(0);
});
