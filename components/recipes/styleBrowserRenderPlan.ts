import { estimateStyleGridMountedPresetCount } from './styleGridVirtualization';
import type { StyleRuntimePack, StyleRuntimePreset } from './styles/runtimeTypes';

export type StyleBrowserSortOrder =
  | 'source'
  | 'az'
  | 'za'
  | 'created_desc'
  | 'created_asc'
  | 'updated_desc'
  | 'updated_asc';
export type StyleBrowserGroupOrder = 'natural' | 'source';
export type StyleBrowserViewMode = 'grouped' | 'flat';

export const STYLE_BROWSER_EAGER_SECTION_LIMIT = 2;
export const STYLE_BROWSER_FLAT_GROUP_KEY = '__all_style_cards__';

export interface StyleBrowserProcessedData {
  favorites: StyleRuntimePreset[];
  groups: Record<string, StyleRuntimePreset[]>;
  flatPresets: StyleRuntimePreset[];
}

export interface CreateStyleBrowserProcessedDataInput {
  activePack: StyleRuntimePack;
  currentPackId: string;
  favoritesPackId: string;
  favoritePresets: StyleRuntimePreset[];
  searchPresets?: StyleRuntimePreset[];
  favoriteIds: string[];
  categoryKeyForPreset?: (preset: StyleRuntimePreset) => string;
  pinFavorites?: boolean;
  searchQuery: string;
  sortOrder: StyleBrowserSortOrder;
  showFavoritesOnly: boolean;
  viewMode?: StyleBrowserViewMode;
}

export interface StyleBrowserRenderPlan {
  styleGroupEntries: [string, StyleRuntimePreset[]][];
  visibleStyleGroupEntries: [string, StyleRuntimePreset[]][];
}

export interface CreateStyleBrowserRenderPlanInput {
  groupOrder?: StyleBrowserGroupOrder;
  processedData: StyleBrowserProcessedData;
  viewMode?: StyleBrowserViewMode;
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

export interface StylePresetPreviewSourceState {
  exampleImageSrc?: string | null;
}

export interface CollectStylePresetPreviewSourcesInput {
  processedData: StyleBrowserProcessedData;
  renderPlan: StyleBrowserRenderPlan;
  visualStateByPresetId: ReadonlyMap<string, StylePresetPreviewSourceState>;
  gridColumns?: number;
  containerWidth?: number;
  viewportHeight?: number;
  eagerSectionLimit?: number;
}

export interface MeasureStyleBrowserRenderPlanInput {
  processedData: StyleBrowserProcessedData;
  renderPlan: StyleBrowserRenderPlan;
  eagerSectionLimit?: number;
  gridColumns?: number;
  containerWidth?: number;
  viewportHeight?: number;
}

function parseCategoryOrder(categoryName: string): number | null {
  const match = categoryName.trim().match(/^(\d+)[.)\s-]/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function compareStyleCategoryNames(first: string, second: string) {
  const firstOrder = parseCategoryOrder(first);
  const secondOrder = parseCategoryOrder(second);

  if (firstOrder !== null && secondOrder !== null && firstOrder !== secondOrder) {
    return firstOrder - secondOrder;
  }

  if (firstOrder !== null && secondOrder === null) return -1;
  if (firstOrder === null && secondOrder !== null) return 1;

  return first.localeCompare(second, undefined, {
    sensitivity: 'base',
    numeric: true,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseDateValue(value: unknown): number | null {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  if (typeof value !== 'string') return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getPresetDateValue(preset: StyleRuntimePreset, keys: readonly string[]) {
  const presetRecord = preset as unknown as Record<string, unknown>;
  for (const key of keys) {
    const value = parseDateValue(presetRecord[key]);
    if (value !== null) return value;
  }

  if (!isRecord(preset.ui)) return null;
  for (const key of keys) {
    const value = parseDateValue(preset.ui[key]);
    if (value !== null) return value;
  }

  return null;
}

function compareSourceOrder(
  first: StyleRuntimePreset,
  second: StyleRuntimePreset,
  sourceIndexByPresetId: ReadonlyMap<string, number>,
) {
  return (
    (sourceIndexByPresetId.get(first.id) ?? Number.MAX_SAFE_INTEGER) -
    (sourceIndexByPresetId.get(second.id) ?? Number.MAX_SAFE_INTEGER)
  );
}

function compareNameOrder(
  first: StyleRuntimePreset,
  second: StyleRuntimePreset,
  direction: 'asc' | 'desc',
  sourceIndexByPresetId: ReadonlyMap<string, number>,
) {
  const compared =
    direction === 'asc'
      ? first.name.localeCompare(second.name, undefined, { sensitivity: 'base', numeric: true })
      : second.name.localeCompare(first.name, undefined, { sensitivity: 'base', numeric: true });

  return compared || compareSourceOrder(first, second, sourceIndexByPresetId);
}

function compareDateOrder(
  first: StyleRuntimePreset,
  second: StyleRuntimePreset,
  keys: readonly string[],
  direction: 'asc' | 'desc',
  sourceIndexByPresetId: ReadonlyMap<string, number>,
) {
  const firstDate = getPresetDateValue(first, keys);
  const secondDate = getPresetDateValue(second, keys);

  if (firstDate !== null && secondDate !== null && firstDate !== secondDate) {
    return direction === 'asc' ? firstDate - secondDate : secondDate - firstDate;
  }

  if (firstDate !== null && secondDate === null) return -1;
  if (firstDate === null && secondDate !== null) return 1;

  return compareSourceOrder(first, second, sourceIndexByPresetId);
}

function compareStylePresets(
  first: StyleRuntimePreset,
  second: StyleRuntimePreset,
  sortOrder: StyleBrowserSortOrder,
  sourceIndexByPresetId: ReadonlyMap<string, number>,
) {
  switch (sortOrder) {
    case 'az':
      return compareNameOrder(first, second, 'asc', sourceIndexByPresetId);
    case 'za':
      return compareNameOrder(first, second, 'desc', sourceIndexByPresetId);
    case 'created_desc':
      return compareDateOrder(
        first,
        second,
        ['createdAt', 'created_at', 'created', 'creationDate'],
        'desc',
        sourceIndexByPresetId,
      );
    case 'created_asc':
      return compareDateOrder(
        first,
        second,
        ['createdAt', 'created_at', 'created', 'creationDate'],
        'asc',
        sourceIndexByPresetId,
      );
    case 'updated_desc':
      return compareDateOrder(
        first,
        second,
        ['updatedAt', 'updated_at', 'updated', 'modifiedAt', 'modified_at'],
        'desc',
        sourceIndexByPresetId,
      );
    case 'updated_asc':
      return compareDateOrder(
        first,
        second,
        ['updatedAt', 'updated_at', 'updated', 'modifiedAt', 'modified_at'],
        'asc',
        sourceIndexByPresetId,
      );
    case 'source':
    default:
      return compareSourceOrder(first, second, sourceIndexByPresetId);
  }
}

function describeSearchValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return `${value}`;
  return '';
}

function createStylePresetSearchText(preset: StyleRuntimePreset) {
  return [
    preset.id,
    preset.name,
    preset.category,
    preset.domain,
    ...Object.values(preset.style).map(describeSearchValue),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function createStyleBrowserProcessedData({
  activePack,
  currentPackId,
  favoritesPackId,
  favoritePresets,
  searchPresets,
  favoriteIds,
  categoryKeyForPreset,
  pinFavorites = true,
  searchQuery,
  sortOrder,
  showFavoritesOnly,
  viewMode = 'grouped',
}: CreateStyleBrowserProcessedDataInput): StyleBrowserProcessedData {
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const favoriteSet = new Set(favoriteIds);
  const rawPresets =
    normalizedSearch && searchPresets
      ? searchPresets
      : currentPackId === favoritesPackId
        ? favoritePresets
        : activePack.presets || [];
  let filtered = rawPresets.filter((preset) => {
    if (!normalizedSearch) return true;
    return createStylePresetSearchText(preset).includes(normalizedSearch);
  });

  if (showFavoritesOnly && currentPackId !== favoritesPackId) {
    filtered = filtered.filter((preset) => favoriteSet.has(preset.id));
  }

  const sourceIndexByPresetId = new Map(
    rawPresets.map((preset, index) => [preset.id, index] as const),
  );
  const orderedPresets =
    sortOrder === 'source'
      ? filtered
      : filtered.sort((first, second) =>
          compareStylePresets(first, second, sortOrder, sourceIndexByPresetId),
        );

  if (viewMode === 'flat') {
    return {
      favorites: [],
      groups: {},
      flatPresets: orderedPresets,
    };
  }

  const favorites: StyleRuntimePreset[] = [];
  const groups: Record<string, StyleRuntimePreset[]> = {};
  const assignPresetToGroup = (preset: StyleRuntimePreset) => {
    const category = categoryKeyForPreset?.(preset) || preset.category || 'General';
    groups[category] = [...(groups[category] ?? []), preset];
  };

  if (currentPackId === favoritesPackId || !pinFavorites) {
    for (const preset of orderedPresets) {
      assignPresetToGroup(preset);
    }
    return { favorites, groups, flatPresets: orderedPresets };
  }

  const nonFavorites: StyleRuntimePreset[] = [];
  for (const preset of orderedPresets) {
    if (favoriteSet.has(preset.id)) {
      favorites.push(preset);
    } else {
      nonFavorites.push(preset);
    }
  }

  for (const preset of nonFavorites) {
    assignPresetToGroup(preset);
  }

  return { favorites, groups, flatPresets: orderedPresets };
}

export function createStyleBrowserRenderPlan({
  groupOrder = 'natural',
  processedData,
  viewMode = 'grouped',
}: CreateStyleBrowserRenderPlanInput): StyleBrowserRenderPlan {
  if (viewMode === 'flat') {
    const styleGroupEntries: [string, StyleRuntimePreset[]][] =
      processedData.flatPresets.length > 0
        ? [[STYLE_BROWSER_FLAT_GROUP_KEY, processedData.flatPresets]]
        : [];

    return {
      styleGroupEntries,
      visibleStyleGroupEntries: styleGroupEntries,
    };
  }

  const styleGroupEntries = Object.entries(processedData.groups) as [
    string,
    StyleRuntimePreset[],
  ][];
  if (groupOrder === 'natural') {
    styleGroupEntries.sort(([firstCategory], [secondCategory]) =>
      compareStyleCategoryNames(firstCategory, secondCategory),
    );
  }

  return {
    styleGroupEntries,
    visibleStyleGroupEntries: styleGroupEntries,
  };
}

export function measureStyleBrowserRenderPlan({
  processedData,
  renderPlan,
  eagerSectionLimit = STYLE_BROWSER_EAGER_SECTION_LIMIT,
  gridColumns,
  containerWidth,
  viewportHeight,
}: MeasureStyleBrowserRenderPlanInput): StyleBrowserRenderMeasurement {
  const estimateMountedPresetCount = (presets: StyleRuntimePreset[]) =>
    gridColumns && containerWidth
      ? estimateStyleGridMountedPresetCount({
          presetCount: presets.length,
          gridColumns,
          containerWidth,
          viewportHeight,
        })
      : presets.length;
  const hasFavoritesSection = processedData.favorites.length > 0;
  const categoryEagerBudget = Math.max(0, eagerSectionLimit - (hasFavoritesSection ? 1 : 0));
  const categorySections = renderPlan.visibleStyleGroupEntries.map(([, presets], index) => {
    const plannedCards = presets.length;
    const mountedCards = estimateMountedPresetCount(presets);
    const eager = index < categoryEagerBudget;
    return { eager, mountedCards, plannedCards };
  });
  const favoritesMountedCards = hasFavoritesSection
    ? estimateMountedPresetCount(processedData.favorites)
    : 0;
  const favoritesPlannedCards = hasFavoritesSection ? processedData.favorites.length : 0;
  const eagerCategorySections =
    (hasFavoritesSection ? 1 : 0) + categorySections.filter((section) => section.eager).length;
  const plannedPresetCards =
    favoritesPlannedCards +
    categorySections.reduce((total, section) => total + section.plannedCards, 0);
  const eagerPresetCards =
    favoritesMountedCards +
    categorySections.reduce(
      (total, section) => total + (section.eager ? section.mountedCards : 0),
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
    hiddenCategorySections: 0,
    hiddenPresetCards: 0,
  };
}

export function collectStylePresetPreviewSources({
  processedData,
  renderPlan,
  visualStateByPresetId,
  gridColumns,
  containerWidth,
  viewportHeight,
  eagerSectionLimit = STYLE_BROWSER_EAGER_SECTION_LIMIT,
}: CollectStylePresetPreviewSourcesInput): string[] {
  const sources = new Set<string>();
  const hasFavoritesSection = processedData.favorites.length > 0;
  const categoryEagerBudget = Math.max(0, eagerSectionLimit - (hasFavoritesSection ? 1 : 0));

  const getPreloadPresets = (presets: StyleRuntimePreset[]) => {
    if (!gridColumns || !containerWidth) return presets;
    const mountedPresetCount = estimateStyleGridMountedPresetCount({
      presetCount: presets.length,
      gridColumns,
      containerWidth,
      viewportHeight,
    });
    return presets.slice(0, mountedPresetCount);
  };
  const addPresetSources = (presets: StyleRuntimePreset[]) => {
    for (const preset of getPreloadPresets(presets)) {
      const source = visualStateByPresetId.get(preset.id)?.exampleImageSrc;
      if (source) sources.add(source);
    }
  };

  if (hasFavoritesSection) {
    addPresetSources(processedData.favorites);
  }

  for (const [, presets] of renderPlan.visibleStyleGroupEntries.slice(0, categoryEagerBudget)) {
    addPresetSources(presets);
  }

  return [...sources];
}
