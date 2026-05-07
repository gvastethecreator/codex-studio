import { initStudio } from '../apps/local-server/src/init';
import { getDb } from '../apps/local-server/src/db';
import { embedMetadata, extractMetadata } from '../apps/local-server/src/metadataEmbedder';

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
    await embedMetadata(row.file_path, {
      prompt: row.prompt || '',
      negativePrompt: row.negative_prompt,
      aspectRatio: row.aspect_ratio,
      imageSize: row.image_size,
      model: 'codex-imagegen',
      recipe: row.recipe_id,
      batchId: row.batch_id,
      generatedAt: row.created_at,
      studioVersion: '0.0.0',
      libraryId: row.library_id,
      catalogId: row.id,
    });
    embedded += 1;
  } catch {
    failed += 1;
  }
}

console.log(
  JSON.stringify({ migration: 'embed_metadata_bulk', embedded, skipped, failed }, null, 2),
);
