import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { GeneratedImageWithConfig } from '../types';
import {
  resolveStudioCarouselDisplayCandidates,
  resolveStudioCarouselDisplaySrc,
  resolveStudioCarouselFallbackSrc,
  resolveStudioCarouselImage,
} from './studioCarouselImage';

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

  it('uses the bounded preview for modal display when preview variants are available', () => {
    const modalImage = {
      ...image('img-1'),
      src: 'http://studio/library/outputs/original.png',
      preview: 'http://studio/library/outputs/original.png?variant=thumb&max=1024',
      thumbnail: 'http://studio/library/outputs/original.png?variant=thumb&max=512',
    };

    expect(resolveStudioCarouselDisplaySrc({ image: modalImage, isComparing: false })).toBe(
      modalImage.preview,
    );
  });

  it('falls through preview, thumbnail, and source when display candidates fail', () => {
    const modalImage = {
      ...image('img-1'),
      src: 'http://studio/library/outputs/original.png',
      preview: 'http://studio/library/outputs/original.png?variant=thumb&max=1024',
      thumbnail: 'http://studio/library/outputs/thumbnails/stored-thumb.webp',
    };

    const displaySrc = resolveStudioCarouselDisplaySrc({ image: modalImage, isComparing: false });

    expect(
      resolveStudioCarouselFallbackSrc({ image: modalImage, displaySrc, isComparing: false }),
    ).toBe(modalImage.thumbnail);
    expect(
      resolveStudioCarouselDisplaySrc({
        image: modalImage,
        isComparing: false,
        failedDisplaySrcs: [modalImage.preview],
      }),
    ).toBe(modalImage.thumbnail);
    expect(
      resolveStudioCarouselDisplaySrc({
        image: modalImage,
        isComparing: false,
        failedDisplaySrcs: [modalImage.preview, modalImage.thumbnail],
      }),
    ).toBe(modalImage.src);
  });

  it('deduplicates safe visual candidates for source-missing catalog entries', () => {
    const modalImage = {
      ...image('img-1'),
      src: 'http://studio/library/outputs/thumbnails/stored-thumb.webp',
      preview: 'http://studio/library/outputs/thumbnails/stored-thumb.webp',
      thumbnail: 'http://studio/library/outputs/thumbnails/stored-thumb.webp',
    };

    expect(
      resolveStudioCarouselDisplayCandidates({ image: modalImage, isComparing: false }),
    ).toEqual([modalImage.thumbnail]);
  });

  it('uses the reference image only while comparing', () => {
    const modalImage = {
      ...image('img-1'),
      config: {
        ...DEFAULT_GENERATION_CONFIG,
        attachments: [
          {
            id: 'ref-1',
            name: 'reference.png',
            dataUrl: 'data:image/png;base64,REF',
            strength: 1,
          },
        ],
      },
    };

    expect(resolveStudioCarouselDisplaySrc({ image: modalImage, isComparing: true })).toBe(
      'data:image/png;base64,REF',
    );
  });
});
