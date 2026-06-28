import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import { toLegacyVisualBatchSnapshot } from './studioLegacyVisualBatchTypes';

describe('studioLegacyVisualBatchTypes', () => {
  it('translates live generation batches into sealed legacy DTO snapshots', () => {
    const snapshot = toLegacyVisualBatchSnapshot([
      {
        id: 'batch-1',
        workspaceId: 'workspace-1',
        config: {
          ...DEFAULT_GENERATION_CONFIG,
          prompt: 'A scene',
        },
        images: [
          {
            id: 'image-1',
            src: '/library/image.webp',
            batchId: 'batch-1',
            createdAt: 1,
            isFavorite: true,
          },
        ],
        createdAt: 1,
      },
    ]);

    expect(snapshot).toEqual([
      {
        id: 'batch-1',
        workspaceId: 'workspace-1',
        config: expect.objectContaining({ prompt: 'A scene' }),
        images: [
          {
            id: 'image-1',
            src: '/library/image.webp',
            batchId: 'batch-1',
            createdAt: 1,
            isFavorite: true,
          },
        ],
        createdAt: 1,
      },
    ]);
  });
});
