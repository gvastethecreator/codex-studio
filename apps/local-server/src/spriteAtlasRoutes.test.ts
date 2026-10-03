import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { createSpriteAtlasRoutes } from './spriteAtlasRoutes';

async function writeStrip(filePath: string, frames: number, cellWidth: number, cellHeight: number) {
  await sharp({
    create: {
      width: frames * cellWidth,
      height: cellHeight,
      channels: 4,
      background: { r: 20, g: 40, b: 60, alpha: 255 },
    },
  })
    .png()
    .toFile(filePath);
}

/** A square provider image with one horizontal band of art on a transparent backdrop. */
async function writeSquareProviderImage(filePath: string, size: number, bandHeight: number) {
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

describe('spriteAtlasRoutes', () => {
  it('creates handoff artifacts and composes imported rows into a production atlas', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'sprite-atlas-routes-'));
    try {
      const routes = createSpriteAtlasRoutes({ readLibraryDir: () => root });

      const presetsResponse = await routes.request('/presets');
      expect(presetsResponse.status).toBe(200);
      const presetsPayload = (await presetsResponse.json()) as { presets: Array<{ id: string }> };
      expect(presetsPayload.presets).toContainEqual(expect.objectContaining({ id: 'codex-pet' }));

      const createResponse = await routes.request('/runs', {
        method: 'POST',
        body: JSON.stringify({
          title: 'test atlas',
          presetId: 'platformer-character',
          prompt: 'tiny courier',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(createResponse.status).toBe(201);
      const run = (await createResponse.json()) as {
        id: string;
        paths: {
          runDir: string;
          requestPath: string;
          atlasPath: string;
          manifestPath: string;
          qaReportPath: string;
        };
        rows: Array<{ id: string; promptPath: string; layoutGuidePath: string }>;
      };

      expect(existsSync(run.paths.requestPath)).toBe(true);
      expect(existsSync(run.rows[0]!.promptPath)).toBe(true);
      expect(existsSync(run.rows[0]!.layoutGuidePath)).toBe(true);

      const promptResponse = await routes.request(`/runs/${run.id}/rows/idle/prompt`);
      expect(promptResponse.status).toBe(200);
      const prompt = (await promptResponse.json()) as { prompt: string };
      expect(prompt.prompt.split('\n').slice(0, 2)).toEqual(['Row: idle', 'Action: idle']);
      expect(prompt.prompt).toContain('Base prompt: tiny courier');
      expect(prompt.prompt).not.toContain('#00FF00');
      expect(prompt.prompt).toContain('native transparency');

      const jobResponse = await routes.request(`/runs/${run.id}/row-jobs`, {
        method: 'POST',
        body: JSON.stringify({ rowId: 'idle' }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(jobResponse.status).toBe(201);
      const job = (await jobResponse.json()) as { jobId: string; promptPath: string };
      expect(existsSync(job.promptPath)).toBe(true);

      const batchResponse = await routes.request(`/runs/${run.id}/row-jobs/batch`, {
        method: 'POST',
        body: JSON.stringify({ rowIds: ['run', 'jump'] }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(batchResponse.status).toBe(409);
      await expect(batchResponse.json()).resolves.toMatchObject({
        code: 'anchor_required',
      });

      const blockedResponse = await routes.request(`/runs/${run.id}/import-row`, {
        method: 'POST',
        body: JSON.stringify({
          rowId: 'idle',
          blocked: {
            status: 'blocked',
            reasonKind: 'imagegen_unavailable',
            userMessage: 'Imagegen unavailable',
            suggestion: 'Try again later',
          },
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(blockedResponse.status).toBe(200);
      const blockedRun = (await blockedResponse.json()) as {
        status: string;
        rows: Array<{ id: string; status: string }>;
      };
      expect(blockedRun.status).toBe('blocked');
      expect(blockedRun.rows).toContainEqual(
        expect.objectContaining({ id: 'idle', status: 'blocked' }),
      );

      const composeResponse = await routes.request(`/runs/${run.id}/compose-fixture`, {
        method: 'POST',
      });
      expect(composeResponse.status).toBe(200);
      // Fixture art stays beside the run. Production outputs and checks do not change.
      await expect(composeResponse.json()).resolves.toMatchObject({ status: 'blocked', qa: null });
      const fixtureAtlasPath = path.join(run.paths.runDir, 'fixture', 'atlas.png');
      expect(existsSync(fixtureAtlasPath)).toBe(true);
      expect(existsSync(path.join(run.paths.runDir, 'fixture', 'manifest.json'))).toBe(true);
      expect(existsSync(run.paths.atlasPath)).toBe(false);
      expect(existsSync(run.paths.manifestPath)).toBe(false);

      // An image that cannot split into sensible slots blocks its row at import.
      const mismatchResponse = await routes.request(`/runs/${run.id}/import-row`, {
        method: 'POST',
        body: JSON.stringify({ rowId: 'idle', sourcePath: fixtureAtlasPath }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(mismatchResponse.status).toBe(200);
      await expect(mismatchResponse.json()).resolves.toMatchObject({
        anchor: null,
        rows: expect.arrayContaining([
          expect.objectContaining({
            id: 'idle',
            status: 'blocked',
            rawPath: null,
            blocked: expect.objectContaining({
              reasonKind: 'geometry_mismatch',
              userMessage: expect.stringContaining('would fill only 17% of one side'),
            }),
          }),
        ]),
      });
      const qaResponse = await routes.request(`/runs/${run.id}/qa`, { method: 'POST' });
      expect(qaResponse.status).toBe(200);
      const fixtureQa = (await qaResponse.json()) as { status: string; qa: { ok: boolean } };
      expect(fixtureQa.qa.ok).toBe(false);
      expect(fixtureQa.status).not.toBe('qa_passed');
      expect(existsSync(run.paths.qaReportPath)).toBe(true);

      const productionComposeResponse = await routes.request(`/runs/${run.id}/compose`, {
        method: 'POST',
      });
      expect(productionComposeResponse.status).toBe(409);
      await expect(productionComposeResponse.json()).resolves.toMatchObject({
        code: 'rows_missing',
      });
      expect(existsSync(run.paths.atlasPath)).toBe(false);

      // A square provider image is split into equal slots and resampled to the cell size.
      const providerPath = path.join(root, 'provider-idle.png');
      await writeSquareProviderImage(providerPath, 1024, 171);
      const normalizedResponse = await routes.request(`/runs/${run.id}/import-row`, {
        method: 'POST',
        body: JSON.stringify({ rowId: 'idle', sourcePath: providerPath }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(normalizedResponse.status).toBe(200);
      const normalizedRun = (await normalizedResponse.json()) as {
        rows: Array<{
          id: string;
          frames: number;
          rawPath: string;
          normalization: { sourcePath: string } | null;
        }>;
      };
      const idle = normalizedRun.rows.find((row) => row.id === 'idle')!;
      expect(idle.normalization).toMatchObject({
        normalized: true,
        sourceSize: { w: 1024, h: 1024 },
        kernel: 'nearest',
        fit: 'scale',
      });
      await expect(sharp(idle.rawPath).metadata()).resolves.toMatchObject({
        width: 768,
        height: 128,
      });
      expect(readFileSync(idle.normalization!.sourcePath)).toEqual(readFileSync(providerPath));

      for (const row of normalizedRun.rows.filter((item) => item.id !== 'idle')) {
        const stripPath = path.join(root, `exact-${row.id}.png`);
        await writeStrip(stripPath, row.frames, 128, 128);
        const response = await routes.request(`/runs/${run.id}/import-row`, {
          method: 'POST',
          body: JSON.stringify({ rowId: row.id, sourcePath: stripPath }),
          headers: { 'Content-Type': 'application/json' },
        });
        expect(response.status).toBe(200);
      }
      const normalizedCompose = await routes.request(`/runs/${run.id}/compose`, {
        method: 'POST',
      });
      expect(normalizedCompose.status).toBe(200);
      const normalizedManifest = JSON.parse(readFileSync(run.paths.manifestPath, 'utf8')) as {
        frame_layout: Array<{ id: string }>;
      };
      expect(normalizedManifest.frame_layout).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'idle',
            normalized: true,
            sourceSize: { w: 1024, h: 1024 },
            kernel: 'nearest',
            fit: 'scale',
          }),
          expect.objectContaining({ id: 'run', normalized: false }),
        ]),
      );
      const normalizedQa = await routes.request(`/runs/${run.id}/qa`, { method: 'POST' });
      await expect(normalizedQa.json()).resolves.toMatchObject({
        status: 'qa_passed',
        qa: { ok: true, mode: 'generated_art' },
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 30_000);

  it('composes an exact strip and rejects paths outside the Studio Library', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'sprite-atlas-exact-'));
    const outsideRoot = mkdtempSync(path.join(os.tmpdir(), 'sprite-atlas-outside-'));
    try {
      const routes = createSpriteAtlasRoutes({ readLibraryDir: () => root });
      const createResponse = await routes.request('/runs', {
        method: 'POST',
        body: JSON.stringify({
          title: 'exact',
          presetId: 'platformer-character',
          cellWidth: 16,
          cellHeight: 16,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const run = (await createResponse.json()) as {
        id: string;
        contract: { cell: { width: number; height: number } };
        paths: { framesDir: string; atlasPath: string; manifestPath: string };
        rows: Array<{ id: string; frames: number }>;
      };
      expect(run.contract.cell.width).toBe(16);
      expect(run.contract.cell.height).toBe(16);

      const outsidePath = path.join(outsideRoot, 'outside.png');
      await writeStrip(outsidePath, run.rows[0]!.frames, 16, 16);
      const rejected = await routes.request(`/runs/${run.id}/import-row`, {
        method: 'POST',
        body: JSON.stringify({ rowId: run.rows[0]!.id, sourcePath: outsidePath }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(rejected.status).toBe(200);
      await expect(rejected.json()).resolves.toMatchObject({
        rows: expect.arrayContaining([
          expect.objectContaining({
            id: run.rows[0]!.id,
            status: 'blocked',
            blocked: expect.objectContaining({ reasonKind: 'path_rejected' }),
          }),
        ]),
      });

      for (const row of run.rows) {
        const stripPath = path.join(root, `${row.id}.png`);
        await writeStrip(stripPath, row.frames, 16, 16);
        const response = await routes.request(`/runs/${run.id}/import-row`, {
          method: 'POST',
          body: JSON.stringify({ rowId: row.id, sourcePath: stripPath }),
          headers: { 'Content-Type': 'application/json' },
        });
        expect(response.status).toBe(200);
      }

      const composeResponse = await routes.request(`/runs/${run.id}/compose`, { method: 'POST' });
      expect(composeResponse.status).toBe(200);
      const composed = (await composeResponse.json()) as {
        status: string;
        rows: Array<{ id: string; status: string; sourceSha256: string; rawPath: string }>;
      };
      expect(composed.status).toBe('composed');
      expect(composed.rows.every((row) => row.status === 'extracted' && row.sourceSha256)).toBe(
        true,
      );

      const frameRaw = await sharp(path.join(run.paths.framesDir, 'idle-01.png'))
        .ensureAlpha()
        .raw()
        .toBuffer();
      const cropRaw = await sharp(path.join(root, 'idle.png'))
        .extract({ left: 0, top: 0, width: 16, height: 16 })
        .ensureAlpha()
        .raw()
        .toBuffer();
      expect(Buffer.compare(frameRaw, cropRaw)).toBe(0);
      const frameResponse = await routes.request(`/runs/${run.id}/files/frame/idle/1`);
      expect(frameResponse.status).toBe(200);
      const pastEnd = await routes.request(`/runs/${run.id}/files/frame/idle/99`);
      expect(pastEnd.status).toBe(404);

      const qaResponse = await routes.request(`/runs/${run.id}/qa`, { method: 'POST' });
      await expect(qaResponse.json()).resolves.toMatchObject({
        status: 'qa_passed',
        qa: { ok: true, mode: 'generated_art', technical: { representative: true } },
      });
      const manifest = JSON.parse(readFileSync(run.paths.manifestPath, 'utf8')) as {
        atlas: unknown;
        frame_layout: Array<{ id: string; loop: boolean; frames: unknown[] }>;
      };
      expect(manifest.atlas).toEqual({
        file: path.basename(run.paths.atlasPath),
        width: 128,
        height: 128,
      });
      expect(manifest.frame_layout[0]).toMatchObject({
        id: 'idle',
        loop: true,
        frames: expect.arrayContaining([
          expect.objectContaining({ source: 'idle-01.png', origin: { x: 8, y: 16 } }),
        ]),
      });
      expect(manifest.frame_layout.find((row) => row.id === 'death')?.loop).toBe(false);

      // A failed re-import reports the error and keeps the imported row.
      const json = { 'Content-Type': 'application/json' };
      const rejectedReimport = await routes.request(`/runs/${run.id}/import-row`, {
        method: 'POST',
        body: JSON.stringify({ rowId: 'idle', sourcePath: outsidePath }),
        headers: json,
      });
      expect(rejectedReimport.status).toBe(409);
      await expect(rejectedReimport.json()).resolves.toMatchObject({ code: 'path_rejected' });
      const deletedReimport = await routes.request(`/runs/${run.id}/import-row`, {
        method: 'POST',
        body: JSON.stringify({ rowId: 'idle', catalogImageId: 'deleted-image' }),
        headers: json,
      });
      await expect(deletedReimport.json()).resolves.toMatchObject({ code: 'no_image_returned' });

      // Re-queueing a row leaves the composed and accepted state.
      await routes.request(`/runs/${run.id}/visual-review`, { method: 'POST' });
      const redispatch = await routes.request(`/runs/${run.id}/row-dispatch`, {
        method: 'POST',
        body: JSON.stringify({ rowId: 'run', jobId: 'job-retry' }),
        headers: json,
      });
      await expect(redispatch.json()).resolves.toMatchObject({
        status: 'waiting_for_rows',
        qa: null,
        visualReview: { status: 'pending' },
        rows: expect.arrayContaining([
          expect.objectContaining({ id: 'idle', status: 'extracted' }),
          expect.objectContaining({ id: 'run', status: 'generating', jobId: 'job-retry' }),
        ]),
      });

      // Compose still rejects a strip that changed size after import.
      const reimported = await routes.request(`/runs/${run.id}/import-row`, {
        method: 'POST',
        body: JSON.stringify({ rowId: 'run', sourcePath: path.join(root, 'run.png') }),
        headers: json,
      });
      expect(reimported.status).toBe(200);
      const atlasBytes = readFileSync(run.paths.atlasPath);
      await writeStrip(composed.rows.find((row) => row.id === 'idle')!.rawPath, 1, 16, 16);
      const staleCompose = await routes.request(`/runs/${run.id}/compose`, { method: 'POST' });
      expect(staleCompose.status).toBe(409);
      await expect(staleCompose.json()).resolves.toMatchObject({ code: 'geometry_mismatch' });
      expect(readFileSync(run.paths.atlasPath)).toEqual(atlasBytes);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outsideRoot, { recursive: true, force: true });
    }
  }, 20_000);

  it('blocks irregular items and passes tilesets with declared repeat modes', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'sprite-atlas-lanes-'));
    try {
      const routes = createSpriteAtlasRoutes({ readLibraryDir: () => root });
      const customResponse = await routes.request('/runs', {
        method: 'POST',
        body: JSON.stringify({ presetId: 'custom-atlas', title: 'items' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const customRun = (await customResponse.json()) as { id: string };
      const blocked = await routes.request(`/runs/${customRun.id}/compose`, { method: 'POST' });
      expect(blocked.status).toBe(409);
      await expect(blocked.json()).resolves.toMatchObject({ code: 'static_items_blocked' });

      const tilesetResponse = await routes.request('/runs', {
        method: 'POST',
        body: JSON.stringify({
          presetId: 'tileset-topdown',
          title: 'tiles',
          cellWidth: 16,
          cellHeight: 16,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const tileset = (await tilesetResponse.json()) as {
        id: string;
        paths: { manifestPath: string; qaReportPath: string };
        rows: Array<{ id: string; frames: number }>;
      };
      for (const row of tileset.rows) {
        const stripPath = path.join(root, `tile-${row.id}.png`);
        await writeStrip(stripPath, row.frames, 16, 16);
        const imported = await routes.request(`/runs/${tileset.id}/import-row`, {
          method: 'POST',
          body: JSON.stringify({ rowId: row.id, sourcePath: stripPath }),
          headers: { 'Content-Type': 'application/json' },
        });
        expect(imported.status).toBe(200);
      }
      const composeResponse = await routes.request(`/runs/${tileset.id}/compose`, {
        method: 'POST',
      });
      expect(composeResponse.status).toBe(200);
      const qaResponse = await routes.request(`/runs/${tileset.id}/qa`, { method: 'POST' });
      await expect(qaResponse.json()).resolves.toMatchObject({
        status: 'qa_passed',
        qa: { ok: true, issues: [] },
      });
      expect(
        existsSync(path.join(path.dirname(tileset.paths.qaReportPath), 'terrain-repeat-3x3.png')),
      ).toBe(true);
      const tileManifest = JSON.parse(readFileSync(tileset.paths.manifestPath, 'utf8')) as {
        frame_layout: Array<{ frames: Array<{ origin: unknown }> }>;
      };
      expect(tileManifest.frame_layout[0]!.frames[0]!.origin).toEqual({ x: 0, y: 0 });

      const textureResponse = await routes.request('/runs', {
        method: 'POST',
        body: JSON.stringify({
          presetId: 'texture-pack',
          title: 'textures',
          cellWidth: 16,
          cellHeight: 16,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const texture = (await textureResponse.json()) as {
        id: string;
        paths: { qaReportPath: string };
        rows: Array<{ id: string; frames: number }>;
      };
      for (const row of texture.rows) {
        const stripPath = path.join(root, `texture-${row.id}.png`);
        await writeStrip(stripPath, row.frames, 16, 16);
        const imported = await routes.request(`/runs/${texture.id}/import-row`, {
          method: 'POST',
          body: JSON.stringify({ rowId: row.id, sourcePath: stripPath }),
          headers: { 'Content-Type': 'application/json' },
        });
        expect(imported.status).toBe(200);
      }
      const textureCompose = await routes.request(`/runs/${texture.id}/compose`, {
        method: 'POST',
      });
      expect(textureCompose.status).toBe(200);
      const textureQa = await routes.request(`/runs/${texture.id}/qa`, { method: 'POST' });
      await expect(textureQa.json()).resolves.toMatchObject({
        status: 'qa_passed',
        qa: { ok: true },
      });
      expect(
        existsSync(path.join(path.dirname(texture.paths.qaReportPath), 'stone-repeat-3x3.png')),
      ).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 20_000);
});
