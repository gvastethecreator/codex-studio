import type {
  StyleCollection,
  StyleCollectionEntry,
  StyleCollectionFacets,
} from './styleCollectionTypes';

export type StyleCollectionFacetKey = keyof StyleCollectionFacets;
export type StyleCollectionFacetFilters = Partial<
  Record<StyleCollectionFacetKey, readonly string[]>
>;

function addFacetValues(
  target: Map<StyleCollectionFacetKey, Set<string>>,
  facets: StyleCollectionFacets | undefined,
) {
  if (!facets) return;
  for (const [rawKey, rawValues] of Object.entries(facets)) {
    const key = rawKey as StyleCollectionFacetKey;
    const values = rawValues ?? [];
    const targetValues = target.get(key) ?? new Set<string>();
    for (const value of values) targetValues.add(value);
    target.set(key, targetValues);
  }
}

function addEntryFacetValues(
  target: Map<StyleCollectionFacetKey, Set<string>>,
  entries: readonly StyleCollectionEntry[],
) {
  for (const entry of entries) {
    addFacetValues(target, entry.facetOverrides);
    if (entry.entries?.length) addEntryFacetValues(target, entry.entries);
  }
}

export function collectStyleCollectionFacetValues(collection: StyleCollection) {
  const valuesByKey = new Map<StyleCollectionFacetKey, Set<string>>();
  addFacetValues(valuesByKey, collection.facets);
  addEntryFacetValues(valuesByKey, collection.entries);

  return Object.fromEntries(
    [...valuesByKey.entries()].map(([key, values]) => [key, [...values].sort()]),
  ) as StyleCollectionFacets;
}

export function styleCollectionMatchesFacetFilters(
  collection: StyleCollection,
  filters: StyleCollectionFacetFilters,
) {
  const facets = collectStyleCollectionFacetValues(collection);

  for (const [rawKey, rawRequiredValues] of Object.entries(filters)) {
    const requiredValues = rawRequiredValues ?? [];
    if (requiredValues.length === 0) continue;
    const key = rawKey as StyleCollectionFacetKey;
    const values = new Set(facets[key] ?? []);
    if (!requiredValues.some((value) => values.has(value))) return false;
  }

  return true;
}
