import type { Database } from 'bun:sqlite';
import { randomUUID } from 'node:crypto';

import type {
  GenerationProviderId,
  GenerationTaskSpec,
  Job,
  JobExecutionOptions,
  JobFinalization,
  JobFinalizationState,
  JobKind,
  JobLibraryContext,
  JobStatus,
  JobSummary,
  JobRemoteExecution,
  JobListPage,
  JobListQuery,
  JobCounts,
  JobAttemptRecord,
} from '../../../../packages/shared/src';
import {
  normalizeWorkspaceId,
  resolveJobWorkspaceId,
  withWorkspaceMetadata,
} from '../../../../packages/shared/src/workspaceContracts';
import { getDb } from './connection';
import { ensureDefaultWorkspaceRow } from './workspaces';

function now() {
  return new Date().toISOString();
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function nullableString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function createPromptPreview(value: string | null | undefined, limit = 160) {
  const text = (value ?? '').trim();
  if (text.length <= limit) return text;
  if (limit <= 3) return text.slice(0, limit);
  return `${text.slice(0, limit - 3).trimEnd()}...`;
}

function mapJobFinalization(row: Record<string, unknown>): JobFinalization | null {
  if (!row.finalization_state) return null;
  return {
    state: row.finalization_state as JobFinalizationState,
    sourcePath: nullableString(row.finalization_source_path),
    filePath: nullableString(row.finalization_file_path),
    assetId: nullableString(row.finalization_asset_id),
    catalogId: nullableString(row.finalization_catalog_id),
  };
}

export function mapJobRow(row: Record<string, unknown>): Job {
  const sourceSpec = parseJson<GenerationTaskSpec | null>(row.source_spec_json, null);
  const workspaceId = resolveJobWorkspaceId({
    columnWorkspaceId: nullableString(row.workspace_id),
    sourceSpecMetadata: sourceSpec?.metadata,
  });
  return {
    id: String(row.id),
    attempt: Number(row.attempt ?? 1),
    attemptQueuedAt: nullableString(row.attempt_queued_at) ?? undefined,
    workspaceId,
    recipeId: nullableString(row.recipe_id) ?? sourceSpec?.recipeId ?? null,
    batchId: nullableString(row.batch_id),
    aspectRatio: nullableString(row.aspect_ratio) ?? sourceSpec?.output?.aspectRatio ?? null,
    kind: row.kind as Job['kind'],
    providerId: row.provider_id as Job['providerId'],
    sourceSpec,
    status: row.status as Job['status'],
    execution: parseJson<JobExecutionOptions | null>(row.execution_json, null),
    libraryContext:
      typeof row.library_id === 'string' && typeof row.library_root === 'string'
        ? { libraryId: row.library_id, rootPath: row.library_root }
        : null,
    finalization: mapJobFinalization(row),
    remoteExecution: parseJson<JobRemoteExecution | null>(row.remote_execution_json, null),
    originalPrompt: String(row.original_prompt),
    expandedPrompt: nullableString(row.expanded_prompt),
    finalPromptUsed: String(row.final_prompt_used),
    error: nullableString(row.error),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    completedAt: nullableString(row.completed_at),
  };
}

export function mapJobSummaryRow(row: Record<string, unknown>): JobSummary {
  return {
    remoteExecution: parseJson<JobRemoteExecution | null>(row.remote_execution_json, null),
    id: String(row.id),
    attempt: Number(row.attempt ?? 1),
    attemptQueuedAt: nullableString(row.attempt_queued_at) ?? undefined,
    kind: row.kind as JobSummary['kind'],
    providerId: row.provider_id as JobSummary['providerId'],
    workspaceId: resolveJobWorkspaceId({
      columnWorkspaceId: nullableString(row.workspace_id),
    }),
    recipeId: nullableString(row.recipe_id),
    batchId: nullableString(row.batch_id),
    aspectRatio: nullableString(row.aspect_ratio),
    status: row.status as JobSummary['status'],
    execution: parseJson<JobExecutionOptions | null>(row.execution_json, null),
    error: nullableString(row.error),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    completedAt: nullableString(row.completed_at),
    promptPreview: createPromptPreview(nullableString(row.prompt_preview)),
  };
}

export function createJob(
  input: {
    id?: string;
    workspaceId?: string | null;
    batchId?: string | null;
    kind: JobKind;
    providerId?: GenerationProviderId | null;
    sourceSpec?: GenerationTaskSpec | null;
    prompt: string;
    execution?: JobExecutionOptions | null;
    libraryContext?: JobLibraryContext | null;
  },
  db?: Database,
) {
  const database = getDb(db);
  ensureDefaultWorkspaceRow(database);
  const workspaceId = normalizeWorkspaceId(input.workspaceId);
  const workspaceSpec =
    withWorkspaceMetadata(input.sourceSpec ?? null, workspaceId) ?? input.sourceSpec ?? null;
  const sourceSpec =
    workspaceSpec && input.batchId
      ? { ...workspaceSpec, metadata: { ...workspaceSpec.metadata, batchId: input.batchId } }
      : workspaceSpec;
  const recipeId =
    typeof sourceSpec?.recipeId === 'string' && sourceSpec.recipeId.trim()
      ? sourceSpec.recipeId
      : null;
  const batchId =
    input.batchId ??
    (sourceSpec?.metadata &&
    typeof sourceSpec.metadata === 'object' &&
    !Array.isArray(sourceSpec.metadata) &&
    typeof sourceSpec.metadata.batchId === 'string'
      ? sourceSpec.metadata.batchId
      : null);
  const aspectRatio =
    typeof sourceSpec?.output?.aspectRatio === 'string' ? sourceSpec.output.aspectRatio : null;
  const timestamp = now();

  const job: Job = {
    id: input.id ?? randomUUID(),
    attempt: 1,
    attemptQueuedAt: timestamp,
    workspaceId,
    recipeId,
    batchId,
    aspectRatio,
    kind: input.kind,
    providerId: input.providerId ?? null,
    sourceSpec,
    status: 'queued',
    execution: input.execution ?? null,
    libraryContext: input.libraryContext ?? null,
    finalization: null,
    originalPrompt: input.prompt,
    expandedPrompt: null,
    finalPromptUsed: input.prompt,
    error: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
  };
  database
    .query(`
      INSERT INTO jobs (
        id, workspace_id, recipe_id, batch_id, aspect_ratio,
        kind, provider_id, source_spec_json, status, execution_json,
        library_id, library_root, original_prompt, expanded_prompt, final_prompt_used,
        error, created_at, updated_at, completed_at, attempt_queued_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      job.id,
      job.workspaceId,
      job.recipeId ?? null,
      job.batchId ?? null,
      job.aspectRatio ?? null,
      job.kind,
      job.providerId,
      job.sourceSpec ? JSON.stringify(job.sourceSpec) : null,
      job.status,
      job.execution ? JSON.stringify(job.execution) : null,
      job.libraryContext?.libraryId ?? null,
      job.libraryContext?.rootPath ?? null,
      job.originalPrompt,
      job.expandedPrompt,
      job.finalPromptUsed,
      job.error,
      job.createdAt,
      job.updatedAt,
      job.completedAt,
      timestamp,
    );
  return job;
}

export function updateJobFinalPrompt(id: string, finalPrompt: string, db?: Database) {
  getDb(db)
    .query('UPDATE jobs SET final_prompt_used = ?, updated_at = ? WHERE id = ?')
    .run(finalPrompt, now(), id);
  return getJob(id, db);
}

export function updateJobStatus(
  id: string,
  status: JobStatus,
  error: string | null = null,
  db?: Database,
) {
  const completedAt =
    status === 'completed' || status === 'failed' || status === 'cancelled' ? now() : null;
  getDb(db)
    .query(
      'UPDATE jobs SET status = ?, error = ?, updated_at = ?, completed_at = COALESCE(?, completed_at) WHERE id = ?',
    )
    .run(status, error, now(), completedAt, id);
  return getJob(id, db);
}

export function updateJobFinalization(id: string, finalization: JobFinalization, db?: Database) {
  getDb(db)
    .query(
      `UPDATE jobs
       SET finalization_state = ?, finalization_source_path = ?, finalization_file_path = ?,
           finalization_asset_id = ?, finalization_catalog_id = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(
      finalization.state,
      finalization.sourcePath,
      finalization.filePath,
      finalization.assetId,
      finalization.catalogId,
      now(),
      id,
    );
  return getJob(id, db);
}

export function requeueJob(
  id: string,
  db?: Database,
  expected?: { attempt: number; status: JobStatus },
) {
  const database = getDb(db);
  return database.transaction(() => {
    const previous = getJob(id, database);
    if (!previous || !['failed', 'cancelled', 'needs_review'].includes(previous.status))
      return null;
    if (expected && (previous.status !== expected.status || previous.attempt !== expected.attempt))
      return null;
    const resume = previous.status === 'needs_review';
    if (!resume) {
      const eventEnd = database
        .query('SELECT COALESCE(MAX(id), 0) AS id FROM job_events WHERE job_id = ?')
        .get(id) as { id: number };
      database
        .query(`INSERT INTO job_attempts (job_id, attempt, queued_at, archived_at, event_end_id, job_json)
        VALUES (?, ?, ?, ?, ?, ?)`)
        .run(
          id,
          previous.attempt ?? 1,
          previous.attemptQueuedAt ?? null,
          now(),
          eventEnd.id,
          JSON.stringify(previous),
        );
    }
    const result = database
      .query(
        `UPDATE jobs SET status = 'queued', error = NULL, updated_at = ?, completed_at = NULL,
       attempt = attempt + ?, attempt_queued_at = CASE WHEN ? = 1 THEN ? ELSE attempt_queued_at END,
       remote_execution_json = CASE WHEN json_extract(remote_execution_json, '$.phase') IN ('failed', 'cancelled')
         THEN NULL ELSE remote_execution_json END
       WHERE id = ? AND status IN ('failed', 'cancelled', 'needs_review')`,
      )
      .run(now(), resume ? 0 : 1, resume ? 0 : 1, now(), id);
    if (result.changes !== 1) return null;
    return getJob(id, database);
  })();
}

export function listJobAttempts(id: string, db?: Database): JobAttemptRecord[] {
  return (
    getDb(db)
      .query('SELECT * FROM job_attempts WHERE job_id = ? ORDER BY attempt')
      .all(id) as Array<Record<string, unknown>>
  ).map((row) => ({
    attempt: Number(row.attempt),
    queuedAt: nullableString(row.queued_at),
    archivedAt: String(row.archived_at),
    eventEndId: Number(row.event_end_id),
    job: JSON.parse(String(row.job_json)) as Job,
  }));
}

export function updateJobRemoteExecution(
  id: string,
  checkpoint: JobRemoteExecution,
  db?: Database,
) {
  const result = getDb(db)
    .query('UPDATE jobs SET remote_execution_json = ?, updated_at = ? WHERE id = ?')
    .run(JSON.stringify(checkpoint), now(), id);
  if (result.changes !== 1) throw new Error('Could not persist remote execution identity.');
}

export function getJob(id: string, db?: Database) {
  const row = getDb(db).query('SELECT * FROM jobs WHERE id = ?').get(id);
  return row ? mapJobRow(row as Record<string, unknown>) : null;
}

export function getJobStatus(id: string, db?: Database) {
  const row = getDb(db)
    .query('SELECT id, status, error, updated_at FROM jobs WHERE id = ?')
    .get(id) as {
    id: string;
    status: Job['status'];
    error: string | null;
    updated_at: string;
  } | null;
  return row && { id: row.id, status: row.status, error: row.error, updatedAt: row.updated_at };
}

export const JOB_SUMMARY_COLUMNS = `id, attempt, attempt_queued_at, workspace_id, recipe_id, batch_id, aspect_ratio,
  kind, provider_id, status, execution_json, remote_execution_json,
  substr(COALESCE(NULLIF(trim(final_prompt_used), ''), original_prompt, ''), 1, 160) AS prompt_preview,
  error, created_at, updated_at, completed_at`;
const OPEN_JOB_SQL = "status IN ('queued', 'running', 'needs_review')";
const TERMINAL_JOB_SQL = "status IN ('completed', 'failed', 'cancelled')";

function decodeJobHistoryCursor(cursor: string) {
  let value: unknown;
  try {
    value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Invalid job history cursor.');
  }
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    typeof value[0] !== 'string' ||
    !Number.isFinite(Date.parse(value[0])) ||
    typeof value[1] !== 'string' ||
    value[1].length === 0
  ) {
    throw new Error('Invalid job history cursor.');
  }
  return value as [string, string];
}

export function listJobSummariesFromDb(database: Database, query: JobListQuery = {}): JobListPage {
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const cursor = query.cursor ? decodeJobHistoryCursor(query.cursor) : null;
  const scope = query.workspaceId ? 'workspace_id = ?' : '1 = 1';
  const params: Array<string | number> = query.workspaceId ? [query.workspaceId] : [];
  return database.transaction(() => {
    const counts: JobCounts = {
      queued: 0,
      running: 0,
      needs_review: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      open: 0,
      history: 0,
      total: 0,
    };
    const grouped = database
      .query(`SELECT status, COUNT(*) AS count FROM jobs WHERE ${scope} GROUP BY status`)
      .all(...params) as Array<{ status: JobStatus; count: number }>;
    for (const row of grouped) counts[row.status] = row.count;
    counts.open = counts.queued + counts.running + counts.needs_review;
    counts.history = query.status
      ? counts[query.status]
      : counts.completed + counts.failed + counts.cancelled;
    counts.total = counts.open + counts.history;
    const open = database
      .query(
        `SELECT ${JOB_SUMMARY_COLUMNS} FROM jobs WHERE ${scope} AND ${OPEN_JOB_SQL} ORDER BY created_at DESC, id DESC`,
      )
      .all(...params);
    const historyWhere = `${scope} AND ${query.status ? 'status = ?' : TERMINAL_JOB_SQL}`;
    const historyParams = query.status ? [...params, query.status] : [...params];
    if (cursor) historyParams.push(cursor[0], cursor[0], cursor[1]);
    const history = database
      .query(`SELECT ${JOB_SUMMARY_COLUMNS} FROM jobs WHERE ${historyWhere}
      ${cursor ? 'AND (created_at < ? OR (created_at = ? AND id < ?))' : ''}
      ORDER BY created_at DESC, id DESC LIMIT ?`)
      .all(...historyParams, limit + 1)
      .map((row) => mapJobSummaryRow(row as Record<string, unknown>));
    const hasMore = history.length > limit;
    history.length = Math.min(limit, history.length);
    const last = history.at(-1);
    const global = database
      .query(`SELECT COUNT(*) AS count FROM jobs WHERE ${OPEN_JOB_SQL}`)
      .get() as { count: number };
    const workspaces = database
      .query(`SELECT DISTINCT jobs.workspace_id AS id, COALESCE(workspaces.name, jobs.workspace_id) AS name
      FROM jobs LEFT JOIN workspaces ON jobs.workspace_id = workspaces.id ORDER BY name, jobs.workspace_id`)
      .all() as Array<{ id: string; name: string }>;
    return {
      open: open.map((row) => mapJobSummaryRow(row as Record<string, unknown>)),
      history,
      counts,
      globalOpenCount: global.count,
      workspaces,
      nextCursor:
        hasMore && last
          ? Buffer.from(JSON.stringify([last.createdAt, last.id])).toString('base64url')
          : null,
    };
  })();
}

export function listJobSummaries(query: JobListQuery = {}, db?: Database) {
  return listJobSummariesFromDb(getDb(db), query);
}

export function listRecoverableJobs(db?: Database) {
  return getDb(db)
    .query(`
      SELECT
        jobs.*,
        assets.id AS recovery_asset_id,
        assets.file_path AS recovery_asset_path,
        catalog_images.id AS recovery_catalog_id
      FROM jobs
      LEFT JOIN assets
        ON assets.id = (
          SELECT candidate_asset.id
          FROM assets AS candidate_asset
          WHERE candidate_asset.job_id = jobs.id
            AND candidate_asset.deleted_at IS NULL
          ORDER BY candidate_asset.created_at ASC
          LIMIT 1
        )
      LEFT JOIN catalog_images
        ON catalog_images.id = (
          SELECT candidate_catalog.id
          FROM catalog_images AS candidate_catalog
          WHERE candidate_catalog.job_id = jobs.id
            AND candidate_catalog.file_path = assets.file_path
          ORDER BY candidate_catalog.created_at ASC
          LIMIT 1
        )
      WHERE jobs.status IN ('queued', 'running')
      ORDER BY jobs.created_at ASC
    `)
    .all()
    .map((rawRow) => {
      const row = rawRow as Record<string, unknown>;
      const job = mapJobRow(row);
      const recoveryAssetId = nullableString(row.recovery_asset_id);
      const recoveryAssetPath = nullableString(row.recovery_asset_path);
      if (!job.finalization && recoveryAssetId && recoveryAssetPath) {
        job.finalization = {
          state: row.recovery_catalog_id ? 'catalog_recorded' : 'asset_recorded',
          sourcePath: recoveryAssetPath,
          filePath: recoveryAssetPath,
          assetId: recoveryAssetId,
          catalogId: nullableString(row.recovery_catalog_id),
        };
      }
      return job;
    });
}
