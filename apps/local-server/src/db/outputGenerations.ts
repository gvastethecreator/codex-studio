import type { Database } from 'bun:sqlite';
import { getDb } from './connection';

/** A stable sequence shared by generated images and workflow exports. */
export function getOutputGeneration(ownerKey: string, db?: Database): number {
  const database = getDb(db);
  return database
    .transaction(() => {
      const existing = database
        .query('SELECT generation_number FROM output_generations WHERE owner_key = ?')
        .get(ownerKey) as { generation_number: number } | null;
      if (existing) return existing.generation_number;

      return Number(
        database.query('INSERT INTO output_generations (owner_key) VALUES (?)').run(ownerKey)
          .lastInsertRowid,
      );
    })
    .immediate();
}
