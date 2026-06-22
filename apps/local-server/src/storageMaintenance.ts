import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import type {
  StorageMaintenanceAuditReport,
  StorageMaintenanceBackup,
  StorageMaintenanceCompactResult,
  StorageMaintenanceMode,
  StorageMaintenanceThumbnailBackfillResult,
} from '../../../packages/shared/src';
import { getSettings } from './config';
import { ensureThumbnailVariant } from './libraryAssetVariants';
import { resolveLibraryPathFromRoot } from './library';

type JsonObject = Record<string, unknown>;

interface InlinePayloadMarker {
  omittedInlinePayload: true;
  kind: 'image_data_url';
  mimeType: string;
  byteCount: number;
  sha256: string;
  recoverable: boolean;
  localPath?: string;
  missingLocalPath?: string;
}

interface CompactResult {
  value: unknown;
  changed: boolean;
  replacements: number;
  omittedBytes: number;
  recoverablePayloads: number;
  nonRecoverablePayloads: number;
}

interface SqliteDatabase {
  query(sql: string): {
    all(...params: unknown[]): unknown[];
    get(...params: unknown[]): unknown;
    run(...params: unknown[]): unknown;
  };
  run(sql: string): unknown;
  close(): void;
}

export interface StorageMaintenanceOptions {
  libraryDir?: string;
  dbPath?: string;
}

export interface StorageMaintenanceWriteOptions extends StorageMaintenanceOptions {
  write?: boolean;
  confirm?: string | null;
}

export interface CompactStorageMaintenanceOptions extends StorageMaintenanceWriteOptions {
  vacuum?: boolean;
}

export interface ThumbnailBackfillStorageMaintenanceOptions extends StorageMaintenanceWriteOptions {
  limit?: number;
}

const INLINE_IMAGE_DATA_URL_RE = /^data:(image\/[a-z0-9.+-]+);base64,(.*)$/is;
const COMPACT_CONFIRMATION = 'compact-inline-payloads';
const THUMBNAIL_BACKFILL_CONFIRMATION = 'backfill-thumbnails';

const PAYLOAD_FIELDS = [
  { table: 'jobs', idColumn: 'id', field: 'source_spec_json' },
  { table: 'catalog_images', idColumn: 'id', field: 'generation_config' },
] as const;

const COUNT_TABLES = [
  'jobs',
  'catalog_images',
  'assets',
  'codex_turns',
  'job_events',
  'system_logs',
] as const;

function resolveStorageMaintenanceOptions(options: StorageMaintenanceOptions = {}) {
  const libraryDir = options.libraryDir || getSettings().libraryDir;
  const dbPath = options.dbPath || resolveLibraryPathFromRoot(libraryDir, 'library.sqlite');
  return { libraryDir, dbPath };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

function readDirectoryStats(dirPath: string) {
  const stats = { files: 0, bytes: 0 };
  if (!existsSync(dirPath)) return stats;

  const stack = [dirPath];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile()) {
        const fileStats = statSync(entryPath);
        stats.files += 1;
        stats.bytes += fileStats.size;
      }
    }
  }

  return stats;
}

export function readReferenceDedupeStats(dirPath: string) {
  const stats = {
    files: 0,
    bytes: 0,
    uniqueHashes: 0,
    duplicateFiles: 0,
    duplicateBytes: 0,
  };
  if (!existsSync(dirPath)) return stats;

  const hashes = new Map<string, { count: number; bytes: number }>();
  const stack = [dirPath];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile()) {
        const fileStats = statSync(entryPath);
        const sha256 = createHash('sha256').update(readFileSync(entryPath)).digest('hex');
        const previous = hashes.get(sha256);
        stats.files += 1;
        stats.bytes += fileStats.size;
        if (previous) {
          previous.count += 1;
          stats.duplicateFiles += 1;
          stats.duplicateBytes += fileStats.size;
        } else {
          hashes.set(sha256, { count: 1, bytes: fileStats.size });
        }
      }
    }
  }

  stats.uniqueHashes = hashes.size;
  return stats;
}

function parseInlineImageDataUrl(value: string) {
  const match = value.match(INLINE_IMAGE_DATA_URL_RE);
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  const base64 = match[2];
  const bytes = Buffer.from(base64, 'base64');
  return {
    mimeType,
    byteCount: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

function createInlinePayloadMarker(value: string, localPath?: unknown): InlinePayloadMarker | null {
  const parsed = parseInlineImageDataUrl(value);
  if (!parsed) return null;
  const candidatePath = typeof localPath === 'string' && localPath.trim() ? localPath : null;
  const recoverable = Boolean(candidatePath && existsSync(candidatePath));
  return {
    omittedInlinePayload: true,
    kind: 'image_data_url',
    mimeType: parsed.mimeType,
    byteCount: parsed.byteCount,
    sha256: parsed.sha256,
    recoverable,
    ...(recoverable && candidatePath ? { localPath: candidatePath } : {}),
    ...(!recoverable && candidatePath ? { missingLocalPath: candidatePath } : {}),
  };
}

function compactValue(value: unknown, key: string | null = null): CompactResult {
  if (typeof value === 'string') {
    const marker = createInlinePayloadMarker(value);
    if (!marker) {
      return {
        value,
        changed: false,
        replacements: 0,
        omittedBytes: 0,
        recoverablePayloads: 0,
        nonRecoverablePayloads: 0,
      };
    }
    return {
      value: key === 'dataUrl' ? undefined : marker,
      changed: true,
      replacements: 1,
      omittedBytes: marker.byteCount,
      recoverablePayloads: marker.recoverable ? 1 : 0,
      nonRecoverablePayloads: marker.recoverable ? 0 : 1,
    };
  }

  if (Array.isArray(value)) {
    let changed = false;
    let replacements = 0;
    let omittedBytes = 0;
    let recoverablePayloads = 0;
    let nonRecoverablePayloads = 0;
    const items = value.map((item) => {
      const result = compactValue(item);
      changed ||= result.changed;
      replacements += result.replacements;
      omittedBytes += result.omittedBytes;
      recoverablePayloads += result.recoverablePayloads;
      nonRecoverablePayloads += result.nonRecoverablePayloads;
      return result.value;
    });
    return {
      value: items,
      changed,
      replacements,
      omittedBytes,
      recoverablePayloads,
      nonRecoverablePayloads,
    };
  }

  if (value && typeof value === 'object') {
    const record = value as JsonObject;
    const output: JsonObject = {};
    let changed = false;
    let replacements = 0;
    let omittedBytes = 0;
    let recoverablePayloads = 0;
    let nonRecoverablePayloads = 0;

    for (const [childKey, childValue] of Object.entries(record)) {
      if (childKey === 'dataUrl' && typeof childValue === 'string') {
        const marker = createInlinePayloadMarker(childValue, record.localPath);
        if (marker) {
          changed = true;
          replacements += 1;
          omittedBytes += marker.byteCount;
          recoverablePayloads += marker.recoverable ? 1 : 0;
          nonRecoverablePayloads += marker.recoverable ? 0 : 1;
          output.omittedInlinePayload = true;
          output.inlinePayloadSummary = marker;
          continue;
        }
      }

      const result = compactValue(childValue, childKey);
      changed ||= result.changed;
      replacements += result.replacements;
      omittedBytes += result.omittedBytes;
      recoverablePayloads += result.recoverablePayloads;
      nonRecoverablePayloads += result.nonRecoverablePayloads;
      if (result.value !== undefined) {
        output[childKey] = result.value;
      }
    }

    return {
      value: output,
      changed,
      replacements,
      omittedBytes,
      recoverablePayloads,
      nonRecoverablePayloads,
    };
  }

  return {
    value,
    changed: false,
    replacements: 0,
    omittedBytes: 0,
    recoverablePayloads: 0,
    nonRecoverablePayloads: 0,
  };
}

export function compactInlineImagePayloads(value: unknown) {
  return compactValue(value);
}

async function openStorageMaintenanceDatabase(
  dbPath: string,
  options: { readonly?: boolean } = {},
) {
  const { Database } = (await import('bun:sqlite')) as {
    Database: new (path: string, options?: { readonly?: boolean }) => SqliteDatabase;
  };
  return options.readonly ? new Database(dbPath, { readonly: true }) : new Database(dbPath);
}

function readCountStats(db: SqliteDatabase) {
  return Object.fromEntries(
    COUNT_TABLES.map((table) => {
      const row = db.query(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
      return [table, row.count];
    }),
  );
}

function readPayloadFieldStats(db: SqliteDatabase, field: (typeof PAYLOAD_FIELDS)[number]) {
  const row = db
    .query(
      `
      SELECT
        COUNT(*) as rows,
        COALESCE(SUM(LENGTH(${field.field})), 0) as bytes,
        COALESCE(MAX(LENGTH(${field.field})), 0) as maxBytes,
        COALESCE(SUM(CASE WHEN ${field.field} LIKE '%data:image/%' THEN 1 ELSE 0 END), 0) as inlineRows,
        COALESCE(SUM(CASE WHEN ${field.field} LIKE '%data:image/%' THEN LENGTH(${field.field}) ELSE 0 END), 0) as inlineBytes
      FROM ${field.table}
      WHERE ${field.field} IS NOT NULL
    `,
    )
    .get() as {
    rows: number;
    bytes: number;
    maxBytes: number;
    inlineRows: number;
    inlineBytes: number;
  };

  return {
    table: field.table,
    field: field.field,
    rows: row.rows,
    bytes: row.bytes,
    formattedBytes: formatBytes(row.bytes),
    maxBytes: row.maxBytes,
    formattedMaxBytes: formatBytes(row.maxBytes),
    inlineRows: row.inlineRows,
    inlineBytes: row.inlineBytes,
    formattedInlineBytes: formatBytes(row.inlineBytes),
  };
}

function readCatalogMaintenanceStats(db: SqliteDatabase) {
  const row = db
    .query(
      `
      SELECT
        COUNT(*) as rows,
        COALESCE(SUM(CASE WHEN thumbnail_path IS NULL OR thumbnail_url IS NULL THEN 1 ELSE 0 END), 0) as missingThumbnails
      FROM catalog_images
      WHERE is_deleted = 0
    `,
    )
    .get() as { rows: number; missingThumbnails: number };

  return row;
}

function readDatabaseFileStats(dbPath: string) {
  const databaseBytes = existsSync(dbPath) ? statSync(dbPath).size : 0;
  const walBytes = existsSync(`${dbPath}-wal`) ? statSync(`${dbPath}-wal`).size : 0;
  const shmBytes = existsSync(`${dbPath}-shm`) ? statSync(`${dbPath}-shm`).size : 0;
  return {
    bytes: databaseBytes,
    formattedBytes: formatBytes(databaseBytes),
    walBytes,
    shmBytes,
  };
}

export function createStorageMaintenanceAuditReport(
  options: Required<StorageMaintenanceOptions>,
  db: SqliteDatabase,
): StorageMaintenanceAuditReport {
  const studioDir = resolveLibraryPathFromRoot(options.libraryDir, '.studio');
  const referenceDedupe = readReferenceDedupeStats(path.join(studioDir, 'references'));
  const directories = {
    transcripts: readDirectoryStats(path.join(studioDir, 'transcripts')),
    logs: readDirectoryStats(path.join(studioDir, 'logs')),
    references: readDirectoryStats(path.join(studioDir, 'references')),
    outputs: readDirectoryStats(resolveLibraryPathFromRoot(options.libraryDir, 'outputs')),
    thumbnails: readDirectoryStats(
      resolveLibraryPathFromRoot(options.libraryDir, 'outputs', 'thumbnails'),
    ),
    toolingLogs: readDirectoryStats(path.resolve(process.cwd(), 'logs', 'tooling')),
  };

  return {
    libraryDir: options.libraryDir,
    dbPath: options.dbPath,
    database: readDatabaseFileStats(options.dbPath),
    counts: readCountStats(db),
    payloadFields: PAYLOAD_FIELDS.map((field) => readPayloadFieldStats(db, field)),
    catalog: readCatalogMaintenanceStats(db),
    references: {
      ...referenceDedupe,
      formattedDuplicateBytes: formatBytes(referenceDedupe.duplicateBytes),
    },
    directories: Object.fromEntries(
      Object.entries(directories).map(([key, value]) => [
        key,
        { ...value, formattedBytes: formatBytes(value.bytes) },
      ]),
    ),
  };
}

function toPublicAssetUrlForLibrary(libraryDir: string, filePath: string) {
  const relative = path.relative(libraryDir, filePath).replaceAll(path.sep, '/');
  return `/library/${encodeURIComponent(relative).replaceAll('%2F', '/')}`;
}

interface ThumbnailBackfillDependencies {
  ensureThumbnailVariant(sourceFilePath: string, options: { libraryDir: string }): Promise<string>;
  fileExists(filePath: string): boolean;
}

export async function backfillMissingThumbnails(
  db: SqliteDatabase,
  args: { libraryDir: string; write: boolean; limit: number },
  dependencies: ThumbnailBackfillDependencies,
) {
  const rows = db
    .query(
      `
      SELECT id, file_path as filePath
      FROM catalog_images
      WHERE is_deleted = 0
        AND (thumbnail_path IS NULL OR thumbnail_url IS NULL)
      ORDER BY created_at DESC
      LIMIT ?
    `,
    )
    .all(args.limit) as { id: string; filePath: string }[];
  const updateCatalog = args.write
    ? db.query('UPDATE catalog_images SET thumbnail_path = ?, thumbnail_url = ? WHERE id = ?')
    : null;
  const updateAssets = args.write
    ? db.query(
        "UPDATE assets SET thumbnail_path = ? WHERE file_path = ? AND (thumbnail_path IS NULL OR thumbnail_path = '')",
      )
    : null;

  let plannedRows = 0;
  let missingSourceFiles = 0;
  let wroteRows = 0;
  let errors = 0;

  for (const row of rows) {
    if (!dependencies.fileExists(row.filePath)) {
      missingSourceFiles += 1;
      continue;
    }

    plannedRows += 1;
    if (!args.write) continue;

    try {
      const thumbnailPath = await dependencies.ensureThumbnailVariant(row.filePath, {
        libraryDir: args.libraryDir,
      });
      updateCatalog?.run(
        thumbnailPath,
        toPublicAssetUrlForLibrary(args.libraryDir, thumbnailPath),
        row.id,
      );
      updateAssets?.run(thumbnailPath, row.filePath);
      wroteRows += 1;
    } catch {
      errors += 1;
    }
  }

  return {
    mode: (args.write ? 'write' : 'dry-run') as StorageMaintenanceMode,
    limit: args.limit,
    scannedRows: rows.length,
    plannedRows,
    missingSourceFiles,
    wroteRows,
    errors,
  };
}

function compactField(db: SqliteDatabase, field: (typeof PAYLOAD_FIELDS)[number], write: boolean) {
  const rows = db
    .query(
      `SELECT ${field.idColumn} as id, ${field.field} as value FROM ${field.table} WHERE ${field.field} LIKE '%data:image/%'`,
    )
    .all() as { id: string; value: string }[];
  const update = write
    ? db.query(`UPDATE ${field.table} SET ${field.field} = ? WHERE ${field.idColumn} = ?`)
    : null;
  let changedRows = 0;
  let replacements = 0;
  let omittedBytes = 0;
  let recoverablePayloads = 0;
  let nonRecoverablePayloads = 0;

  for (const row of rows) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(row.value);
    } catch {
      continue;
    }

    const compacted = compactInlineImagePayloads(parsed);
    if (!compacted.changed) continue;
    changedRows += 1;
    replacements += compacted.replacements;
    omittedBytes += compacted.omittedBytes;
    recoverablePayloads += compacted.recoverablePayloads;
    nonRecoverablePayloads += compacted.nonRecoverablePayloads;
    update?.run(JSON.stringify(compacted.value), row.id);
  }

  return {
    table: field.table,
    field: field.field,
    scannedRows: rows.length,
    changedRows,
    replacements,
    omittedBytes,
    formattedOmittedBytes: formatBytes(omittedBytes),
    recoverablePayloads,
    nonRecoverablePayloads,
    wrote: write,
  };
}

function createBackup(options: Required<StorageMaintenanceOptions>): StorageMaintenanceBackup {
  const backupDir = resolveLibraryPathFromRoot(
    options.libraryDir,
    'state',
    `storage-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`,
  );
  mkdirSync(backupDir, { recursive: true });

  const files = [options.dbPath, `${options.dbPath}-wal`, `${options.dbPath}-shm`].filter(
    existsSync,
  );
  for (const file of files) {
    copyFileSync(file, path.join(backupDir, path.basename(file)));
  }

  return {
    backupDir,
    files: files.map((file) => path.basename(file)),
  };
}

async function createBackupForWrite(options: Required<StorageMaintenanceOptions>) {
  const checkpointDb = await openStorageMaintenanceDatabase(options.dbPath);
  try {
    checkpointDb.run('PRAGMA wal_checkpoint(FULL)');
  } finally {
    checkpointDb.close();
  }
  return createBackup(options);
}

export async function readStorageMaintenanceAudit(
  options: StorageMaintenanceOptions = {},
): Promise<StorageMaintenanceAuditReport> {
  const resolvedOptions = resolveStorageMaintenanceOptions(options);
  if (!existsSync(resolvedOptions.dbPath)) {
    throw new Error(`Studio SQLite database was not found at ${resolvedOptions.dbPath}`);
  }

  const db = await openStorageMaintenanceDatabase(resolvedOptions.dbPath, { readonly: true });
  try {
    return createStorageMaintenanceAuditReport(resolvedOptions, db);
  } finally {
    db.close();
  }
}

export async function compactStorageInlinePayloadFields(
  options: CompactStorageMaintenanceOptions = {},
): Promise<StorageMaintenanceCompactResult> {
  const resolvedOptions = resolveStorageMaintenanceOptions(options);
  const write = options.write === true;
  if (!existsSync(resolvedOptions.dbPath)) {
    throw new Error(`Studio SQLite database was not found at ${resolvedOptions.dbPath}`);
  }
  if (write && options.confirm !== COMPACT_CONFIRMATION) {
    throw new Error(
      'Refusing to compact without explicit confirmation. Re-run after reviewing the dry-run output.',
    );
  }

  const backup = write ? await createBackupForWrite(resolvedOptions) : null;
  const db = await openStorageMaintenanceDatabase(resolvedOptions.dbPath, { readonly: !write });
  try {
    const results = PAYLOAD_FIELDS.map((field) => compactField(db, field, write));
    if (write && options.vacuum) {
      db.run('VACUUM');
    }
    return {
      libraryDir: resolvedOptions.libraryDir,
      dbPath: resolvedOptions.dbPath,
      mode: write ? 'write' : 'dry-run',
      backup,
      vacuumRan: write && options.vacuum === true,
      results,
    };
  } finally {
    db.close();
  }
}

export async function backfillStorageThumbnails(
  options: ThumbnailBackfillStorageMaintenanceOptions = {},
): Promise<StorageMaintenanceThumbnailBackfillResult> {
  const resolvedOptions = resolveStorageMaintenanceOptions(options);
  const write = options.write === true;
  const parsedLimit = Number.parseInt(String(options.limit ?? '100'), 10);
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, parsedLimit) : 100;

  if (!existsSync(resolvedOptions.dbPath)) {
    throw new Error(`Studio SQLite database was not found at ${resolvedOptions.dbPath}`);
  }
  if (write && options.confirm !== THUMBNAIL_BACKFILL_CONFIRMATION) {
    throw new Error(
      'Refusing to backfill thumbnails without explicit confirmation. Re-run after reviewing the dry-run output.',
    );
  }

  const backup = write ? await createBackupForWrite(resolvedOptions) : null;
  const db = await openStorageMaintenanceDatabase(resolvedOptions.dbPath, { readonly: !write });
  try {
    const result = await backfillMissingThumbnails(
      db,
      { libraryDir: resolvedOptions.libraryDir, limit, write },
      {
        ensureThumbnailVariant,
        fileExists: existsSync,
      },
    );
    return {
      libraryDir: resolvedOptions.libraryDir,
      dbPath: resolvedOptions.dbPath,
      backup,
      ...result,
    };
  } finally {
    db.close();
  }
}
