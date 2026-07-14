import {
  STYLE_GRID_DEFAULT_VIEWPORT_HEIGHT_PX,
  STYLE_GRID_WINDOW_TARGET_PRESET_COUNT,
  estimateStyleGridMountedPresetCount,
  estimateStyleGroupPlaceholderHeight,
} from '../components/recipes/styleGridVirtualization';
import {
  createStyleBrowserProcessedData,
  createStyleBrowserRenderPlan,
  measureStyleBrowserRenderPlan,
  STYLE_BROWSER_EAGER_SECTION_LIMIT,
  type StyleBrowserRenderMeasurement,
} from '../components/recipes/styleBrowserRenderPlan';
import {
  GENERATED_STYLE_RUNTIME_PACK_SUMMARIES,
  loadGeneratedStyleRuntimePack,
} from '../components/recipes/styleRuntimeData.generated';
import type { StyleRuntimePack } from '../components/recipes/styles/runtimeTypes';

const DEFAULT_GRID_COLUMNS = 4;
const DEFAULT_CONTAINER_WIDTH = 1200;
const DEFAULT_VIEWPORT_HEIGHT = STYLE_GRID_DEFAULT_VIEWPORT_HEIGHT_PX;
const MAX_INITIAL_RENDERED_CATEGORIES = Number.MAX_SAFE_INTEGER;
const MAX_INITIAL_RENDERED_PRESET_CARDS =
  Math.ceil((STYLE_GRID_WINDOW_TARGET_PRESET_COUNT + 1) / 10) * 10;
const MAX_EXPANDED_GROUP_PRESET_CARDS = MAX_INITIAL_RENDERED_PRESET_CARDS;
const MAX_EAGER_PRESET_CARDS = 256;

const SEARCH_SCENARIOS = [
  {
    name: 'pack_01_boudoir_narrow',
    packId: 'pack_01',
    query: 'boudoir',
    maxRenderedPresetCards: MAX_INITIAL_RENDERED_PRESET_CARDS,
    maxEagerPresetCards: MAX_EAGER_PRESET_CARDS,
    minMatchedPresetCards: 1,
  },
  {
    name: 'pack_02_all_presets',
    packId: 'pack_02',
    query: '',
    maxRenderedPresetCards: MAX_INITIAL_RENDERED_PRESET_CARDS,
    maxEagerPresetCards: MAX_EAGER_PRESET_CARDS,
    minMatchedPresetCards: 100,
  },
  {
    name: 'pack_16_all_presets',
    packId: 'pack_16',
    query: '',
    maxRenderedPresetCards: MAX_INITIAL_RENDERED_PRESET_CARDS,
    maxEagerPresetCards: MAX_EAGER_PRESET_CARDS,
    minMatchedPresetCards: 100,
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

interface StyleRenderFlatAllCardsBudget {
  packId: string;
  totalPresets: number;
  mountedCategorySections: number;
  eagerPresetCards: number;
  plannedPresetCards: number;
  maxRenderedPresetCards: number;
}

interface StyleSearchScenarioBudget {
  name: string;
  packId: string;
  query: string;
  matchedPresetCards: number;
  eagerPresetCards: number;
  plannedPresetCards: number;
  initialRenderedCategories: number;
  initialRenderedPresetCards: number;
  maxRenderedPresetCards: number;
  maxEagerPresetCards: number;
  minMatchedPresetCards: number;
}

export interface StyleRenderBudgetReport {
  gridColumns: number;
  containerWidth: number;
  viewportHeight: number;
  categoryInitialRenderLimit: number;
  groupInitialRenderLimit: number;
  expandedGroupRenderLimit: number;
  packs: StyleRenderPackBudget[];
  flatAllCards: StyleRenderFlatAllCardsBudget;
  searchScenarios: StyleSearchScenarioBudget[];
  violations: string[];
}

function createBrowserRenderMeasurement({
  pack,
  gridColumns,
  containerWidth,
}: {
  pack: StyleRuntimePack;
  gridColumns: number;
  containerWidth: number;
}): StyleBrowserRenderMeasurement {
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
  });

  return measureStyleBrowserRenderPlan({
    processedData,
    renderPlan,
    gridColumns,
    containerWidth,
    viewportHeight: DEFAULT_VIEWPORT_HEIGHT,
  });
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
  name,
  pack,
  query,
  maxRenderedPresetCards,
  maxEagerPresetCards,
  minMatchedPresetCards,
  gridColumns,
  containerWidth,
}: {
  name: string;
  pack: StyleRuntimePack;
  query: string;
  maxRenderedPresetCards: number;
  maxEagerPresetCards: number;
  minMatchedPresetCards: number;
  gridColumns: number;
  containerWidth: number;
}): StyleSearchScenarioBudget {
  const filteredPack = {
    ...pack,
    presets: searchPresets(pack, query),
  };
  const measurement = createBrowserRenderMeasurement({
    pack: filteredPack,
    gridColumns,
    containerWidth,
  });
  const renderPlan = createStyleBrowserRenderPlan({
    processedData: createStyleBrowserProcessedData({
      activePack: filteredPack,
      currentPackId: pack.id,
      favoritesPackId: 'favorites',
      favoritePresets: [],
      favoriteIds: [],
      searchQuery: '',
      sortOrder: 'az',
      showFavoritesOnly: false,
    }),
  });
  const initialCategoryEntries = renderPlan.visibleStyleGroupEntries;
  const initialRenderedPresetCards = measurement.eagerPresetCards;

  return {
    name,
    packId: pack.id,
    query,
    matchedPresetCards: filteredPack.presets.length,
    eagerPresetCards: measurement.eagerPresetCards,
    plannedPresetCards: measurement.plannedPresetCards,
    initialRenderedCategories: initialCategoryEntries.length,
    initialRenderedPresetCards,
    maxRenderedPresetCards,
    maxEagerPresetCards,
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
  });
  const categoryEntries = renderPlan.styleGroupEntries;
  const measurement = measureStyleBrowserRenderPlan({
    processedData,
    renderPlan,
    gridColumns,
    containerWidth,
    viewportHeight: DEFAULT_VIEWPORT_HEIGHT,
  });
  const expandedMeasurement = measurement;
  const initialCategoryEntries = renderPlan.visibleStyleGroupEntries;
  const initialGroups = initialCategoryEntries.map(([category, presets]) => {
    const collapsedRenderedPresets = estimateStyleGridMountedPresetCount({
      presetCount: presets.length,
      gridColumns,
      containerWidth,
      viewportHeight: DEFAULT_VIEWPORT_HEIGHT,
    });
    return {
      category,
      totalPresets: presets.length,
      collapsedRenderedPresets,
      hiddenPresets: presets.length - collapsedRenderedPresets,
      placeholderHeight: estimateStyleGroupPlaceholderHeight({
        renderedPresetCount: presets.length,
        gridColumns,
        containerWidth,
        hasShowMore: false,
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
    initialRenderedPresetCards: measurement.eagerPresetCards,
    hiddenCategories: 0,
    hiddenPresetCards: 0,
    maxCollapsedGroupRenderedPresetCards: Math.max(
      0,
      ...initialGroups.map((group) => group.collapsedRenderedPresets),
    ),
    largestExpandedCategoryPresetCards: Math.max(
      0,
      ...categoryEntries.map(([, presets]) =>
        estimateStyleGridMountedPresetCount({
          presetCount: presets.length,
          gridColumns,
          containerWidth,
          viewportHeight: DEFAULT_VIEWPORT_HEIGHT,
        }),
      ),
    ),
    initialGroups,
  };
}

function createFlatAllCardsBudget({
  packs,
  gridColumns,
  containerWidth,
}: {
  packs: StyleRuntimePack[];
  gridColumns: number;
  containerWidth: number;
}): StyleRenderFlatAllCardsBudget {
  const allCardsPack = {
    id: 'all_cards',
    name: 'All Style Cards',
    description: 'Virtual style pack containing every loaded preset.',
    presets: packs.flatMap((pack) => pack.presets),
  } satisfies StyleRuntimePack;
  const processedData = createStyleBrowserProcessedData({
    activePack: allCardsPack,
    currentPackId: allCardsPack.id,
    favoritesPackId: 'favorites',
    favoritePresets: [],
    favoriteIds: [],
    searchQuery: '',
    sortOrder: 'source',
    showFavoritesOnly: false,
    viewMode: 'flat',
  });
  const renderPlan = createStyleBrowserRenderPlan({
    processedData,
    viewMode: 'flat',
  });
  const measurement = measureStyleBrowserRenderPlan({
    processedData,
    renderPlan,
    gridColumns,
    containerWidth,
    viewportHeight: DEFAULT_VIEWPORT_HEIGHT,
  });

  return {
    packId: allCardsPack.id,
    totalPresets: allCardsPack.presets.length,
    mountedCategorySections: measurement.mountedCategorySections,
    eagerPresetCards: measurement.eagerPresetCards,
    plannedPresetCards: measurement.plannedPresetCards,
    maxRenderedPresetCards: MAX_INITIAL_RENDERED_PRESET_CARDS,
  };
}

export async function createStyleRenderBudgetReport({
  gridColumns = DEFAULT_GRID_COLUMNS,
  containerWidth = DEFAULT_CONTAINER_WIDTH,
} = {}): Promise<StyleRenderBudgetReport> {
  const loadedPacks = await Promise.all(
    GENERATED_STYLE_RUNTIME_PACK_SUMMARIES.map(async (summary) => {
      const pack = await loadGeneratedStyleRuntimePack(summary.id);
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
  const flatAllCards = createFlatAllCardsBudget({
    packs: loadedPacks,
    gridColumns,
    containerWidth,
  });
  const packById = new Map(loadedPacks.map((pack) => [pack.id, pack]));
  const searchScenarios = SEARCH_SCENARIOS.map((scenario) => {
    const pack = packById.get(scenario.packId);
    if (!pack) {
      throw new Error(`Missing style pack for search scenario: ${scenario.packId}`);
    }
    return createSearchScenarioBudget({ pack, gridColumns, containerWidth, ...scenario });
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
    if (pack.largestExpandedCategoryPresetCards > MAX_EXPANDED_GROUP_PRESET_CARDS) {
      errors.push(
        `${pack.packId} expanded group cards ${pack.largestExpandedCategoryPresetCards} > ${MAX_EXPANDED_GROUP_PRESET_CARDS}`,
      );
    }
    return errors;
  });
  if (flatAllCards.eagerPresetCards > flatAllCards.maxRenderedPresetCards) {
    violations.push(
      `${flatAllCards.packId} rendered cards ${flatAllCards.eagerPresetCards} > ${flatAllCards.maxRenderedPresetCards} planned=${flatAllCards.plannedPresetCards}`,
    );
  }
  violations.push(
    ...searchScenarios.flatMap((scenario) => {
      const errors: string[] = [];
      if (scenario.matchedPresetCards < scenario.minMatchedPresetCards) {
        errors.push(
          `${scenario.name} ${scenario.packId} search ${JSON.stringify(scenario.query)} matches ${scenario.matchedPresetCards} < ${scenario.minMatchedPresetCards}`,
        );
      }
      if (scenario.initialRenderedPresetCards > scenario.maxRenderedPresetCards) {
        errors.push(
          `${scenario.name} ${scenario.packId} search ${JSON.stringify(scenario.query)} initial cards ${scenario.initialRenderedPresetCards} > ${scenario.maxRenderedPresetCards} matched=${scenario.matchedPresetCards}`,
        );
      }
      if (scenario.eagerPresetCards > scenario.maxEagerPresetCards) {
        errors.push(
          `${scenario.name} ${scenario.packId} search ${JSON.stringify(scenario.query)} eager cards ${scenario.eagerPresetCards} > ${scenario.maxEagerPresetCards} matched=${scenario.matchedPresetCards}`,
        );
      }
      return errors;
    }),
  );

  return {
    gridColumns,
    containerWidth,
    viewportHeight: DEFAULT_VIEWPORT_HEIGHT,
    categoryInitialRenderLimit: MAX_INITIAL_RENDERED_CATEGORIES,
    groupInitialRenderLimit: MAX_INITIAL_RENDERED_PRESET_CARDS,
    expandedGroupRenderLimit: MAX_EXPANDED_GROUP_PRESET_CARDS,
    packs,
    flatAllCards,
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
      `[styles:render] packs=${report.packs.length} categoryLimit=${report.categoryInitialRenderLimit} groupLimit=${report.groupInitialRenderLimit} viewportHeight=${report.viewportHeight} violations=${report.violations.length}`,
    );
    for (const pack of report.packs) {
      console.log(
        `[styles:render] ${pack.packId} categories=${pack.totalCategories} presets=${pack.totalPresets} mountedSections=${pack.mountedCategorySections} eagerSections=${pack.eagerCategorySections} placeholders=${pack.placeholderCategorySections} eagerCards=${pack.eagerPresetCards} plannedCards=${pack.plannedPresetCards} expandedMountedSections=${pack.expandedMountedCategorySections} expandedEagerCards=${pack.expandedEagerPresetCards} expandedPlannedCards=${pack.expandedPlannedPresetCards} hiddenCategories=${pack.hiddenCategories} hiddenPresets=${pack.hiddenPresetCards} largestExpandedGroup=${pack.largestExpandedCategoryPresetCards}`,
      );
    }
    for (const scenario of report.searchScenarios) {
      console.log(
        `[styles:render] search name=${scenario.name} pack=${scenario.packId} query=${JSON.stringify(scenario.query)} matches=${scenario.matchedPresetCards} eagerCards=${scenario.eagerPresetCards} initialCards=${scenario.initialRenderedPresetCards}`,
      );
    }
    console.log(
      `[styles:render] flatAllCards total=${report.flatAllCards.totalPresets} eagerCards=${report.flatAllCards.eagerPresetCards} plannedCards=${report.flatAllCards.plannedPresetCards}`,
    );
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
