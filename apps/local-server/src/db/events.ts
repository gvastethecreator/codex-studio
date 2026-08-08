import type { Database } from 'bun:sqlite';

import type { JobEventRecord, SystemLog } from '../../../../packages/shared/src';
import { getDb } from './connection';

function parseMetadata(value: unknown) {
  if (typeof value !== 'string' || !value) return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function mapLog(row: Record<string, unknown>): SystemLog {
  return {
    id: Number(row.id),
    level: row.level as SystemLog['level'],
    scope: String(row.scope),
    message: String(row.message),
    jobId: typeof row.job_id === 'string' ? row.job_id : null,
    createdAt: String(row.created_at),
  };
}

function mapJobEvent(row: Record<string, unknown>): JobEventRecord {
  return {
    id: Number(row.id),
    jobId: typeof row.job_id === 'string' ? row.job_id : null,
    type: String(row.type),
    message: String(row.message),
    metadata: parseMetadata(row.metadata),
    createdAt: String(row.created_at),
  };
}

export function addJobEvent(
  jobId: string,
  type: string,
  message: string,
  metadata?: unknown,
  db?: Database,
) {
  getDb(db)
    .query(
      'INSERT INTO job_events (job_id, type, message, metadata, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    .run(
      jobId,
      type,
      message,
      metadata ? JSON.stringify(metadata) : null,
      new Date().toISOString(),
    );
}

export function addSystemLog(
  input: {
    level: SystemLog['level'];
    scope: string;
    message: string;
    jobId?: string | null;
  },
  db?: Database,
) {
  const database = getDb(db);
  const result = database
    .query(
      'INSERT INTO system_logs (level, scope, message, job_id, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    .run(input.level, input.scope, input.message, input.jobId ?? null, new Date().toISOString());
  const row = database
    .query('SELECT * FROM system_logs WHERE id = ?')
    .get(Number(result.lastInsertRowid));
  pruneSystemLogs(undefined, db);
  return row ? mapLog(row as Record<string, unknown>) : null;
}

export function pruneSystemLogs(options: { maxRows?: number } = {}, db?: Database) {
  const maxRows = Math.max(
    300,
    Math.floor(options.maxRows ?? Number(process.env.STUDIO_SYSTEM_LOG_RETENTION_ROWS || 5000)),
  );
  getDb(db)
    .query(
      `DELETE FROM system_logs
       WHERE id NOT IN (SELECT id FROM system_logs ORDER BY id DESC LIMIT ?)`,
    )
    .run(maxRows);
}

export function listLogs(db?: Database) {
  return getDb(db)
    .query('SELECT * FROM system_logs ORDER BY id DESC LIMIT 300')
    .all()
    .map((row) => mapLog(row as Record<string, unknown>));
}

export function listJobEvents(jobId: string, db?: Database) {
  return getDb(db)
    .query('SELECT * FROM job_events WHERE job_id = ? ORDER BY id ASC')
    .all(jobId)
    .map((row) => mapJobEvent(row as Record<string, unknown>));
}
