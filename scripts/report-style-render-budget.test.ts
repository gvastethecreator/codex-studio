import { describe, expect, it } from 'vite-plus/test';

import { createStyleRenderBudgetReport } from './report-style-render-budget';

describe('style render budget report', () => {
  it('keeps initial style rendering bounded across all packs', async () => {
    const report = await createStyleRenderBudgetReport();

    expect(report.violations).toEqual([]);
    expect(report.categoryInitialRenderLimit).toBe(Number.MAX_SAFE_INTEGER);
    expect(report.groupInitialRenderLimit).toBe(160);
    expect(report.expandedGroupRenderLimit).toBe(160);
    expect(report.packs).toHaveLength(17);
    expect(Math.max(...report.packs.map((pack) => pack.initialRenderedCategories))).toBe(10);
    expect(Math.max(...report.packs.map((pack) => pack.initialRenderedPresetCards))).toBe(70);
    expect(Math.max(...report.packs.map((pack) => pack.eagerPresetCards))).toBeLessThanOrEqual(256);
    expect(
      Math.max(...report.packs.map((pack) => pack.expandedEagerPresetCards)),
    ).toBeLessThanOrEqual(256);
    expect(Math.max(...report.packs.map((pack) => pack.mountedCategorySections))).toBe(10);
    expect(Math.max(...report.packs.map((pack) => pack.hiddenCategories))).toBe(0);
    expect(Math.max(...report.packs.map((pack) => pack.hiddenPresetCards))).toBe(0);
    expect(
      Math.min(...report.packs.map((pack) => pack.placeholderCategorySections)),
    ).toBeGreaterThanOrEqual(0);
    expect(report.packs.find((pack) => pack.packId === 'pack_05')).toEqual(
      expect.objectContaining({
        totalPresets: 135,
        totalCategories: 5,
        eagerPresetCards: 70,
        plannedPresetCards: 135,
        placeholderCategorySections: 3,
        expandedMountedCategorySections: 5,
        expandedEagerPresetCards: 70,
        expandedPlannedPresetCards: 135,
      }),
    );
    expect(
      Math.max(...report.packs.map((pack) => pack.largestExpandedCategoryPresetCards)),
    ).toBeLessThanOrEqual(report.expandedGroupRenderLimit);
    expect(report.flatAllCards).toEqual(
      expect.objectContaining({
        packId: 'all_cards',
        eagerPresetCards: 152,
      }),
    );
    expect(report.flatAllCards.totalPresets).toBeGreaterThan(1000);
    expect(report.flatAllCards.plannedPresetCards).toBe(report.flatAllCards.totalPresets);
    expect(report.flatAllCards.eagerPresetCards).toBeLessThanOrEqual(
      report.flatAllCards.maxRenderedPresetCards,
    );
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
