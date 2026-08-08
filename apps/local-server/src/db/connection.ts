import type { Database } from 'bun:sqlite';
import { createRequire } from 'node:module';

import { resolveLibraryPath } from '../library';

let defaultDb: Database | null = null;
const runtimeRequire = createRequire(import.meta.url);

export function getDb(db?: Database) {
  if (db) return db;
  if (!defaultDb) {
    const { Database: DatabaseConstructor } = runtimeRequire(
      'bun:sqlite',
    ) as typeof import('bun:sqlite');
    defaultDb = new DatabaseConstructor(resolveLibraryPath('library.sqlite'));
    defaultDb.run('PRAGMA journal_mode = WAL');
    defaultDb.run('PRAGMA foreign_keys = ON');
  }
  return defaultDb;
}

export function closeDb(db?: Database) {
  const target = db ?? defaultDb;
  if (!target) return;

  try {
    target.close();
  } catch {
    // Best effort; reset flows can recreate the database afterwards.
  } finally {
    if (!db) defaultDb = null;
  }
}
