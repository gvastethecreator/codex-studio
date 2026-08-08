import type { Database } from 'bun:sqlite';
import { randomUUID } from 'node:crypto';

import type { CodexTurnRecord } from '../../../../packages/shared/src';
import { getDb } from './connection';

function mapCodexTurn(row: Record<string, unknown>): CodexTurnRecord {
  return {
    id: String(row.id),
    jobId: String(row.job_id),
    codexThreadId: typeof row.codex_thread_id === 'string' ? row.codex_thread_id : null,
    codexTurnId: typeof row.codex_turn_id === 'string' ? row.codex_turn_id : null,
    transcriptPath: typeof row.transcript_path === 'string' ? row.transcript_path : null,
    status: String(row.status),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function getCodexTurnByJobId(jobId: string, db?: Database) {
  const row = getDb(db)
    .query('SELECT * FROM codex_turns WHERE job_id = ? ORDER BY updated_at DESC LIMIT 1')
    .get(jobId);
  return row ? mapCodexTurn(row as Record<string, unknown>) : null;
}

export function upsertCodexTurn(
  input: {
    id?: string;
    jobId: string;
    codexThreadId?: string | null;
    codexTurnId?: string | null;
    transcriptPath?: string | null;
    status: string;
  },
  db?: Database,
) {
  const id = input.id || randomUUID();
  const timestamp = new Date().toISOString();
  getDb(db)
    .query(`
      INSERT INTO codex_turns (id, job_id, codex_thread_id, codex_turn_id, transcript_path, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        codex_thread_id = excluded.codex_thread_id,
        codex_turn_id = excluded.codex_turn_id,
        transcript_path = excluded.transcript_path,
        status = excluded.status,
        updated_at = excluded.updated_at
    `)
    .run(
      id,
      input.jobId,
      input.codexThreadId ?? null,
      input.codexTurnId ?? null,
      input.transcriptPath ?? null,
      input.status,
      timestamp,
      timestamp,
    );
  return id;
}
