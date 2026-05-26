import { describe, expect, it } from 'vite-plus/test';

import { createStyleRenderBudgetReport } from './report-style-render-budget';

describe('style render budget report', () => {
  it('keeps initial style rendering bounded across all packs', async () => {
    const report = await createStyleRenderBudgetReport();

    expect(report.violations).toEqual([]);
    expect(report.categoryInitialRenderLimit).toBe(4);
    expect(report.groupInitialRenderLimit).toBe(16);
    expect(report.expandedGroupRenderLimit).toBe(64);
    expect(report.packs).toHaveLength(11);
    expect(
      Math.max(...report.packs.map((pack) => pack.initialRenderedCategories)),
    ).toBeLessThanOrEqual(4);
    expect(
      Math.max(...report.packs.map((pack) => pack.initialRenderedPresetCards)),
    ).toBeLessThanOrEqual(64);
    expect(Math.max(...report.packs.map((pack) => pack.eagerPresetCards))).toBeLessThanOrEqual(32);
    expect(
      Math.max(...report.packs.map((pack) => pack.expandedEagerPresetCards)),
    ).toBeLessThanOrEqual(32);
    expect(Math.max(...report.packs.map((pack) => pack.mountedCategorySections))).toBe(4);
    expect(Math.min(...report.packs.map((pack) => pack.placeholderCategorySections))).toBe(2);
    expect(report.packs.find((pack) => pack.packId === 'pack_05')).toEqual(
      expect.objectContaining({
        totalPresets: 372,
        totalCategories: 12,
        eagerPresetCards: 32,
        plannedPresetCards: 64,
        placeholderCategorySections: 2,
        expandedMountedCategorySections: 12,
        expandedEagerPresetCards: 32,
        expandedPlannedPresetCards: 192,
      }),
    );
    expect(
      Math.max(...report.packs.map((pack) => pack.largestExpandedCategoryPresetCards)),
    ).toBeLessThanOrEqual(64);
    expect(report.searchScenarios).toEqual([
      expect.objectContaining({
        packId: 'pack_01',
        query: 'boudoir',
        matchedPresetCards: 1,
        eagerPresetCards: 1,
        plannedPresetCards: 1,
        initialRenderedPresetCards: 1,
      }),
    ]);
  });
});
