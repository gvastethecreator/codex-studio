import { Database } from 'bun:sqlite';
import { createJob, listJobSummaries, listRecoverableJobs, updateJobFinalization } from './db/jobs';
import { addAsset } from './db/assets';
import { LATEST_DATABASE_SCHEMA_VERSION, migrateDatabase } from './db/migrations';
import { createGenerationTaskSpec } from '../../../packages/shared/src/generationContracts';

function createLegacyDatabase() {
  const database = new Database(':memory:');
  database.run('PRAGMA foreign_keys = ON');
  database.run(`
    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  database.run(`
    CREATE TABLE jobs (
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
    CREATE TABLE assets (
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
    CREATE TABLE libraries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      is_default INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
  database.run(`
    CREATE TABLE catalog_images (
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
  database.run(`
    CREATE TABLE codex_turns (
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
    CREATE TABLE job_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT REFERENCES jobs(id),
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    )
  `);
  database
    .query(
      'INSERT INTO projects (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    )
    .run('project-sentinel', 'Sentinel Project', null, '2026-01-01', '2026-01-01');
  database
    .query(
      `INSERT INTO jobs (
        id, project_id, kind, status, original_prompt, expanded_prompt,
        final_prompt_used, error, created_at, updated_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      'job-sentinel',
      'project-sentinel',
      'image_generate',
      'queued',
      'sentinel prompt',
      null,
      'sentinel prompt',
      null,
      '2026-01-01',
      '2026-01-01',
      null,
    );
  database
    .query('INSERT INTO libraries (id, name, path, is_default, created_at) VALUES (?, ?, ?, ?, ?)')
    .run('library-sentinel', 'Sentinel Library', 'D:/library', 1, '2026-01-01');
  database
    .query(
      `INSERT INTO assets (
        id, project_id, job_id, file_path, thumbnail_path, public_url, prompt,
        width, height, mime_type, created_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      'asset-sentinel',
      'project-sentinel',
      'job-sentinel',
      'D:/library/outputs/sentinel.png',
      null,
      '/library/library-sentinel/outputs/sentinel.png',
      'sentinel prompt',
      1024,
      1024,
      'image/png',
      '2026-01-01',
      null,
    );
  database
    .query(
      `INSERT INTO catalog_images (
        id, library_id, file_path, public_url, mime_type, job_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      'catalog-sentinel',
      'library-sentinel',
      'D:/library/outputs/sentinel.png',
      '/library/library-sentinel/outputs/sentinel.png',
      'image/png',
      'job-sentinel',
      '2026-01-01',
    );
  database
    .query(
      `INSERT INTO codex_turns (
        id, job_id, codex_thread_id, codex_turn_id, transcript_path, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      'turn-sentinel',
      'job-sentinel',
      'thread-sentinel',
      'turn-runtime-sentinel',
      null,
      'completed',
      '2026-01-01',
      '2026-01-01',
    );
  database
    .query(
      'INSERT INTO job_events (job_id, type, message, metadata, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    .run('job-sentinel', 'created', 'Sentinel event', null, '2026-01-01');
  return database;
}

function readColumnNames(database: Database) {
  return (database.query('PRAGMA table_info(jobs)').all() as Array<{ name: string }>).map(
    (column) => column.name,
  );
}

const database = createLegacyDatabase();
try {
  migrateDatabase(database);
  migrateDatabase(database);
  const migrationRows = database
    .query('SELECT version, name FROM schema_migrations ORDER BY version')
    .all() as Array<{ version: number; name: string }>;
  const sentinel = database.query('SELECT * FROM jobs WHERE id = ?').get('job-sentinel') as Record<
    string,
    unknown
  > | null;
  const indexes = database.query("PRAGMA index_list('jobs')").all() as Array<{ name: string }>;
  const foreignKeyViolations = database.query('PRAGMA foreign_key_check').all();
  const foreignKeyEnforcement = database.query('PRAGMA foreign_keys').get() as {
    foreign_keys: number;
  };
  const assetForeignKeys = database.query("PRAGMA foreign_key_list('assets')").all() as Array<{
    table: string;
    from: string;
  }>;
  const referencingRowsPreserved =
    Boolean(database.query('SELECT id FROM assets WHERE id = ?').get('asset-sentinel')) &&
    Boolean(database.query('SELECT id FROM catalog_images WHERE id = ?').get('catalog-sentinel')) &&
    Boolean(database.query('SELECT id FROM codex_turns WHERE id = ?').get('turn-sentinel')) &&
    Boolean(database.query('SELECT id FROM job_events WHERE job_id = ?').get('job-sentinel')) &&
    assetForeignKeys.some(
      (foreignKey) => foreignKey.table === 'jobs' && foreignKey.from === 'job_id',
    );
  const requiredColumns = [
    'provider_id',
    'source_spec_json',
    'execution_json',
    'library_id',
    'library_root',
    'finalization_state',
    'finalization_source_path',
    'finalization_file_path',
    'finalization_asset_id',
    'finalization_catalog_id',
    'workspace_id',
    'recipe_id',
    'batch_id',
    'aspect_ratio',
  ];
  const columns = readColumnNames(database);
  database
    .query(
      `UPDATE jobs
       SET provider_id = ?,
           source_spec_json = ?,
           workspace_id = ?,
           recipe_id = ?,
           batch_id = ?,
           aspect_ratio = ?
       WHERE id = ?`,
    )
    .run(
      'codex',
      JSON.stringify({
        recipeId: 'styles',
        output: { aspectRatio: '2:3' },
        metadata: { workspaceId: 'workspace-summary', batchId: 'batch-1' },
      }),
      'workspace-summary',
      'styles',
      'batch-1',
      '2:3',
      'job-sentinel',
    );
  const summary = listJobSummaries(database).find((job) => job.id === 'job-sentinel');
  const createdJob = createJob(
    {
      id: 'job-workspace-only',
      workspaceId: 'workspace-created',
      kind: 'image_generate',
      providerId: 'codex',
      sourceSpec: createGenerationTaskSpec({
        id: 'spec-workspace-only',
        task: 'image_generate',
        providerId: 'codex',
        prompt: 'workspace-only prompt',
      }),
      prompt: 'workspace-only prompt',
    },
    database,
  );
  const createdJobRow = database
    .query('SELECT workspace_id, source_spec_json FROM jobs WHERE id = ?')
    .get(createdJob.id) as { workspace_id: string; source_spec_json: string | null } | null;
  const legacyAsset = addAsset(
    {
      jobId: 'job-sentinel',
      filePath: 'D:/library/outputs/result.png',
      thumbnailPath: null,
      publicUrl: '/library/library-1/outputs/result.png',
      prompt: 'sentinel prompt',
      width: null,
      height: null,
      mimeType: 'image/png',
    },
    database,
  );
  const recoverableJobs = listRecoverableJobs(database);
  const checkpoint = updateJobFinalization(
    'job-sentinel',
    {
      state: 'asset_recorded',
      sourcePath: 'D:/provider/result.png',
      filePath: legacyAsset.filePath,
      assetId: legacyAsset.id,
      catalogId: null,
    },
    database,
  );
  const rollbackDatabase = createLegacyDatabase();
  rollbackDatabase.run(`
    CREATE TABLE schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    )
  `);
  rollbackDatabase.run(`
    CREATE TRIGGER reject_second_migration
    BEFORE INSERT ON schema_migrations
    WHEN NEW.version = 2
    BEGIN
      SELECT RAISE(ABORT, 'forced migration failure');
    END
  `);
  let migrationFailed = false;
  try {
    migrateDatabase(rollbackDatabase);
  } catch {
    migrationFailed = true;
  }
  const rolledBackMigrationCount = (
    rollbackDatabase.query('SELECT COUNT(*) AS count FROM schema_migrations').get() as {
      count: number;
    }
  ).count;
  const rollbackColumns = readColumnNames(rollbackDatabase);
  const rollbackSentinel = rollbackDatabase
    .query('SELECT original_prompt FROM jobs WHERE id = ?')
    .get('job-sentinel') as { original_prompt: string } | null;
  const rollbackForeignKeyEnforcement = rollbackDatabase.query('PRAGMA foreign_keys').get() as {
    foreign_keys: number;
  };
  rollbackDatabase.close();
  const columnSet = new Set(columns);

  console.log(
    JSON.stringify({
      idempotent:
        migrationRows.length === LATEST_DATABASE_SCHEMA_VERSION &&
        migrationRows.at(-1)?.version === LATEST_DATABASE_SCHEMA_VERSION &&
        requiredColumns.every((column) => columnSet.has(column)),
      sentinelPreserved: sentinel?.original_prompt === 'sentinel prompt',
      projectContractRemoved:
        !columns.includes('project_id') &&
        !database
          .query("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'projects'")
          .get() &&
        createdJob.workspaceId === 'workspace-created' &&
        createdJobRow?.workspace_id === 'workspace-created' &&
        JSON.parse(createdJobRow?.source_spec_json ?? '{}').metadata?.workspaceId ===
          'workspace-created',
      indexesPresent:
        indexes.some((index) => index.name === 'idx_jobs_library_created_desc') &&
        indexes.some((index) => index.name === 'idx_jobs_finalization_state'),
      foreignKeysValid:
        foreignKeyEnforcement.foreign_keys === 1 && foreignKeyViolations.length === 0,
      referencingRowsPreserved,
      transactionRolledBack:
        migrationFailed &&
        rolledBackMigrationCount === 0 &&
        !rollbackColumns.includes('provider_id') &&
        rollbackSentinel?.original_prompt === 'sentinel prompt' &&
        rollbackForeignKeyEnforcement.foreign_keys === 1,
      recoverableCheckpoint:
        checkpoint?.finalization?.state === 'asset_recorded' &&
        checkpoint.finalization.assetId === legacyAsset.id &&
        recoverableJobs.some(
          (job) =>
            job.id === 'job-sentinel' &&
            job.finalization?.state === 'catalog_recorded' &&
            job.finalization.assetId === 'asset-sentinel' &&
            job.finalization.catalogId === 'catalog-sentinel',
        ),
      summaryProjection:
        summary?.workspaceId === 'workspace-summary' &&
        summary.recipeId === 'styles' &&
        summary.batchId === 'batch-1' &&
        summary.aspectRatio === '2:3' &&
        summary.promptPreview === 'sentinel prompt' &&
        !summary.workspaceId?.includes('{'),
      schemaVersion: LATEST_DATABASE_SCHEMA_VERSION,
    }),
  );
} finally {
  database.close();
}
