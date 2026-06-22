import { Database } from 'bun:sqlite';
import { randomUUID } from 'node:crypto';
import { resolveLibraryPath } from './library';
import type {
  Asset,
  CodexTurnRecord,
  Job,
  JobEventRecord,
  JobExecutionOptions,
  JobKind,
  JobSummary,
  JobStatus,
  GenerationProviderId,
  GenerationTaskSpec,
  Project,
  SystemLog,
} from '../../../packages/shared/src';

let defaultDb: Database | null = null;

function now() {
  return new Date().toISOString();
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function createPromptPreview(value: string | null | undefined, limit = 500) {
  const text = (value ?? '').trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 1)).trimEnd()}...`;
}

function ensureColumn(
  database: Database,
  tableName: string,
  columnName: string,
  definition: string,
) {
  const columns = database.query(`PRAGMA table_info(${tableName})`).all() as { name: string }[];
  if (!columns.some((column) => column.name === columnName)) {
    database.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

export function getDb(db?: Database) {
  if (db) return db;
  if (!defaultDb) {
    defaultDb = new Database(resolveLibraryPath('library.sqlite'));
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
    if (!db) {
      defaultDb = null;
    }
  }
}

export function migrateDatabase(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id),
      kind TEXT NOT NULL,
      provider_id TEXT,
      source_spec_json TEXT,
      status TEXT NOT NULL,
      execution_json TEXT,
      original_prompt TEXT NOT NULL,
      expanded_prompt TEXT,
      final_prompt_used TEXT NOT NULL,
      error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id),
      job_id TEXT NOT NULL REFERENCES jobs(id),
      file_path TEXT NOT NULL,
      thumbnail_path TEXT,
      public_url TEXT NOT NULL,
      prompt TEXT NOT NULL,
      width INTEGER,
      height INTEGER,
      mime_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      deleted_at TEXT
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS libraries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      is_default INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS catalog_images (
      id TEXT PRIMARY KEY,
      library_id TEXT NOT NULL REFERENCES libraries(id),
      file_path TEXT NOT NULL,
      thumbnail_path TEXT,
      public_url TEXT NOT NULL,
      thumbnail_url TEXT,
      prompt TEXT,
      negative_prompt TEXT,
      aspect_ratio TEXT,
      image_size TEXT,
      width INTEGER,
      height INTEGER,
      mime_type TEXT NOT NULL,
      file_size_bytes INTEGER,
      job_id TEXT REFERENCES jobs(id),
      workspace_id TEXT,
      batch_id TEXT,
      recipe_id TEXT,
      is_favorite INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      deleted_at TEXT,
      tags TEXT DEFAULT '[]',
      generation_config TEXT,
      created_at TEXT NOT NULL
    )
  `);
  database.run('CREATE INDEX IF NOT EXISTS idx_catalog_library ON catalog_images(library_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_catalog_workspace ON catalog_images(workspace_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_catalog_job ON catalog_images(job_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_catalog_favorite ON catalog_images(is_favorite)');
  database.run('CREATE INDEX IF NOT EXISTS idx_catalog_deleted ON catalog_images(is_deleted)');
  database.run('CREATE INDEX IF NOT EXISTS idx_catalog_created ON catalog_images(created_at)');
  database.run(
    'CREATE INDEX IF NOT EXISTS idx_catalog_deleted_created_desc ON catalog_images(is_deleted, created_at DESC)',
  );
  database.run(
    "CREATE INDEX IF NOT EXISTS idx_catalog_workspace_key_deleted_created_desc ON catalog_images(COALESCE(workspace_id, 'default'), is_deleted, created_at DESC)",
  );
  database.run(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      library_id TEXT REFERENCES libraries(id),
      filter_json TEXT,
      sort_order TEXT DEFAULT 'newest',
      created_at TEXT NOT NULL
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS codex_threads (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id),
      codex_thread_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS codex_turns (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id),
      codex_thread_id TEXT,
      codex_turn_id TEXT,
      transcript_path TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS job_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT REFERENCES jobs(id),
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL,
      scope TEXT NOT NULL,
      message TEXT NOT NULL,
      job_id TEXT,
      created_at TEXT NOT NULL
    )
  `);
  ensureColumn(database, 'jobs', 'execution_json', 'TEXT');
  ensureColumn(database, 'jobs', 'provider_id', 'TEXT');
  ensureColumn(database, 'jobs', 'source_spec_json', 'TEXT');
  database.run('CREATE INDEX IF NOT EXISTS idx_jobs_created_desc ON jobs(created_at DESC)');
  database.run('CREATE INDEX IF NOT EXISTS idx_job_events_job_id_id ON job_events(job_id, id)');
  database.run(
    'CREATE INDEX IF NOT EXISTS idx_codex_turns_job_updated_desc ON codex_turns(job_id, updated_at DESC)',
  );
}

export function migrateDb(db?: Database) {
  migrateDatabase(getDb(db));
}

export function getSettingValue(key: string, db?: Database): string | null {
  const row = getDb(db).query('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | null
    | undefined;
  return row?.value ?? null;
}

export function setSettingValue(key: string, value: string, updatedAt = now(), db?: Database) {
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

function mapProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapJob(row: any): Job {
  return {
    id: row.id,
    projectId: row.project_id,
    kind: row.kind,
    providerId: row.provider_id,
    sourceSpec: parseJson<GenerationTaskSpec | null>(row.source_spec_json, null),
    status: row.status,
    execution: parseJson<JobExecutionOptions | null>(row.execution_json, null),
    originalPrompt: row.original_prompt,
    expandedPrompt: row.expanded_prompt,
    finalPromptUsed: row.final_prompt_used,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

function mapJobSummary(row: any): JobSummary {
  return {
    id: row.id,
    projectId: row.project_id,
    kind: row.kind,
    providerId: row.provider_id,
    sourceSpec: null,
    status: row.status,
    execution: parseJson<JobExecutionOptions | null>(row.execution_json, null),
    originalPrompt: createPromptPreview(row.original_prompt),
    expandedPrompt: row.expanded_prompt ? createPromptPreview(row.expanded_prompt) : null,
    finalPromptUsed: createPromptPreview(row.final_prompt_used),
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    promptPreview: createPromptPreview(row.final_prompt_used || row.original_prompt),
  };
}

function mapAsset(row: any): Asset {
  return {
    id: row.id,
    projectId: row.project_id,
    jobId: row.job_id,
    filePath: row.file_path,
    thumbnailPath: row.thumbnail_path,
    publicUrl: row.public_url,
    prompt: row.prompt,
    width: row.width,
    height: row.height,
    mimeType: row.mime_type,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

function mapLog(row: any): SystemLog {
  return {
    id: row.id,
    level: row.level,
    scope: row.scope,
    message: row.message,
    jobId: row.job_id,
    createdAt: row.created_at,
  };
}

function mapJobEvent(row: any): JobEventRecord {
  return {
    id: row.id,
    jobId: row.job_id,
    type: row.type,
    message: row.message,
    metadata: parseJson<Record<string, unknown> | null>(row.metadata, null),
    createdAt: row.created_at,
  };
}

function mapCodexTurn(row: any): CodexTurnRecord {
  return {
    id: row.id,
    jobId: row.job_id,
    codexThreadId: row.codex_thread_id,
    codexTurnId: row.codex_turn_id,
    transcriptPath: row.transcript_path,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function ensureDefaultProject(db?: Database) {
  const existing = getDb(db).query('SELECT * FROM projects ORDER BY created_at LIMIT 1').get();
  if (existing) return mapProject(existing);
  return createProject(
    'Default Studio Project',
    'Initial local project for Codex Studio jobs.',
    db,
  );
}

export function createProject(name: string, description: string | null = null, db?: Database) {
  const project: Project = {
    id: randomUUID(),
    name,
    description,
    createdAt: now(),
    updatedAt: now(),
  };
  getDb(db)
    .query(
      'INSERT INTO projects (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    )
    .run(project.id, project.name, project.description, project.createdAt, project.updatedAt);
  return project;
}

export function listProjects(db?: Database) {
  return getDb(db).query('SELECT * FROM projects ORDER BY updated_at DESC').all().map(mapProject);
}

export function createJob(
  input: {
    id?: string;
    projectId: string;
    kind: JobKind;
    providerId?: GenerationProviderId | null;
    sourceSpec?: GenerationTaskSpec | null;
    prompt: string;
    execution?: JobExecutionOptions | null;
  },
  db?: Database,
) {
  const job: Job = {
    id: input.id ?? randomUUID(),
    projectId: input.projectId,
    kind: input.kind,
    providerId: input.providerId ?? null,
    sourceSpec: input.sourceSpec ?? null,
    status: 'queued',
    execution: input.execution ?? null,
    originalPrompt: input.prompt,
    expandedPrompt: null,
    finalPromptUsed: input.prompt,
    error: null,
    createdAt: now(),
    updatedAt: now(),
    completedAt: null,
  };
  getDb(db)
    .query(`
      INSERT INTO jobs (id, project_id, kind, provider_id, source_spec_json, status, execution_json, original_prompt, expanded_prompt, final_prompt_used, error, created_at, updated_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      job.id,
      job.projectId,
      job.kind,
      job.providerId,
      job.sourceSpec ? JSON.stringify(job.sourceSpec) : null,
      job.status,
      job.execution ? JSON.stringify(job.execution) : null,
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

export function getJob(id: string, db?: Database) {
  const row = getDb(db).query('SELECT * FROM jobs WHERE id = ?').get(id);
  return row ? mapJob(row) : null;
}

export function listJobs(db?: Database) {
  return getDb(db).query('SELECT * FROM jobs ORDER BY created_at DESC LIMIT 100').all().map(mapJob);
}

export function listJobSummaries(db?: Database) {
  return getDb(db)
    .query(
      `
      SELECT
        id, project_id, kind, provider_id, status, execution_json,
        original_prompt, expanded_prompt, final_prompt_used, error,
        created_at, updated_at, completed_at
      FROM jobs
      ORDER BY created_at DESC
      LIMIT 100
    `,
    )
    .all()
    .map(mapJobSummary);
}

export function listRecoverableJobs(db?: Database) {
  return getDb(db)
    .query(`
      SELECT jobs.*
      FROM jobs
      LEFT JOIN assets ON assets.job_id = jobs.id AND assets.deleted_at IS NULL
      WHERE jobs.status IN ('queued', 'running')
        AND assets.id IS NULL
      ORDER BY jobs.created_at ASC
    `)
    .all()
    .map(mapJob);
}

export function addAsset(input: Omit<Asset, 'id' | 'createdAt' | 'deletedAt'>, db?: Database) {
  const asset: Asset = {
    ...input,
    id: randomUUID(),
    createdAt: now(),
    deletedAt: null,
  };
  getDb(db)
    .query(`
      INSERT INTO assets (id, project_id, job_id, file_path, thumbnail_path, public_url, prompt, width, height, mime_type, created_at, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      asset.id,
      asset.projectId,
      asset.jobId,
      asset.filePath,
      asset.thumbnailPath,
      asset.publicUrl,
      asset.prompt,
      asset.width,
      asset.height,
      asset.mimeType,
      asset.createdAt,
      asset.deletedAt,
    );
  return asset;
}

export function listAssets(db?: Database) {
  return getDb(db)
    .query('SELECT * FROM assets WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 200')
    .all()
    .map(mapAsset);
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
    .run(jobId, type, message, metadata ? JSON.stringify(metadata) : null, now());
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
  const result = getDb(db)
    .query(
      'INSERT INTO system_logs (level, scope, message, job_id, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    .run(input.level, input.scope, input.message, input.jobId ?? null, now());
  const row = getDb(db)
    .query('SELECT * FROM system_logs WHERE id = ?')
    .get(Number(result.lastInsertRowid));
  pruneSystemLogs(undefined, db);
  return row ? mapLog(row) : null;
}

export function pruneSystemLogs(options: { maxRows?: number } = {}, db?: Database) {
  const maxRows = Math.max(
    300,
    Math.floor(options.maxRows ?? Number(process.env.STUDIO_SYSTEM_LOG_RETENTION_ROWS || 5000)),
  );
  getDb(db)
    .query(
      `
      DELETE FROM system_logs
      WHERE id NOT IN (
        SELECT id FROM system_logs ORDER BY id DESC LIMIT ?
      )
    `,
    )
    .run(maxRows);
}

export function listLogs(db?: Database) {
  return getDb(db).query('SELECT * FROM system_logs ORDER BY id DESC LIMIT 300').all().map(mapLog);
}

export function listJobEvents(jobId: string, db?: Database) {
  return getDb(db)
    .query('SELECT * FROM job_events WHERE job_id = ? ORDER BY id ASC')
    .all(jobId)
    .map(mapJobEvent);
}

export function getCodexTurnByJobId(jobId: string, db?: Database) {
  const row = getDb(db)
    .query('SELECT * FROM codex_turns WHERE job_id = ? ORDER BY updated_at DESC LIMIT 1')
    .get(jobId);
  return row ? mapCodexTurn(row) : null;
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
      now(),
      now(),
    );
  return id;
}
