const STYLE_CATALOG_RESOURCE_MARKERS = [
  'StylePresetCatalogSearchSurface',
  'stylePresetCatalogData',
] as const;

export interface StylesBrowserGatePackBudgetInput {
  packId: string;
  mountedCategorySections: number;
  eagerCategorySections: number;
  placeholderCategorySections: number;
  eagerPresetCards: number;
  plannedPresetCards: number;
  hiddenCategories: number;
  hiddenPresetCards: number;
  expandedMountedCategorySections: number;
  expandedEagerCategorySections: number;
  expandedPlaceholderCategorySections: number;
  expandedEagerPresetCards: number;
  expandedPlannedPresetCards: number;
}

export interface StylesBrowserGateDomState {
  groups: number;
  eagerGroups: number;
  placeholderGroups: number;
  renderedCards: number;
  plannedCards: number;
  hiddenGroups: number;
  hiddenPresets: number;
}

export interface StylesBrowserCatalogExpectation {
  query: string;
  resultCount: number;
  resourceMarkers: string[];
}

export interface StylesBrowserCatalogObservation {
  mountedBefore: boolean;
  mountedAfter: boolean;
  matchedResourceNamesBefore: string[];
  matchedResourceNamesAfter: string[];
  resultCount: number;
}

export interface StylesBrowserGateExpectation {
  packId: string;
  collapsed: StylesBrowserGateDomState;
  expanded: StylesBrowserGateDomState;
  catalog: StylesBrowserCatalogExpectation;
}

export interface StylesBrowserGateObservation {
  packId: string;
  collapsed: StylesBrowserGateDomState;
  expanded: StylesBrowserGateDomState;
  catalog: StylesBrowserCatalogObservation;
  consoleErrors: string[];
  consoleWarnings: string[];
  pageErrors: string[];
}

function compareDomState({
  label,
  expected,
  actual,
}: {
  label: string;
  expected: StylesBrowserGateDomState;
  actual: StylesBrowserGateDomState;
}) {
  const violations: string[] = [];

  for (const key of Object.keys(expected) as Array<keyof StylesBrowserGateDomState>) {
    if (expected[key] !== actual[key]) {
      violations.push(`${label} ${key} ${actual[key]} !== expected ${expected[key]}`);
    }
  }

  return violations;
}

export function findMatchingStyleCatalogResources(
  resourceNames: readonly string[],
  resourceMarkers: readonly string[] = STYLE_CATALOG_RESOURCE_MARKERS,
) {
  return resourceNames.filter((name) => resourceMarkers.some((marker) => name.includes(marker)));
}

export function createStylesBrowserGateExpectation({
  packBudget,
  catalogQuery,
  catalogResultCount,
  resourceMarkers = [...STYLE_CATALOG_RESOURCE_MARKERS],
}: {
  packBudget: StylesBrowserGatePackBudgetInput;
  catalogQuery: string;
  catalogResultCount: number;
  resourceMarkers?: string[];
}): StylesBrowserGateExpectation {
  return {
    packId: packBudget.packId,
    collapsed: {
      groups: packBudget.mountedCategorySections,
      eagerGroups: packBudget.eagerCategorySections,
      placeholderGroups: packBudget.placeholderCategorySections,
      renderedCards: packBudget.eagerPresetCards,
      plannedCards: packBudget.plannedPresetCards,
      hiddenGroups: packBudget.hiddenCategories,
      hiddenPresets: packBudget.hiddenPresetCards,
    },
    expanded: {
      groups: packBudget.expandedMountedCategorySections,
      eagerGroups: packBudget.expandedEagerCategorySections,
      placeholderGroups: packBudget.expandedPlaceholderCategorySections,
      renderedCards: packBudget.expandedEagerPresetCards,
      plannedCards: packBudget.expandedPlannedPresetCards,
      hiddenGroups: 0,
      hiddenPresets: 0,
    },
    catalog: {
      query: catalogQuery,
      resultCount: catalogResultCount,
      resourceMarkers,
    },
  };
}

export function evaluateStylesBrowserGate(
  expectation: StylesBrowserGateExpectation,
  observation: StylesBrowserGateObservation,
) {
  const violations: string[] = [];

  if (observation.packId !== expectation.packId) {
    violations.push(`packId ${observation.packId} !== expected ${expectation.packId}`);
  }

  violations.push(
    ...compareDomState({
      label: 'collapsed',
      expected: expectation.collapsed,
      actual: observation.collapsed,
    }),
  );
  violations.push(
    ...compareDomState({
      label: 'expanded',
      expected: expectation.expanded,
      actual: observation.expanded,
    }),
  );

  if (observation.catalog.mountedBefore) {
    violations.push('catalog surface was mounted before opening it');
  }
  if (!observation.catalog.mountedAfter) {
    violations.push('catalog surface did not mount after opening it');
  }
  if (observation.catalog.matchedResourceNamesBefore.length > 0) {
    violations.push(
      `catalog resources loaded before opening: ${observation.catalog.matchedResourceNamesBefore.join(', ')}`,
    );
  }
  if (observation.catalog.resultCount !== expectation.catalog.resultCount) {
    violations.push(
      `catalog resultCount ${observation.catalog.resultCount} !== expected ${expectation.catalog.resultCount} for query ${JSON.stringify(expectation.catalog.query)}`,
    );
  }

  if (observation.consoleErrors.length > 0) {
    violations.push(`console errors observed: ${observation.consoleErrors.join(' | ')}`);
  }
  if (observation.consoleWarnings.length > 0) {
    violations.push(`console warnings observed: ${observation.consoleWarnings.join(' | ')}`);
  }
  if (observation.pageErrors.length > 0) {
    violations.push(`page errors observed: ${observation.pageErrors.join(' | ')}`);
  }

  return violations;
}
