import { describe, expect, it } from 'vite-plus/test';

import {
  createStylesBrowserGateExpectation,
  evaluateStylesBrowserGate,
  findMatchingStyleCatalogResources,
} from './stylesBrowserGate';

describe('stylesBrowserGate', () => {
  it('passes when DOM, demand-mount resources, and console state all match', () => {
    const expectation = createStylesBrowserGateExpectation({
      packBudget: {
        packId: 'pack_05',
        mountedCategorySections: 4,
        eagerCategorySections: 2,
        placeholderCategorySections: 2,
        eagerPresetCards: 32,
        plannedPresetCards: 64,
        hiddenCategories: 8,
        hiddenPresetCards: 240,
        expandedMountedCategorySections: 12,
        expandedEagerCategorySections: 2,
        expandedPlaceholderCategorySections: 10,
        expandedEagerPresetCards: 32,
        expandedPlannedPresetCards: 192,
      },
      catalogQuery: 'boudoir',
      catalogResultCount: 1,
    });

    const violations = evaluateStylesBrowserGate(expectation, {
      packId: 'pack_05',
      collapsed: {
        groups: 4,
        eagerGroups: 2,
        placeholderGroups: 2,
        renderedCards: 32,
        plannedCards: 64,
        hiddenGroups: 8,
        hiddenPresets: 240,
      },
      expanded: {
        groups: 12,
        eagerGroups: 2,
        placeholderGroups: 10,
        renderedCards: 32,
        plannedCards: 192,
        hiddenGroups: 0,
        hiddenPresets: 0,
      },
      catalog: {
        mountedBefore: false,
        mountedAfter: true,
        matchedResourceNamesBefore: [],
        matchedResourceNamesAfter: [],
        resultCount: 1,
      },
      consoleErrors: [],
      consoleWarnings: [],
      pageErrors: [],
    });

    expect(violations).toEqual([]);
    expect(
      findMatchingStyleCatalogResources([
        'http://127.0.0.1:5173/src/main.tsx',
        'http://127.0.0.1:5173/components/recipes/StylePresetCatalogSearchSurface.tsx',
      ]),
    ).toEqual(['http://127.0.0.1:5173/components/recipes/StylePresetCatalogSearchSurface.tsx']);
  });

  it('reports count mismatches, eager demand-mount regressions, and console noise', () => {
    const expectation = createStylesBrowserGateExpectation({
      packBudget: {
        packId: 'pack_05',
        mountedCategorySections: 4,
        eagerCategorySections: 2,
        placeholderCategorySections: 2,
        eagerPresetCards: 32,
        plannedPresetCards: 64,
        hiddenCategories: 8,
        hiddenPresetCards: 240,
        expandedMountedCategorySections: 12,
        expandedEagerCategorySections: 2,
        expandedPlaceholderCategorySections: 10,
        expandedEagerPresetCards: 32,
        expandedPlannedPresetCards: 192,
      },
      catalogQuery: 'boudoir',
      catalogResultCount: 1,
    });

    const violations = evaluateStylesBrowserGate(expectation, {
      packId: 'pack_05',
      collapsed: {
        groups: 4,
        eagerGroups: 3,
        placeholderGroups: 1,
        renderedCards: 48,
        plannedCards: 64,
        hiddenGroups: 8,
        hiddenPresets: 240,
      },
      expanded: {
        groups: 12,
        eagerGroups: 4,
        placeholderGroups: 8,
        renderedCards: 64,
        plannedCards: 192,
        hiddenGroups: 0,
        hiddenPresets: 0,
      },
      catalog: {
        mountedBefore: true,
        mountedAfter: true,
        matchedResourceNamesBefore: [
          'http://127.0.0.1:5173/components/recipes/stylePresetCatalogData.ts',
        ],
        matchedResourceNamesAfter: [],
        resultCount: 3,
      },
      consoleErrors: ['boom'],
      consoleWarnings: ['warn'],
      pageErrors: ['page exploded'],
    });

    expect(violations).toEqual(
      expect.arrayContaining([
        'collapsed eagerGroups 3 !== expected 2',
        'collapsed placeholderGroups 1 !== expected 2',
        'collapsed renderedCards 48 !== expected 32',
        'expanded eagerGroups 4 !== expected 2',
        'expanded placeholderGroups 8 !== expected 10',
        'expanded renderedCards 64 !== expected 32',
        'catalog surface was mounted before opening it',
        'catalog resultCount 3 !== expected 1 for query "boudoir"',
        'console errors observed: boom',
        'console warnings observed: warn',
        'page errors observed: page exploded',
      ]),
    );
    expect(
      violations.some((violation) => violation.includes('catalog resources loaded before opening')),
    ).toBe(true);
  });
});
