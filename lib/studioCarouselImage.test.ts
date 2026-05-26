import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { GeneratedImageWithConfig } from '../types';
import { resolveStudioCarouselImage } from './studioCarouselImage';

function image(id: string): GeneratedImageWithConfig {
  return {
    id,
    src: `file://${id}.png`,
    batchId: 'batch-1',
    createdAt: 1,
    config: {
      ...DEFAULT_GENERATION_CONFIG,
      prompt: id,
    },
  };
}

describe('resolveStudioCarouselImage', () => {
  it('uses the active carousel id instead of the originally opened modal image', () => {
    const first = image('img-1');
    const second = image('img-2');

    expect(
      resolveStudioCarouselImage({
        activeCarouselId: 'img-2',
        modalImage: first,
        images: [first, second],
      }),
    ).toBe(second);
  });

  it('falls back to the opened modal image when the active id is stale', () => {
    const first = image('img-1');

    expect(
      resolveStudioCarouselImage({
        activeCarouselId: 'missing',
        modalImage: first,
        images: [first],
      }),
    ).toBe(first);
  });
});
