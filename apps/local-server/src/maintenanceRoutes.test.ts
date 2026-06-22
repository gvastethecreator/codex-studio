import { describe, expect, it, vi } from 'vite-plus/test';
import { createMaintenanceRoutes } from './maintenanceRoutes';

describe('maintenanceRoutes', () => {
  it('returns the storage audit report', async () => {
    const readStorageAudit = vi.fn(async () => ({
      libraryDir: 'D:/library',
      dbPath: 'D:/library/.studio/studio.sqlite',
      database: { bytes: 1, formattedBytes: '1 B', walBytes: 0, shmBytes: 0 },
      counts: {},
      payloadFields: [],
      catalog: { rows: 0, missingThumbnails: 0 },
      references: {
        files: 0,
        bytes: 0,
        uniqueHashes: 0,
        duplicateFiles: 0,
        duplicateBytes: 0,
        formattedDuplicateBytes: '0 B',
      },
      directories: {},
    }));
    const routes = createMaintenanceRoutes({ readStorageAudit });

    const response = await routes.request('/storage/audit');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ libraryDir: 'D:/library' });
    expect(readStorageAudit).toHaveBeenCalledOnce();
  });

  it('runs compaction as dry-run unless write is requested explicitly', async () => {
    const compactStorage = vi.fn(async (input) => ({
      libraryDir: 'D:/library',
      dbPath: 'D:/library/.studio/studio.sqlite',
      mode: input.write ? ('write' as const) : ('dry-run' as const),
      backup: null,
      vacuumRan: false,
      results: [],
    }));
    const routes = createMaintenanceRoutes({ compactStorage });

    const response = await routes.request('/storage/compact', { method: 'POST' });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ mode: 'dry-run' });
    expect(compactStorage).toHaveBeenCalledWith({
      write: false,
      vacuum: false,
      confirm: null,
    });
  });

  it('passes bounded thumbnail backfill write confirmation', async () => {
    const backfillThumbnails = vi.fn(async (input) => ({
      libraryDir: 'D:/library',
      dbPath: 'D:/library/.studio/studio.sqlite',
      backup: null,
      mode: input.write ? ('write' as const) : ('dry-run' as const),
      limit: input.limit ?? 100,
      scannedRows: 0,
      plannedRows: 0,
      missingSourceFiles: 0,
      wroteRows: 0,
      errors: 0,
    }));
    const routes = createMaintenanceRoutes({ backfillThumbnails });

    const response = await routes.request('/storage/thumbnails/backfill', {
      method: 'POST',
      body: JSON.stringify({
        write: true,
        confirm: 'backfill-thumbnails',
        limit: 1000,
      }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ mode: 'write', limit: 1000 });
    expect(backfillThumbnails).toHaveBeenCalledWith({
      write: true,
      confirm: 'backfill-thumbnails',
      limit: 1000,
    });
  });

  it('prunes tooling logs with bounded retention', async () => {
    const pruneLogs = vi.fn(() => ({
      logDir: 'D:/repo/logs/tooling',
      retainPerTask: 10,
      pruned: 3,
    }));
    const routes = createMaintenanceRoutes({ pruneLogs });

    const response = await routes.request('/tooling/logs/prune', {
      method: 'POST',
      body: JSON.stringify({ retainPerTask: 10 }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ pruned: 3 });
    expect(pruneLogs).toHaveBeenCalledWith(10);
  });
});
