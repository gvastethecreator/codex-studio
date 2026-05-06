import { Database } from 'bun:sqlite';
import { randomUUID } from 'node:crypto';
import { resolveLibraryPath } from './library';
import type { Asset, Job, JobKind, JobStatus, Project, SystemLog } from '../../../packages/shared/src';

let db: Database | null = null;

function now() {
  return new Date().toISOString();
}

export function getDb() {
  if (!db) {
    db = new Database(resolveLibraryPath('library.sqlite'));
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA foreign_keys = ON');
  }
  return db;
}

export function migrateDb() {
  const database = getDb();
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
      status TEXT NOT NULL,
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
    status: row.status,
    originalPrompt: row.original_prompt,
    expandedPrompt: row.expanded_prompt,
    finalPromptUsed: row.final_prompt_used,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
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

export function ensureDefaultProject() {
  const existing = getDb().query('SELECT * FROM projects ORDER BY created_at LIMIT 1').get();
  if (existing) return mapProject(existing);
  return createProject('Default Studio Project', 'Initial local project for Codex Image Studio jobs.');
}

export function createProject(name: string, description: string | null = null) {
  const project: Project = {
    id: randomUUID(),
    name,
    description,
    createdAt: now(),
    updatedAt: now(),
  };
  getDb()
    .query('INSERT INTO projects (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .run(project.id, project.name, project.description, project.createdAt, project.updatedAt);
  return project;
}

export function listProjects() {
  return getDb().query('SELECT * FROM projects ORDER BY updated_at DESC').all().map(mapProject);
}

export function createJob(input: { projectId: string; kind: JobKind; prompt: string }) {
  const job: Job = {
    id: randomUUID(),
    projectId: input.projectId,
    kind: input.kind,
    status: 'queued',
    originalPrompt: input.prompt,
    expandedPrompt: null,
    finalPromptUsed: input.prompt,
    error: null,
    createdAt: now(),
    updatedAt: now(),
    completedAt: null,
  };
  getDb()
    .query(`
      INSERT INTO jobs (id, project_id, kind, status, original_prompt, expanded_prompt, final_prompt_used, error, created_at, updated_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      job.id,
      job.projectId,
      job.kind,
      job.status,
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

export function updateJobFinalPrompt(id: string, finalPrompt: string) {
  getDb()
    .query('UPDATE jobs SET final_prompt_used = ?, updated_at = ? WHERE id = ?')
    .run(finalPrompt, now(), id);
  return getJob(id);
}

export function updateJobStatus(id: string, status: JobStatus, error: string | null = null) {
  const completedAt = status === 'completed' || status === 'failed' || status === 'cancelled' ? now() : null;
  getDb()
    .query('UPDATE jobs SET status = ?, error = ?, updated_at = ?, completed_at = COALESCE(?, completed_at) WHERE id = ?')
    .run(status, error, now(), completedAt, id);
  return getJob(id);
}

export function getJob(id: string) {
  const row = getDb().query('SELECT * FROM jobs WHERE id = ?').get(id);
  return row ? mapJob(row) : null;
}

export function listJobs() {
  return getDb().query('SELECT * FROM jobs ORDER BY created_at DESC LIMIT 100').all().map(mapJob);
}

export function listRecoverableJobs() {
  return getDb()
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

export function addAsset(input: Omit<Asset, 'id' | 'createdAt' | 'deletedAt'>) {
  const asset: Asset = {
    ...input,
    id: randomUUID(),
    createdAt: now(),
    deletedAt: null,
  };
  getDb()
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

export function listAssets() {
  return getDb()
    .query('SELECT * FROM assets WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 200')
    .all()
    .map(mapAsset);
}

export function addJobEvent(jobId: string, type: string, message: string, metadata?: unknown) {
  getDb()
    .query('INSERT INTO job_events (job_id, type, message, metadata, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(jobId, type, message, metadata ? JSON.stringify(metadata) : null, now());
}

export function addSystemLog(input: { level: SystemLog['level']; scope: string; message: string; jobId?: string | null }) {
  const result = getDb()
    .query('INSERT INTO system_logs (level, scope, message, job_id, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(input.level, input.scope, input.message, input.jobId ?? null, now());
  const row = getDb().query('SELECT * FROM system_logs WHERE id = ?').get(Number(result.lastInsertRowid));
  return row ? mapLog(row) : null;
}

export function listLogs() {
  return getDb().query('SELECT * FROM system_logs ORDER BY id DESC LIMIT 300').all().map(mapLog);
}

export function upsertCodexTurn(input: {
  id?: string;
  jobId: string;
  codexThreadId?: string | null;
  codexTurnId?: string | null;
  transcriptPath?: string | null;
  status: string;
}) {
  const id = input.id || randomUUID();
  getDb()
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
