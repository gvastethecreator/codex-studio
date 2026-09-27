import { Hono } from 'hono';
import path from 'node:path';
import type { ExtensionStore } from './extensionStore';

interface ExtensionRoutesDependencies {
  store: ExtensionStore;
}

const CONTENT_TYPES: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

/** Lists installed Cozy Extensions and serves their files (ADR 0011). */
export function createExtensionRoutes({ store }: ExtensionRoutesDependencies) {
  const app = new Hono();

  app.get('/', async (c) => {
    const { extensions, invalid } = await store.list({ refresh: c.req.query('refresh') === '1' });
    return c.json({
      extensions: extensions.map(({ manifest }) => manifest),
      invalid: invalid.map(({ folder, issues }) => ({ folder: path.basename(folder), issues })),
    });
  });

  app.get('/:id/files/*', async (c) => {
    const id = c.req.param('id');
    const relativePath = decodeURIComponent(c.req.path.split(`/${id}/files/`)[1] ?? '');
    const contentType = CONTENT_TYPES[path.extname(relativePath).toLowerCase()];
    if (!relativePath || !contentType) return c.json({ error: 'Unsupported file' }, 400);
    const file = await store.readFile(id, relativePath);
    if (!file) return c.json({ error: 'Not found' }, 404);
    return c.body(new Uint8Array(file), 200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    });
  });

  return app;
}
