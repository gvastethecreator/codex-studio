import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { GenerationBatch } from '../types';
import { LEGACY_VISUAL_BATCH_CACHE_KEYS } from './studioLegacyVisualBatchStore';
import { collectRecoverableBatches } from './studioStorageRecovery';

function createBatch(id: string): GenerationBatch {
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

describe('collectRecoverableBatches', () => {
  it('collects recoverable Visual Batches from IndexedDB and localStorage payloads', () => {
    const recovered = collectRecoverableBatches({
      idbEntries: [
        { key: 'orphaned-batch', value: createBatch('idb-batch') },
        { key: LEGACY_VISUAL_BATCH_CACHE_KEYS[0], value: [createBatch('ignored-cache')] },
      ],
      storageEntries: [
        { key: 'snapshot', value: JSON.stringify([createBatch('storage-batch')]) },
        { key: 'broken', value: '{not-json' },
      ],
    });

    expect(recovered.map((batch) => batch.id)).toEqual(['idb-batch', 'storage-batch']);
  });

  it('filters existing batch ids and deduplicates repeated recoveries', () => {
    const repeated = createBatch('repeated');

    const recovered = collectRecoverableBatches({
      idbEntries: [
        { key: 'one', value: repeated },
        { key: 'two', value: repeated },
      ],
      storageEntries: [{ key: 'three', value: JSON.stringify(repeated) }],
      existingBatchIds: ['repeated'],
    });

    expect(recovered).toEqual([]);
  });
});
