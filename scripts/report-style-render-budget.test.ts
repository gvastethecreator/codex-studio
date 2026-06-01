import { describe, expect, it } from 'vite-plus/test';

import { createStyleRenderBudgetReport } from './report-style-render-budget';

describe('style render budget report', () => {
  it('keeps initial style rendering bounded across all packs', async () => {
    const report = await createStyleRenderBudgetReport();

    expect(report.violations).toEqual([]);
    expect(report.categoryInitialRenderLimit).toBe(4);
    expect(report.groupInitialRenderLimit).toBe(16);
    expect(report.expandedGroupRenderLimit).toBe(128);
    expect(report.packs).toHaveLength(16);
    expect(
      Math.max(...report.packs.map((pack) => pack.initialRenderedCategories)),
    ).toBeLessThanOrEqual(4);
    expect(
      Math.max(...report.packs.map((pack) => pack.initialRenderedPresetCards)),
    ).toBeLessThanOrEqual(128);
    expect(Math.max(...report.packs.map((pack) => pack.eagerPresetCards))).toBeLessThanOrEqual(32);
    expect(
      Math.max(...report.packs.map((pack) => pack.expandedEagerPresetCards)),
    ).toBeLessThanOrEqual(32);
    expect(Math.max(...report.packs.map((pack) => pack.mountedCategorySections))).toBe(4);
    expect(
      Math.min(...report.packs.map((pack) => pack.placeholderCategorySections)),
    ).toBeGreaterThanOrEqual(0);
    expect(report.packs.find((pack) => pack.packId === 'pack_05')).toEqual(
      expect.objectContaining({
        totalPresets: 135,
        totalCategories: 5,
        eagerPresetCards: 21,
        plannedPresetCards: 53,
        placeholderCategorySections: 2,
        expandedMountedCategorySections: 5,
        expandedEagerPresetCards: 21,
        expandedPlannedPresetCards: 69,
      }),
    );
    expect(
      Math.max(...report.packs.map((pack) => pack.largestExpandedCategoryPresetCards)),
    ).toBeLessThanOrEqual(report.expandedGroupRenderLimit);
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
  }, 20_000);
});
