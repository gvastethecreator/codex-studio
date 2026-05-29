import { describe, expect, it } from 'vite-plus/test';
import {
  buildPackFallbackCatalog,
  packIdFromPresetId,
  resolveStyleCatalogResultImage,
  resolveStylePreviewImage,
} from './stylePresetVisuals';

describe('stylePresetVisuals', () => {
  it('derives pack ids from preset ids', () => {
    expect(packIdFromPresetId('SP12-052')).toBe('pack_12');
    expect(packIdFromPresetId('broken')).toBeNull();
  });

  it('chooses the first existing default image as pack fallback', () => {
    expect(
      buildPackFallbackCatalog({
        'SP12-053': '/defaults/SP12-053.webp',
        'SP12-001': '/defaults/SP12-001.webp',
        'SP06-119': '/defaults/SP06-119.webp',
      }),
    ).toEqual({
      pack_06: '/defaults/SP06-119.webp',
      pack_12: '/defaults/SP12-001.webp',
    });
  });

  it('uses exact preset asset before pack fallback in catalog results', () => {
    expect(
      resolveStyleCatalogResultImage({
        presetId: 'SP12-001',
        packId: 'pack_12',
        defaultImages: {
          'SP12-001': '/defaults/SP12-001.webp',
        },
        packFallbackImages: {
          pack_12: '/defaults/SP12-010.webp',
        },
      }),
    ).toBe('/defaults/SP12-001.webp');

    expect(
      resolveStyleCatalogResultImage({
        presetId: 'SP12-999',
        packId: 'pack_12',
        defaultImages: {},
        packFallbackImages: {
          pack_12: '/defaults/SP12-010.webp',
        },
      }),
    ).toBe('/defaults/SP12-010.webp');
  });

  it('resolves preview image by category first, then preview, then pack fallback', () => {
    expect(
      resolveStylePreviewImage({
        categoryImage: '/category/exact.webp',
        categoryPreviewImage: '/preview/category.webp',
        packFallbackImage: '/defaults/SP12-010.webp',
      }),
    ).toBe('/category/exact.webp');

    expect(
      resolveStylePreviewImage({
        categoryPreviewImage: '/preview/category.webp',
        packFallbackImage: '/defaults/SP12-010.webp',
      }),
    ).toBe('/preview/category.webp');

    expect(
      resolveStylePreviewImage({
        packFallbackImage: '/defaults/SP12-010.webp',
      }),
    ).toBe('/defaults/SP12-010.webp');
  });
});
