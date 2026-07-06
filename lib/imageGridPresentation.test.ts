import { describe, expect, it } from 'vite-plus/test';
import {
  estimateImageGridItemHeight,
  resolveImageGridAspectRatio,
  resolveImageGridIntrinsicSize,
  shouldPriorityLoadImageGridItem,
  sortImageGridImages,
} from './imageGridPresentation';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { GeneratedImageWithConfig } from '../types';

function imageWithAspectRatio(
  aspectRatio: GeneratedImageWithConfig['config']['aspectRatio'],
  overrides: Partial<GeneratedImageWithConfig> = {},
): GeneratedImageWithConfig {
  return {
    id: 'image-1',
    src: '/image.webp',
    batchId: 'batch-1',
    createdAt: 1,
    config: {
      ...DEFAULT_GENERATION_CONFIG,
      prompt: 'prompt',
      aspectRatio,
    },
    ...overrides,
  };
}

describe('imageGridPresentation', () => {
  it('reserves card geometry from generation aspect ratio', () => {
    expect(resolveImageGridAspectRatio(imageWithAspectRatio('2:3'))).toBe('2 / 3');
    expect(resolveImageGridAspectRatio(imageWithAspectRatio('3:2'))).toBe('3 / 2');
    expect(resolveImageGridAspectRatio(imageWithAspectRatio('1:1'))).toBe('1 / 1');
    expect(
      resolveImageGridAspectRatio({
        ...imageWithAspectRatio('1:1'),
        width: 1024,
        height: 1536,
      }),
    ).toBe('1024 / 1536');
  });

  it('passes valid intrinsic dimensions to priority images', () => {
    expect(resolveImageGridIntrinsicSize({ width: 1024, height: 1536 })).toEqual({
      width: 1024,
      height: 1536,
    });
    expect(resolveImageGridIntrinsicSize({ width: null, height: 1536 })).toEqual({
      width: undefined,
      height: undefined,
    });
  });

  it('estimates card height from the resolved image geometry', () => {
    expect(
      estimateImageGridItemHeight({
        image: imageWithAspectRatio('3:2'),
        thumbnailSize: 176,
      }),
    ).toBeCloseTo(117.33, 1);
    expect(
      estimateImageGridItemHeight({
        image: { ...imageWithAspectRatio('1:1'), width: 512, height: 768 },
        thumbnailSize: 176,
      }),
    ).toBeCloseTo(264, 0);
  });

  it('prioritizes images estimated inside the first viewport', () => {
    expect(shouldPriorityLoadImageGridItem({ estimatedTop: 0, viewportHeight: 800 })).toBe(true);
    expect(shouldPriorityLoadImageGridItem({ estimatedTop: 850, viewportHeight: 800 })).toBe(true);
    expect(shouldPriorityLoadImageGridItem({ estimatedTop: 920, viewportHeight: 800 })).toBe(false);
  });

  it('sorts generated images by explicit gallery actions', () => {
    const images = [
      imageWithAspectRatio('1:1', {
        id: 'c-image',
        createdAt: 30,
        config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'Gamma', aspectRatio: '1:1' },
      }),
      imageWithAspectRatio('2:3', {
        id: 'a-image',
        createdAt: 10,
        config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'Alpha', aspectRatio: '2:3' },
      }),
      imageWithAspectRatio('16:9', {
        id: 'b-image',
        createdAt: 20,
        config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'Beta', aspectRatio: '16:9' },
      }),
    ];

    expect(sortImageGridImages(images, 'desc').map((image) => image.id)).toEqual([
      'c-image',
      'b-image',
      'a-image',
    ]);
    expect(sortImageGridImages(images, 'prompt').map((image) => image.id)).toEqual([
      'a-image',
      'b-image',
      'c-image',
    ]);
    expect(sortImageGridImages(images, 'prompt_desc').map((image) => image.id)).toEqual([
      'c-image',
      'b-image',
      'a-image',
    ]);
    expect(sortImageGridImages(images, 'id').map((image) => image.id)).toEqual([
      'a-image',
      'b-image',
      'c-image',
    ]);
  });
});
