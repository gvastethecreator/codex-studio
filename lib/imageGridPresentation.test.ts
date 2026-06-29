import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { GeneratedImageWithConfig } from '../types';
import {
  filterImageGridImages,
  resolveImageGridColumnCount,
  resolveImageGridTemplateColumns,
  sortImageGridImages,
} from './imageGridPresentation';

function image(overrides: Partial<GeneratedImageWithConfig>): GeneratedImageWithConfig {
  return {
    id: overrides.id ?? 'image',
    src: overrides.src ?? '/image.png',
    batchId: overrides.batchId ?? 'batch',
    createdAt: overrides.createdAt ?? 1,
    isFavorite: overrides.isFavorite ?? false,
    config: {
      ...DEFAULT_GENERATION_CONFIG,
      ...overrides.config,
      prompt: overrides.config?.prompt ?? 'Prompt',
      aspectRatio: overrides.config?.aspectRatio ?? '1:1',
    },
  };
}

describe('imageGridPresentation', () => {
  it('filters favorites without pinning them ahead of the chosen sort', () => {
    const images = [
      image({
        id: 'favorite-old',
        createdAt: 1,
        isFavorite: true,
        config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'B', aspectRatio: '1:1' },
      }),
      image({
        id: 'regular-new',
        createdAt: 3,
        isFavorite: false,
        config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'A', aspectRatio: '2:3' },
      }),
      image({
        id: 'favorite-mid',
        createdAt: 2,
        isFavorite: true,
        config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'C', aspectRatio: '3:2' },
      }),
    ];

    expect(sortImageGridImages(images, 'desc').map((entry) => entry.id)).toEqual([
      'regular-new',
      'favorite-mid',
      'favorite-old',
    ]);
    expect(filterImageGridImages(images, true).map((entry) => entry.id)).toEqual([
      'favorite-old',
      'favorite-mid',
    ]);
  });

  it('changes column density from thumbnail size while keeping mobile single-column', () => {
    expect(
      resolveImageGridColumnCount({
        viewportWidth: 390,
        thumbnailSize: 144,
        itemCount: 12,
      }),
    ).toBe(1);
    expect(
      resolveImageGridColumnCount({
        viewportWidth: 1280,
        thumbnailSize: 160,
        itemCount: 12,
      }),
    ).toBeGreaterThan(
      resolveImageGridColumnCount({
        viewportWidth: 1280,
        thumbnailSize: 320,
        itemCount: 12,
      }),
    );
  });

  it('keeps each thumbnail size value visible in the multi-column grid template', () => {
    const templates = [144, 152, 160, 168, 176, 184].map((thumbnailSize) =>
      resolveImageGridTemplateColumns(4, thumbnailSize),
    );

    expect(resolveImageGridTemplateColumns(4, 176)).toBe('repeat(4, 176px)');
    expect(new Set(templates).size).toBe(templates.length);
  });

  it('keeps single-column grids fluid for narrow layouts', () => {
    expect(resolveImageGridTemplateColumns(1, 176)).toBe('repeat(1, minmax(0, 1fr))');
  });

  it('accounts for grid gaps before adding another column', () => {
    expect(
      resolveImageGridColumnCount({
        viewportWidth: 1118,
        thumbnailSize: 144,
        itemCount: 20,
      }),
    ).toBe(6);
  });

  it('uses measured grid width directly when padding is already excluded', () => {
    expect(
      resolveImageGridColumnCount({
        viewportWidth: 1072,
        thumbnailSize: 144,
        itemCount: 20,
        horizontalPadding: 0,
      }),
    ).toBe(6);
  });
});
