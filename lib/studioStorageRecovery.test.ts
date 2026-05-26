import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import { LEGACY_VISUAL_BATCH_CACHE_KEYS } from './studioLegacyVisualBatchStore';
import type { LegacyVisualBatch } from './studioLegacyVisualSnapshotImport';
import { collectRecoverableLegacyVisualSnapshot } from './studioStorageRecovery';

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

describe('collectRecoverableLegacyVisualSnapshot', () => {
  it('collects recoverable Visual Batches from IndexedDB and localStorage payloads', () => {
    const recovered = collectRecoverableLegacyVisualSnapshot({
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

    const recovered = collectRecoverableLegacyVisualSnapshot({
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
