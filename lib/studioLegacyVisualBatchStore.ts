import type { LegacyVisualBatchSnapshot } from './studioLegacyVisualBatchTypes';

export const LEGACY_VISUAL_BATCH_CACHE_KEYS = ['catalog-cache', 'catalog-trash'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Validate legacy Visual Batch snapshot payloads at import/recovery edges only.
 * Durable image truth lives in SQLite Catalog Entries.
 */
export function validateLegacyVisualBatchVault(data: unknown): data is LegacyVisualBatchSnapshot {
  if (!Array.isArray(data)) return false;

  return data.every((batch) => {
    if (!isRecord(batch)) return false;
    if (typeof batch.id !== 'string') return false;
    if (typeof batch.createdAt !== 'number') return false;
    if (!isRecord(batch.config)) return false;
    if (!Array.isArray(batch.images)) return false;

    return batch.images.every((img) => {
      if (!isRecord(img)) return false;
      if (typeof img.id !== 'string') return false;
      if (typeof img.src !== 'string') return false;
      if (typeof img.batchId !== 'string') return false;
      if (typeof img.createdAt !== 'number') return false;
      return true;
    });
  });
}
