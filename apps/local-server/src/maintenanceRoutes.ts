import { Hono } from 'hono';

import {
  backfillStorageThumbnails,
  compactStorageInlinePayloadFields,
  readStorageMaintenanceAudit,
  type CompactStorageMaintenanceOptions,
  type ThumbnailBackfillStorageMaintenanceOptions,
} from './storageMaintenance';
import { pruneToolingLogs } from './toolingLogMaintenance';

interface MaintenanceRoutesDependencies {
  readStorageAudit?: typeof readStorageMaintenanceAudit;
  compactStorage?: typeof compactStorageInlinePayloadFields;
  backfillThumbnails?: typeof backfillStorageThumbnails;
  pruneLogs?: typeof pruneToolingLogs;
}

async function readJsonBody<T>(request: Request): Promise<Partial<T>> {
  try {
    return (await request.json()) as Partial<T>;
  } catch {
    return {};
  }
}

export function createMaintenanceRoutes({
  readStorageAudit = readStorageMaintenanceAudit,
  compactStorage = compactStorageInlinePayloadFields,
  backfillThumbnails = backfillStorageThumbnails,
  pruneLogs = pruneToolingLogs,
}: MaintenanceRoutesDependencies = {}) {
  const routes = new Hono();

  routes.get('/storage/audit', async (c) => c.json(await readStorageAudit()));

  routes.post('/storage/compact', async (c) => {
    const body = await readJsonBody<CompactStorageMaintenanceOptions>(c.req.raw);
    return c.json(
      await compactStorage({
        write: body.write === true,
        vacuum: body.vacuum === true,
        confirm: body.confirm ?? null,
      }),
    );
  });

  routes.post('/storage/thumbnails/backfill', async (c) => {
    const body = await readJsonBody<ThumbnailBackfillStorageMaintenanceOptions>(c.req.raw);
    return c.json(
      await backfillThumbnails({
        write: body.write === true,
        confirm: body.confirm ?? null,
        limit: typeof body.limit === 'number' ? body.limit : undefined,
      }),
    );
  });

  routes.post('/tooling/logs/prune', async (c) => {
    const body = await readJsonBody<{ retainPerTask?: number }>(c.req.raw);
    return c.json(pruneLogs(body.retainPerTask));
  });

  return routes;
}
