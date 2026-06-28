import { describe, expect, it } from 'vite-plus/test';

import {
  createStorageRepairPlanFromAudit,
  type StorageMaintenanceAuditReport,
} from './storageMaintenance';

function createAudit(
  overrides: Partial<StorageMaintenanceAuditReport> = {},
): StorageMaintenanceAuditReport {
  return {
    libraryDir: 'D:/Studio',
    dbPath: 'D:/Studio/library.sqlite',
    database: {
      bytes: 100,
      formattedBytes: '100 B',
      walBytes: 0,
      shmBytes: 0,
    },
    counts: {},
    payloadFields: [
      {
        table: 'jobs',
        field: 'source_spec_json',
        rows: 2,
        bytes: 1000,
        formattedBytes: '1000 B',
        maxBytes: 800,
        formattedMaxBytes: '800 B',
        inlineRows: 2,
        inlineBytes: 900,
        formattedInlineBytes: '900 B',
      },
    ],
    catalog: {
      rows: 10,
      missingThumbnails: 3,
    },
    references: {
      files: 4,
      bytes: 400,
      uniqueHashes: 2,
      duplicateFiles: 2,
      duplicateBytes: 200,
      formattedDuplicateBytes: '200 B',
    },
    directories: {
      toolingLogs: {
        files: 5,
        bytes: 500,
        formattedBytes: '500 B',
      },
    },
    ...overrides,
  };
}

describe('createStorageRepairPlanFromAudit', () => {
  it('projects storage audit facts into a dry-run repair plan', () => {
    const plan = createStorageRepairPlanFromAudit(createAudit(), '2026-06-28T00:00:00.000Z');

    expect(plan.generatedAt).toBe('2026-06-28T00:00:00.000Z');
    expect(plan.summary).toEqual({
      itemCount: 4,
      warningCount: 2,
      totalBytes: 1600,
    });
    expect(plan.items.map((item) => item.kind)).toEqual([
      'inline_payload_compaction',
      'thumbnail_backfill',
      'reference_dedupe',
      'tooling_log_prune',
    ]);
    expect(plan.items.every((item) => item.destructive === false)).toBe(true);
  });
});
