import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { getSettings, loadDotEnvLocal } from '../apps/local-server/src/config';
import { ensureLibrary } from '../apps/local-server/src/library';

interface MoveResult {
  from: string;
  to: string;
}

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');

function normalizeForCompare(value: string) {
  return path.resolve(value).toLowerCase();
}

function normalizeSlashes(value: string) {
  return value.replaceAll('\\', '/');
}

function uniqueTarget(filePath: string) {
  if (!existsSync(filePath)) return filePath;
  const parsed = path.parse(filePath);
  for (let index = 2; index < 1000; index += 1) {
    const candidate = path.join(parsed.dir, `${parsed.name}-${index}${parsed.ext}`);
    if (!existsSync(candidate)) return candidate;
  }
  return path.join(parsed.dir, `${parsed.name}-${Date.now()}${parsed.ext}`);
}

function moveFile(from: string, to: string, moves: MoveResult[]) {
  if (!existsSync(from)) return;
  const target = uniqueTarget(to);
  moves.push({ from, to: target });
  if (dryRun) return;
  mkdirSync(path.dirname(target), { recursive: true });
  renameSync(from, target);
}

function mergeDirectory(from: string, to: string, moves: MoveResult[]) {
  if (!existsSync(from)) return;
  if (!statSync(from).isDirectory()) {
    moveFile(from, to, moves);
    return;
  }

  if (!dryRun) mkdirSync(to, { recursive: true });

  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const sourcePath = path.join(from, entry.name);
    const targetPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      mergeDirectory(sourcePath, targetPath, moves);
      continue;
    }
    moveFile(sourcePath, targetPath, moves);
  }

  if (!dryRun) {
    try {
      rmSync(from, { recursive: true, force: true });
    } catch {
      // Best effort. Non-empty folders mean a concurrent process wrote during migration.
    }
  }
}

function publicUrlFor(libraryDir: string, filePath: string | null) {
  if (!filePath) return null;
  const relative = normalizeSlashes(path.relative(libraryDir, filePath));
  return `/library/${encodeURIComponent(relative).replaceAll('%2F', '/')}`;
}

function migrateAnyPath(value: string, pathMappings: { from: string; to: string }[]) {
  const normalizedValue = normalizeForCompare(value);
  const mapping = pathMappings.find((candidate) => {
    const from = normalizeForCompare(candidate.from);
    return normalizedValue === from || normalizedValue.startsWith(`${from}${path.sep}`);
  });

  if (!mapping) return value;
  const relative = path.relative(mapping.from, value);
  return path.join(mapping.to, relative);
}

function migrateJsonPaths(value: unknown, pathMappings: { from: string; to: string }[]): unknown {
  if (typeof value === 'string') {
    return migrateAnyPath(value, pathMappings);
  }
  if (Array.isArray(value)) {
    return value.map((item) => migrateJsonPaths(item, pathMappings));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, migrateJsonPaths(item, pathMappings)]),
    );
  }
  return value;
}

function updateDbPaths(
  libraryDir: string,
  dbPath: string,
  pathMappings: { from: string; to: string }[],
) {
  if (!existsSync(dbPath)) return { updatedRows: 0 };
  let updatedRows = 0;
  const db = new Database(dbPath);

  const assetRows = db.query('SELECT id, file_path, thumbnail_path FROM assets').all() as {
    id: string;
    file_path: string;
    thumbnail_path: string | null;
  }[];
  const updateAsset = db.query(
    'UPDATE assets SET file_path = ?, thumbnail_path = ?, public_url = ? WHERE id = ?',
  );
  for (const row of assetRows) {
    const filePath = migrateAnyPath(row.file_path, pathMappings);
    const thumbnailPath = row.thumbnail_path
      ? migrateAnyPath(row.thumbnail_path, pathMappings)
      : null;
    if (filePath === row.file_path && thumbnailPath === row.thumbnail_path) continue;
    updatedRows += 1;
    if (!dryRun)
      updateAsset.run(filePath, thumbnailPath, publicUrlFor(libraryDir, filePath), row.id);
  }

  const catalogRows = db
    .query('SELECT id, file_path, thumbnail_path FROM catalog_images')
    .all() as { id: string; file_path: string; thumbnail_path: string | null }[];
  const updateCatalog = db.query(
    'UPDATE catalog_images SET file_path = ?, thumbnail_path = ?, public_url = ?, thumbnail_url = ? WHERE id = ?',
  );
  for (const row of catalogRows) {
    const filePath = migrateAnyPath(row.file_path, pathMappings);
    const thumbnailPath = row.thumbnail_path
      ? migrateAnyPath(row.thumbnail_path, pathMappings)
      : null;
    if (filePath === row.file_path && thumbnailPath === row.thumbnail_path) continue;
    updatedRows += 1;
    if (!dryRun) {
      updateCatalog.run(
        filePath,
        thumbnailPath,
        publicUrlFor(libraryDir, filePath),
        publicUrlFor(libraryDir, thumbnailPath),
        row.id,
      );
    }
  }

  const turnRows = db
    .query('SELECT id, transcript_path FROM codex_turns WHERE transcript_path IS NOT NULL')
    .all() as { id: string; transcript_path: string }[];
  const updateTurn = db.query('UPDATE codex_turns SET transcript_path = ? WHERE id = ?');
  for (const row of turnRows) {
    const transcriptPath = migrateAnyPath(row.transcript_path, pathMappings);
    if (transcriptPath === row.transcript_path) continue;
    updatedRows += 1;
    if (!dryRun) updateTurn.run(transcriptPath, row.id);
  }

  const jobRows = db
    .query('SELECT id, source_spec_json FROM jobs WHERE source_spec_json IS NOT NULL')
    .all() as { id: string; source_spec_json: string }[];
  const updateJob = db.query('UPDATE jobs SET source_spec_json = ? WHERE id = ?');
  for (const row of jobRows) {
    try {
      const parsed = JSON.parse(row.source_spec_json);
      const migrated = JSON.stringify(migrateJsonPaths(parsed, pathMappings));
      if (migrated === row.source_spec_json) continue;
      updatedRows += 1;
      if (!dryRun) updateJob.run(migrated, row.id);
    } catch {
      // Leave corrupt historical JSON untouched.
    }
  }

  db.close();
  return { updatedRows };
}

loadDotEnvLocal();
ensureLibrary();

const { libraryDir } = getSettings();
const oldDbPath = path.join(libraryDir, 'library.sqlite');
const newDbPath = path.join(libraryDir, '.studio', 'studio.sqlite');
const backupDir = path.join(
  libraryDir,
  '.studio',
  'migration-backups',
  new Date().toISOString().replace(/[:.]/g, '-'),
);

const folderMappings = [
  ['assets', 'outputs'],
  ['thumbnails', path.join('outputs', 'thumbnails')],
  ['exports', path.join('outputs', 'exports')],
  ['references', path.join('.studio', 'references')],
  ['masks', path.join('.studio', 'masks')],
  ['transcripts', path.join('.studio', 'transcripts')],
  ['state', path.join('.studio', 'state')],
  ['logs', path.join('.studio', 'logs')],
  [path.join('.trash', 'assets'), path.join('outputs', '.trash', 'assets')],
  [path.join('.trash', 'thumbnails'), path.join('outputs', '.trash', 'thumbnails')],
  [path.join('.trash', 'transcripts'), path.join('.studio', '.trash', 'transcripts')],
] as const;

const pathMappings = [
  ...folderMappings.map(([from, to]) => ({
    from: path.join(libraryDir, from),
    to: path.join(libraryDir, to),
  })),
  { from: oldDbPath, to: newDbPath },
].sort((a, b) => b.from.length - a.from.length);

const moves: MoveResult[] = [];

if (existsSync(oldDbPath)) {
  if (existsSync(newDbPath)) {
    moveFile(newDbPath, path.join(backupDir, 'studio.sqlite'), moves);
    moveFile(`${newDbPath}-wal`, path.join(backupDir, 'studio.sqlite-wal'), moves);
    moveFile(`${newDbPath}-shm`, path.join(backupDir, 'studio.sqlite-shm'), moves);
  }
  moveFile(oldDbPath, newDbPath, moves);
  moveFile(`${oldDbPath}-wal`, `${newDbPath}-wal`, moves);
  moveFile(`${oldDbPath}-shm`, `${newDbPath}-shm`, moves);
}

for (const [from, to] of folderMappings) {
  mergeDirectory(path.join(libraryDir, from), path.join(libraryDir, to), moves);
}

for (const legacyRoot of ['.trash']) {
  const legacyPath = path.join(libraryDir, legacyRoot);
  if (!dryRun && existsSync(legacyPath) && readdirSync(legacyPath).length === 0) {
    rmSync(legacyPath, { recursive: true, force: true });
  }
}

const dbResult = updateDbPaths(libraryDir, newDbPath, pathMappings);

console.log(
  JSON.stringify(
    {
      ok: true,
      dryRun,
      libraryDir,
      moved: moves.length,
      updatedDbRows: dbResult.updatedRows,
      sampleMoves: moves.slice(0, 20),
    },
    null,
    2,
  ),
);
