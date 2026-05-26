import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { LegacyVisualBatch } from '../lib/studioLegacyVisualSnapshotImport';
import {
  createInitialLegacyVisualBatchState,
  legacyVisualBatchReducer,
} from './legacyVisualBatchReducer';

function createBatch(id: string, workspaceId = 'default'): LegacyVisualBatch {
  return {
    id,
    workspaceId,
    createdAt: 1,
    config: {
      ...DEFAULT_GENERATION_CONFIG,
      batchCount: 1,
      useThinkingAndSearch: false,
    },
    images: [
      {
        id: `${id}-image`,
        src: `${id}.png`,
        batchId: id,
        createdAt: 1,
        isFavorite: false,
      },
    ],
  };
}

describe('legacyVisualBatchReducer', () => {
  it('tracks generated legacy Visual Batch ids without storing full snapshots', () => {
    const initial = {
      ...createInitialLegacyVisualBatchState(),
      legacyVisualBatchRefs: [{ id: 'batch-1', workspaceId: 'default' }],
    };

    const next = legacyVisualBatchReducer(initial, {
      type: 'REGISTER_GENERATED_LEGACY_VISUAL_BATCH_REF',
      ref: { id: 'batch-2', workspaceId: 'default' },
    });

    expect(next.legacyVisualBatchRefs).toEqual([
      { id: 'batch-2', workspaceId: 'default' },
      { id: 'batch-1', workspaceId: 'default' },
    ]);
  });

  it('respects maxPerWorkspace when registering generated ids', () => {
    const initial = {
      ...createInitialLegacyVisualBatchState(),
      legacyVisualBatchRefs: [{ id: 'older', workspaceId: 'default' }],
    };

    const next = legacyVisualBatchReducer(initial, {
      type: 'REGISTER_GENERATED_LEGACY_VISUAL_BATCH_REF',
      ref: { id: 'newer', workspaceId: 'default' },
      maxPerWorkspace: 1,
    });

    expect(next.legacyVisualBatchRefs).toEqual([{ id: 'newer', workspaceId: 'default' }]);
  });

  it('registers recovered ids with dedupe and maxTotal', () => {
    const initial = {
      ...createInitialLegacyVisualBatchState(),
      legacyVisualBatchRefs: [{ id: 'existing', workspaceId: 'default' }],
    };

    const next = legacyVisualBatchReducer(initial, {
      type: 'REGISTER_RECOVERED_LEGACY_VISUAL_BATCH_IDS',
      batches: [createBatch('recovered', 'ws-1'), createBatch('existing')],
      prepend: true,
      maxTotal: 2,
    });

    expect(next.legacyVisualBatchRefs).toEqual([
      { id: 'recovered', workspaceId: 'ws-1' },
      { id: 'existing', workspaceId: 'default' },
    ]);
  });

  it('clears one workspace and preserves others', () => {
    const initial = {
      ...createInitialLegacyVisualBatchState(),
      legacyVisualBatchRefs: [
        { id: 'default-batch', workspaceId: 'default' },
        { id: 'other-batch', workspaceId: 'ws-1' },
      ],
    };

    const next = legacyVisualBatchReducer(initial, {
      type: 'CLEAR_LEGACY_VISUAL_WORKSPACE_IDS',
      workspaceId: 'ws-1',
    });

    expect(next.legacyVisualBatchRefs).toEqual([{ id: 'default-batch', workspaceId: 'default' }]);
  });

  it('resets to empty state', () => {
    const initial = {
      ...createInitialLegacyVisualBatchState(),
      legacyVisualBatchRefs: [{ id: 'batch-1', workspaceId: 'default' }],
    };

    const next = legacyVisualBatchReducer(initial, {
      type: 'RESET_LEGACY_VISUAL_BATCH_IDS',
    });

    expect(next.legacyVisualBatchRefs).toEqual([]);
  });
});
