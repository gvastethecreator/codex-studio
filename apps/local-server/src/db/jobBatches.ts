import type { Database } from 'bun:sqlite';
import type {
  JobBatchDetail,
  JobBatchSummary,
  RetryJobBatchRequest,
} from '../../../../packages/shared/src';
import {
  canRetryFailedBatchItem,
  summarizeJobBatch,
} from '../../../../packages/shared/src/jobBatches';
import type { PreparedPersistentJob } from '../persistentJobIntake';
import { getDb } from './connection';
import {
  createJob,
  getJob,
  mapJobRow,
  mapJobSummaryRow,
  requeueJob,
  updateJobFinalPrompt,
  JOB_SUMMARY_COLUMNS,
} from './jobs';

export class BatchRequestConflictError extends Error {}
type BatchRow = {
  id: string;
  request_hash: string;
  workspace_id: string;
  requested_count: number;
  created_at: string;
};

function readBatch(id: string, db: Database) {
  return db.query('SELECT * FROM job_batches WHERE id = ?').get(id) as BatchRow | null;
}
function readBatchJobs(id: string, db: Database) {
  return db
    .query(
      'SELECT jobs.* FROM job_batch_members m JOIN jobs ON jobs.id = m.job_id WHERE m.batch_id = ? ORDER BY m.position',
    )
    .all(id)
    .map((row) => mapJobRow(row as Record<string, unknown>));
}
function header(row: BatchRow) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    requestedCount: row.requested_count,
    createdAt: row.created_at,
  };
}
export function getJobBatch(id: string, db?: Database): JobBatchDetail | null {
  const database = getDb(db);
  return database.transaction(() => {
    const row = readBatch(id, database);
    if (!row) return null;
    const jobs = readBatchJobs(id, database);
    return { ...summarizeJobBatch(header(row), jobs), jobs };
  })();
}
export function getJobBatchSummary(id: string, db?: Database): JobBatchSummary | null {
  const database = getDb(db);
  return database.transaction(() => {
    const row = readBatch(id, database);
    if (!row) return null;
    const jobs = database
      .query(
        `SELECT ${JOB_SUMMARY_COLUMNS} FROM jobs WHERE id IN (SELECT job_id FROM job_batch_members WHERE batch_id = ?)`,
      )
      .all(id)
      .map((job) => mapJobSummaryRow(job as Record<string, unknown>));
    return summarizeJobBatch(header(row), jobs);
  })();
}
export function findAcceptedJobBatch(id: string, hash: string, db?: Database) {
  const database = getDb(db);
  const row = readBatch(id, database);
  if (!row) return null;
  if (row.request_hash !== hash)
    throw new BatchRequestConflictError(
      'This request identity was already used for a different batch.',
    );
  return getJobBatch(id, database);
}
export function createJobBatch(
  id: string,
  hash: string,
  items: PreparedPersistentJob[],
  db?: Database,
) {
  const database = getDb(db);
  return database.transaction(() => {
    const existing = findAcceptedJobBatch(id, hash, database);
    if (existing) return { batch: existing, created: false };
    if (
      !items.length ||
      items.some((item) => item.input.workspaceId !== items[0].input.workspaceId)
    )
      throw new BatchRequestConflictError('Every batch item must belong to the same workspace.');
    database
      .query(
        'INSERT INTO job_batches (id, request_hash, workspace_id, requested_count, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .run(
        id,
        hash,
        items[0].input.workspaceId ?? 'default',
        items.length,
        new Date().toISOString(),
      );
    items.forEach(({ input, finalPrompt }, position) => {
      const job = createJob({ ...input, batchId: id }, database);
      if (finalPrompt !== input.prompt) updateJobFinalPrompt(job.id, finalPrompt, database);
      database
        .query('INSERT INTO job_batch_members (batch_id, job_id, position) VALUES (?, ?, ?)')
        .run(id, job.id, position);
    });
    return { batch: getJobBatch(id, database)!, created: true };
  })();
}
export function retryFailedJobBatch(
  id: string,
  request: RetryJobBatchRequest,
  hash: string,
  db?: Database,
) {
  const database = getDb(db);
  return database.transaction(() => {
    const batch = getJobBatch(id, database);
    if (!batch) return null;
    const receipt = database
      .query('SELECT * FROM job_batch_retries WHERE request_id = ?')
      .get(request.requestId) as { batch_id: string; request_hash: string } | null;
    if (receipt) {
      if (receipt.batch_id !== id || receipt.request_hash !== hash)
        throw new BatchRequestConflictError(
          'This retry identity was already used for a different request.',
        );
      return { batch, queued: [] };
    }
    if (request.items.some((item) => !batch.jobs.some((job) => job.id === item.jobId)))
      throw new BatchRequestConflictError('A retry item does not belong to this batch.');
    const queued = request.items.flatMap((item) => {
      const job = getJob(item.jobId, database);
      if (!job || !canRetryFailedBatchItem(job) || job.attempt !== item.attempt) return [];
      const next = requeueJob(job.id, database, { status: 'failed', attempt: item.attempt });
      return next ? [next] : [];
    });
    database
      .query(
        'INSERT INTO job_batch_retries (request_id, batch_id, request_hash, job_ids_json) VALUES (?, ?, ?, ?)',
      )
      .run(request.requestId, id, hash, JSON.stringify(queued.map((job) => job.id)));
    return { batch: getJobBatch(id, database)!, queued };
  })();
}

export const jobBatchStore = {
  getJobBatch,
  getJobBatchSummary,
  findAcceptedJobBatch,
  createJobBatch,
  retryFailedJobBatch,
};
export type JobBatchStore = typeof jobBatchStore;
