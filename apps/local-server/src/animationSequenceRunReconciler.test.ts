import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';
import type { CatalogImage, GenerationTaskSpec, Job } from '../../../packages/shared/src';
import { createAnimationSequenceService } from './animationSequenceService';
import { createAnimationSequenceRunParticipant } from './animationSequenceRunReconciler';

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

async function setup() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'animation-sequence-reconciler-'));
  roots.push(root);
  const catalog = new Map<string, CatalogImage>();
  const jobs = new Map<string, Job>();
  const options = {
    readLibraryDir: () => root,
    allocateOutputGeneration: () => 1,
    getCatalogImage: (imageId: string) => catalog.get(imageId) ?? null,
    getJob: (jobId: string) => jobs.get(jobId) ?? null,
  };
  const service = createAnimationSequenceService(options);
  const run = await service.createRun({ prompt: 'a lantern pulses', frameCount: 2 });

  async function addImage(id: string, size = 1024, height = size) {
    const filePath = path.join(root, `${id}.png`);
    await sharp({ create: { width: size, height, channels: 4, background: '#3366ff' } })
      .png()
      .toFile(filePath);
    catalog.set(id, { id, filePath } as CatalogImage);
  }

  function job(
    id: string,
    status: Job['status'],
    {
      frameId = 'frame-0001',
      catalogId = null,
      correctionMode = false,
      runId = run.id,
    }: {
      frameId?: string;
      catalogId?: string | null;
      correctionMode?: boolean;
      runId?: string;
    } = {},
  ) {
    const recipeParams: Record<string, unknown> = {
      runId,
      frameId,
      frameIndex: Number(frameId.slice(-4)) - 1,
      correctionMode,
    };
    const sourceSpec = { recipeId: 'animation-sequence', recipeParams } as GenerationTaskSpec;
    const finalization: Job['finalization'] = catalogId
      ? { state: 'catalog_recorded', sourcePath: null, filePath: null, assetId: null, catalogId }
      : null;
    const value = {
      id,
      status,
      error: status === 'failed' ? 'provider refused' : null,
      sourceSpec,
      finalization,
    } as Job;
    jobs.set(id, value);
    return value;
  }

  async function frame(frameId = 'frame-0001') {
    const saved = await service.getRun(run.id);
    return saved!.frames.find((item) => item.id === frameId)!;
  }

  return {
    options,
    service,
    participant: createAnimationSequenceRunParticipant(service),
    run,
    addImage,
    job,
    frame,
  };
}

describe('Animation Sequence run participant', () => {
  it('rejects frame jobs for an unknown run or frame', async () => {
    const { participant, run } = await setup();
    const spec = (recipeParams: Record<string, unknown>) =>
      ({ recipeId: 'animation-sequence', recipeParams }) as GenerationTaskSpec;

    await expect(
      participant.validateDispatch!(spec({ runId: 'anim-missing', frameId: 'frame-0001' })),
    ).resolves.toMatchObject({ code: 'animation_sequence_run_not_found' });
    await expect(
      participant.validateDispatch!(spec({ runId: run.id, frameId: 'frame-0099' })),
    ).resolves.toMatchObject({ code: 'animation_sequence_frame_not_found' });
    await expect(
      participant.validateDispatch!(spec({ runId: run.id, frameIndex: 1 })),
    ).resolves.toBeNull();
    await expect(participant.validateDispatch!(spec({}))).resolves.toBeNull();
  });

  it('records a dispatch set once and ignores jobs from a replaced set', async () => {
    const { participant, service, run, addImage, job, frame } = await setup();
    const batch = [job('job-a', 'queued'), job('job-b', 'queued')];

    await participant.recordDispatch(batch);
    const recorded = await service.getRun(run.id);
    expect(await frame()).toMatchObject({
      status: 'generating',
      jobId: 'job-a',
      dispatch: { jobIds: ['job-a', 'job-b'] },
    });

    await participant.recordDispatch(batch);
    expect((await service.getRun(run.id))!.updatedAt).toBe(recorded!.updatedAt);

    await participant.recordDispatch([job('job-c', 'queued')]);
    await addImage('image-a');
    await expect(
      participant.settle(job('job-a', 'completed', { catalogId: 'image-a' })),
    ).resolves.toBe(false);
    expect(await frame()).toMatchObject({
      status: 'generating',
      jobId: 'job-c',
      catalogImageId: null,
    });
  });

  it('attaches the first finished sibling and keeps later ones in the Catalog', async () => {
    const { participant, addImage, job, frame } = await setup();
    await participant.recordDispatch([job('job-a', 'queued'), job('job-b', 'queued')]);
    await addImage('image-a');
    await addImage('image-b');

    await expect(
      participant.settle(job('job-b', 'completed', { catalogId: 'image-b' })),
    ).resolves.toBe(true);
    await expect(
      participant.settle(job('job-a', 'completed', { catalogId: 'image-a' })),
    ).resolves.toBe(false);
    await expect(
      participant.settle(job('job-b', 'completed', { catalogId: 'image-b' })),
    ).resolves.toBe(false);
    expect(await frame()).toMatchObject({ status: 'generated', catalogImageId: 'image-b' });
  });

  it('blocks a failed frame only after no sibling can land, and reopens it on retry', async () => {
    const { participant, job, frame } = await setup();
    await participant.recordDispatch([job('job-a', 'queued'), job('job-b', 'queued')]);
    job('job-b', 'running');

    await expect(participant.settle(job('job-a', 'failed'))).resolves.toBe(false);
    expect(await frame()).toMatchObject({ status: 'generating', blocked: null });

    await expect(participant.settle(job('job-b', 'cancelled'))).resolves.toBe(true);
    expect(await frame()).toMatchObject({
      status: 'blocked',
      blocked: { reasonKind: 'runner_failed', userMessage: 'The frame job was cancelled.' },
    });
    await expect(participant.settle(job('job-b', 'cancelled'))).resolves.toBe(false);

    await expect(participant.settle(job('job-a', 'queued'))).resolves.toBe(true);
    expect(await frame()).toMatchObject({ status: 'generating', blocked: null });
  });

  it('lets a later sibling replace a geometry-blocked result', async () => {
    const { participant, addImage, job, frame } = await setup();
    await participant.recordDispatch([job('job-a', 'queued'), job('job-b', 'queued')]);
    await addImage('image-small', 16, 24);
    await addImage('image-good');

    await participant.settle(job('job-a', 'completed', { catalogId: 'image-small' }));
    expect(await frame()).toMatchObject({
      status: 'blocked',
      blocked: { reasonKind: 'geometry_mismatch' },
    });
    await expect(
      participant.settle(job('job-b', 'completed', { catalogId: 'image-good' })),
    ).resolves.toBe(true);
    expect(await frame()).toMatchObject({ status: 'generated', catalogImageId: 'image-good' });
  });

  it('keeps the current image during a correction and replaces it when the job lands', async () => {
    const { participant, service, run, addImage, job, frame } = await setup();
    await addImage('image-old');
    await addImage('image-new');
    await service.attachFrame(run.id, { frameId: 'frame-0001', catalogImageId: 'image-old' });

    await participant.recordDispatch([job('job-fix', 'queued', { correctionMode: true })]);
    expect(await frame()).toMatchObject({ status: 'correcting', catalogImageId: 'image-old' });

    await participant.settle(job('job-fix', 'completed', { catalogId: 'image-new' }));
    expect(await frame()).toMatchObject({ status: 'generated', catalogImageId: 'image-new' });
  });

  it('serializes concurrent settles on one run', async () => {
    const { participant, service, run, addImage, job } = await setup();
    await participant.recordDispatch([
      job('job-1', 'queued'),
      job('job-2', 'queued', { frameId: 'frame-0002' }),
    ]);
    await addImage('image-1');
    await addImage('image-2');

    await Promise.all([
      participant.settle(job('job-1', 'completed', { catalogId: 'image-1' })),
      participant.settle(
        job('job-2', 'completed', { frameId: 'frame-0002', catalogId: 'image-2' }),
      ),
    ]);
    expect((await service.getRun(run.id))!.frames).toMatchObject([
      { status: 'generated', catalogImageId: 'image-1' },
      { status: 'generated', catalogImageId: 'image-2' },
    ]);
  });

  it('recovers jobs that settled or were accepted while the server was down', async () => {
    const { options, participant, addImage, job, frame } = await setup();
    await participant.recordDispatch([job('job-1', 'queued')]);
    await addImage('image-1');
    job('job-1', 'completed', { catalogId: 'image-1' });
    const unrecorded = job('job-2', 'queued', { frameId: 'frame-0002' });

    const restarted = createAnimationSequenceRunParticipant(
      createAnimationSequenceService(options),
    );
    await restarted.recover([unrecorded]);

    expect(await frame()).toMatchObject({ status: 'generated', catalogImageId: 'image-1' });
    expect(await frame('frame-0002')).toMatchObject({
      status: 'generating',
      dispatch: { jobIds: ['job-2'] },
    });
  });
});
