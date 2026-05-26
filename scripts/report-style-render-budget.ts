import {
  STYLE_CATEGORY_INITIAL_RENDER_LIMIT,
  STYLE_GROUP_INITIAL_RENDER_LIMIT,
  estimateStyleGroupPlaceholderHeight,
  getVisibleStylePresets,
} from '../components/recipes/styleGridVirtualization';
import {
  createStyleBrowserProcessedData,
  createStyleBrowserRenderPlan,
  measureStyleBrowserRenderPlan,
  STYLE_BROWSER_EAGER_SECTION_LIMIT,
  type StyleBrowserRenderMeasurement,
} from '../components/recipes/styleBrowserRenderPlan';
import {
  STYLE_RUNTIME_PACK_SUMMARIES,
  loadStyleRuntimePack,
} from '../components/recipes/stylesData';
import type {
  StyleRuntimePack,
  StyleRuntimePreset,
} from '../components/recipes/styles/runtimeTypes';

const DEFAULT_GRID_COLUMNS = 4;
const DEFAULT_CONTAINER_WIDTH = 1200;
const MAX_INITIAL_RENDERED_CATEGORIES = STYLE_CATEGORY_INITIAL_RENDER_LIMIT;
const MAX_INITIAL_RENDERED_PRESET_CARDS =
  STYLE_CATEGORY_INITIAL_RENDER_LIMIT * STYLE_GROUP_INITIAL_RENDER_LIMIT;
const MAX_EXPANDED_GROUP_PRESET_CARDS = 64;
const MAX_EAGER_PRESET_CARDS = STYLE_BROWSER_EAGER_SECTION_LIMIT * STYLE_GROUP_INITIAL_RENDER_LIMIT;

const SEARCH_SCENARIOS = [
  {
    packId: 'pack_01',
    query: 'boudoir',
    maxRenderedPresetCards: STYLE_GROUP_INITIAL_RENDER_LIMIT,
    minMatchedPresetCards: 1,
  },
] as const;

interface StyleRenderGroupBudget {
  category: string;
  totalPresets: number;
  collapsedRenderedPresets: number;
  hiddenPresets: number;
  placeholderHeight: number;
}

interface StyleRenderPackBudget {
  packId: string;
  packName: string;
  totalPresets: number;
  totalCategories: number;
  mountedCategorySections: number;
  eagerCategorySections: number;
  placeholderCategorySections: number;
  eagerPresetCards: number;
  plannedPresetCards: number;
  expandedMountedCategorySections: number;
  expandedEagerCategorySections: number;
  expandedPlaceholderCategorySections: number;
  expandedEagerPresetCards: number;
  expandedPlannedPresetCards: number;
  initialRenderedCategories: number;
  initialRenderedPresetCards: number;
  hiddenCategories: number;
  hiddenPresetCards: number;
  maxCollapsedGroupRenderedPresetCards: number;
  largestExpandedCategoryPresetCards: number;
  initialGroups: StyleRenderGroupBudget[];
}

interface StyleSearchScenarioBudget {
  packId: string;
  query: string;
  matchedPresetCards: number;
  eagerPresetCards: number;
  plannedPresetCards: number;
  initialRenderedCategories: number;
  initialRenderedPresetCards: number;
  maxRenderedPresetCards: number;
  minMatchedPresetCards: number;
}

export interface StyleRenderBudgetReport {
  gridColumns: number;
  containerWidth: number;
  categoryInitialRenderLimit: number;
  groupInitialRenderLimit: number;
  expandedGroupRenderLimit: number;
  packs: StyleRenderPackBudget[];
  searchScenarios: StyleSearchScenarioBudget[];
  violations: string[];
}

function groupPresetsByCategory(pack: StyleRuntimePack) {
  const groups = new Map<string, StyleRuntimePreset[]>();

  for (const preset of pack.presets) {
    const category = preset.category || 'General';
    groups.set(category, [...(groups.get(category) ?? []), preset]);
  }

  return [...groups.entries()];
}

function createBrowserRenderMeasurement(pack: StyleRuntimePack): StyleBrowserRenderMeasurement {
  const processedData = createStyleBrowserProcessedData({
    activePack: pack,
    currentPackId: pack.id,
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

  return measureStyleBrowserRenderPlan({ processedData, renderPlan });
}

function createExpandedBrowserRenderMeasurement(
  pack: StyleRuntimePack,
): StyleBrowserRenderMeasurement {
  const processedData = createStyleBrowserProcessedData({
    activePack: pack,
    currentPackId: pack.id,
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

  return measureStyleBrowserRenderPlan({ processedData, renderPlan });
}

function searchPresets(pack: StyleRuntimePack, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  return pack.presets
    .filter((preset) => {
      if (!normalizedQuery) return true;
      return (
        preset.name.toLowerCase().includes(normalizedQuery) ||
        preset.style.aesthetic.toLowerCase().includes(normalizedQuery) ||
        preset.category?.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((first, second) => first.name.localeCompare(second.name));
}

function createSearchScenarioBudget({
  pack,
  query,
  maxRenderedPresetCards,
  minMatchedPresetCards,
}: {
  pack: StyleRuntimePack;
  query: string;
  maxRenderedPresetCards: number;
  minMatchedPresetCards: number;
}): StyleSearchScenarioBudget {
  const filteredPack = {
    ...pack,
    presets: searchPresets(pack, query),
  };
  const measurement = createBrowserRenderMeasurement(filteredPack);
  const initialCategoryEntries = groupPresetsByCategory(filteredPack).slice(
    0,
    STYLE_CATEGORY_INITIAL_RENDER_LIMIT,
  );
  const initialRenderedPresetCards = initialCategoryEntries.reduce(
    (total, [, presets]) =>
      total + getVisibleStylePresets(presets, false, STYLE_GROUP_INITIAL_RENDER_LIMIT).length,
    0,
  );

  return {
    packId: pack.id,
    query,
    matchedPresetCards: filteredPack.presets.length,
    eagerPresetCards: measurement.eagerPresetCards,
    plannedPresetCards: measurement.plannedPresetCards,
    initialRenderedCategories: initialCategoryEntries.length,
    initialRenderedPresetCards,
    maxRenderedPresetCards,
    minMatchedPresetCards,
  };
}

function createPackBudget({
  pack,
  gridColumns,
  containerWidth,
}: {
  pack: StyleRuntimePack;
  gridColumns: number;
  containerWidth: number;
}): StyleRenderPackBudget {
  const processedData = createStyleBrowserProcessedData({
    activePack: pack,
    currentPackId: pack.id,
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
  const expandedRenderPlan = createStyleBrowserRenderPlan({
    processedData,
    showAllStyleCategories: true,
  });
  const categoryEntries = renderPlan.styleGroupEntries;
  const measurement = measureStyleBrowserRenderPlan({ processedData, renderPlan });
  const expandedMeasurement = measureStyleBrowserRenderPlan({
    processedData,
    renderPlan: expandedRenderPlan,
  });
  const initialCategoryEntries = renderPlan.visibleStyleGroupEntries;
  const hiddenCategoryEntries = renderPlan.hiddenStyleGroupEntries;
  const initialGroups = initialCategoryEntries.map(([category, presets]) => {
    const collapsedPresets = getVisibleStylePresets(
      presets,
      false,
      STYLE_GROUP_INITIAL_RENDER_LIMIT,
    );
    const hiddenPresets = Math.max(0, presets.length - collapsedPresets.length);

    return {
      category,
      totalPresets: presets.length,
      collapsedRenderedPresets: collapsedPresets.length,
      hiddenPresets,
      placeholderHeight: estimateStyleGroupPlaceholderHeight({
        renderedPresetCount: collapsedPresets.length,
        gridColumns,
        containerWidth,
        hasShowMore: hiddenPresets > 0,
      }),
    };
  });

  return {
    packId: pack.id,
    packName: pack.name,
    totalPresets: pack.presets.length,
    totalCategories: categoryEntries.length,
    mountedCategorySections: measurement.mountedCategorySections,
    eagerCategorySections: measurement.eagerCategorySections,
    placeholderCategorySections: measurement.placeholderCategorySections,
    eagerPresetCards: measurement.eagerPresetCards,
    plannedPresetCards: measurement.plannedPresetCards,
    expandedMountedCategorySections: expandedMeasurement.mountedCategorySections,
    expandedEagerCategorySections: expandedMeasurement.eagerCategorySections,
    expandedPlaceholderCategorySections: expandedMeasurement.placeholderCategorySections,
    expandedEagerPresetCards: expandedMeasurement.eagerPresetCards,
    expandedPlannedPresetCards: expandedMeasurement.plannedPresetCards,
    initialRenderedCategories: initialGroups.length,
    initialRenderedPresetCards: initialGroups.reduce(
      (total, group) => total + group.collapsedRenderedPresets,
      0,
    ),
    hiddenCategories: hiddenCategoryEntries.length,
    hiddenPresetCards: hiddenCategoryEntries.reduce(
      (total, [, presets]) => total + presets.length,
      0,
    ),
    maxCollapsedGroupRenderedPresetCards: Math.max(
      0,
      ...initialGroups.map((group) => group.collapsedRenderedPresets),
    ),
    largestExpandedCategoryPresetCards: Math.max(
      0,
      ...categoryEntries.map(([, presets]) => presets.length),
    ),
    initialGroups,
  };
}

export async function createStyleRenderBudgetReport({
  gridColumns = DEFAULT_GRID_COLUMNS,
  containerWidth = DEFAULT_CONTAINER_WIDTH,
} = {}): Promise<StyleRenderBudgetReport> {
  const loadedPacks = await Promise.all(
    STYLE_RUNTIME_PACK_SUMMARIES.map(async (summary) => {
      const pack = await loadStyleRuntimePack(summary.id);
      if (!pack) {
        throw new Error(`Missing style pack runtime data: ${summary.id}`);
      }
      return pack;
    }),
  );
  const packs = loadedPacks.map((pack) =>
    createPackBudget({
      pack,
      gridColumns,
      containerWidth,
    }),
  );
  const packById = new Map(loadedPacks.map((pack) => [pack.id, pack]));
  const searchScenarios = SEARCH_SCENARIOS.map((scenario) => {
    const pack = packById.get(scenario.packId);
    if (!pack) {
      throw new Error(`Missing style pack for search scenario: ${scenario.packId}`);
    }
    return createSearchScenarioBudget({ pack, ...scenario });
  });
  const violations = packs.flatMap((pack) => {
    const errors: string[] = [];
    if (pack.initialRenderedCategories > MAX_INITIAL_RENDERED_CATEGORIES) {
      errors.push(
        `${pack.packId} initial categories ${pack.initialRenderedCategories} > ${MAX_INITIAL_RENDERED_CATEGORIES}`,
      );
    }
    if (pack.initialRenderedPresetCards > MAX_INITIAL_RENDERED_PRESET_CARDS) {
      errors.push(
        `${pack.packId} initial preset cards ${pack.initialRenderedPresetCards} > ${MAX_INITIAL_RENDERED_PRESET_CARDS}`,
      );
    }
    if (pack.eagerPresetCards > MAX_EAGER_PRESET_CARDS) {
      errors.push(
        `${pack.packId} eager preset cards ${pack.eagerPresetCards} > ${MAX_EAGER_PRESET_CARDS}`,
      );
    }
    if (pack.expandedEagerPresetCards > MAX_EAGER_PRESET_CARDS) {
      errors.push(
        `${pack.packId} expanded eager preset cards ${pack.expandedEagerPresetCards} > ${MAX_EAGER_PRESET_CARDS}`,
      );
    }
    if (pack.maxCollapsedGroupRenderedPresetCards > STYLE_GROUP_INITIAL_RENDER_LIMIT) {
      errors.push(
        `${pack.packId} collapsed group cards ${pack.maxCollapsedGroupRenderedPresetCards} > ${STYLE_GROUP_INITIAL_RENDER_LIMIT}`,
      );
    }
    if (pack.largestExpandedCategoryPresetCards > MAX_EXPANDED_GROUP_PRESET_CARDS) {
      errors.push(
        `${pack.packId} expanded group cards ${pack.largestExpandedCategoryPresetCards} > ${MAX_EXPANDED_GROUP_PRESET_CARDS}`,
      );
    }
    return errors;
  });
  violations.push(
    ...searchScenarios.flatMap((scenario) => {
      const errors: string[] = [];
      if (scenario.matchedPresetCards < scenario.minMatchedPresetCards) {
        errors.push(
          `${scenario.packId} search "${scenario.query}" matches ${scenario.matchedPresetCards} < ${scenario.minMatchedPresetCards}`,
        );
      }
      if (scenario.initialRenderedPresetCards > scenario.maxRenderedPresetCards) {
        errors.push(
          `${scenario.packId} search "${scenario.query}" initial cards ${scenario.initialRenderedPresetCards} > ${scenario.maxRenderedPresetCards}`,
        );
      }
      return errors;
    }),
  );

  return {
    gridColumns,
    containerWidth,
    categoryInitialRenderLimit: STYLE_CATEGORY_INITIAL_RENDER_LIMIT,
    groupInitialRenderLimit: STYLE_GROUP_INITIAL_RENDER_LIMIT,
    expandedGroupRenderLimit: MAX_EXPANDED_GROUP_PRESET_CARDS,
    packs,
    searchScenarios,
    violations,
  };
}

if (import.meta.main) {
  const verify = process.argv.includes('--verify');
  const json = process.argv.includes('--json');
  const report = await createStyleRenderBudgetReport();

  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      `[styles:render] packs=${report.packs.length} categoryLimit=${report.categoryInitialRenderLimit} groupLimit=${report.groupInitialRenderLimit} violations=${report.violations.length}`,
    );
    for (const pack of report.packs) {
      console.log(
        `[styles:render] ${pack.packId} categories=${pack.totalCategories} presets=${pack.totalPresets} mountedSections=${pack.mountedCategorySections} eagerSections=${pack.eagerCategorySections} placeholders=${pack.placeholderCategorySections} eagerCards=${pack.eagerPresetCards} plannedCards=${pack.plannedPresetCards} expandedMountedSections=${pack.expandedMountedCategorySections} expandedEagerCards=${pack.expandedEagerPresetCards} expandedPlannedCards=${pack.expandedPlannedPresetCards} hiddenCategories=${pack.hiddenCategories} hiddenPresets=${pack.hiddenPresetCards} largestExpandedGroup=${pack.largestExpandedCategoryPresetCards}`,
      );
    }
    for (const scenario of report.searchScenarios) {
      console.log(
        `[styles:render] search pack=${scenario.packId} query=${JSON.stringify(scenario.query)} matches=${scenario.matchedPresetCards} initialCards=${scenario.initialRenderedPresetCards}`,
      );
    }
  }

  if (report.violations.length > 0) {
    for (const violation of report.violations) {
      console.error(`- ${violation}`);
    }
    if (verify) process.exitCode = 1;
  } else if (verify && !json) {
    console.log('[styles:render] ok');
  }
}
