import { existsSync } from 'node:fs';
import { Hono, type Context } from 'hono';
import type {
  CreateSpriteAtlasRowJobsRequest,
  CreateSpriteAtlasRunRequest,
  ImportSpriteAtlasRowRequest,
} from '../../../packages/shared/src';
import { createSpriteAtlasService, type SpriteAtlasService } from './spriteAtlasService';

export interface SpriteAtlasRoutesDependencies {
  readLibraryDir: () => string;
  service?: SpriteAtlasService;
}

async function readJsonBody(c: Context) {
  return c.req.json().catch(() => ({ __invalidJson: true }) as { __invalidJson: true });
}

export function createSpriteAtlasRoutes({
  readLibraryDir,
  service,
}: SpriteAtlasRoutesDependencies) {
  const routes = new Hono();
  const spriteAtlas = service ?? createSpriteAtlasService({ readLibraryDir });

  routes.get('/presets', (c) => c.json({ presets: spriteAtlas.listPresets() }));

  routes.get('/runs', async (c) => c.json({ runs: await spriteAtlas.listRuns() }));

  routes.get('/runs/:id', async (c) => {
    const run = await spriteAtlas.getRun(c.req.param('id'));
    if (!run) return c.json({ error: 'Sprite Atlas run not found' }, 404);
    return c.json(run);
  });

  routes.get('/runs/:id/rows/:rowId/prompt', async (c) => {
    const prompt = await spriteAtlas.readRowPrompt(c.req.param('id'), c.req.param('rowId'));
    if (!prompt) return c.json({ error: 'Sprite Atlas row prompt not found' }, 404);
    return c.json(prompt);
  });

  routes.get('/runs/:id/files/layout-guide/:rowId', async (c) => {
    const run = await spriteAtlas.getRun(c.req.param('id'));
    const row = run?.rows.find((item) => item.id === c.req.param('rowId'));
    if (!row || !existsSync(row.layoutGuidePath)) return c.notFound();
    return new Response(Bun.file(row.layoutGuidePath), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  });

  routes.get('/runs/:id/files/atlas', async (c) => {
    const run = await spriteAtlas.getRun(c.req.param('id'));
    if (!run || !existsSync(run.paths.atlasPath)) return c.notFound();
    return new Response(Bun.file(run.paths.atlasPath), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  });

  routes.post('/runs', async (c) => {
    const body = await readJsonBody(c);
    if ('__invalidJson' in body) {
      return c.json({ error: 'Invalid request body', code: 'invalid_json' }, 400);
    }
    const run = await spriteAtlas.createRun(body as CreateSpriteAtlasRunRequest);
    return c.json(run, 201);
  });

  routes.post('/runs/:id/row-jobs', async (c) => {
    const body = await readJsonBody(c);
    if ('__invalidJson' in body) {
      return c.json({ error: 'Invalid request body', code: 'invalid_json' }, 400);
    }
    const rowId = typeof body.rowId === 'string' ? body.rowId : '';
    if (!rowId) return c.json({ error: 'rowId is required', code: 'invalid_request_body' }, 400);
    const job = await spriteAtlas.createRowJob(c.req.param('id'), rowId);
    if (!job) return c.json({ error: 'Sprite Atlas row not found' }, 404);
    return c.json(job, 201);
  });

  routes.post('/runs/:id/row-jobs/batch', async (c) => {
    const body = await readJsonBody(c);
    if ('__invalidJson' in body) {
      return c.json({ error: 'Invalid request body', code: 'invalid_json' }, 400);
    }
    const input = body as CreateSpriteAtlasRowJobsRequest;
    if (input.rowIds !== undefined && !Array.isArray(input.rowIds)) {
      return c.json({ error: 'rowIds must be an array', code: 'invalid_request_body' }, 400);
    }
    const rowIds = input.rowIds?.filter((rowId) => typeof rowId === 'string' && rowId.trim());
    const result = await spriteAtlas.createRowJobs(c.req.param('id'), rowIds);
    if (!result) return c.json({ error: 'Sprite Atlas run not found' }, 404);
    return c.json(result, 201);
  });

  routes.post('/runs/:id/import-row', async (c) => {
    const body = await readJsonBody(c);
    if ('__invalidJson' in body) {
      return c.json({ error: 'Invalid request body', code: 'invalid_json' }, 400);
    }
    const rowId = typeof body.rowId === 'string' ? body.rowId : '';
    if (!rowId) return c.json({ error: 'rowId is required', code: 'invalid_request_body' }, 400);
    const run = await spriteAtlas.importRow(c.req.param('id'), body as ImportSpriteAtlasRowRequest);
    if (!run) return c.json({ error: 'Sprite Atlas row not found' }, 404);
    return c.json(run);
  });

  routes.post('/runs/:id/compose-fixture', async (c) => {
    const run = await spriteAtlas.composeFixture(c.req.param('id'));
    if (!run) return c.json({ error: 'Sprite Atlas run not found' }, 404);
    return c.json(run);
  });

  routes.post('/runs/:id/qa', async (c) => {
    const run = await spriteAtlas.runQa(c.req.param('id'));
    if (!run) return c.json({ error: 'Sprite Atlas run not found' }, 404);
    return c.json(run);
  });

  return routes;
}
