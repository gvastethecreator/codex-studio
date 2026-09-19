import { describe, expect, it } from 'vitest';

import {
  compactStyleMenuTitle,
  compactStyleParentRoute,
  filterCompactStyleCatalog,
  formatCompactStyleStrength,
  listCompactStyleCategories,
  listCompactStylePacks,
  mergeCompactStyleSearchIndexes,
  planCompactStyleCatalogPackIds,
  type CompactStyleRoute,
} from './compactStyleCatalog';
import type { StylePresetCatalogSearchIndex } from './stylePresetManifests';

const index: StylePresetCatalogSearchIndex = {
  packs: [
    { id: 'pack_01', name: 'Photography', presetCount: 2 },
    { id: 'pack_06', name: 'Art', presetCount: 1 },
  ],
  totalPresetCount: 3,
  presets: [
    {
      id: 'SP01-001',
      name: 'Silver Grain',
      ref: 'pack_01/SP01-001.yaml',
      packId: 'pack_01',
      packName: 'Photography',
      categoryId: 'film',
      categoryName: 'Film Stocks',
      tags: [],
      supportedTasks: ['image_generate'],
      searchableText: 'sp01-001 silver grain photography film stocks',
    },
    {
      id: 'SP01-002',
      name: 'Noir Lighting',
      ref: 'pack_01/SP01-002.yaml',
      packId: 'pack_01',
      packName: 'Photography',
      categoryId: 'light',
      categoryName: 'Lighting',
      tags: [],
      supportedTasks: ['image_generate'],
      searchableText: 'sp01-002 noir lighting photography lighting',
    },
    {
      id: 'SP06-001',
      name: 'Linocut',
      ref: 'pack_06/SP06-001.yaml',
      packId: 'pack_06',
      packName: 'Art',
      categoryId: 'print',
      categoryName: 'Print',
      tags: [],
      supportedTasks: ['image_generate'],
      searchableText: 'sp06-001 linocut art print',
    },
  ],
};

describe('compactStyleCatalog', () => {
  it('formats intensity as a percent and keeps pack/category navigation bounded', () => {
    expect(formatCompactStyleStrength(0.75)).toBe('75%');
    expect(planCompactStyleCatalogPackIds({
      route: { view: 'packs' },
      query: '',
      packSummaries: index.packs,
    })).toEqual([]);
    expect(planCompactStyleCatalogPackIds({
      route: { view: 'styles', packId: 'pack_01', categoryId: 'film' },
      query: '',
      packSummaries: index.packs,
    })).toEqual(['pack_01']);
    expect(planCompactStyleCatalogPackIds({
      route: { view: 'all' },
      query: 'grain',
      packSummaries: index.packs,
    })).toEqual(['pack_01', 'pack_06']);
    expect(compactStyleParentRoute({ view: 'styles', packId: 'pack_01', categoryId: 'film' })).toEqual({
      view: 'categories',
      packId: 'pack_01',
    });
  });

  it('filters search, favorites, and category lists from the loaded index', () => {
    const packsRoute: CompactStyleRoute = { view: 'packs' };
    expect(filterCompactStyleCatalog({
      index,
      route: packsRoute,
      query: '',
      favorites: ['SP06-001'],
    })).toEqual([]);
    expect(
      filterCompactStyleCatalog({
        index,
        route: { view: 'all' },
        query: 'silver',
        favorites: [],
      }).map((item) => item.id),
    ).toEqual(['SP01-001']);
    expect(
      filterCompactStyleCatalog({
        index,
        route: { view: 'favorites' },
        query: '',
        favorites: ['SP06-001'],
      }).map((item) => item.id),
    ).toEqual(['SP06-001']);
    expect(listCompactStyleCategories(index, 'pack_01')).toEqual([
      { id: 'film', name: 'Film Stocks', count: 1 },
      { id: 'light', name: 'Lighting', count: 1 },
    ]);
    expect(compactStyleMenuTitle({
      route: { view: 'categories', packId: 'pack_01' },
      query: '',
      resultCount: 0,
      packs: index.packs,
    })).toBe('Photography');
  });

  it('merges extra user styles without duplicating runtime presets', () => {
    const extra: StylePresetCatalogSearchIndex = {
      packs: [{ id: 'user_styles', name: 'My Styles', presetCount: 1 }],
      totalPresetCount: 2,
      presets: [
        index.presets[0],
        {
          id: 'user-1',
          name: 'Custom Blend',
          ref: 'user_styles/user-1.yaml',
          packId: 'user_styles',
          packName: 'My Styles',
          categoryId: 'custom',
          categoryName: 'Custom',
          tags: [],
          supportedTasks: ['image_generate'],
          searchableText: 'user-1 custom blend',
        },
      ],
    };
    const merged = mergeCompactStyleSearchIndexes(index, extra);
    expect(merged.presets.map((preset) => preset.id)).toEqual([
      'SP01-001',
      'SP01-002',
      'SP06-001',
      'user-1',
    ]);
    expect(listCompactStylePacks(index.packs, extra).map((pack) => pack.id)).toEqual([
      'pack_01',
      'pack_06',
      'user_styles',
    ]);
  });
});
