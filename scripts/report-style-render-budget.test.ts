import { describe, expect, it } from 'vite-plus/test';

import { createStyleRenderBudgetReport } from './report-style-render-budget';

describe('style render budget report', () => {
  it('keeps initial style rendering bounded across all packs', async () => {
    const report = await createStyleRenderBudgetReport();

    expect(report.violations).toEqual([]);
    expect(report.categoryInitialRenderLimit).toBe(4);
    expect(report.groupInitialRenderLimit).toBe(16);
    expect(report.expandedGroupRenderLimit).toBe(128);
    expect(report.packs).toHaveLength(17);
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
    expect(report.searchScenarios).toHaveLength(3);
    expect(report.searchScenarios).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'pack_01_boudoir_narrow',
          packId: 'pack_01',
          query: 'boudoir',
          matchedPresetCards: 1,
          eagerPresetCards: 1,
          plannedPresetCards: 1,
          initialRenderedPresetCards: 1,
        }),
        expect.objectContaining({
          name: 'pack_02_all_presets',
          packId: 'pack_02',
          query: '',
          matchedPresetCards: expect.any(Number),
        }),
        expect.objectContaining({
          name: 'pack_16_all_presets',
          packId: 'pack_16',
          query: '',
          matchedPresetCards: expect.any(Number),
        }),
      ]),
    );
    for (const scenario of report.searchScenarios) {
      expect(scenario.matchedPresetCards).toBeGreaterThanOrEqual(scenario.minMatchedPresetCards);
      expect(scenario.initialRenderedPresetCards).toBeLessThanOrEqual(
        scenario.maxRenderedPresetCards,
      );
      expect(scenario.eagerPresetCards).toBeLessThanOrEqual(scenario.maxEagerPresetCards);
    }
  }, 20_000);
});
