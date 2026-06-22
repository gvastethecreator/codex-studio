import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vite-plus/test';

describe('migrateDatabase', () => {
  it('creates composite catalog indexes for hot workspace and gallery queries', () => {
    const source = readFileSync(fileURLToPath(new URL('./db.ts', import.meta.url)), 'utf8');

    expect(source).toContain(
      'CREATE INDEX IF NOT EXISTS idx_catalog_deleted_created_desc ON catalog_images(is_deleted, created_at DESC)',
    );
    expect(source).toContain(
      "CREATE INDEX IF NOT EXISTS idx_catalog_workspace_key_deleted_created_desc ON catalog_images(COALESCE(workspace_id, 'default'), is_deleted, created_at DESC)",
    );
    expect(source).toContain(
      'CREATE INDEX IF NOT EXISTS idx_jobs_created_desc ON jobs(created_at DESC)',
    );
    expect(source).toContain(
      'CREATE INDEX IF NOT EXISTS idx_job_events_job_id_id ON job_events(job_id, id)',
    );
    expect(source).toContain(
      'CREATE INDEX IF NOT EXISTS idx_codex_turns_job_updated_desc ON codex_turns(job_id, updated_at DESC)',
    );
  });
});
