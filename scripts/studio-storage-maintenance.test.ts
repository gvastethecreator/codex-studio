import { describe, expect, it } from 'vite-plus/test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  backfillMissingThumbnails,
  compactInlineImagePayloads,
  readReferenceDedupeStats,
} from './studio-storage-maintenance';
import { resolveLibraryPathFromRoot } from '../apps/local-server/src/library';

describe('compactInlineImagePayloads', () => {
  it('omits inline image bytes while preserving non-inline task data', () => {
    const result = compactInlineImagePayloads({
      prompt: 'keep the prompt',
      assets: [
        {
          role: 'reference',
          name: 'reference.png',
          dataUrl: 'data:image/png;base64,aGVsbG8=',
        },
      ],
    });

    expect(result.changed).toBe(true);
    expect(result.replacements).toBe(1);
    expect(result.omittedBytes).toBe(5);
    expect(result.nonRecoverablePayloads).toBe(1);
    expect(result.value).toMatchObject({
      prompt: 'keep the prompt',
      assets: [
        {
          role: 'reference',
          name: 'reference.png',
          omittedInlinePayload: true,
          inlinePayloadSummary: {
            omittedInlinePayload: true,
            kind: 'image_data_url',
            mimeType: 'image/png',
            byteCount: 5,
            recoverable: false,
          },
        },
      ],
    });
  });

  it('marks compacted payloads recoverable when a local path still exists', () => {
    const result = compactInlineImagePayloads({
      assets: [
        {
          localPath: path.resolve('package.json'),
          dataUrl: 'data:image/png;base64,aGVsbG8=',
        },
      ],
    });

    expect(result.recoverablePayloads).toBe(1);
    expect(result.nonRecoverablePayloads).toBe(0);
    expect(result.value).toMatchObject({
      assets: [
        {
          localPath: path.resolve('package.json'),
          inlinePayloadSummary: {
            recoverable: true,
            localPath: path.resolve('package.json'),
          },
        },
      ],
    });
  });
});

describe('readReferenceDedupeStats', () => {
  it('counts duplicate reference bytes without exposing content', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'codex-reference-dedupe-'));
    try {
      writeFileSync(path.join(dir, 'a.bin'), 'same');
      writeFileSync(path.join(dir, 'b.bin'), 'same');
      writeFileSync(path.join(dir, 'c.bin'), 'different');

      expect(readReferenceDedupeStats(dir)).toMatchObject({
        files: 3,
        uniqueHashes: 2,
        duplicateFiles: 1,
        duplicateBytes: 4,
      });
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });
});

function createStorageMaintenanceDb() {
  const catalogRows = new Map<
    string,
    { filePath: string; thumbnailPath: string | null; thumbnailUrl: string | null }
  >();
  const assetRows = new Map<string, { thumbnailPath: string | null }>();
  const db = {
    query(sql: string) {
      if (sql.includes('SELECT id, file_path as filePath')) {
        return {
          all(limit: number) {
            return Array.from(catalogRows, ([id, row]) => ({ id, filePath: row.filePath }))
              .filter((row) => {
                const source = catalogRows.get(row.id)!;
                return !source.thumbnailPath || !source.thumbnailUrl;
              })
              .slice(0, limit);
          },
        };
      }
      if (sql.startsWith('UPDATE catalog_images')) {
        return {
          run(thumbnailPath: string, thumbnailUrl: string, id: string) {
            const row = catalogRows.get(id);
            if (row) {
              row.thumbnailPath = thumbnailPath;
              row.thumbnailUrl = thumbnailUrl;
            }
          },
        };
      }
      if (sql.startsWith('UPDATE assets')) {
        return {
          run(thumbnailPath: string, filePath: string) {
            const row = assetRows.get(filePath);
            if (row && !row.thumbnailPath) {
              row.thumbnailPath = thumbnailPath;
            }
          },
        };
      }
      throw new Error(`Unexpected SQL in test: ${sql}`);
    },
  };

  return { assetRows, catalogRows, db };
}

describe('backfillMissingThumbnails', () => {
  it('plans missing thumbnail rows without creating thumbnails in dry-run mode', async () => {
    const libraryDir = mkdtempSync(path.join(tmpdir(), 'codex-thumbnail-backfill-'));
    const { catalogRows, db } = createStorageMaintenanceDb();
    try {
      const sourcePath = resolveLibraryPathFromRoot(libraryDir, 'outputs', 'sample.png');
      mkdirSync(path.dirname(sourcePath), { recursive: true });
      writeFileSync(sourcePath, 'not-real-image');
      catalogRows.set('catalog-1', {
        filePath: sourcePath,
        thumbnailPath: null,
        thumbnailUrl: null,
      });

      const result = await backfillMissingThumbnails(
        db as never,
        { libraryDir, limit: 10, write: false },
        {
          ensureThumbnailVariant: async () => {
            throw new Error('dry-run should not write thumbnails');
          },
          fileExists: () => true,
        },
      );

      expect(result).toMatchObject({
        mode: 'dry-run',
        scannedRows: 1,
        plannedRows: 1,
        wroteRows: 0,
      });
    } finally {
      rmSync(libraryDir, { force: true, recursive: true });
    }
  });

  it('writes thumbnail path and public URL for bounded backfill rows', async () => {
    const libraryDir = mkdtempSync(path.join(tmpdir(), 'codex-thumbnail-backfill-'));
    const { assetRows, catalogRows, db } = createStorageMaintenanceDb();
    try {
      const sourcePath = resolveLibraryPathFromRoot(libraryDir, 'outputs', 'sample.png');
      const thumbnailPath = resolveLibraryPathFromRoot(
        libraryDir,
        'outputs',
        'thumbnails',
        'sample.webp',
      );
      mkdirSync(path.dirname(sourcePath), { recursive: true });
      writeFileSync(sourcePath, 'not-real-image');
      catalogRows.set('catalog-1', {
        filePath: sourcePath,
        thumbnailPath: null,
        thumbnailUrl: null,
      });
      assetRows.set(sourcePath, { thumbnailPath: null });

      const result = await backfillMissingThumbnails(
        db as never,
        { libraryDir, limit: 10, write: true },
        {
          ensureThumbnailVariant: async () => thumbnailPath,
          fileExists: () => true,
        },
      );
      const row = catalogRows.get('catalog-1');

      expect(result.wroteRows).toBe(1);
      expect(row).toEqual({
        filePath: sourcePath,
        thumbnailPath,
        thumbnailUrl: '/library/outputs/thumbnails/sample.webp',
      });
    } finally {
      rmSync(libraryDir, { force: true, recursive: true });
    }
  });
});
