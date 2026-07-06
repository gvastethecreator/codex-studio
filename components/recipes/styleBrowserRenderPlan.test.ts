import { describe, expect, it } from 'vite-plus/test';

import type { StyleRuntimePack, StyleRuntimePreset } from './styles/runtimeTypes';
import {
  STYLE_BROWSER_FLAT_GROUP_KEY,
  collectStylePresetPreviewSources,
  createStyleBrowserProcessedData,
  createStyleBrowserRenderPlan,
  measureStyleBrowserRenderPlan,
} from './styleBrowserRenderPlan';

function preset(id: string, category: string): StyleRuntimePreset {
  return {
    id,
    name: `Preset ${id}`,
    category,
    style: {
      aesthetic: `Aesthetic ${id}`,
      subject_treatment: '',
      color_and_tone: '',
      lighting_and_shadow: '',
      texture_and_material: '',
      camera_and_composition: '',
      atmosphere_and_mood: '',
      rendering_and_quality: '',
    },
  };
}

function pack(presets: StyleRuntimePreset[]): StyleRuntimePack {
  return {
    id: 'pack_01',
    name: 'Pack 01',
    description: 'Test pack',
    presets,
  };
}

describe('styleBrowserRenderPlan', () => {
  it('searches across loaded style packs instead of only the active pack', () => {
    const activePackPreset = preset('photo-a', 'Photography');
    const otherPackPreset = preset('game-a', 'Arcade Worlds');
    otherPackPreset.style.aesthetic = 'Sega Genesis dungeon staging';

    const processedData = createStyleBrowserProcessedData({
      activePack: pack([activePackPreset]),
      currentPackId: 'pack_01',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      searchPresets: [activePackPreset, otherPackPreset],
      favoriteIds: [],
      searchQuery: 'genesis',
      sortOrder: 'az',
      showFavoritesOnly: false,
    });

    expect(processedData.favorites).toEqual([]);
    expect(
      Object.values(processedData.groups)
        .flat()
        .map((item) => item.id),
    ).toEqual(['game-a']);
  });

  it('applies favorites filtering to global style search results', () => {
    const activePackPreset = preset('photo-a', 'Photography');
    const favoriteOtherPackPreset = preset('game-a', 'Arcade Worlds');
    favoriteOtherPackPreset.style.aesthetic = 'Sega Genesis dungeon staging';

    const processedData = createStyleBrowserProcessedData({
      activePack: pack([activePackPreset]),
      currentPackId: 'pack_01',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      searchPresets: [activePackPreset, favoriteOtherPackPreset],
      favoriteIds: ['game-a'],
      searchQuery: 'genesis',
      sortOrder: 'az',
      showFavoritesOnly: true,
    });

    expect(processedData.favorites.map((item) => item.id)).toEqual(['game-a']);
    expect(Object.values(processedData.groups).flat()).toEqual([]);
  });

  it('keeps every category visible while bounding eager render behavior', () => {
    const presets = [
      ...Array.from({ length: 20 }, (_, index) => preset(`a-${index}`, 'A')),
      ...Array.from({ length: 4 }, (_, index) => preset(`b-${index}`, 'B')),
      ...Array.from({ length: 4 }, (_, index) => preset(`c-${index}`, 'C')),
      ...Array.from({ length: 4 }, (_, index) => preset(`d-${index}`, 'D')),
      ...Array.from({ length: 4 }, (_, index) => preset(`e-${index}`, 'E')),
    ];
    const processedData = createStyleBrowserProcessedData({
      activePack: pack(presets),
      currentPackId: 'pack_01',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      favoriteIds: [],
      searchQuery: '',
      sortOrder: 'az',
      showFavoritesOnly: false,
    });
    const renderPlan = createStyleBrowserRenderPlan({
      processedData,
    });

    expect(renderPlan.visibleStyleGroupEntries.map(([category]) => category)).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
    ]);
    expect(measureStyleBrowserRenderPlan({ processedData, renderPlan })).toMatchObject({
      mountedCategorySections: 5,
      eagerCategorySections: 2,
      placeholderCategorySections: 3,
      eagerPresetCards: 24,
      plannedPresetCards: 36,
      hiddenCategorySections: 0,
      hiddenPresetCards: 0,
    });
  });

  it('keeps favorites eager and pushes normal groups behind placeholders', () => {
    const presets = [preset('fav', 'A'), preset('other', 'B')];
    const processedData = createStyleBrowserProcessedData({
      activePack: pack(presets),
      currentPackId: 'pack_01',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      favoriteIds: ['fav'],
      searchQuery: '',
      sortOrder: 'az',
      showFavoritesOnly: false,
    });
    const renderPlan = createStyleBrowserRenderPlan({
      processedData,
    });

    expect(processedData.favorites.map((item) => item.id)).toEqual(['fav']);
    expect(measureStyleBrowserRenderPlan({ processedData, renderPlan })).toMatchObject({
      mountedCategorySections: 2,
      eagerCategorySections: 2,
      placeholderCategorySections: 0,
      eagerPresetCards: 2,
      plannedPresetCards: 2,
    });
  });

  it('orders numbered subcategories naturally while keeping all groups visible', () => {
    const presets = [
      preset('a-1', '10. Last'),
      preset('a-2', '2. Second'),
      preset('a-3', '1. First'),
      preset('a-4', '3. Third'),
      preset('a-5', 'Zeta'),
    ];

    const processedData = createStyleBrowserProcessedData({
      activePack: pack(presets),
      currentPackId: 'pack_01',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      favoriteIds: [],
      searchQuery: '',
      sortOrder: 'az',
      showFavoritesOnly: false,
    });

    const renderPlan = createStyleBrowserRenderPlan({
      processedData,
    });

    expect(renderPlan.styleGroupEntries.map(([category]) => category)).toEqual([
      '1. First',
      '2. Second',
      '3. Third',
      '10. Last',
      'Zeta',
    ]);

    expect(renderPlan.visibleStyleGroupEntries.map(([category]) => category)).toEqual([
      '1. First',
      '2. Second',
      '3. Third',
      '10. Last',
      'Zeta',
    ]);
  });

  it('renders flat view as one source-ordered card grid without category sorting', () => {
    const presets = [
      preset('z-late-name', '10. Last'),
      preset('a-early-name', '2. Second'),
      preset('m-middle-name', '1. First'),
    ];

    const processedData = createStyleBrowserProcessedData({
      activePack: pack(presets),
      currentPackId: 'pack_01',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      favoriteIds: ['z-late-name'],
      searchQuery: '',
      sortOrder: 'source',
      showFavoritesOnly: false,
      viewMode: 'flat',
    });

    const renderPlan = createStyleBrowserRenderPlan({
      processedData,
      viewMode: 'flat',
    });

    expect(processedData.favorites).toEqual([]);
    expect(processedData.flatPresets.map((item) => item.id)).toEqual([
      'z-late-name',
      'a-early-name',
      'm-middle-name',
    ]);
    expect(renderPlan.styleGroupEntries).toHaveLength(1);
    expect(renderPlan.styleGroupEntries[0]?.[0]).toBe(STYLE_BROWSER_FLAT_GROUP_KEY);
    expect(renderPlan.styleGroupEntries[0]?.[1].map((item) => item.id)).toEqual([
      'z-late-name',
      'a-early-name',
      'm-middle-name',
    ]);
  });

  it('sorts cards by creation and update dates with stable source fallback', () => {
    const oldPreset = {
      ...preset('old', 'A'),
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-04T00:00:00.000Z',
    };
    const missingPreset = preset('missing', 'A');
    const recentPreset = {
      ...preset('recent', 'A'),
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    const uiUpdatedPreset = {
      ...preset('ui-updated', 'A'),
      createdAt: '2026-02-01T00:00:00.000Z',
      ui: { updatedAt: '2026-04-01T00:00:00.000Z' },
    };
    const presets = [oldPreset, missingPreset, recentPreset, uiUpdatedPreset];

    const createdData = createStyleBrowserProcessedData({
      activePack: pack(presets),
      currentPackId: 'pack_01',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      favoriteIds: [],
      searchQuery: '',
      sortOrder: 'created_desc',
      showFavoritesOnly: false,
      viewMode: 'flat',
    });
    const updatedData = createStyleBrowserProcessedData({
      activePack: pack(presets),
      currentPackId: 'pack_01',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      favoriteIds: [],
      searchQuery: '',
      sortOrder: 'updated_desc',
      showFavoritesOnly: false,
      viewMode: 'flat',
    });

    expect(createdData.flatPresets.map((item) => item.id)).toEqual([
      'recent',
      'ui-updated',
      'old',
      'missing',
    ]);
    expect(updatedData.flatPresets.map((item) => item.id)).toEqual([
      'ui-updated',
      'old',
      'recent',
      'missing',
    ]);
  });

  it('renders global category view by source category without pinning favorites away', () => {
    const presets = [
      preset('photo-first', '10. Last'),
      preset('anime-first', '1. First'),
      preset('photo-second', '2. Second'),
    ];

    const processedData = createStyleBrowserProcessedData({
      activePack: pack(presets),
      currentPackId: 'all_categories',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      favoriteIds: ['photo-first'],
      categoryKeyForPreset: (item) =>
        item.id.startsWith('photo') ? `Photo / ${item.category}` : `Anime / ${item.category}`,
      pinFavorites: false,
      searchQuery: '',
      sortOrder: 'source',
      showFavoritesOnly: false,
      viewMode: 'grouped',
    });

    const renderPlan = createStyleBrowserRenderPlan({
      groupOrder: 'source',
      processedData,
      viewMode: 'grouped',
    });

    expect(processedData.favorites).toEqual([]);
    expect(renderPlan.styleGroupEntries.map(([category]) => category)).toEqual([
      'Photo / 10. Last',
      'Anime / 1. First',
      'Photo / 2. Second',
    ]);
    expect(renderPlan.styleGroupEntries[0]?.[1].map((item) => item.id)).toEqual(['photo-first']);
  });

  it('collects preview preload sources only from eager planned cards', () => {
    const presets = [
      ...Array.from({ length: 20 }, (_, index) => preset(`a-${index}`, 'A')),
      ...Array.from({ length: 20 }, (_, index) => preset(`b-${index}`, 'B')),
      ...Array.from({ length: 20 }, (_, index) => preset(`c-${index}`, 'C')),
      ...Array.from({ length: 20 }, (_, index) => preset(`d-${index}`, 'D')),
      ...Array.from({ length: 20 }, (_, index) => preset(`e-${index}`, 'E')),
    ];
    const processedData = createStyleBrowserProcessedData({
      activePack: pack(presets),
      currentPackId: 'pack_01',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      favoriteIds: [],
      searchQuery: '',
      sortOrder: 'az',
      showFavoritesOnly: false,
    });
    const renderPlan = createStyleBrowserRenderPlan({
      processedData,
    });
    const visualStateByPresetId = new Map(
      presets.map((item) => [item.id, { exampleImageSrc: `/preview/${item.id}.webp` }]),
    );

    expect(
      collectStylePresetPreviewSources({
        processedData,
        renderPlan,
        visualStateByPresetId,
      }),
    ).toHaveLength(40);
  });

  it('de-duplicates preview preload sources', () => {
    const presets = [preset('a-1', 'A'), preset('a-2', 'A'), preset('b-1', 'B')];
    const processedData = createStyleBrowserProcessedData({
      activePack: pack(presets),
      currentPackId: 'pack_01',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      favoriteIds: [],
      searchQuery: '',
      sortOrder: 'az',
      showFavoritesOnly: false,
    });
    const renderPlan = createStyleBrowserRenderPlan({
      processedData,
    });
    const visualStateByPresetId = new Map([
      ['a-1', { exampleImageSrc: '/preview/shared.webp' }],
      ['a-2', { exampleImageSrc: '/preview/shared.webp' }],
      ['b-1', { exampleImageSrc: '/preview/b-1.webp' }],
    ]);

    expect(
      collectStylePresetPreviewSources({
        processedData,
        renderPlan,
        visualStateByPresetId,
      }),
    ).toEqual(['/preview/shared.webp', '/preview/b-1.webp']);
  });

  it('keeps preload sources bounded to eager visible groups after full expansion', () => {
    const presets = [
      ...Array.from({ length: 20 }, (_, index) => preset(`a-${index}`, 'A')),
      ...Array.from({ length: 20 }, (_, index) => preset(`b-${index}`, 'B')),
      ...Array.from({ length: 20 }, (_, index) => preset(`c-${index}`, 'C')),
      ...Array.from({ length: 20 }, (_, index) => preset(`d-${index}`, 'D')),
      ...Array.from({ length: 20 }, (_, index) => preset(`e-${index}`, 'E')),
    ];
    const processedData = createStyleBrowserProcessedData({
      activePack: pack(presets),
      currentPackId: 'pack_01',
      favoritesPackId: 'favorites',
      favoritePresets: [],
      favoriteIds: [],
      searchQuery: '',
      sortOrder: 'az',
      showFavoritesOnly: false,
    });
    const renderPlan = createStyleBrowserRenderPlan({
      processedData,
    });
    const visualStateByPresetId = new Map(
      presets.map((item) => [item.id, { exampleImageSrc: `/preview/${item.id}.webp` }]),
    );

    expect(
      collectStylePresetPreviewSources({
        processedData,
        renderPlan,
        visualStateByPresetId,
      }),
    ).toHaveLength(40);
  });
});
