import { describe, expect, it, vi } from 'vitest';

import { createGenerationTaskSpec, type Job } from '../../../packages/shared/src';
import { publishEvent as publishStudioEvent, subscribeEvents } from './events';
import { createWorkflowRunReconciler, type WorkflowRunParticipant } from './workflowRunReconciler';

function createJob(overrides: Partial<Job> & { recipeId?: string | null } = {}): Job {
  const { recipeId = 'sprite-atlas', ...jobOverrides } = overrides;
  return {
    id: 'job-1',
    workspaceId: 'default',
    kind: 'image_generate',
    providerId: 'chatgpt',
    sourceSpec: createGenerationTaskSpec({
      id: 'spec-1',
      task: 'image_generate',
      prompt: 'draw',
      recipeId,
      recipeParams: { runId: 'run-1' },
    }),
    status: 'completed',
    execution: null,
    originalPrompt: 'draw',
    expandedPrompt: null,
    finalPromptUsed: 'draw',
    error: null,
    createdAt: '2026-10-02T00:00:00.000Z',
    updatedAt: '2026-10-02T00:00:00.000Z',
    completedAt: null,
    ...jobOverrides,
  };
}

function createParticipant(recipeId: string, settled = true) {
  return {
    recipeId,
    recordDispatch: vi.fn(async (_jobs: Job[]) => {}),
    settle: vi.fn(async (_job: Job) => settled),
    recover: vi.fn(async (_jobs: Job[]) => {}),
  } satisfies WorkflowRunParticipant;
}

function jobEvent(type: string, job: Job | null) {
  return { type, payload: job, createdAt: '2026-10-02T00:00:00.000Z' };
}

function setup(participants: WorkflowRunParticipant[], storedJobs: Job[] = []) {
  const publishEvent = vi.fn();
  const logger = vi.fn();
  const reconciler = createWorkflowRunReconciler({
    participants,
    getJob: (jobId) => storedJobs.find((job) => job.id === jobId) ?? null,
    logger,
    publishEvent,
  });
  return { reconciler, publishEvent, logger };
}

describe('workflowRunReconciler', () => {
  it('routes jobs to the participant of their recipe and ignores other recipes', async () => {
    const sprite = createParticipant('sprite-atlas');
    const animation = createParticipant('animation-sequence');
    const { reconciler } = setup([sprite, animation]);
    const spriteJob = createJob({ id: 'sprite-job', status: 'queued' });
    const animationJob = createJob({
      id: 'animation-job',
      status: 'queued',
      recipeId: 'animation-sequence',
    });
    const plainJob = createJob({ id: 'plain-job', status: 'queued', recipeId: null });

    await reconciler.jobsAccepted([spriteJob, animationJob, plainJob]);
    await reconciler.recover([animationJob, plainJob]);

    expect(sprite.recordDispatch).toHaveBeenCalledWith([spriteJob]);
    expect(animation.recordDispatch).toHaveBeenCalledWith([animationJob]);
    expect(sprite.recover).toHaveBeenCalledWith([]);
    expect(animation.recover).toHaveBeenCalledWith([animationJob]);
  });

  it('settles only terminal and requeued jobs, from their stored state', async () => {
    const sprite = createParticipant('sprite-atlas', false);
    const stored = createJob({ id: 'job-1', status: 'failed', error: 'stored' });
    const { reconciler } = setup([sprite], [stored]);

    reconciler.onStudioEvent(jobEvent('job.running', createJob({ status: 'running' })));
    reconciler.onStudioEvent(jobEvent('job.progress', createJob({ status: 'running' })));
    reconciler.onStudioEvent(jobEvent('job.created', createJob({ status: 'queued' })));
    reconciler.onStudioEvent(jobEvent('job.completed', createJob({ recipeId: 'timeline' })));
    for (const status of ['completed', 'failed', 'cancelled', 'needs_review', 'queued'] as const) {
      reconciler.onStudioEvent(
        jobEvent('job.progress', createJob({ id: `job-${status}`, status })),
      );
    }
    reconciler.onStudioEvent(jobEvent('job.failed', createJob({ status: 'failed' })));
    expect(sprite.settle).not.toHaveBeenCalled();
    await reconciler.drain();

    expect(sprite.settle.mock.calls.map(([job]) => `${job.id}:${job.status}`)).toEqual([
      'job-completed:completed',
      'job-failed:failed',
      'job-cancelled:cancelled',
      'job-needs_review:needs_review',
      'job-queued:queued',
      'job-1:failed',
    ]);
    expect(sprite.settle).toHaveBeenLastCalledWith(stored);
  });

  it('publishes a run update only when settling changed the run', async () => {
    const changed = createParticipant('sprite-atlas', true);
    const unchanged = createParticipant('animation-sequence', false);
    const { reconciler, publishEvent } = setup([changed, unchanged]);

    reconciler.onStudioEvent(jobEvent('job.completed', createJob()));
    reconciler.onStudioEvent(
      jobEvent('job.completed', createJob({ id: 'job-2', recipeId: 'animation-sequence' })),
    );
    await reconciler.drain();

    expect(publishEvent).toHaveBeenCalledTimes(1);
    expect(publishEvent).toHaveBeenCalledWith('workflow-run.updated', {
      recipeId: 'sprite-atlas',
      runId: 'run-1',
    });
  });

  it('never throws into the publisher and logs failed participant work', async () => {
    const sprite = createParticipant('sprite-atlas');
    sprite.settle.mockRejectedValueOnce(new Error('run file locked'));
    sprite.recordDispatch.mockRejectedValueOnce(new Error('run file missing'));
    const { reconciler, logger } = setup([sprite]);
    const unsubscribe = subscribeEvents(reconciler.onStudioEvent);
    try {
      expect(() => publishStudioEvent('job.completed', createJob())).not.toThrow();
      expect(() => publishStudioEvent('job.failed', null)).not.toThrow();
      expect(() => publishStudioEvent('job.failed', { status: 'failed' })).not.toThrow();
      await expect(reconciler.jobsAccepted([createJob({ status: 'queued' })])).resolves.toBe(
        undefined,
      );
      await reconciler.drain();
    } finally {
      unsubscribe();
    }

    expect(sprite.settle).toHaveBeenCalledTimes(1);
    expect(logger).toHaveBeenCalledWith(
      'warn',
      'workflow',
      expect.stringContaining('run file locked'),
      'job-1',
    );
    expect(logger).toHaveBeenCalledWith(
      'warn',
      'workflow',
      expect.stringContaining('run file missing'),
      undefined,
    );
  });

  it('drain waits for settles that start while it is waiting', async () => {
    let release!: () => void;
    const sprite = createParticipant('sprite-atlas');
    sprite.settle.mockImplementationOnce(
      () =>
        new Promise<boolean>((resolve) => {
          release = () => resolve(false);
        }),
    );
    const { reconciler } = setup([sprite]);
    let drained = false;

    reconciler.onStudioEvent(jobEvent('job.completed', createJob()));
    const drain = reconciler.drain().then(() => {
      drained = true;
    });
    await vi.waitFor(() => expect(sprite.settle).toHaveBeenCalledTimes(1));
    reconciler.onStudioEvent(jobEvent('job.failed', createJob({ id: 'job-2', status: 'failed' })));
    release();
    await drain;

    expect(drained).toBe(true);
    expect(sprite.settle).toHaveBeenCalledTimes(2);
  });

  it('asks only the participant of the recipe to validate a dispatch', async () => {
    const issue = { code: 'sprite_atlas_run_missing', message: 'Run not found.' };
    const sprite = { ...createParticipant('sprite-atlas'), validateDispatch: vi.fn(() => issue) };
    const { reconciler } = setup([sprite, createParticipant('animation-sequence')]);
    const spriteSpec = createJob().sourceSpec!;
    const animationSpec = createJob({ recipeId: 'animation-sequence' }).sourceSpec!;

    await expect(reconciler.validateDispatch(spriteSpec)).resolves.toEqual(issue);
    await expect(reconciler.validateDispatch(animationSpec)).resolves.toBeNull();
    expect(sprite.validateDispatch).toHaveBeenCalledTimes(1);
  });
});
