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
    id: String(row.id),
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
    promptPreview: createPromptPreview(
      nullableString(row.final_prompt_used) ?? nullableString(row.original_prompt),
    ),
  };
}

export function createJob(
  input: {
    id?: string;
    workspaceId?: string | null;
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
  const sourceSpec =
    withWorkspaceMetadata(input.sourceSpec ?? null, workspaceId) ?? input.sourceSpec ?? null;
  const recipeId =
    typeof sourceSpec?.recipeId === 'string' && sourceSpec.recipeId.trim()
      ? sourceSpec.recipeId
      : null;
  const batchId =
    sourceSpec?.metadata &&
    typeof sourceSpec.metadata === 'object' &&
    !Array.isArray(sourceSpec.metadata) &&
    typeof sourceSpec.metadata.batchId === 'string'
      ? sourceSpec.metadata.batchId
      : null;
  const aspectRatio =
    typeof sourceSpec?.output?.aspectRatio === 'string' ? sourceSpec.output.aspectRatio : null;
  const timestamp = now();

  const job: Job = {
    id: input.id ?? randomUUID(),
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
        error, created_at, updated_at, completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

export function requeueJob(id: string, db?: Database) {
  getDb(db)
    .query(
      "UPDATE jobs SET status = 'queued', error = NULL, updated_at = ?, completed_at = NULL WHERE id = ?",
    )
    .run(now(), id);
  return getJob(id, db);
}

export function getJob(id: string, db?: Database) {
  const row = getDb(db).query('SELECT * FROM jobs WHERE id = ?').get(id);
  return row ? mapJobRow(row as Record<string, unknown>) : null;
}

export function listJobSummariesFromDb(database: Database) {
  return database
    .query(
      `SELECT
         id, workspace_id, recipe_id, batch_id, aspect_ratio,
         kind, provider_id, status, execution_json,
         original_prompt, final_prompt_used, error,
         created_at, updated_at, completed_at
       FROM jobs
       ORDER BY created_at DESC
       LIMIT 100`,
    )
    .all()
    .map((row) => mapJobSummaryRow(row as Record<string, unknown>));
}

export function listJobSummaries(db?: Database) {
  return listJobSummariesFromDb(getDb(db));
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
