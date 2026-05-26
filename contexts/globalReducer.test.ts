import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { GenerationBatch } from '../types';
import { createInitialGlobalState, globalReducer } from './globalReducer';

function createBatch(
  id: string,
  workspaceId = 'default',
  imageIds: string[] = [id],
): GenerationBatch {
  return {
    id,
    workspaceId,
    createdAt: 1,
    config: {
      ...DEFAULT_GENERATION_CONFIG,
      batchCount: 1,
      useThinkingAndSearch: false,
    },
    images: imageIds.map((imageId, index) => ({
      id: imageId,
      src: `${imageId}.png`,
      batchId: id,
      createdAt: index,
      isFavorite: false,
    })),
  };
}

describe('globalReducer', () => {
  it('merges images when prepending an existing batch id', () => {
    const initial = {
      ...createInitialGlobalState(),
      legacyVisualBatches: [createBatch('batch-1', 'default', ['img-1'])],
    };

    const next = globalReducer(initial, {
      type: 'PREPEND_GENERATED_VISUAL_BATCH',
      batch: createBatch('batch-1', 'default', ['img-2']),
    });

    expect(next.legacyVisualBatches).toHaveLength(1);
    expect(next.legacyVisualBatches[0].images.map((image) => image.id)).toEqual(['img-1', 'img-2']);
  });

  it('respects maxPerWorkspace when prepending a batch', () => {
    const initial = {
      ...createInitialGlobalState(),
      legacyVisualBatches: [createBatch('older', 'default', ['old'])],
    };

    const next = globalReducer(initial, {
      type: 'PREPEND_GENERATED_VISUAL_BATCH',
      batch: createBatch('newer', 'default', ['new']),
      maxPerWorkspace: 1,
    });

    expect(next.legacyVisualBatches.map((batch) => batch.id)).toEqual(['newer']);
  });

  it('archives a batch when its last image is deleted', () => {
    const initialBatch = createBatch('batch-1', 'default', ['img-1']);
    const initial = {
      ...createInitialGlobalState(),
      legacyVisualBatches: [initialBatch],
    };

    const next = globalReducer(initial, {
      type: 'DELETE_LEGACY_VISUAL_IMAGE',
      imageId: 'img-1',
    });

    expect(next.legacyVisualBatches).toHaveLength(0);
    expect(next.legacyVisualTrash).toHaveLength(1);
    expect(next.legacyVisualTrash[0].id).toBe('batch-1');
  });

  it('clears one workspace and preserves others', () => {
    const initial = {
      ...createInitialGlobalState(),
      legacyVisualBatches: [
        createBatch('default-batch', 'default', ['default-img']),
        createBatch('other-batch', 'ws-1', ['other-img']),
      ],
    };

    const next = globalReducer(initial, {
      type: 'CLEAR_LEGACY_VISUAL_WORKSPACE',
      workspaceId: 'ws-1',
    });

    expect(next.legacyVisualBatches.map((batch) => batch.id)).toEqual(['default-batch']);
    expect(next.legacyVisualTrash.map((batch) => batch.id)).toEqual(['other-batch']);
  });

  it('restores one batch from trash back into batches', () => {
    const trashedBatch = createBatch('trashed', 'default', ['img-1']);
    const initial = {
      ...createInitialGlobalState(),
      legacyVisualTrash: [trashedBatch],
    };

    const next = globalReducer(initial, {
      type: 'RESTORE_LEGACY_VISUAL_BATCH_FROM_TRASH',
      batchId: 'trashed',
    });

    expect(next.legacyVisualTrash).toHaveLength(0);
    expect(next.legacyVisualBatches.map((batch) => batch.id)).toEqual(['trashed']);
  });

  it('preserves existing slices when hydrate payload contains undefined values', () => {
    const initial = {
      ...createInitialGlobalState(),
      logs: [{ id: 'log-1', timestamp: 1, message: 'ready' }],
      legacyVisualBatches: [createBatch('batch-1', 'default', ['img-1'])],
      legacyVisualTrash: [createBatch('trash-1', 'default', ['trash-img'])],
      bgConfig: { density: 0.2, speed: 0.01 },
      isBackgroundEnabled: false,
    };

    const next = globalReducer(initial, {
      type: 'HYDRATE_STATE',
      state: {
        logs: undefined,
        legacyVisualBatches: undefined,
        legacyVisualTrash: undefined,
        bgConfig: undefined,
        workspaces: undefined,
      },
    });

    expect(next.logs).toEqual(initial.logs);
    expect(next.legacyVisualBatches).toEqual(initial.legacyVisualBatches);
    expect(next.legacyVisualTrash).toEqual(initial.legacyVisualTrash);
    expect(next.bgConfig).toEqual(initial.bgConfig);
    expect(next.isBackgroundEnabled).toBe(false);
    expect(next.workspaces).toEqual(initial.workspaces);
    expect(next.activeWorkspaceId).toBe(initial.activeWorkspaceId);
  });
});
