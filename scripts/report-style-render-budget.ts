import {
  STYLE_CATEGORY_INITIAL_RENDER_LIMIT,
  STYLE_GROUP_INITIAL_RENDER_LIMIT,
  estimateStyleGroupPlaceholderHeight,
  getVisibleStylePresets,
} from '../components/recipes/styleGridVirtualization';
import { STYLE_PACK_SUMMARIES, loadStylePack } from '../components/recipes/stylesData';
import type { StylePack, StylePresetDef } from '../components/recipes/styles/types';

const DEFAULT_GRID_COLUMNS = 4;
const DEFAULT_CONTAINER_WIDTH = 1200;
const MAX_INITIAL_RENDERED_CATEGORIES = STYLE_CATEGORY_INITIAL_RENDER_LIMIT;
const MAX_INITIAL_RENDERED_PRESET_CARDS =
  STYLE_CATEGORY_INITIAL_RENDER_LIMIT * STYLE_GROUP_INITIAL_RENDER_LIMIT;

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

export interface StyleRenderBudgetReport {
  gridColumns: number;
  containerWidth: number;
  categoryInitialRenderLimit: number;
  groupInitialRenderLimit: number;
  packs: StyleRenderPackBudget[];
  violations: string[];
}

function groupPresetsByCategory(pack: StylePack) {
  const groups = new Map<string, StylePresetDef[]>();

  for (const preset of pack.presets) {
    const category = preset.category || 'General';
    groups.set(category, [...(groups.get(category) ?? []), preset]);
  }

  return [...groups.entries()];
}

function createPackBudget({
  pack,
  gridColumns,
  containerWidth,
}: {
  pack: StylePack;
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
  const packs = await Promise.all(
    STYLE_PACK_SUMMARIES.map(async (summary) => {
      const pack = await loadStylePack(summary.id);
      if (!pack) {
        throw new Error(`Missing style pack runtime data: ${summary.id}`);
      }
      return createPackBudget({
        pack,
        gridColumns,
        containerWidth,
      });
    }),
  );
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
    return errors;
  });

  return {
    gridColumns,
    containerWidth,
    categoryInitialRenderLimit: STYLE_CATEGORY_INITIAL_RENDER_LIMIT,
    groupInitialRenderLimit: STYLE_GROUP_INITIAL_RENDER_LIMIT,
    packs,
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
        `[styles:render] ${pack.packId} categories=${pack.totalCategories} presets=${pack.totalPresets} initialCategories=${pack.initialRenderedCategories} initialCards=${pack.initialRenderedPresetCards} hiddenCategories=${pack.hiddenCategories} hiddenPresets=${pack.hiddenPresetCards} largestCategory=${pack.largestExpandedCategoryPresetCards}`,
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
