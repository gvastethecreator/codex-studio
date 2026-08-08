import { Database } from 'bun:sqlite';
import type { GenerationTaskSpec } from '../../../../packages/shared/src';
import { resolveJobWorkspaceId } from '../../../../packages/shared/src/workspaceContracts';
import { getDb } from './connection';
import { ensureDefaultWorkspaceRow } from './workspaces';

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
  {
    version: 6,
    name: 'remove-project-contract',
    migrate: removeLegacyProjectContract,
  },
] as const;

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

function columnExists(database: Database, tableName: string, columnName: string) {
  if (!tableExists(database, tableName)) return false;
  return (database.query(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>).some(
    (column) => column.name === columnName,
  );
}

function removeLegacyProjectContract(database: Database) {
  for (const tableName of ['assets', 'codex_threads', 'jobs']) {
    if (columnExists(database, tableName, 'project_id')) {
      database.run(`ALTER TABLE ${tableName} DROP COLUMN project_id`);
    }
  }
  database.run('DROP TABLE IF EXISTS projects');
}

function rebuildAssetsWithoutRequiredProject(database: Database) {
  if (!tableExists(database, 'assets')) return;
  database.run(`
    CREATE TABLE IF NOT EXISTS assets_workspace_authority (
      id TEXT PRIMARY KEY,
      project_id TEXT,
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
  const requiresForeignKeySafeRebuild = !appliedVersions.has(5);
  const foreignKeysWereEnabled =
    (
      database.query('PRAGMA foreign_keys').get() as {
        foreign_keys: number;
      }
    ).foreign_keys === 1;

  // SQLite checks the implicit DELETE from DROP TABLE immediately when a
  // referenced parent is rebuilt. Disable enforcement outside the transaction,
  // then require a clean relationship check before the migration can commit.
  if (requiresForeignKeySafeRebuild && foreignKeysWereEnabled) {
    database.run('PRAGMA foreign_keys = OFF');
  }

  const applyPendingMigrations = database.transaction(() => {
    for (const migration of DATABASE_MIGRATIONS) {
      if (appliedVersions.has(migration.version)) continue;
      migration.migrate(database);
      database
        .query('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)')
        .run(migration.version, migration.name, now());
    }

    if (requiresForeignKeySafeRebuild) {
      const violations = database.query('PRAGMA foreign_key_check').all();
      if (violations.length > 0) {
        throw new Error(
          `Database migration would leave ${violations.length} invalid foreign key relationship(s).`,
        );
      }
    }
  });

  try {
    applyPendingMigrations();
  } finally {
    if (requiresForeignKeySafeRebuild && foreignKeysWereEnabled) {
      database.run('PRAGMA foreign_keys = ON');
    }
  }
}

export function migrateDb(db?: Database) {
  migrateDatabase(getDb(db));
}
