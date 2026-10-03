import { randomUUID } from 'node:crypto';
import { mkdirSync, existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { getSettings } from './config';
import { getDb } from './db/connection';
import { LIBRARY_FOLDERS, resolveLibraryPathFromRoot, resolvePublicLibraryPath } from './library';
import { isAbsolutePlatformPath } from './platformHome';

export interface StudioLibrary {
  kind?: 'library' | 'output';
  id: string;
  name: string;
  path: string;
  isDefault: boolean;
  createdAt: string;
}

function now() {
  return new Date().toISOString();
}

function mapLibrary(row: any): StudioLibrary {
  return {
    id: row.id,
    kind: row.kind ?? 'library',
    name: row.name,
    path: row.path,
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
  };
}

function ensureLibraryStructure(libraryPath: string) {
  mkdirSync(libraryPath, { recursive: true });
  for (const folder of LIBRARY_FOLDERS) {
    mkdirSync(resolveLibraryPathFromRoot(libraryPath, folder), { recursive: true });
  }
}

export function ensureDefaultLibrary() {
  const database = getDb();
  const existing = database.query('SELECT * FROM libraries WHERE is_default = 1 LIMIT 1').get();
  if (existing) return mapLibrary(existing);

  const configuredPath = getSettings().libraryDir;
  const byPath = database
    .query('SELECT * FROM libraries WHERE path = ? LIMIT 1')
    .get(configuredPath);
  if (byPath) {
    database.run('UPDATE libraries SET is_default = 0');
    database.query('UPDATE libraries SET is_default = 1 WHERE id = ?').run((byPath as any).id);
    return mapLibrary({ ...(byPath as any), is_default: 1 });
  }

  return registerLibrary({ name: 'Default Studio Library', path: configuredPath, isDefault: true });
}

export function registerLibrary(input: {
  name: string;
  path: string;
  isDefault?: boolean;
  outputOnly?: boolean;
}) {
  if (!isAbsolutePlatformPath(input.path)) {
    throw new Error('Choose an absolute library directory for this operating system.');
  }
  const database = getDb();
  const absolutePath = path.resolve(input.path);
  if (input.outputOnly) mkdirSync(absolutePath, { recursive: true });
  else ensureLibraryStructure(absolutePath);
  if (input.isDefault) {
    database.run('UPDATE libraries SET is_default = 0');
  }
  const row: StudioLibrary = {
    id: randomUUID(),
    kind: input.outputOnly ? 'output' : 'library',
    name: input.name.trim() || 'Untitled Library',
    path: absolutePath,
    isDefault: Boolean(input.isDefault),
    createdAt: now(),
  };
  database
    .query(
      'INSERT INTO libraries (id, name, path, is_default, created_at, kind) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(row.id, row.name, row.path, row.isDefault ? 1 : 0, row.createdAt, row.kind ?? 'library');
  return row;
}

export function listLibraries() {
  return getDb()
    .query('SELECT * FROM libraries ORDER BY is_default DESC, created_at ASC')
    .all()
    .map(mapLibrary);
}

/** Register a write destination without creating database or cache folders inside it. */
export function registerOutputDirectory(directory: string) {
  if (!isAbsolutePlatformPath(directory)) throw new Error('Choose an absolute output directory.');
  const absolutePath = path.resolve(directory);
  const existing = listLibraries().find(
    (library) => path.relative(path.resolve(library.path), absolutePath) === '',
  );
  return (
    existing ??
    registerLibrary({
      name: `Output · ${path.basename(absolutePath)}`,
      path: absolutePath,
      outputOnly: true,
    })
  );
}

export function getDefaultLibrary() {
  return ensureDefaultLibrary();
}

export function getLibrary(id: string) {
  const row = getDb().query('SELECT * FROM libraries WHERE id = ?').get(id);
  return row ? mapLibrary(row) : null;
}

export function getLibraryForFilePath(filePath: string) {
  return (
    listLibraries()
      .sort((a, b) => b.path.length - a.path.length)
      .find((library) => {
        const relative = path.relative(library.path, filePath);
        return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
      }) ?? null
  );
}

export function resolvePublicLibraryAssetRequest(relativePath: string) {
  const normalized = relativePath.replaceAll('\\', '/').replace(/^\/+/, '');
  const [possibleLibraryId, ...rest] = normalized.split('/');
  const library = possibleLibraryId ? getLibrary(possibleLibraryId) : null;
  if (!library) {
    return {
      filePath: resolvePublicLibraryPath(normalized),
      assetRelativePath: normalized,
    };
  }

  const assetRelativePath = rest.join('/');
  if (
    library.kind === 'output' &&
    (rest.some((segment) => segment.startsWith('.')) ||
      !/\.(png|webp|jpe?g|gif|avif|svg|json|zip)$/i.test(assetRelativePath))
  )
    return null;
  const filePath = path.resolve(library.path, assetRelativePath);
  const root = existsSync(library.path) ? realpathSync(library.path) : library.path;
  const relative = path.relative(root, existsSync(filePath) ? realpathSync(filePath) : filePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return {
    filePath,
    assetRelativePath:
      library.kind === 'output' ? `outputs/${assetRelativePath}` : assetRelativePath,
  };
}

export function setDefaultLibrary(id: string) {
  const database = getDb();
  const row = database.query('SELECT * FROM libraries WHERE id = ?').get(id);
  if (!row || (row as { kind?: string }).kind === 'output') return null;
  database.run('UPDATE libraries SET is_default = 0');
  database.query('UPDATE libraries SET is_default = 1 WHERE id = ?').run(id);
  return mapLibrary({ ...(row as any), is_default: 1 });
}

export function removeLibrary(id: string) {
  const library = getLibrary(id);
  if (!library || library.isDefault || library.kind === 'output') return false;
  getDb().query('DELETE FROM libraries WHERE id = ?').run(id);
  return true;
}
