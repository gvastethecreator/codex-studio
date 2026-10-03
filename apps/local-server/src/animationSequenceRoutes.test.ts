import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import type { CatalogImage, Job } from '../../../packages/shared/src';

import { createAnimationSequenceRoutes } from './animationSequenceRoutes';

async function writeFixturePng(filePath: string, color: string, size = 1024) {
  await sharp({
    create: {
      width: size,
      height: size,
      channels: color === '#ff0000' ? 3 : 4,
      background: color,
    },
  })
    .png()
    .toFile(filePath);
}

function createCatalogImage(id: string, filePath: string): CatalogImage {
  return {
    id,
    libraryId: 'library-default',
    filePath,
    thumbnailPath: null,
    publicUrl: `/library/${path.basename(filePath)}`,
    thumbnailUrl: null,
    prompt: null,
    negativePrompt: null,
    aspectRatio: '1:1',
    imageSize: '1K',
    width: 16,
    height: 16,
    mimeType: 'image/png',
    fileSizeBytes: null,
    jobId: null,
    workspaceId: null,
    batchId: null,
    recipeId: 'animation-sequence',
    isFavorite: false,
    isDeleted: false,
    deletedAt: null,
    tags: [],
    generationConfig: null,
    createdAt: '2026-07-10T00:00:00.000Z',
  };
}

describe('animationSequenceRoutes', () => {
  it('creates a run, attaches managed frame images, exports GIF, and writes QA', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'animation-sequence-routes-'));
    try {
      const sourceA = path.join(root, 'source-a.png');
      const sourceB = path.join(root, 'source-b.png');
      await writeFixturePng(sourceA, '#ff0000');
      await writeFixturePng(sourceB, 'rgba(0,0,255,0.4)');

      const routes = createAnimationSequenceRoutes({
        readLibraryDir: () => root,
        readOutputContext: () => ({
          libraryId: 'test',
          rootPath: root,
          output: { libraryId: 'out', rootPath: path.join(root, 'final') },
          outputOrganization: { subfolderTokens: [], fileNameTemplate: '{workflow}-{jobId}' },
        }),
      });

      const createResponse = await routes.request('/runs', {
        method: 'POST',
        body: JSON.stringify({
          title: 'test loop',
          prompt: 'a tiny lantern pulses',
          frameCount: 2,
          fps: 8,
          aspectRatio: '1:1',
          cyclic: true,
          background: 'transparent',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(createResponse.status).toBe(201);
      const run = (await createResponse.json()) as {
        id: string;
        paths?: unknown;
        frames: Array<{ id: string; promptPath?: string }>;
      };

      expect(run.paths).toBeUndefined();
      expect(run.frames.map((frame) => frame.id)).toEqual(['frame-0001', 'frame-0002']);
      expect(run.frames[0]!.promptPath).toBeUndefined();

      const promptResponse = await routes.request(`/runs/${run.id}/frames/frame-0001/prompt`);
      expect(promptResponse.status).toBe(200);
      await expect(promptResponse.json()).resolves.toMatchObject({
        frameId: 'frame-0001',
        prompt: expect.stringContaining('Animation frame 1 of 2.'),
      });

      for (const [frameIndex, sourcePath] of [sourceA, sourceB].entries()) {
        const attachResponse = await routes.request(`/runs/${run.id}/attach-frame`, {
          method: 'POST',
          body: JSON.stringify({ frameIndex, sourcePath }),
          headers: { 'Content-Type': 'application/json' },
        });
        expect(attachResponse.status).toBe(200);
      }

      const exportResponse = await routes.request(`/runs/${run.id}/export-gif`, {
        method: 'POST',
        body: JSON.stringify({ fps: 8, loop: true }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(exportResponse.status).toBe(200);
      const exportPayload = (await exportResponse.json()) as {
        export: { format: string; publicUrl: string; frameCount: number; path?: string };
      };
      expect(exportPayload.export).toMatchObject({
        format: 'gif',
        frameCount: 2,
        publicUrl: `/library/out/animation-sequence-${run.id}.gif`,
      });
      expect(exportPayload.export.path).toBeUndefined();

      const gifResponse = await routes.request(`/runs/${run.id}/files/gif`);
      expect(gifResponse.status).toBe(200);
      expect(gifResponse.headers.get('Content-Type')).toBe('image/gif');
      const gifBytes = Buffer.from(await gifResponse.arrayBuffer());
      expect(gifBytes.subarray(0, 6).toString('ascii')).toBe('GIF89a');
      await expect(sharp(gifBytes, { animated: true }).metadata()).resolves.toMatchObject({
        format: 'gif',
        width: 1024,
        height: 2048,
        pages: 2,
        pageHeight: 1024,
      });

      const savedRun = (await (await routes.request(`/runs/${run.id}`)).json()) as {
        frames: Array<{ warning?: string }>;
      };
      expect(savedRun.frames[0].warning).toContain('opaque');
      expect(savedRun.frames[1].warning).toBeNull();

      const qaResponse = await routes.request(`/runs/${run.id}/qa`, { method: 'POST' });
      expect(qaResponse.status).toBe(200);
      const qaPayload = (await qaResponse.json()) as { qa: { ok: boolean }; paths?: unknown };
      expect(qaPayload).toMatchObject({ qa: { ok: true } });
      expect(qaPayload.paths).toBeUndefined();

      const reattachResponse = await routes.request(`/runs/${run.id}/attach-frame`, {
        method: 'POST',
        body: JSON.stringify({ frameIndex: 0, sourcePath: sourceA }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(reattachResponse.status).toBe(200);
      await expect(reattachResponse.json()).resolves.toMatchObject({
        status: 'ready_for_review',
        exports: [],
        qa: null,
      });

      const staleQaResponse = await routes.request(`/runs/${run.id}/qa`, { method: 'POST' });
      expect(staleQaResponse.status).toBe(200);
      await expect(staleQaResponse.json()).resolves.toMatchObject({
        qa: {
          ok: false,
          issues: expect.arrayContaining(['GIF export is missing or stale.']),
        },
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 60_000);

  it('blocks GIF export until all frames are attached', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'animation-sequence-routes-'));
    try {
      const routes = createAnimationSequenceRoutes({ readLibraryDir: () => root });
      const createResponse = await routes.request('/runs', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'missing frame check', frameCount: 2 }),
        headers: { 'Content-Type': 'application/json' },
      });
      const run = (await createResponse.json()) as { id: string };

      const exportResponse = await routes.request(`/runs/${run.id}/export-gif`, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      expect(exportResponse.status).toBe(409);
      await expect(exportResponse.json()).resolves.toMatchObject({
        code: 'gif_export_blocked',
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('attaches managed Catalog images and blocks paths outside the Studio Library', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'animation-sequence-catalog-'));
    const outsideRoot = mkdtempSync(path.join(os.tmpdir(), 'animation-sequence-outside-'));
    try {
      const managedPath = path.join(root, 'managed.png');
      const outsidePath = path.join(outsideRoot, 'outside.png');
      await writeFixturePng(managedPath, '#00ff00', 1024);
      await writeFixturePng(outsidePath, '#ff00ff', 16);
      const catalogImages = new Map([
        ['managed', createCatalogImage('managed', managedPath)],
        ['outside', createCatalogImage('outside', outsidePath)],
      ]);
      const routes = createAnimationSequenceRoutes({
        readLibraryDir: () => root,
        getCatalogImage: (imageId) => catalogImages.get(imageId) ?? null,
      });
      const createResponse = await routes.request('/runs', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'catalog path check', frameCount: 2 }),
        headers: { 'Content-Type': 'application/json' },
      });
      const run = (await createResponse.json()) as { id: string };

      // Concurrent attaches to one run must both persist.
      const [managedResponse, outsideResponse] = await Promise.all(
        [
          { frameIndex: 0, catalogImageId: 'managed' },
          { frameIndex: 1, catalogImageId: 'outside' },
        ].map(async (body) =>
          routes.request(`/runs/${run.id}/attach-frame`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
      );
      expect(managedResponse!.status).toBe(200);
      expect(outsideResponse!.status).toBe(200);
      const savedRun = (await (await routes.request(`/runs/${run.id}`)).json()) as {
        frames: Array<{ id: string; status: string; catalogImageId: string | null }>;
      };
      expect(savedRun.frames).toMatchObject([
        { id: 'frame-0001', status: 'generated', catalogImageId: 'managed' },
        { id: 'frame-0002', status: 'blocked', blocked: { reasonKind: 'source_missing' } },
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outsideRoot, { recursive: true, force: true });
    }
  });

  it('supports explicit partial force export but rejects force export with no frames', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'animation-sequence-force-'));
    try {
      const sourcePath = path.join(root, 'source.png');
      await writeFixturePng(sourcePath, '#ffaa00');
      const routes = createAnimationSequenceRoutes({ readLibraryDir: () => root });
      const createResponse = await routes.request('/runs', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'partial force export', frameCount: 2 }),
        headers: { 'Content-Type': 'application/json' },
      });
      const run = (await createResponse.json()) as { id: string };

      const emptyForceResponse = await routes.request(`/runs/${run.id}/export-gif`, {
        method: 'POST',
        body: JSON.stringify({ force: true }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(emptyForceResponse.status).toBe(409);

      await routes.request(`/runs/${run.id}/attach-frame`, {
        method: 'POST',
        body: JSON.stringify({ frameIndex: 0, sourcePath }),
        headers: { 'Content-Type': 'application/json' },
      });
      const partialForceResponse = await routes.request(`/runs/${run.id}/export-gif`, {
        method: 'POST',
        body: JSON.stringify({ force: true }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(partialForceResponse.status).toBe(200);

      const smallPath = path.join(root, 'small.png');
      await writeFixturePng(smallPath, '#112233', 16);
      const smallResponse = await routes.request(`/runs/${run.id}/attach-frame`, {
        method: 'POST',
        body: JSON.stringify({ frameIndex: 1, sourcePath: smallPath }),
        headers: { 'Content-Type': 'application/json' },
      });
      const smallPayload = (await smallResponse.json()) as {
        frames: Array<{ id: string; status: string; rawPath?: string }>;
        paths?: { rawDir: string };
      };
      expect(smallPayload.frames.find((frame) => frame.id === 'frame-0002')).toMatchObject({
        status: 'blocked',
        blocked: { reasonKind: 'geometry_mismatch' },
      });
      const rawFile = path.join(
        root,
        '.studio',
        'state',
        'animation-sequence',
        run.id,
        'raw',
        'frame-0002.png',
      );
      expect(readFileSync(rawFile).equals(readFileSync(smallPath))).toBe(true);
      await expect(partialForceResponse.json()).resolves.toMatchObject({
        export: { frameCount: 1 },
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 20_000);

  it('reconciles a legacy run whose frame links one job', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'animation-sequence-reconcile-'));
    try {
      const sourcePath = path.join(root, 'legacy.png');
      await writeFixturePng(sourcePath, '#33aa55');
      const routes = createAnimationSequenceRoutes({
        readLibraryDir: () => root,
        getCatalogImage: (imageId) =>
          imageId === 'legacy-image' ? createCatalogImage(imageId, sourcePath) : null,
        getJob: (jobId) =>
          ({
            id: jobId,
            status: 'completed',
            finalization: { catalogId: 'legacy-image' },
          }) as Job,
      });
      const run = (await (
        await routes.request('/runs', {
          method: 'POST',
          body: JSON.stringify({ prompt: 'legacy run', frameCount: 2 }),
          headers: { 'Content-Type': 'application/json' },
        })
      ).json()) as { id: string };
      const statusPath = path.join(
        root,
        '.studio',
        'state',
        'animation-sequence',
        run.id,
        'animation-sequence-run.json',
      );
      const saved = JSON.parse(readFileSync(statusPath, 'utf8'));
      delete saved.frames[0].dispatch;
      Object.assign(saved.frames[0], { jobId: 'legacy-job', status: 'generating' });
      writeFileSync(statusPath, JSON.stringify(saved));

      expect(
        (await routes.request('/runs/anim-missing/reconcile', { method: 'POST' })).status,
      ).toBe(404);
      const response = await routes.request(`/runs/${run.id}/reconcile`, { method: 'POST' });
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        frames: [{ status: 'generated', catalogImageId: 'legacy-image', jobId: 'legacy-job' }, {}],
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
