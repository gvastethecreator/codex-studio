import { Hono } from 'hono';
import type { RepositoryUpdates } from './repositoryUpdates';

export function createRepositoryUpdateRoutes(updates: RepositoryUpdates) {
  const routes = new Hono();
  routes.use('*', async (c, next) => {
    c.header('Cache-Control', 'no-store');
    if (c.req.method === 'POST' && !c.req.header('Content-Type')?.startsWith('application/json')) {
      return c.json({ error: 'Expected application/json.' }, 415);
    }
    await next();
  });
  routes.get('/', (c) => c.json(updates.status()));
  routes.post('/check', async (c) => c.json(await updates.check()));
  routes.post('/apply', async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body.commit !== 'string' || !/^[a-f0-9]{40,64}$/.test(body.commit)) {
      return c.json({ error: 'Check for updates before updating.' }, 400);
    }
    try {
      return c.json(updates.apply(body.commit), 202);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 409);
    }
  });
  routes.post('/restart', (c) => {
    try {
      return c.json(updates.restart(), 202);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 409);
    }
  });
  return routes;
}
