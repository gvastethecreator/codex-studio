import { describe, expect, it } from 'vite-plus/test';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { LegacyVisualBatch } from './studioLegacyVisualBatchTypes';
import {
  LegacyVisualSnapshotImportError,
  parseLegacyVisualBatchSnapshot,
  parseRecoverableLegacyVisualBatches,
  readLegacyVisualBatchSnapshot,
} from './studioLegacyVisualSnapshotImport';

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

describe('studioLegacyVisualSnapshotImport', () => {
  it('parses valid legacy Visual Batch snapshots at the compatibility edge', () => {
    const batches = [createBatch('batch-1')];

    expect(parseLegacyVisualBatchSnapshot(batches)).toEqual(batches);
  });

  it('throws a typed error for invalid snapshots', () => {
    expect(() => parseLegacyVisualBatchSnapshot([{ id: 'broken', images: [] }])).toThrow(
      LegacyVisualSnapshotImportError,
    );
  });

  it('extracts recoverable legacy batches from arrays or single-batch candidates', () => {
    const batch = createBatch('batch-1');

    expect(parseRecoverableLegacyVisualBatches([batch])).toEqual([batch]);
    expect(parseRecoverableLegacyVisualBatches(batch)).toEqual([batch]);
    expect(parseRecoverableLegacyVisualBatches({ id: 'broken', images: [] })).toEqual([]);
  });

  it('keeps file reading injectable so hooks do not own legacy validation details', async () => {
    const file = new File(['[]'], 'snapshot.json', { type: 'application/json' });
    const batches = [createBatch('batch-1')];

    await expect(readLegacyVisualBatchSnapshot(file, async () => batches)).resolves.toEqual(
      batches,
    );
  });
});
