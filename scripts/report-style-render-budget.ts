import {
  STYLE_CATEGORY_INITIAL_RENDER_LIMIT,
  STYLE_GROUP_INITIAL_RENDER_LIMIT,
  estimateStyleGroupPlaceholderHeight,
  getVisibleStylePresets,
} from '../components/recipes/styleGridVirtualization';
import { STYLE_PACK_SUMMARIES, loadStylePack } from '../components/recipes/stylesData';
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
  const categoryEntries = groupPresetsByCategory(pack);
  const initialCategoryEntries = categoryEntries.slice(0, STYLE_CATEGORY_INITIAL_RENDER_LIMIT);
  const hiddenCategoryEntries = categoryEntries.slice(STYLE_CATEGORY_INITIAL_RENDER_LIMIT);
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
    STYLE_PACK_SUMMARIES.map(async (summary) => {
      const pack = await loadStylePack(summary.id);
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
        `[styles:render] ${pack.packId} categories=${pack.totalCategories} presets=${pack.totalPresets} initialCategories=${pack.initialRenderedCategories} initialCards=${pack.initialRenderedPresetCards} hiddenCategories=${pack.hiddenCategories} hiddenPresets=${pack.hiddenPresetCards} largestExpandedGroup=${pack.largestExpandedCategoryPresetCards}`,
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
