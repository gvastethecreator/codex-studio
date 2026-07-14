import { Database } from 'bun:sqlite';
import {
  addAsset,
  LATEST_DATABASE_SCHEMA_VERSION,
  listRecoverableJobs,
  migrateDatabase,
  updateJobFinalization,
} from './db';

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
  ];
  const columns = readColumnNames(database);
  const legacyAsset = addAsset(
    {
      projectId: 'project-sentinel',
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
  rollbackDatabase.close();

  console.log(
    JSON.stringify({
      idempotent:
        migrationRows.length === LATEST_DATABASE_SCHEMA_VERSION &&
        migrationRows.at(-1)?.version === LATEST_DATABASE_SCHEMA_VERSION &&
        requiredColumns.every((column) => columns.includes(column)),
      sentinelPreserved:
        sentinel?.project_id === 'project-sentinel' &&
        sentinel?.original_prompt === 'sentinel prompt',
      indexesPresent:
        indexes.some((index) => index.name === 'idx_jobs_library_created_desc') &&
        indexes.some((index) => index.name === 'idx_jobs_finalization_state'),
      foreignKeysValid: foreignKeyViolations.length === 0,
      transactionRolledBack:
        migrationFailed &&
        rolledBackMigrationCount === 0 &&
        !rollbackColumns.includes('provider_id') &&
        rollbackSentinel?.original_prompt === 'sentinel prompt',
      recoverableCheckpoint:
        checkpoint?.finalization?.state === 'asset_recorded' &&
        recoverableJobs.some(
          (job) =>
            job.id === 'job-sentinel' &&
            job.finalization?.state === 'asset_recorded' &&
            job.finalization.assetId === legacyAsset.id,
        ),
      schemaVersion: LATEST_DATABASE_SCHEMA_VERSION,
    }),
  );
} finally {
  database.close();
}
