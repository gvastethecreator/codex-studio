import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';

import {
  createGenerationTaskSpec,
  type CatalogImage,
  type Job,
  type SpriteAtlasRun,
} from '../../../packages/shared/src';
import { createSpriteAtlasRunParticipant } from './spriteAtlasRunReconciler';
import { createSpriteAtlasService } from './spriteAtlasService';

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function rowJob(
  id: string,
  status: Job['status'],
  target: { runId: string; rowId: string },
  overrides: Partial<Job> = {},
): Job {
  return {
    id,
    workspaceId: 'default',
    kind: 'image_generate',
    providerId: 'chatgpt',
    sourceSpec: createGenerationTaskSpec({
      id: `spec-${id}`,
      task: 'image_generate',
      prompt: 'row strip',
      recipeId: 'sprite-atlas',
      recipeParams: target,
    }),
    status,
    execution: null,
    originalPrompt: 'row strip',
    expandedPrompt: null,
    finalPromptUsed: 'row strip',
    error: null,
    createdAt: '2026-10-02T00:00:00.000Z',
    updatedAt: '2026-10-02T00:00:00.000Z',
    completedAt: null,
    ...overrides,
  };
}

/** A square provider image with one band of art, so import must normalize it. */
async function writeProviderImage(filePath: string, size: number, bandHeight: number) {
  const band = await sharp({
    create: {
      width: size,
      height: bandHeight,
      channels: 4,
      background: { r: 200, g: 80, b: 40, alpha: 255 },
    },
  })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: band, left: 0, top: Math.round((size - bandHeight) / 2) }])
    .png()
    .toFile(filePath);
}

async function setup() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'sprite-atlas-reconcile-'));
  roots.push(root);
  const jobs = new Map<string, Job>();
  const images = new Map<string, CatalogImage>();
  const imageByJob = new Map<string, string>();
  const service = createSpriteAtlasService({
    readLibraryDir: () => root,
    allocateOutputGeneration: () => 1,
    getCatalogImage: (imageId) => images.get(imageId) ?? null,
  });
  const participant = createSpriteAtlasRunParticipant(service, {
    getJob: (jobId) => jobs.get(jobId) ?? null,
    getCatalogImageByJobId: (jobId) => images.get(imageByJob.get(jobId) ?? '') ?? null,
  });
  const run = await service.createRun({
    title: 'courier',
    presetId: 'platformer-character',
  });

  function setJob(id: string, status: Job['status'], rowId = 'idle', overrides: Partial<Job> = {}) {
    const job = rowJob(id, status, { runId: run.id, rowId }, overrides);
    jobs.set(id, job);
    return job;
  }

  /** Completes a job with a Catalog image. A 768 px square with a 128 px band normalizes idle. */
  async function finishWithImage(id: string, rowId = 'idle', size = 768, bandHeight = 128) {
    const filePath = path.join(root, `${id}.png`);
    await writeProviderImage(filePath, size, bandHeight);
    images.set(`image-${id}`, { id: `image-${id}`, filePath } as CatalogImage);
    imageByJob.set(id, `image-${id}`);
    return setJob(id, 'completed', rowId);
  }

  async function row(rowId = 'idle') {
    const current = (await service.getRun(run.id)) as SpriteAtlasRun;
    return current.rows.find((item) => item.id === rowId)!;
  }

  return { root, service, participant, run, setJob, finishWithImage, row };
}

describe('sprite atlas run participant', () => {
  it('records a batch and auto-imports the first finished image with normalization', async () => {
    const { participant, run, setJob, finishWithImage, row, service } = await setup();
    await participant.recordDispatch([setJob('job-a', 'queued'), setJob('job-b', 'queued')]);
    expect(await row()).toMatchObject({
      status: 'generating',
      jobId: 'job-a',
      dispatch: { jobIds: ['job-a', 'job-b'] },
    });
    expect((await service.getRun(run.id))?.status).toBe('waiting_for_rows');

    expect(await participant.settle(await finishWithImage('job-a'))).toBe(true);
    const imported = await row();
    expect(imported).toMatchObject({
      status: 'raw_imported',
      catalogImageId: 'image-job-a',
      normalization: { normalized: true, sourceSize: { w: 768, h: 768 }, kernel: 'nearest' },
    });
    const strip = await sharp(imported.rawPath!).metadata();
    expect([strip.width, strip.height]).toEqual([768, 128]);
    expect((await service.getRun(run.id))?.anchor).toEqual({
      rowId: 'idle',
      sha256: imported.sourceSha256,
    });

    // A later sibling stays in the Catalog. Settling again changes nothing.
    expect(await participant.settle(await finishWithImage('job-b'))).toBe(false);
    expect(await participant.settle(await finishWithImage('job-a'))).toBe(false);
    expect((await row()).catalogImageId).toBe('image-job-a');
  });

  it('ignores a job that is not in the current dispatch set', async () => {
    const { participant, setJob, finishWithImage, row } = await setup();
    await participant.recordDispatch([setJob('job-old', 'queued')]);
    await participant.recordDispatch([setJob('job-new', 'queued')]);
    expect(await participant.settle(await finishWithImage('job-old'))).toBe(false);
    expect(await row()).toMatchObject({
      status: 'generating',
      jobId: 'job-new',
      dispatch: { jobIds: ['job-new'] },
    });
  });

  it('blocks only after the last sibling fails, and a retry reopens the row', async () => {
    const { participant, setJob, finishWithImage, row } = await setup();
    await participant.recordDispatch([
      setJob('job-a', 'queued'),
      setJob('job-b', 'queued'),
      setJob('job-c', 'queued'),
    ]);
    setJob('job-b', 'running');
    setJob('job-c', 'running');
    expect(
      await participant.settle(setJob('job-a', 'failed', 'idle', { error: 'Rate limited.' })),
    ).toBe(false);
    expect(await participant.settle(setJob('job-b', 'failed'))).toBe(false);
    expect((await row()).status).toBe('generating');

    expect(await participant.settle(setJob('job-c', 'cancelled'))).toBe(true);
    expect((await row()).blocked).toMatchObject({
      reasonKind: 'runner_failed',
      userMessage: 'The idle job was cancelled.',
    });

    // A batch retry of the same jobs only puts the row back to generating.
    await participant.recordDispatch([setJob('job-c', 'queued')]);
    expect(await row()).toMatchObject({
      status: 'generating',
      blocked: null,
      dispatch: { jobIds: ['job-a', 'job-b', 'job-c'] },
    });
    expect(await participant.settle(await finishWithImage('job-c'))).toBe(true);
    expect((await row()).status).toBe('raw_imported');
  });

  it('blocks a needs_review job with a clear reason', async () => {
    const { participant, setJob, row } = await setup();
    await participant.recordDispatch([setJob('job-a', 'queued')]);
    const job = setJob('job-a', 'needs_review', 'idle', { error: 'Could not confirm.' });
    expect(await participant.settle(job)).toBe(true);
    expect(await row()).toMatchObject({
      status: 'blocked',
      blocked: {
        reasonKind: 'runner_failed',
        userMessage: 'The idle job needs review. Could not confirm.',
        suggestion: 'Resolve it in Queue, or queue idle again.',
      },
    });
  });

  it('keeps the previous strip when normalization blocks, then accepts a later sibling', async () => {
    const { root, service, participant, run, setJob, finishWithImage, row } = await setup();
    const firstPath = path.join(root, 'first.png');
    await writeProviderImage(firstPath, 768, 128);
    await service.importRow(run.id, { rowId: 'idle', sourcePath: firstPath });
    const previous = await row();
    const previousBytes = readFileSync(previous.rawPath!);

    await participant.recordDispatch([setJob('job-bad', 'queued'), setJob('job-good', 'queued')]);
    // 24 px wide: each of the 6 slots is 4 px, under the 8 px floor.
    expect(await participant.settle(await finishWithImage('job-bad', 'idle', 24, 24))).toBe(true);
    const blocked = await row();
    expect(blocked).toMatchObject({
      status: 'blocked',
      blocked: { reasonKind: 'geometry_mismatch' },
      rawPath: previous.rawPath,
      sourceSha256: previous.sourceSha256,
    });
    expect(readFileSync(previous.rawPath!)).toEqual(previousBytes);

    expect(await participant.settle(await finishWithImage('job-good'))).toBe(true);
    expect(await row()).toMatchObject({ status: 'raw_imported', catalogImageId: 'image-job-good' });
  });

  it('validates the run, the row, and the idle anchor before dispatch', async () => {
    const { participant, run } = await setup();
    const spec = (recipeParams: Record<string, unknown>) =>
      createGenerationTaskSpec({
        id: 'spec',
        task: 'image_generate',
        prompt: 'row strip',
        recipeId: 'sprite-atlas',
        recipeParams,
      });
    await expect(
      participant.validateDispatch!(spec({ runId: run.id, rowId: 'run' })),
    ).resolves.toMatchObject({
      code: 'anchor_required',
      message: 'Import an idle row before queueing run.',
    });
    await expect(
      participant.validateDispatch!(spec({ runId: 'missing', rowId: 'idle' })),
    ).resolves.toMatchObject({ code: 'run_not_found' });
    await expect(
      participant.validateDispatch!(spec({ runId: run.id, rowId: 'missing' })),
    ).resolves.toMatchObject({ code: 'row_not_found' });
    await expect(
      participant.validateDispatch!(spec({ runId: run.id, rowId: 'idle' })),
    ).resolves.toBeNull();
    await expect(participant.validateDispatch!(spec({}))).resolves.toBeNull();
  });

  it('serializes concurrent settles of one run', async () => {
    const { participant, setJob, finishWithImage, row } = await setup();
    await participant.recordDispatch([setJob('job-a', 'queued'), setJob('job-b', 'queued')]);
    const [jobA, jobB] = await Promise.all([finishWithImage('job-a'), finishWithImage('job-b')]);
    // Without the run lock both settles read a generating row and both import.
    await expect(
      Promise.all([participant.settle(jobA), participant.settle(jobB)]),
    ).resolves.toEqual([true, false]);
    expect((await row()).catalogImageId).toBe('image-job-a');
  });

  it('recovers a legacy generating row and records a job accepted before a restart', async () => {
    const { participant, run, setJob, finishWithImage, row } = await setup();
    await participant.recordDispatch([setJob('job-idle', 'queued')]);
    // Runs before backend reconciliation kept only the job id on the row.
    const stored = JSON.parse(readFileSync(run.paths.statusPath, 'utf8')) as SpriteAtlasRun;
    delete (stored.rows[0] as Partial<SpriteAtlasRun['rows'][number]>).dispatch;
    writeFileSync(run.paths.statusPath, JSON.stringify(stored));
    await finishWithImage('job-idle');

    await participant.recover([setJob('job-run', 'queued', 'run')]);
    expect(await row()).toMatchObject({ status: 'raw_imported', catalogImageId: 'image-job-idle' });
    expect(await row('run')).toMatchObject({
      status: 'generating',
      dispatch: { jobIds: ['job-run'] },
    });
  });
});
