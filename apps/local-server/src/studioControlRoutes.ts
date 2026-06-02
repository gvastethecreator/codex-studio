import { Hono } from 'hono';
import type { resetStudioData } from './reset';

interface StudioControlRoutesDependencies {
  resetStudioData: typeof resetStudioData;
  worker: { resetWorkerState(): Promise<void> };
}

export function createStudioControlRoutes({
  resetStudioData,
  worker,
}: StudioControlRoutesDependencies) {
  const routes = new Hono();

  routes.post('/reset', async (c) => {
    return c.json(await resetStudioData(worker));
  });

  return routes;
}
