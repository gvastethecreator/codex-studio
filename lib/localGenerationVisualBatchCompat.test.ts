import { describe, expect, it } from 'vite-plus/test';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { GeneratedImage } from '../types';
import {
  appendLocalGenerationResultToLegacyVisualBatches,
  buildLegacyVisualBatchFromLocalGenerationResult,
} from './localGenerationVisualBatchCompat';

function createImage(id: string): GeneratedImage {
  return {
    id,
    src: `${id}.png`,
    batchId: 'batch-1',
    createdAt: 1,
  };
}

describe('localGenerationVisualBatchCompat', () => {
  it('builds a legacy Visual Batch from catalog-derived local generation results', () => {
    const batch = buildLegacyVisualBatchFromLocalGenerationResult({
      batchId: 'batch-1',
      workspaceId: 'default',
      config: DEFAULT_GENERATION_CONFIG,
      images: [createImage('image-1')],
      createdAt: 1,
      generatedCount: 1,
    });

    expect(batch).toEqual({
      id: 'batch-1',
      workspaceId: 'default',
      config: DEFAULT_GENERATION_CONFIG,
      images: [createImage('image-1')],
      createdAt: 1,
    });
  });

  it('keeps local generation append behind an explicit legacy Visual Batch edge', () => {
    const calls: unknown[] = [];

    const returned = appendLocalGenerationResultToLegacyVisualBatches(
      {
        batchId: 'batch-1',
        workspaceId: 'default',
        config: DEFAULT_GENERATION_CONFIG,
        images: [createImage('image-1')],
        createdAt: 1,
        generatedCount: 1,
      },
      (nextRef, options) => calls.push({ nextRef, options }),
      { maxPerWorkspace: 20 },
    );

    expect(returned.id).toBe('batch-1');
    expect(calls).toEqual([
      {
        nextRef: { id: 'batch-1', workspaceId: 'default' },
        options: { maxPerWorkspace: 20 },
      },
    ]);
  });
});
