import { describe, expect, it } from 'vite-plus/test';
import {
  estimateImageGridItemHeight,
  estimateImageGridListItemHeight,
  resolveImageGridColumnCount,
  resolveImageGridAspectRatio,
  resolveImageGridIntrinsicSize,
  resolveImageGridItemWidth,
  resolveImageGridTemplateColumns,
  resolveImageGridVirtualWindow,
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

  it('resolves virtual windows with before and after spacers', () => {
    expect(
      resolveImageGridVirtualWindow({
        itemSizes: [100, 100, 100, 100, 100],
        scrollTop: 250,
        viewportHeight: 100,
        overscanPx: 0,
      }),
    ).toEqual({
      startIndex: 2,
      endIndex: 4,
      beforeHeight: 200,
      afterHeight: 100,
      totalHeight: 500,
    });
  });

  it('estimates virtualized item dimensions from gallery geometry', () => {
    expect(
      resolveImageGridItemWidth({ containerWidth: 640, columnCount: 3, thumbnailSize: 176 }),
    ).toBeCloseTo(202.66, 1);
    expect(estimateImageGridListItemHeight({ thumbnailSize: 176, viewportWidth: 390 })).toBe(220);
    expect(estimateImageGridListItemHeight({ thumbnailSize: 176, viewportWidth: 900 })).toBe(132);
  });

  it('resolves columns for each gallery view mode', () => {
    expect(
      resolveImageGridColumnCount({
        viewportWidth: 900,
        thumbnailSize: 176,
        itemCount: 12,
        horizontalPadding: 0,
        viewMode: 'mosaic',
      }),
    ).toBe(4);
    expect(
      resolveImageGridColumnCount({
        viewportWidth: 900,
        thumbnailSize: 176,
        itemCount: 12,
        horizontalPadding: 0,
        viewMode: 'grid',
      }),
    ).toBe(4);
    expect(
      resolveImageGridColumnCount({
        viewportWidth: 900,
        thumbnailSize: 176,
        itemCount: 12,
        horizontalPadding: 0,
        viewMode: 'cards',
      }),
    ).toBe(3);
    expect(
      resolveImageGridColumnCount({
        viewportWidth: 900,
        thumbnailSize: 176,
        itemCount: 12,
        horizontalPadding: 0,
        viewMode: 'list',
      }),
    ).toBe(1);
  });

  it('resolves template columns by gallery view mode', () => {
    expect(resolveImageGridTemplateColumns(3, 176, 'mosaic')).toBe('repeat(3, 176px)');
    expect(resolveImageGridTemplateColumns(3, 176, 'grid')).toBe('repeat(3, minmax(0, 1fr))');
    expect(resolveImageGridTemplateColumns(3, 176, 'cards')).toBe('repeat(3, minmax(0, 1fr))');
    expect(resolveImageGridTemplateColumns(3, 176, 'list')).toBe('minmax(0, 1fr)');
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
