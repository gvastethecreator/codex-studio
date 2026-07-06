import { describe, expect, it } from 'vite-plus/test';

import type { StyleCollection } from './styleCollectionTypes';
import {
  getStyleCollectionFolderImageCandidates,
  getStyleFolderImages,
} from './styleCollectionFolderImages';

const thumbnailCatalog = {
  pack_bad__unrelated: '/bad-category.webp',
  pack_good__good_category: '/good-category.webp',
  'SPGOOD-001': '/good-featured.webp',
  'SPGOOD-002': '/good-preset.webp',
  'SP12-001': '/source-preset.webp',
};

function collection(overrides: Partial<StyleCollection>): StyleCollection {
  return {
    id: 'collection_test',
    title: 'Collection Test',
    familyId: 'test',
    description: 'Test collection',
    icon: 'grid',
    order: 1,
    sourcePackIds: ['pack_bad', 'pack_good'],
    entries: [],
    ...overrides,
  };
}

describe('style collection folder images', () => {
  it('prefers collection featured presets and entries over broad source pack thumbnails', () => {
    const candidates = getStyleCollectionFolderImageCandidates(
      collection({
        featuredPresetIds: ['SPGOOD-001'],
        entries: [
          {
            id: 'good-category',
            kind: 'category',
            packId: 'pack_good',
            categoryName: '1. Good Category',
          },
          {
            id: 'good-preset',
            kind: 'preset',
            packId: 'pack_good',
            presetId: 'SPGOOD-002',
          },
        ],
      }),
      thumbnailCatalog,
    );

    const images = getStyleFolderImages({
      seedId: 'collection_test',
      sourcePackIds: ['pack_bad', 'pack_good'],
      imageCandidates: candidates,
      thumbnailCatalog,
    });
    const srcs = [images.cover, ...images.files].map((file) => file.src);

    expect(images.cover).toMatchObject({ id: 'preset:SPGOOD-001', src: '/good-featured.webp' });
    expect(srcs).toContain('/good-category.webp');
    expect(srcs).toContain('/good-preset.webp');
    expect(srcs).not.toContain('/bad-category.webp');
  });

  it('keeps source pack cards able to fall back to source pack preset thumbnails', () => {
    const images = getStyleFolderImages({
      seedId: 'pack_12',
      sourcePackIds: ['pack_12'],
      thumbnailCatalog,
    });

    expect([images.cover, ...images.files].map((file) => file.src)).toContain(
      '/source-preset.webp',
    );
  });
});
