import { describe, expect, it } from 'vite-plus/test';

import type { StyleRuntimePack, StyleRuntimePreset } from './styles/runtimeTypes';
import {
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

  it('matches Styles browser category window and eager render behavior', () => {
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
      showAllStyleCategories: false,
    });

    expect(renderPlan.visibleStyleGroupEntries.map(([category]) => category)).toEqual([
      'A',
      'B',
      'C',
      'D',
    ]);
    expect(renderPlan.hiddenStyleGroupEntries.map(([category]) => category)).toEqual(['E']);
    expect(measureStyleBrowserRenderPlan({ processedData, renderPlan })).toMatchObject({
      mountedCategorySections: 4,
      eagerCategorySections: 2,
      placeholderCategorySections: 2,
      eagerPresetCards: 20,
      plannedPresetCards: 28,
      hiddenCategorySections: 1,
      hiddenPresetCards: 4,
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
      showAllStyleCategories: false,
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

  it('orders numbered subcategories naturally before slicing visible groups', () => {
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
      showAllStyleCategories: false,
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
    ]);
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
      showAllStyleCategories: false,
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
    ).toHaveLength(32);
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
      showAllStyleCategories: false,
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

  it('keeps expanded preload sources bounded to eager visible groups', () => {
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
      showAllStyleCategories: true,
    });
    const visualStateByPresetId = new Map(
      presets.map((item) => [item.id, { exampleImageSrc: `/preview/${item.id}.webp` }]),
    );

    expect(
      collectStylePresetPreviewSources({
        processedData,
        renderPlan,
        visualStateByPresetId,
        expandedStyleGroups: new Set(['A', 'B', 'C', 'D', 'E']),
      }),
    ).toHaveLength(40);
  });
});
