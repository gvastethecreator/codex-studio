import type { Database } from 'bun:sqlite';

import { getDb } from './connection';

export function getSettingValue(key: string, db?: Database): string | null {
  const row = getDb(db).query('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | null
    | undefined;
  return row?.value ?? null;
}

export function setSettingValue(
  key: string,
  value: string,
  updatedAt = new Date().toISOString(),
  db?: Database,
) {
  getDb(db)
    .query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`,
    )
    .run(key, value, updatedAt);
}
