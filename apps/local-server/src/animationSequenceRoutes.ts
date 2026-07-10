import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { Hono, type Context } from 'hono';
import type {
  AttachAnimationSequenceFrameRequest,
  CreateAnimationSequenceRunRequest,
  ExportAnimationSequenceGifRequest,
} from '../../../packages/shared/src';
import {
  createAnimationSequenceService,
  type AnimationSequenceService,
  type CreateAnimationSequenceServiceOptions,
} from './animationSequenceService';
import {
  toAnimationSequenceExportView,
  toAnimationSequenceRunView,
} from './animationSequenceRunView';

export interface AnimationSequenceRoutesDependencies extends Pick<
  CreateAnimationSequenceServiceOptions,
  'readLibraryDir' | 'getCatalogImage'
> {
  service?: AnimationSequenceService;
}

async function readJsonBody(c: Context) {
  return c.req.json().catch(() => ({ __invalidJson: true }) as { __invalidJson: true });
}

export function createAnimationSequenceRoutes({
  readLibraryDir,
  getCatalogImage,
  service,
}: AnimationSequenceRoutesDependencies) {
  const routes = new Hono();
  const animationSequence =
    service ?? createAnimationSequenceService({ readLibraryDir, getCatalogImage });

  routes.get('/runs', async (c) =>
    c.json({ runs: (await animationSequence.listRuns()).map(toAnimationSequenceRunView) }),
  );

  routes.get('/runs/:id', async (c) => {
    const run = await animationSequence.getRun(c.req.param('id'));
    if (!run) return c.json({ error: 'Animation Sequence run not found' }, 404);
    return c.json(toAnimationSequenceRunView(run));
  });

  routes.get('/runs/:id/frames/:frameId/prompt', async (c) => {
    const prompt = await animationSequence.readFramePrompt(
      c.req.param('id'),
      c.req.param('frameId'),
    );
    if (!prompt) return c.json({ error: 'Animation Sequence frame prompt not found' }, 404);
    return c.json({ frameId: prompt.frameId, prompt: prompt.prompt });
  });

  routes.get('/runs/:id/files/gif', async (c) => {
    const run = await animationSequence.getRun(c.req.param('id'));
    if (!run || !existsSync(run.paths.gifPath)) return c.notFound();
    return new Response(await readFile(run.paths.gifPath), {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store',
      },
    });
  });

  routes.post('/runs', async (c) => {
    const body = await readJsonBody(c);
    if ('__invalidJson' in body) {
      return c.json({ error: 'Invalid request body', code: 'invalid_json' }, 400);
    }
    const run = await animationSequence.createRun(body as CreateAnimationSequenceRunRequest);
    return c.json(toAnimationSequenceRunView(run), 201);
  });

  routes.post('/runs/:id/attach-frame', async (c) => {
    const body = await readJsonBody(c);
    if ('__invalidJson' in body) {
      return c.json({ error: 'Invalid request body', code: 'invalid_json' }, 400);
    }
    const input = body as AttachAnimationSequenceFrameRequest;
    if (!input.frameId && typeof input.frameIndex !== 'number') {
      return c.json(
        { error: 'frameId or frameIndex is required', code: 'invalid_request_body' },
        400,
      );
    }
    const run = await animationSequence.attachFrame(c.req.param('id'), input);
    if (!run) return c.json({ error: 'Animation Sequence frame not found' }, 404);
    return c.json(toAnimationSequenceRunView(run));
  });

  routes.post('/runs/:id/export-gif', async (c) => {
    const body = await readJsonBody(c);
    if ('__invalidJson' in body) {
      return c.json({ error: 'Invalid request body', code: 'invalid_json' }, 400);
    }
    try {
      const result = await animationSequence.exportGif(
        c.req.param('id'),
        body as ExportAnimationSequenceGifRequest,
      );
      if (!result) return c.json({ error: 'Animation Sequence run not found' }, 404);
      return c.json({
        run: toAnimationSequenceRunView(result.run),
        export: toAnimationSequenceExportView(result.export),
      });
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : 'GIF export failed',
          code: 'gif_export_blocked',
        },
        409,
      );
    }
  });

  routes.post('/runs/:id/qa', async (c) => {
    const run = await animationSequence.runQa(c.req.param('id'));
    if (!run) return c.json({ error: 'Animation Sequence run not found' }, 404);
    return c.json(toAnimationSequenceRunView(run));
  });

  return routes;
}
