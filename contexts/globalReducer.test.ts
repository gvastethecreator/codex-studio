import { describe, expect, it } from 'vite-plus/test';

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
      prompt: '',
      recipeContext: '',
      recipeId: null,
      recipeParams: null,
      attachments: [],
      aspectRatio: '1:1',
      imageSize: '1K',
      negativePrompt: '',
      temperature: 0.8,
      model: 'codex-imagegen',
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
      batches: [createBatch('batch-1', 'default', ['img-1'])],
    };

    const next = globalReducer(initial, {
      type: 'PREPEND_BATCH',
      batch: createBatch('batch-1', 'default', ['img-2']),
    });

    expect(next.batches).toHaveLength(1);
    expect(next.batches[0].images.map((image) => image.id)).toEqual(['img-1', 'img-2']);
  });

  it('respects maxPerWorkspace when prepending a batch', () => {
    const initial = {
      ...createInitialGlobalState(),
      batches: [createBatch('older', 'default', ['old'])],
    };

    const next = globalReducer(initial, {
      type: 'PREPEND_BATCH',
      batch: createBatch('newer', 'default', ['new']),
      maxPerWorkspace: 1,
    });

    expect(next.batches.map((batch) => batch.id)).toEqual(['newer']);
  });

  it('archives a batch when its last image is deleted', () => {
    const initialBatch = createBatch('batch-1', 'default', ['img-1']);
    const initial = {
      ...createInitialGlobalState(),
      batches: [initialBatch],
    };

    const next = globalReducer(initial, {
      type: 'DELETE_IMAGE',
      imageId: 'img-1',
    });

    expect(next.batches).toHaveLength(0);
    expect(next.trash).toHaveLength(1);
    expect(next.trash[0].id).toBe('batch-1');
  });

  it('clears one workspace and preserves others', () => {
    const initial = {
      ...createInitialGlobalState(),
      batches: [
        createBatch('default-batch', 'default', ['default-img']),
        createBatch('other-batch', 'ws-1', ['other-img']),
      ],
    };

    const next = globalReducer(initial, {
      type: 'CLEAR_WORKSPACE',
      workspaceId: 'ws-1',
    });

    expect(next.batches.map((batch) => batch.id)).toEqual(['default-batch']);
    expect(next.trash.map((batch) => batch.id)).toEqual(['other-batch']);
  });

  it('restores one batch from trash back into batches', () => {
    const trashedBatch = createBatch('trashed', 'default', ['img-1']);
    const initial = {
      ...createInitialGlobalState(),
      trash: [trashedBatch],
    };

    const next = globalReducer(initial, {
      type: 'RESTORE_FROM_TRASH',
      batchId: 'trashed',
    });

    expect(next.trash).toHaveLength(0);
    expect(next.batches.map((batch) => batch.id)).toEqual(['trashed']);
  });
});
