import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { Hono, type Context } from 'hono';
import type {
  CatalogImage,
  CreateSpriteAtlasRowJobsRequest,
  CreateSpriteAtlasRunRequest,
  ImportSpriteAtlasRowRequest,
} from '../../../packages/shared/src';
import {
  createSpriteAtlasService,
  spriteAtlasFramePath,
  SpriteAtlasActionError,
  type SpriteAtlasJobLookup,
  type SpriteAtlasService,
} from './spriteAtlasService';
import { createSpriteAtlasRunParticipant } from './spriteAtlasRunReconciler';

export interface SpriteAtlasRoutesDependencies {
  readLibraryDir: () => string;
  readOutputContext?: (
    workspaceId?: string,
  ) => import('../../../packages/shared/src/types').JobLibraryContext;
  getCatalogImage?: (imageId: string) => CatalogImage | null;
  service?: SpriteAtlasService;
  /** Stored job and Catalog reads for manual Sync. Defaults to the Studio database. */
  jobLookup?: SpriteAtlasJobLookup;
}

async function readJsonBody(c: Context) {
  return c.req.json().catch(() => ({ __invalidJson: true }) as { __invalidJson: true });
}

function actionError(error: unknown) {
  if (error instanceof SpriteAtlasActionError) {
    return { error: error.message, code: error.code };
  }
  return { error: error instanceof Error ? error.message : 'Sprite Atlas action failed' };
}

export function createSpriteAtlasRoutes({
  readLibraryDir,
  readOutputContext,
  getCatalogImage,
  service,
  jobLookup,
}: SpriteAtlasRoutesDependencies) {
  const routes = new Hono();
  const spriteAtlas =
    service ?? createSpriteAtlasService({ readLibraryDir, readOutputContext, getCatalogImage });
  const reconciler = createSpriteAtlasRunParticipant(spriteAtlas, jobLookup);

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
    try {
      const job = await spriteAtlas.createRowJob(c.req.param('id'), rowId);
      if (!job) return c.json({ error: 'Sprite Atlas row not found' }, 404);
      return c.json(job, 201);
    } catch (error) {
      return c.json(actionError(error), 409);
    }
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
    try {
      const result = await spriteAtlas.createRowJobs(c.req.param('id'), rowIds);
      if (!result) return c.json({ error: 'Sprite Atlas run not found' }, 404);
      return c.json(result, 201);
    } catch (error) {
      return c.json(actionError(error), 409);
    }
  });

  routes.post('/runs/:id/import-row', async (c) => {
    const body = await readJsonBody(c);
    if ('__invalidJson' in body) {
      return c.json({ error: 'Invalid request body', code: 'invalid_json' }, 400);
    }
    const rowId = typeof body.rowId === 'string' ? body.rowId : '';
    if (!rowId) return c.json({ error: 'rowId is required', code: 'invalid_request_body' }, 400);
    try {
      const run = await spriteAtlas.importRow(
        c.req.param('id'),
        body as ImportSpriteAtlasRowRequest,
      );
      if (!run) return c.json({ error: 'Sprite Atlas row not found' }, 404);
      return c.json(run);
    } catch (error) {
      return c.json(actionError(error), 409);
    }
  });

  routes.post('/runs/:id/compose-fixture', async (c) => {
    const run = await spriteAtlas.composeFixture(c.req.param('id'));
    if (!run) return c.json({ error: 'Sprite Atlas run not found' }, 404);
    return c.json(run);
  });

  routes.post('/runs/:id/compose', async (c) => {
    try {
      const run = await spriteAtlas.compose(c.req.param('id'));
      if (!run) return c.json({ error: 'Sprite Atlas run not found' }, 404);
      return c.json(run);
    } catch (error) {
      return c.json(actionError(error), 409);
    }
  });

  routes.post('/runs/:id/qa', async (c) => {
    const run = await spriteAtlas.runQa(c.req.param('id'));
    if (!run) return c.json({ error: 'Sprite Atlas run not found' }, 404);
    return c.json(run);
  });

  routes.post('/runs/:id/visual-review', async (c) => {
    const run = await spriteAtlas.acceptVisualReview(c.req.param('id'));
    if (!run) return c.json({ error: 'Sprite Atlas run not found' }, 404);
    return c.json(run);
  });

  routes.post('/runs/:id/reconcile', async (c) => {
    const run = await reconciler.reconcileRun(c.req.param('id'));
    if (!run) return c.json({ error: 'Sprite Atlas run not found' }, 404);
    return c.json(run);
  });

  routes.get('/runs/:id/files/frame/:rowId/:frame', async (c) => {
    const run = await spriteAtlas.getRun(c.req.param('id'));
    const row = run?.rows.find((item) => item.id === c.req.param('rowId'));
    const frameNumber = Number(c.req.param('frame'));
    if (
      !run ||
      !row ||
      !Number.isInteger(frameNumber) ||
      frameNumber < 1 ||
      frameNumber > row.frames
    ) {
      return c.notFound();
    }
    const framePath = spriteAtlasFramePath(run, row.id, frameNumber);
    if (!existsSync(framePath)) return c.notFound();
    return new Response(await readFile(framePath), {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
    });
  });

  return routes;
}
