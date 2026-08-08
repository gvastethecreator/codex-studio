import { Database } from 'bun:sqlite';
import { randomUUID } from 'node:crypto';
import { resolveLibraryPath } from './library';
import type {
  Asset,
  CodexTurnRecord,
  Job,
  JobEventRecord,
  JobExecutionOptions,
  JobFinalization,
  JobFinalizationState,
  JobKind,
  JobLibraryContext,
  JobSummary,
  JobStatus,
  GenerationProviderId,
  GenerationTaskSpec,
  Project,
  SystemLog,
} from '../../../packages/shared/src';
import {
  DEFAULT_WORKSPACE_ID,
  normalizeWorkspaceId,
  resolveJobWorkspaceId,
  withWorkspaceMetadata,
} from '../../../packages/shared/src/workspaceContracts';

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

function createPromptPreview(value: string | null | undefined, limit = 160) {
  const text = (value ?? '').trim();
  if (text.length <= limit) return text;
  if (limit <= 3) return text.slice(0, limit);
  return `${text.slice(0, limit - 3).trimEnd()}...`;
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

function migrateBaseSchema(database: Database) {
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
  database.run(
    "CREATE INDEX IF NOT EXISTS idx_catalog_deleted_workspace_created_cover ON catalog_images(is_deleted, COALESCE(workspace_id, 'default'), created_at DESC, id DESC, library_id, file_size_bytes)",
  );
  database.run(`
    CREATE TABLE IF NOT EXISTS user_style_presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      domain TEXT,
      tags_json TEXT NOT NULL,
      supported_tasks_json TEXT NOT NULL,
      visual_dna_json TEXT NOT NULL,
      avoid_rules_json TEXT NOT NULL,
      attributes_json TEXT,
      assets_json TEXT,
      source_json TEXT,
      is_archived INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  database.run(
    'CREATE INDEX IF NOT EXISTS idx_user_style_archived_updated ON user_style_presets(is_archived, updated_at DESC)',
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

const DATABASE_MIGRATIONS = [
  {
    version: 1,
    name: 'base-schema',
    migrate: migrateBaseSchema,
  },
  {
    version: 2,
    name: 'job-library-context',
    migrate(database: Database) {
      ensureColumn(database, 'jobs', 'library_id', 'TEXT');
      ensureColumn(database, 'jobs', 'library_root', 'TEXT');
      database.run(
        'CREATE INDEX IF NOT EXISTS idx_jobs_library_created_desc ON jobs(library_id, created_at DESC)',
      );
    },
  },
  {
    version: 3,
    name: 'job-finalization-checkpoints',
    migrate(database: Database) {
      ensureColumn(database, 'jobs', 'finalization_state', 'TEXT');
      ensureColumn(database, 'jobs', 'finalization_source_path', 'TEXT');
      ensureColumn(database, 'jobs', 'finalization_file_path', 'TEXT');
      ensureColumn(database, 'jobs', 'finalization_asset_id', 'TEXT');
      ensureColumn(database, 'jobs', 'finalization_catalog_id', 'TEXT');
      database.run(
        'CREATE INDEX IF NOT EXISTS idx_jobs_finalization_state ON jobs(finalization_state)',
      );
    },
  },
  {
    version: 4,
    name: 'workspace-authority-expand',
    migrate(database: Database) {
      database.run(`
        CREATE TABLE IF NOT EXISTS workspaces (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          library_id TEXT,
          filter_json TEXT,
          sort_order TEXT DEFAULT 'newest',
          created_at TEXT NOT NULL,
          updated_at TEXT
        )
      `);
      ensureColumn(database, 'workspaces', 'updated_at', 'TEXT');
      ensureColumn(database, 'jobs', 'workspace_id', 'TEXT');
      ensureColumn(database, 'jobs', 'recipe_id', 'TEXT');
      ensureColumn(database, 'jobs', 'batch_id', 'TEXT');
      ensureColumn(database, 'jobs', 'aspect_ratio', 'TEXT');
      ensureDefaultWorkspaceRow(database);
      backfillJobOperationalColumns(database);
      database.run(
        'CREATE INDEX IF NOT EXISTS idx_jobs_workspace_created_desc ON jobs(workspace_id, created_at DESC)',
      );
      database.run(
        'CREATE INDEX IF NOT EXISTS idx_jobs_status_created_desc ON jobs(status, created_at DESC)',
      );
      database.run('CREATE INDEX IF NOT EXISTS idx_jobs_batch_id ON jobs(batch_id)');
      database.run(
        'CREATE INDEX IF NOT EXISTS idx_jobs_recipe_created_desc ON jobs(recipe_id, created_at DESC)',
      );
    },
  },
  {
    version: 5,
    name: 'drop-project-required-coupling',
    migrate(database: Database) {
      // Keep legacy project rows for historical reads, but stop requiring product FK coupling
      // for new writes by making project_id nullable via table rebuild when needed.
      rebuildJobsWithoutRequiredProject(database);
      rebuildAssetsWithoutRequiredProject(database);
      rebuildCodexThreadsWithoutRequiredProject(database);
    },
  },
] as const;

function ensureDefaultWorkspaceRow(database: Database) {
  const existing = database
    .query('SELECT id FROM workspaces WHERE id = ?')
    .get(DEFAULT_WORKSPACE_ID) as { id: string } | null;
  if (existing) {
    database
      .query(
        `UPDATE workspaces
         SET name = COALESCE(NULLIF(name, ''), 'Default'),
             updated_at = COALESCE(updated_at, created_at, ?)
         WHERE id = ?`,
      )
      .run(now(), DEFAULT_WORKSPACE_ID);
    return;
  }
  const timestamp = now();
  database
    .query(
      `INSERT INTO workspaces (id, name, library_id, filter_json, sort_order, created_at, updated_at)
       VALUES (?, ?, NULL, ?, ?, ?, ?)`,
    )
    .run(DEFAULT_WORKSPACE_ID, 'Default', '{}', 'newest', timestamp, timestamp);
}

function backfillJobOperationalColumns(database: Database) {
  const rows = database
    .query('SELECT id, source_spec_json, workspace_id, recipe_id, batch_id, aspect_ratio FROM jobs')
    .all() as Array<{
    id: string;
    source_spec_json: string | null;
    workspace_id: string | null;
    recipe_id: string | null;
    batch_id: string | null;
    aspect_ratio: string | null;
  }>;

  const update = database.query(
    `UPDATE jobs
     SET workspace_id = ?, recipe_id = ?, batch_id = ?, aspect_ratio = ?
     WHERE id = ?`,
  );

  for (const row of rows) {
    const sourceSpec = parseJson<GenerationTaskSpec | null>(row.source_spec_json, null);
    const metadata = sourceSpec?.metadata;
    const workspaceId = resolveJobWorkspaceId({
      columnWorkspaceId: row.workspace_id,
      sourceSpecMetadata: metadata,
    });
    const recipeId =
      row.recipe_id ??
      (typeof sourceSpec?.recipeId === 'string' && sourceSpec.recipeId.trim()
        ? sourceSpec.recipeId
        : null);
    const batchId =
      row.batch_id ??
      (metadata &&
      typeof metadata === 'object' &&
      !Array.isArray(metadata) &&
      typeof (metadata as Record<string, unknown>).batchId === 'string'
        ? String((metadata as Record<string, unknown>).batchId)
        : null);
    const aspectRatio =
      row.aspect_ratio ??
      (typeof sourceSpec?.output?.aspectRatio === 'string' ? sourceSpec.output.aspectRatio : null);
    update.run(workspaceId, recipeId, batchId, aspectRatio, row.id);
  }
}

function rebuildJobsWithoutRequiredProject(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS jobs_workspace_authority (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      workspace_id TEXT,
      recipe_id TEXT,
      batch_id TEXT,
      aspect_ratio TEXT,
      kind TEXT NOT NULL,
      provider_id TEXT,
      source_spec_json TEXT,
      status TEXT NOT NULL,
      execution_json TEXT,
      library_id TEXT,
      library_root TEXT,
      finalization_state TEXT,
      finalization_source_path TEXT,
      finalization_file_path TEXT,
      finalization_asset_id TEXT,
      finalization_catalog_id TEXT,
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
    INSERT INTO jobs_workspace_authority (
      id, project_id, workspace_id, recipe_id, batch_id, aspect_ratio, kind, provider_id,
      source_spec_json, status, execution_json, library_id, library_root,
      finalization_state, finalization_source_path, finalization_file_path,
      finalization_asset_id, finalization_catalog_id, original_prompt, expanded_prompt,
      final_prompt_used, error, created_at, updated_at, completed_at
    )
    SELECT
      id, project_id, workspace_id, recipe_id, batch_id, aspect_ratio, kind, provider_id,
      source_spec_json, status, execution_json, library_id, library_root,
      finalization_state, finalization_source_path, finalization_file_path,
      finalization_asset_id, finalization_catalog_id, original_prompt, expanded_prompt,
      final_prompt_used, error, created_at, updated_at, completed_at
    FROM jobs
  `);
  database.run('DROP TABLE jobs');
  database.run('ALTER TABLE jobs_workspace_authority RENAME TO jobs');
  database.run('CREATE INDEX IF NOT EXISTS idx_jobs_created_desc ON jobs(created_at DESC)');
  database.run(
    'CREATE INDEX IF NOT EXISTS idx_jobs_workspace_created_desc ON jobs(workspace_id, created_at DESC)',
  );
  database.run(
    'CREATE INDEX IF NOT EXISTS idx_jobs_status_created_desc ON jobs(status, created_at DESC)',
  );
  database.run('CREATE INDEX IF NOT EXISTS idx_jobs_batch_id ON jobs(batch_id)');
  database.run(
    'CREATE INDEX IF NOT EXISTS idx_jobs_recipe_created_desc ON jobs(recipe_id, created_at DESC)',
  );
  database.run(
    'CREATE INDEX IF NOT EXISTS idx_jobs_library_created_desc ON jobs(library_id, created_at DESC)',
  );
  database.run(
    'CREATE INDEX IF NOT EXISTS idx_jobs_finalization_state ON jobs(finalization_state)',
  );
}

function tableExists(database: Database, tableName: string) {
  const row = database
    .query(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`)
    .get(tableName) as { name: string } | null;
  return Boolean(row);
}

function rebuildAssetsWithoutRequiredProject(database: Database) {
  if (!tableExists(database, 'assets')) return;
  database.run(`
    CREATE TABLE IF NOT EXISTS assets_workspace_authority (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      job_id TEXT NOT NULL,
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
    INSERT INTO assets_workspace_authority (
      id, project_id, job_id, file_path, thumbnail_path, public_url, prompt,
      width, height, mime_type, created_at, deleted_at
    )
    SELECT
      id, project_id, job_id, file_path, thumbnail_path, public_url, prompt,
      width, height, mime_type, created_at, deleted_at
    FROM assets
  `);
  database.run('DROP TABLE assets');
  database.run('ALTER TABLE assets_workspace_authority RENAME TO assets');
}

function rebuildCodexThreadsWithoutRequiredProject(database: Database) {
  if (!tableExists(database, 'codex_threads')) return;
  database.run(`
    CREATE TABLE IF NOT EXISTS codex_threads_workspace_authority (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      codex_thread_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  database.run(`
    INSERT INTO codex_threads_workspace_authority (
      id, project_id, codex_thread_id, created_at, updated_at
    )
    SELECT id, project_id, codex_thread_id, created_at, updated_at
    FROM codex_threads
  `);
  database.run('DROP TABLE codex_threads');
  database.run('ALTER TABLE codex_threads_workspace_authority RENAME TO codex_threads');
}

export const LATEST_DATABASE_SCHEMA_VERSION = DATABASE_MIGRATIONS.at(-1)?.version ?? 0;

export function migrateDatabase(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    )
  `);

  const appliedVersions = new Set(
    (
      database.query('SELECT version FROM schema_migrations ORDER BY version ASC').all() as Array<{
        version: number;
      }>
    ).map((row) => row.version),
  );
  const applyPendingMigrations = database.transaction(() => {
    for (const migration of DATABASE_MIGRATIONS) {
      if (appliedVersions.has(migration.version)) continue;
      migration.migrate(database);
      database
        .query('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)')
        .run(migration.version, migration.name, now());
    }
  });

  applyPendingMigrations();
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

function mapJobFinalization(row: any): JobFinalization | null {
  if (!row.finalization_state) return null;
  return {
    state: row.finalization_state as JobFinalizationState,
    sourcePath: row.finalization_source_path ?? null,
    filePath: row.finalization_file_path ?? null,
    assetId: row.finalization_asset_id ?? null,
    catalogId: row.finalization_catalog_id ?? null,
  };
}

function mapJob(row: any): Job {
  const sourceSpec = parseJson<GenerationTaskSpec | null>(row.source_spec_json, null);
  const workspaceId = resolveJobWorkspaceId({
    columnWorkspaceId: row.workspace_id,
    sourceSpecMetadata: sourceSpec?.metadata,
  });
  return {
    id: row.id,
    projectId: row.project_id ?? null,
    workspaceId,
    recipeId: row.recipe_id ?? sourceSpec?.recipeId ?? null,
    batchId: row.batch_id ?? null,
    aspectRatio: row.aspect_ratio ?? sourceSpec?.output?.aspectRatio ?? null,
    kind: row.kind,
    providerId: row.provider_id,
    sourceSpec,
    status: row.status,
    execution: parseJson<JobExecutionOptions | null>(row.execution_json, null),
    libraryContext:
      row.library_id && row.library_root
        ? { libraryId: row.library_id, rootPath: row.library_root }
        : null,
    finalization: mapJobFinalization(row),
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
  const sourceSpec = parseJson<GenerationTaskSpec | null>(row.source_spec_json, null);
  const workspaceId = resolveJobWorkspaceId({
    columnWorkspaceId: row.workspace_id,
    sourceSpecMetadata: sourceSpec?.metadata,
  });
  const recipeId =
    (typeof row.recipe_id === 'string' && row.recipe_id.trim() ? row.recipe_id : null) ??
    sourceSpec?.recipeId ??
    null;
  const batchId =
    (typeof row.batch_id === 'string' && row.batch_id.trim() ? row.batch_id : null) ??
    (sourceSpec?.metadata &&
    typeof sourceSpec.metadata === 'object' &&
    !Array.isArray(sourceSpec.metadata) &&
    typeof sourceSpec.metadata.batchId === 'string'
      ? sourceSpec.metadata.batchId
      : null);
  const aspectRatio =
    (typeof row.aspect_ratio === 'string' && row.aspect_ratio.trim() ? row.aspect_ratio : null) ??
    sourceSpec?.output?.aspectRatio ??
    null;

  return {
    id: row.id,
    projectId: row.project_id ?? null,
    kind: row.kind,
    providerId: row.provider_id,
    workspaceId,
    recipeId,
    batchId,
    aspectRatio,
    status: row.status,
    execution: parseJson<JobExecutionOptions | null>(row.execution_json, null),
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
    projectId: row.project_id ?? null,
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

export function ensureDefaultWorkspace(db?: Database) {
  ensureDefaultWorkspaceRow(getDb(db));
  return getWorkspace(DEFAULT_WORKSPACE_ID, db);
}

export function getWorkspace(id: string, db?: Database) {
  const row = getDb(db).query('SELECT * FROM workspaces WHERE id = ?').get(id) as
    | Record<string, unknown>
    | null
    | undefined;
  if (!row) return null;
  return {
    id: typeof row.id === 'string' ? row.id : String(row.id),
    name: typeof row.name === 'string' && row.name.trim() ? row.name : 'Default',
    libraryId: (row.library_id as string | null) ?? null,
    filter: parseJson<Record<string, unknown>>(
      typeof row.filter_json === 'string' ? row.filter_json : null,
      {},
    ),
    sortOrder:
      typeof row.sort_order === 'string' && row.sort_order.trim() ? row.sort_order : 'newest',
    createdAt: typeof row.created_at === 'string' ? row.created_at : now(),
    updatedAt:
      typeof row.updated_at === 'string'
        ? row.updated_at
        : typeof row.created_at === 'string'
          ? row.created_at
          : now(),
  };
}

export function createJob(
  input: {
    id?: string;
    projectId?: string | null;
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

  const job: Job = {
    id: input.id ?? randomUUID(),
    projectId: input.projectId ?? null,
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
    createdAt: now(),
    updatedAt: now(),
    completedAt: null,
  };
  database
    .query(`
      INSERT INTO jobs (
        id, project_id, workspace_id, recipe_id, batch_id, aspect_ratio,
        kind, provider_id, source_spec_json, status, execution_json,
        library_id, library_root, original_prompt, expanded_prompt, final_prompt_used,
        error, created_at, updated_at, completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      job.id,
      job.projectId ?? null,
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
       SET finalization_state = ?,
           finalization_source_path = ?,
           finalization_file_path = ?,
           finalization_asset_id = ?,
           finalization_catalog_id = ?,
           updated_at = ?
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
  return row ? mapJob(row) : null;
}

export function listJobSummaries(db?: Database) {
  return getDb(db)
    .query(
      `
      SELECT
        id, project_id, workspace_id, recipe_id, batch_id, aspect_ratio,
        kind, provider_id, source_spec_json, status, execution_json,
        original_prompt, final_prompt_used, error,
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
    .map((row: any) => {
      const job = mapJob(row);
      if (!job.finalization && row.recovery_asset_id && row.recovery_asset_path) {
        job.finalization = {
          state: row.recovery_catalog_id ? 'catalog_recorded' : 'asset_recorded',
          sourcePath: row.recovery_asset_path,
          filePath: row.recovery_asset_path,
          assetId: row.recovery_asset_id,
          catalogId: row.recovery_catalog_id ?? null,
        };
      }
      return job;
    });
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
      asset.projectId ?? null,
      asset.jobId,
      asset.filePath,
      asset.thumbnailPath,
      asset.publicUrl,
      asset.prompt,
      asset.width ?? null,
      asset.height ?? null,
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

export function getAssetByJobId(jobId: string, filePath?: string | null, db?: Database) {
  const row = filePath
    ? getDb(db)
        .query(
          'SELECT * FROM assets WHERE job_id = ? AND file_path = ? AND deleted_at IS NULL ORDER BY created_at ASC LIMIT 1',
        )
        .get(jobId, filePath)
    : getDb(db)
        .query(
          'SELECT * FROM assets WHERE job_id = ? AND deleted_at IS NULL ORDER BY created_at ASC LIMIT 1',
        )
        .get(jobId);
  return row ? mapAsset(row) : null;
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
