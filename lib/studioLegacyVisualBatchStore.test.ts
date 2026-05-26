import { describe, expect, it } from 'vite-plus/test';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { LegacyVisualBatch } from './studioLegacyVisualBatchTypes';
import {
  LEGACY_VISUAL_BATCH_CACHE_KEYS,
  validateLegacyVisualBatchVault,
} from './studioLegacyVisualBatchStore';

function createBatch(id: string): LegacyVisualBatch {
  return {
    id,
    workspaceId: 'default',
    config: DEFAULT_GENERATION_CONFIG,
    images: [
      {
        id: `${id}-image`,
        src: `${id}.png`,
        batchId: id,
        createdAt: 1,
      },
    ],
    createdAt: 1,
  };
}

describe('studioLegacyVisualBatchStore', () => {
  it('centralizes legacy Visual Batch cache keys', () => {
    expect(LEGACY_VISUAL_BATCH_CACHE_KEYS).toEqual(['catalog-cache', 'catalog-trash']);
  });

  it('validates legacy Visual Batch snapshot payloads', () => {
    expect(validateLegacyVisualBatchVault([createBatch('batch-1')])).toBe(true);
    expect(validateLegacyVisualBatchVault([{ id: 'broken', images: [] }])).toBe(false);
    expect(validateLegacyVisualBatchVault({ id: 'not-array' })).toBe(false);
  });
});
