import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

import { createSpriteAtlasRoutes } from './spriteAtlasRoutes';

describe('spriteAtlasRoutes', () => {
  it('creates a real run folder, handoff job, blocked sidecar, fixture atlas, and QA report', async () => {
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
      await expect(promptResponse.json()).resolves.toMatchObject({
        rowId: 'idle',
        prompt: expect.stringContaining('Base prompt: tiny courier'),
      });

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
      expect(batchResponse.status).toBe(201);
      await expect(batchResponse.json()).resolves.toMatchObject({
        jobs: [
          expect.objectContaining({ rowId: 'run' }),
          expect.objectContaining({ rowId: 'jump' }),
        ],
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

      const qaResponse = await routes.request(`/runs/${run.id}/qa`, { method: 'POST' });
      expect(qaResponse.status).toBe(200);
      await expect(qaResponse.json()).resolves.toMatchObject({
        qa: { ok: true, mode: 'fixture_smoke' },
      });
      expect(existsSync(run.paths.qaReportPath)).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 15_000);
});
