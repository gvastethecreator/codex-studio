import { describe, expect, it } from 'vite-plus/test';
import {
  buildPackFallbackCatalog,
  packIdFromPresetId,
  resolveStylePresetCardImages,
  resolveStyleCatalogResultImage,
  resolveStylePreviewImage,
} from './stylePresetVisuals';
import { DEFAULT_GENERATION_CONFIG } from '../constants';

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

  it('builds card carousel images from generated results plus default card', () => {
    expect(
      resolveStylePresetCardImages({
        resultImages: [
          {
            id: 'generated-1',
            src: '/outputs/full.webp',
            thumbnail: '/outputs/thumb.webp',
            batchId: 'batch-1',
            createdAt: 1,
            config: DEFAULT_GENERATION_CONFIG,
          },
        ],
        defaultImage: '/defaults/SP03-001.webp',
        defaultImageStale: false,
      }),
    ).toEqual([
      { kind: 'result', src: '/outputs/thumb.webp', label: 'Generated' },
      { kind: 'default', src: '/defaults/SP03-001.webp', label: 'Card' },
    ]);
  });

  it('adds default-card variants after the primary default card', () => {
    expect(
      resolveStylePresetCardImages({
        resultImages: [],
        defaultImage: '/defaults/SP03-001.webp',
        defaultImageVariants: ['/defaults/variants/SP03-001-01.webp'],
        defaultImageStale: false,
      }),
    ).toEqual([
      { kind: 'default', src: '/defaults/SP03-001.webp', label: 'Card' },
      { kind: 'variant', src: '/defaults/variants/SP03-001-01.webp', label: 'Variant 1' },
    ]);
  });

  it('shows variants before a stale primary default card', () => {
    expect(
      resolveStylePresetCardImages({
        resultImages: [],
        defaultImage: '/defaults/SP03-003.webp',
        defaultImageVariants: ['/defaults/variants/SP03-003-01.webp'],
        defaultImageStale: true,
      }),
    ).toEqual([
      { kind: 'variant', src: '/defaults/variants/SP03-003-01.webp', label: 'Variant 1' },
      { kind: 'stale-default', src: '/defaults/SP03-003.webp', label: 'Stale' },
    ]);
  });

  it('uses preview only when no generated or default image exists', () => {
    expect(
      resolveStylePresetCardImages({
        resultImages: [],
        defaultImageStale: false,
        previewImage: '/preview/category.webp',
      }),
    ).toEqual([{ kind: 'preview', src: '/preview/category.webp', label: 'Preview' }]);
  });
});
