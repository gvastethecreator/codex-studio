import { initStudio } from '../apps/local-server/src/init';
import { getDb } from '../apps/local-server/src/db/connection';
import { embedMetadata, extractMetadata } from '../apps/local-server/src/metadataEmbedder';
import { getJob } from '../apps/local-server/src/db/jobs';
import { jobImageMetadata } from '../apps/local-server/src/providers/jobImageMetadata';
import { updateCatalogImageFileSize } from '../apps/local-server/src/catalog';

initStudio();

const rows = getDb()
  .query('SELECT * FROM catalog_images WHERE is_deleted = 0 ORDER BY created_at ASC')
  .all() as any[];
let embedded = 0;
let skipped = 0;
let failed = 0;

for (const row of rows) {
  const existing = await extractMetadata(row.file_path);
  if (existing) {
    skipped += 1;
    continue;
  }
  try {
    const job = row.job_id ? getJob(row.job_id) : null;
    const result = await embedMetadata(row.file_path, {
      ...(job ? jobImageMetadata(job) : { prompt: row.prompt || '', model: 'unknown' }),
      negativePrompt: row.negative_prompt,
      aspectRatio: row.aspect_ratio,
      imageSize: row.image_size,
      recipe: row.recipe_id,
      batchId: row.batch_id,
      generatedAt: row.created_at,
      studioVersion: '0.0.0',
      libraryId: row.library_id,
      catalogId: row.id,
    });
    updateCatalogImageFileSize(row.id, result.bytesWritten);
    embedded += 1;
  } catch {
    failed += 1;
  }
}

console.log(
  JSON.stringify({ migration: 'embed_metadata_bulk', embedded, skipped, failed }, null, 2),
);
