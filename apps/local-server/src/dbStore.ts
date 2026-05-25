import { randomUUID } from 'node:crypto';
import type {
  Asset,
  Job,
  JobExecutionOptions,
  JobKind,
  Project,
  SystemLog,
} from '../../../packages/shared/src';

export interface StudioDbStore {
  ensureDefaultProject(): Project;
  createProject(name: string, description?: string | null): Project;
  listProjects(): Project[];
  createJob(input: {
    projectId: string;
    kind: JobKind;
    prompt: string;
    execution?: JobExecutionOptions | null;
  }): Job;
  updateJobFinalPrompt(id: string, finalPrompt: string): Job | null;
  getJob(id: string): Job | null;
  listJobs(): Job[];
  listAssets(): Asset[];
  listLogs(): SystemLog[];
}

export interface CreateSqliteDbStoreOptions {
  database: SqliteDatabaseLike;
  migrate?: boolean;
}

interface SqliteStatementLike {
  all(...params: unknown[]): any[];
  get(...params: unknown[]): any;
  run(...params: unknown[]): unknown;
}

export interface SqliteDatabaseLike {
  query(sql: string): SqliteStatementLike;
  run(sql: string): unknown;
}

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

function ensureColumn(
  database: SqliteDatabaseLike,
  tableName: string,
  columnName: string,
  definition: string,
) {
  const columns = database.query(`PRAGMA table_info(${tableName})`).all() as { name: string }[];
  if (!columns.some((column) => column.name === columnName)) {
    database.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function migrateSqliteDbStore(database: SqliteDatabaseLike) {
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
}

export function createSqliteDbStore({
  database,
  migrate = true,
}: CreateSqliteDbStoreOptions): StudioDbStore {
  if (migrate) {
    migrateSqliteDbStore(database);
  }

  function getProject(id: string) {
    const row = database.query('SELECT * FROM projects WHERE id = ?').get(id);
    return row ? mapProject(row) : null;
  }

  return {
    ensureDefaultProject() {
      const existing = database.query('SELECT * FROM projects ORDER BY created_at LIMIT 1').get();
      if (existing) return mapProject(existing);

      return this.createProject(
        'Default Studio Project',
        'Initial local project for Codex Studio jobs.',
      );
    },
    createProject(name: string, description: string | null = null) {
      const timestamp = now();
      const project: Project = {
        id: randomUUID(),
        name,
        description,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      database
        .query(
          'INSERT INTO projects (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        )
        .run(project.id, project.name, project.description, project.createdAt, project.updatedAt);
      return project;
    },
    listProjects() {
      return database
        .query('SELECT * FROM projects ORDER BY updated_at DESC')
        .all()
        .map(mapProject);
    },
    createJob(input) {
      const project = getProject(input.projectId);
      if (!project) {
        throw new Error(`Project ${input.projectId} does not exist`);
      }

      const timestamp = now();
      const job: Job = {
        id: randomUUID(),
        projectId: input.projectId,
        kind: input.kind,
        status: 'queued',
        execution: input.execution ?? null,
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
          INSERT INTO jobs (id, project_id, kind, status, execution_json, original_prompt, expanded_prompt, final_prompt_used, error, created_at, updated_at, completed_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          job.id,
          job.projectId,
          job.kind,
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
    },
    updateJobFinalPrompt(id, finalPrompt) {
      database
        .query('UPDATE jobs SET final_prompt_used = ?, updated_at = ? WHERE id = ?')
        .run(finalPrompt, now(), id);
      return this.getJob(id);
    },
    getJob(id) {
      const row = database.query('SELECT * FROM jobs WHERE id = ?').get(id);
      return row ? mapJob(row) : null;
    },
    listJobs() {
      return database
        .query('SELECT * FROM jobs ORDER BY created_at DESC LIMIT 100')
        .all()
        .map(mapJob);
    },
    listAssets() {
      return database
        .query('SELECT * FROM assets WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 200')
        .all()
        .map(mapAsset);
    },
    listLogs() {
      return database
        .query('SELECT * FROM system_logs ORDER BY id DESC LIMIT 300')
        .all()
        .map(mapLog);
    },
  };
}

export async function createDefaultDbStore(): Promise<StudioDbStore> {
  const {
    createJob,
    createProject,
    ensureDefaultProject,
    getJob,
    listAssets,
    listJobs,
    listLogs,
    listProjects,
    updateJobFinalPrompt,
  } = await import('./db');

  return {
    ensureDefaultProject,
    createProject,
    listProjects,
    createJob,
    updateJobFinalPrompt,
    getJob,
    listJobs,
    listAssets,
    listLogs,
  };
}
