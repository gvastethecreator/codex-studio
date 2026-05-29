import { describe, expect, it } from 'vite-plus/test';

import type { StyleRuntimePack, StyleRuntimePreset } from './styles/runtimeTypes';
import {
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
});
