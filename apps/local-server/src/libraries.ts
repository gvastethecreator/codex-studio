import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { getSettings } from './config';
import { getDb } from './db';
import { LIBRARY_FOLDERS } from './library';

export interface StudioLibrary {
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
    name: row.name,
    path: row.path,
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
  };
}

export function ensureLibraryStructure(libraryPath: string) {
  mkdirSync(libraryPath, { recursive: true });
  for (const folder of LIBRARY_FOLDERS) {
    mkdirSync(path.join(libraryPath, folder), { recursive: true });
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

export function registerLibrary(input: { name: string; path: string; isDefault?: boolean }) {
  const database = getDb();
  const absolutePath = path.resolve(input.path);
  ensureLibraryStructure(absolutePath);
  if (input.isDefault) {
    database.run('UPDATE libraries SET is_default = 0');
  }
  const row: StudioLibrary = {
    id: randomUUID(),
    name: input.name.trim() || 'Untitled Library',
    path: absolutePath,
    isDefault: Boolean(input.isDefault),
    createdAt: now(),
  };
  database
    .query('INSERT INTO libraries (id, name, path, is_default, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(row.id, row.name, row.path, row.isDefault ? 1 : 0, row.createdAt);
  return row;
}

export function listLibraries() {
  return getDb()
    .query('SELECT * FROM libraries ORDER BY is_default DESC, created_at ASC')
    .all()
    .map(mapLibrary);
}

export function getDefaultLibrary() {
  return ensureDefaultLibrary();
}

export function getLibrary(id: string) {
  const row = getDb().query('SELECT * FROM libraries WHERE id = ?').get(id);
  return row ? mapLibrary(row) : null;
}

export function setDefaultLibrary(id: string) {
  const database = getDb();
  const row = database.query('SELECT * FROM libraries WHERE id = ?').get(id);
  if (!row) return null;
  database.run('UPDATE libraries SET is_default = 0');
  database.query('UPDATE libraries SET is_default = 1 WHERE id = ?').run(id);
  return mapLibrary({ ...(row as any), is_default: 1 });
}

export function removeLibrary(id: string) {
  const library = getLibrary(id);
  if (!library || library.isDefault) return false;
  getDb().query('DELETE FROM libraries WHERE id = ?').run(id);
  return true;
}
