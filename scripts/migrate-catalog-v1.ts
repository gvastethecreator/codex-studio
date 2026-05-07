import { existsSync, statSync } from 'node:fs';
import { initStudio } from '../apps/local-server/src/init';
import { getDb } from '../apps/local-server/src/db';
import { registerCatalogImage } from '../apps/local-server/src/catalog';
import { getDefaultLibrary } from '../apps/local-server/src/libraries';

initStudio();

const database = getDb();
const library = getDefaultLibrary();
const assets = database
  .query('SELECT * FROM assets WHERE deleted_at IS NULL ORDER BY created_at ASC')
  .all() as any[];
let inserted = 0;
let skipped = 0;

for (const asset of assets) {
  const existing = database
    .query('SELECT id FROM catalog_images WHERE job_id = ? AND file_path = ? LIMIT 1')
    .get(asset.job_id, asset.file_path);
  if (existing || !existsSync(asset.file_path)) {
    skipped += 1;
    continue;
  }
  registerCatalogImage({
    libraryId: library.id,
    filePath: asset.file_path,
    thumbnailPath: asset.thumbnail_path,
    prompt: asset.prompt,
    width: asset.width,
    height: asset.height,
    mimeType: asset.mime_type,
    fileSizeBytes: statSync(asset.file_path).size,
    jobId: asset.job_id,
    workspaceId: asset.project_id,
  });
  inserted += 1;
}

database
  .query('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)')
  .run('migration_catalog_v1', 'done', new Date().toISOString());

console.log(JSON.stringify({ migration: 'catalog_v1', inserted, skipped }, null, 2));
