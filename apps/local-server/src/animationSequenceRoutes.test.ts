import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vite-plus/test';
import type { CatalogImage } from '../../../packages/shared/src';

import { createAnimationSequenceRoutes } from './animationSequenceRoutes';

async function writeFixturePng(filePath: string, color: string) {
  await sharp({
    create: {
      width: 16,
      height: 16,
      channels: 4,
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
      await writeFixturePng(sourceB, '#0000ff');

      const routes = createAnimationSequenceRoutes({ readLibraryDir: () => root });

      const createResponse = await routes.request('/runs', {
        method: 'POST',
        body: JSON.stringify({
          title: 'test loop',
          prompt: 'a tiny lantern pulses',
          frameCount: 2,
          fps: 8,
          aspectRatio: '1:1',
          cyclic: true,
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
        publicUrl: `/library/outputs/animation-sequence/${run.id}/exports/animation.gif`,
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

      const reexportResponse = await routes.request(`/runs/${run.id}/export-gif`, {
        method: 'POST',
        body: JSON.stringify({ fps: 8, loop: true }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(reexportResponse.status).toBe(200);
      await expect(reexportResponse.json()).resolves.toMatchObject({
        run: { status: 'exported' },
        export: { frameCount: 2 },
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 20_000);

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
      await writeFixturePng(managedPath, '#00ff00');
      await writeFixturePng(outsidePath, '#ff00ff');
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

      const managedResponse = await routes.request(`/runs/${run.id}/attach-frame`, {
        method: 'POST',
        body: JSON.stringify({ frameIndex: 0, catalogImageId: 'managed' }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(managedResponse.status).toBe(200);
      await expect(managedResponse.json()).resolves.toMatchObject({
        frames: expect.arrayContaining([
          expect.objectContaining({
            id: 'frame-0001',
            status: 'generated',
            catalogImageId: 'managed',
          }),
        ]),
      });

      const outsideResponse = await routes.request(`/runs/${run.id}/attach-frame`, {
        method: 'POST',
        body: JSON.stringify({ frameIndex: 1, catalogImageId: 'outside' }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(outsideResponse.status).toBe(200);
      const outsidePayload = (await outsideResponse.json()) as {
        frames: Array<{
          id: string;
          status: string;
          blocked: { reasonKind: string } | null;
        }>;
      };
      expect(outsidePayload.frames.find((frame) => frame.id === 'frame-0002')).toMatchObject({
        id: 'frame-0002',
        status: 'blocked',
        blocked: { reasonKind: 'source_missing' },
      });
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
      await expect(partialForceResponse.json()).resolves.toMatchObject({
        export: { frameCount: 1 },
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 20_000);
});
