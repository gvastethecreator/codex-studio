import {
  STYLE_CATEGORY_INITIAL_RENDER_LIMIT,
  STYLE_GROUP_INITIAL_RENDER_LIMIT,
  getVisibleStylePresets,
} from './styleGridVirtualization';
import type { StyleRuntimePack, StyleRuntimePreset } from './styles/runtimeTypes';

export type StyleBrowserSortOrder = 'az' | 'za';

export const STYLE_BROWSER_EAGER_SECTION_LIMIT = 2;

export interface StyleBrowserProcessedData {
  favorites: StyleRuntimePreset[];
  groups: Record<string, StyleRuntimePreset[]>;
}

export interface CreateStyleBrowserProcessedDataInput {
  activePack: StyleRuntimePack;
  currentPackId: string;
  favoritesPackId: string;
  favoritePresets: StyleRuntimePreset[];
  favoriteIds: string[];
  searchQuery: string;
  sortOrder: StyleBrowserSortOrder;
  showFavoritesOnly: boolean;
}

export interface StyleBrowserRenderPlan {
  styleGroupEntries: [string, StyleRuntimePreset[]][];
  visibleStyleGroupEntries: [string, StyleRuntimePreset[]][];
  hiddenStyleGroupEntries: [string, StyleRuntimePreset[]][];
  hiddenStylePresetCount: number;
}

export interface CreateStyleBrowserRenderPlanInput {
  processedData: StyleBrowserProcessedData;
  showAllStyleCategories: boolean;
}

export interface StyleBrowserRenderMeasurement {
  mountedCategorySections: number;
  eagerCategorySections: number;
  placeholderCategorySections: number;
  eagerPresetCards: number;
  plannedPresetCards: number;
  hiddenCategorySections: number;
  hiddenPresetCards: number;
}

export function createStyleBrowserProcessedData({
  activePack,
  currentPackId,
  favoritesPackId,
  favoritePresets,
  favoriteIds,
  searchQuery,
  sortOrder,
  showFavoritesOnly,
}: CreateStyleBrowserProcessedDataInput): StyleBrowserProcessedData {
  const normalizedSearch = searchQuery.toLowerCase();
  const favoriteSet = new Set(favoriteIds);
  const rawPresets = currentPackId === favoritesPackId ? favoritePresets : activePack.presets || [];
  let filtered = rawPresets.filter((preset) => {
    return (
      preset.name.toLowerCase().includes(normalizedSearch) ||
      preset.style.aesthetic.toLowerCase().includes(normalizedSearch) ||
      preset.category?.toLowerCase().includes(normalizedSearch)
    );
  });

  if (showFavoritesOnly && currentPackId !== favoritesPackId) {
    filtered = filtered.filter((preset) => favoriteSet.has(preset.id));
  }

  filtered.sort((first, second) =>
    sortOrder === 'az'
      ? first.name.localeCompare(second.name)
      : second.name.localeCompare(first.name),
  );

  const favorites: StyleRuntimePreset[] = [];
  const groups: Record<string, StyleRuntimePreset[]> = {};

  if (currentPackId === favoritesPackId) {
    for (const preset of filtered) {
      const category = preset.category || 'General';
      groups[category] = [...(groups[category] ?? []), preset];
    }
    return { favorites, groups };
  }

  const nonFavorites: StyleRuntimePreset[] = [];
  for (const preset of filtered) {
    if (favoriteSet.has(preset.id)) {
      favorites.push(preset);
    } else {
      nonFavorites.push(preset);
    }
  }

  for (const preset of nonFavorites) {
    const category = preset.category || 'General';
    groups[category] = [...(groups[category] ?? []), preset];
  }

  return { favorites, groups };
}

export function createStyleBrowserRenderPlan({
  processedData,
  showAllStyleCategories,
}: CreateStyleBrowserRenderPlanInput): StyleBrowserRenderPlan {
  const styleGroupEntries = Object.entries(processedData.groups) as [
    string,
    StyleRuntimePreset[],
  ][];
  const visibleStyleGroupEntries = showAllStyleCategories
    ? styleGroupEntries
    : styleGroupEntries.slice(0, STYLE_CATEGORY_INITIAL_RENDER_LIMIT);
  const hiddenStyleGroupEntries = showAllStyleCategories
    ? []
    : styleGroupEntries.slice(STYLE_CATEGORY_INITIAL_RENDER_LIMIT);
  const hiddenStylePresetCount = hiddenStyleGroupEntries.reduce(
    (total, [, presets]) => total + presets.length,
    0,
  );

  return {
    styleGroupEntries,
    visibleStyleGroupEntries,
    hiddenStyleGroupEntries,
    hiddenStylePresetCount,
  };
}

export function measureStyleBrowserRenderPlan({
  processedData,
  renderPlan,
  expandedStyleGroups = new Set<string>(),
  eagerSectionLimit = STYLE_BROWSER_EAGER_SECTION_LIMIT,
}: {
  processedData: StyleBrowserProcessedData;
  renderPlan: StyleBrowserRenderPlan;
  expandedStyleGroups?: Set<string>;
  eagerSectionLimit?: number;
}): StyleBrowserRenderMeasurement {
  const hasFavoritesSection = processedData.favorites.length > 0;
  const categoryEagerBudget = Math.max(0, eagerSectionLimit - (hasFavoritesSection ? 1 : 0));
  const categorySections = renderPlan.visibleStyleGroupEntries.map(([category, presets], index) => {
    const expanded = expandedStyleGroups.has(category);
    const plannedCards = getVisibleStylePresets(
      presets,
      expanded,
      STYLE_GROUP_INITIAL_RENDER_LIMIT,
    ).length;
    const eager = index < categoryEagerBudget;
    return { eager, plannedCards };
  });
  const favoritesPlannedCards = hasFavoritesSection
    ? getVisibleStylePresets(
        processedData.favorites,
        expandedStyleGroups.has('favorites'),
        STYLE_GROUP_INITIAL_RENDER_LIMIT,
      ).length
    : 0;
  const eagerCategorySections =
    (hasFavoritesSection ? 1 : 0) + categorySections.filter((section) => section.eager).length;
  const plannedPresetCards =
    favoritesPlannedCards +
    categorySections.reduce((total, section) => total + section.plannedCards, 0);
  const eagerPresetCards =
    favoritesPlannedCards +
    categorySections.reduce(
      (total, section) => total + (section.eager ? section.plannedCards : 0),
      0,
    );
  const mountedCategorySections =
    (hasFavoritesSection ? 1 : 0) + renderPlan.visibleStyleGroupEntries.length;

  return {
    mountedCategorySections,
    eagerCategorySections,
    placeholderCategorySections: Math.max(0, mountedCategorySections - eagerCategorySections),
    eagerPresetCards,
    plannedPresetCards,
    hiddenCategorySections: renderPlan.hiddenStyleGroupEntries.length,
    hiddenPresetCards: renderPlan.hiddenStylePresetCount,
  };
}
