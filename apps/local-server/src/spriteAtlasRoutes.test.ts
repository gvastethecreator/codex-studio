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
      expect(existsSync(run.paths.atlasPath)).toBe(true);
      expect(existsSync(run.paths.manifestPath)).toBe(true);

      // Importing a row must not turn an existing fixture atlas into generated-art QA.
      const importedResponse = await routes.request(`/runs/${run.id}/import-row`, {
        method: 'POST',
        body: JSON.stringify({ rowId: 'idle', sourcePath: run.paths.atlasPath }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(importedResponse.status).toBe(200);
      const qaResponse = await routes.request(`/runs/${run.id}/qa`, { method: 'POST' });
      expect(qaResponse.status).toBe(200);
      const fixtureQa = (await qaResponse.json()) as {
        status: string;
        qa: { ok: boolean; mode: string };
      };
      expect(fixtureQa.qa).toMatchObject({ ok: false, mode: 'fixture_smoke' });
      expect(fixtureQa.status).not.toBe('qa_passed');
      expect(existsSync(run.paths.qaReportPath)).toBe(true);

      const fixtureBytes = readFileSync(run.paths.atlasPath);
      for (const row of run.rows) {
        const response = await routes.request(`/runs/${run.id}/import-row`, {
          method: 'POST',
          body: JSON.stringify({ rowId: row.id, sourcePath: run.paths.atlasPath }),
          headers: { 'Content-Type': 'application/json' },
        });
        expect(response.status).toBe(200);
      }
      const productionComposeResponse = await routes.request(`/runs/${run.id}/compose`, {
        method: 'POST',
      });
      expect(productionComposeResponse.status).toBe(409);
      await expect(productionComposeResponse.json()).resolves.toMatchObject({
        code: 'geometry_mismatch',
      });
      expect(readFileSync(run.paths.atlasPath)).toEqual(fixtureBytes);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);

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
        paths: { framesDir: string; atlasPath: string };
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
        rows: Array<{ id: string; status: string; sourceSha256: string }>;
      };
      expect(composed.status).toBe('composed');
      expect(composed.rows.every((row) => row.status === 'extracted' && row.sourceSha256)).toBe(
        true,
      );

      const frameRaw = await sharp(path.join(run.paths.framesDir, 'idle-01.png')).ensureAlpha().raw().toBuffer();
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
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outsideRoot, { recursive: true, force: true });
    }
  }, 20_000);

  it('blocks irregular items and requires a tileset repeat mode', async () => {
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
      const composeResponse = await routes.request(`/runs/${tileset.id}/compose`, { method: 'POST' });
      expect(composeResponse.status).toBe(200);
      const qaResponse = await routes.request(`/runs/${tileset.id}/qa`, { method: 'POST' });
      const qa = (await qaResponse.json()) as { status: string; qa: { ok: boolean; issues: string[] } };
      expect(qa.status).not.toBe('qa_passed');
      expect(qa.qa.ok).toBe(false);
      expect(qa.qa.issues.some((issue) => issue.includes('repeat mode'))).toBe(true);

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
      const textureCompose = await routes.request(`/runs/${texture.id}/compose`, { method: 'POST' });
      expect(textureCompose.status).toBe(200);
      const textureQa = await routes.request(`/runs/${texture.id}/qa`, { method: 'POST' });
      await expect(textureQa.json()).resolves.toMatchObject({
        status: 'qa_passed',
        qa: { ok: true },
      });
      expect(existsSync(path.join(path.dirname(texture.paths.qaReportPath), 'stone-repeat-3x3.png'))).toBe(
        true,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 20_000);
});
