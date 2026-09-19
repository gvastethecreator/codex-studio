import type {
  StylePresetCatalogSearchIndex,
  StylePresetCatalogSearchPackSummary,
  StylePresetCatalogSearchResult,
} from './stylePresetManifests';

export type CompactStyleRoute =
  | { view: 'all' }
  | { view: 'packs' }
  | { view: 'categories'; packId: string }
  | { view: 'styles'; packId: string; categoryId: string }
  | { view: 'favorites' };

export interface CompactStyleCategorySummary {
  id: string;
  name: string;
  count: number;
}

export interface CompactStylePackSummary {
  id: string;
  name: string;
  presetCount: number;
}

export function clampCompactStyleStrength(value: number) {
  if (!Number.isFinite(value)) return 0.75;
  return Math.max(0.1, Math.min(1, Math.round(value * 100) / 100));
}

export function formatCompactStyleStrength(value: number) {
  return `${Math.round(clampCompactStyleStrength(value) * 100)}%`;
}

export function normalizeCompactStyleQuery(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function compactStyleSearchTerms(query: string) {
  return normalizeCompactStyleQuery(query).split(/\s+/).filter(Boolean);
}

export function mergeCompactStyleSearchIndexes(
  primary: StylePresetCatalogSearchIndex | null,
  extra: StylePresetCatalogSearchIndex | null,
): StylePresetCatalogSearchIndex {
  if (!primary && !extra) {
    return { packs: [], presets: [], totalPresetCount: 0 };
  }
  if (!primary) return extra as StylePresetCatalogSearchIndex;
  if (!extra) return primary;
  const seen = new Set(primary.presets.map((preset) => preset.id));
  const presets = [
    ...primary.presets,
    ...extra.presets.filter((preset) => {
      if (seen.has(preset.id)) return false;
      seen.add(preset.id);
      return true;
    }),
  ];
  const packIds = new Set(primary.packs.map((pack) => pack.id));
  const packs = [...primary.packs, ...extra.packs.filter((pack) => !packIds.has(pack.id))];
  return {
    packs,
    presets,
    totalPresetCount: presets.length,
  };
}

export function listCompactStylePacks(
  packSummaries: readonly StylePresetCatalogSearchPackSummary[],
  extraIndex?: StylePresetCatalogSearchIndex | null,
): CompactStylePackSummary[] {
  const packs: CompactStylePackSummary[] = packSummaries.map((pack) => ({
    id: pack.id,
    name: pack.name,
    presetCount: pack.presetCount,
  }));
  const known = new Set(packs.map((pack) => pack.id));
  for (const pack of extraIndex?.packs ?? []) {
    if (known.has(pack.id)) continue;
    packs.push({ id: pack.id, name: pack.name, presetCount: pack.presetCount });
  }
  return packs;
}

export function listCompactStyleCategories(
  index: StylePresetCatalogSearchIndex,
  packId: string,
): CompactStyleCategorySummary[] {
  const categories: CompactStyleCategorySummary[] = [];
  const byId = new Map<string, CompactStyleCategorySummary>();
  for (const preset of index.presets) {
    if (preset.packId !== packId) continue;
    const existing = byId.get(preset.categoryId);
    if (existing) {
      existing.count += 1;
      continue;
    }
    const next = { id: preset.categoryId, name: preset.categoryName, count: 1 };
    byId.set(preset.categoryId, next);
    categories.push(next);
  }
  return categories;
}

export function planCompactStyleCatalogPackIds({
  route,
  query,
  packSummaries,
}: {
  route: CompactStyleRoute;
  query: string;
  packSummaries: readonly CompactStylePackSummary[];
}) {
  const runtimePackIds = packSummaries
    .map((pack) => pack.id)
    .filter((packId) => packId !== 'user_styles' && packId !== 'favorites');
  if (compactStyleSearchTerms(query).length > 0) return runtimePackIds;
  if (route.view === 'packs') return [];
  if (route.view === 'categories' || route.view === 'styles') {
    return runtimePackIds.includes(route.packId) ? [route.packId] : [];
  }
  return runtimePackIds;
}

export function filterCompactStyleCatalog({
  index,
  route,
  query,
  favorites,
}: {
  index: StylePresetCatalogSearchIndex;
  route: CompactStyleRoute;
  query: string;
  favorites: readonly string[];
}): StylePresetCatalogSearchResult[] {
  const terms = compactStyleSearchTerms(query);
  const favoriteIds = new Set(favorites);
  return index.presets.filter((preset) => {
    if (terms.length > 0) {
      return terms.every((term) => preset.searchableText.includes(term));
    }
    if (route.view === 'favorites') return favoriteIds.has(preset.id);
    if (route.view === 'styles') {
      return preset.packId === route.packId && preset.categoryId === route.categoryId;
    }
    if (route.view === 'categories' || route.view === 'packs') return false;
    return true;
  });
}

export function compactStyleMenuTitle({
  route,
  query,
  resultCount,
  packs,
}: {
  route: CompactStyleRoute;
  query: string;
  resultCount: number;
  packs: readonly CompactStylePackSummary[];
}) {
  const trimmed = query.trim();
  if (trimmed) return `${resultCount} results`;
  if (route.view === 'packs') return 'Packs';
  if (route.view === 'favorites') return 'Favorites';
  if (route.view === 'categories') {
    return packs.find((pack) => pack.id === route.packId)?.name ?? 'Categories';
  }
  if (route.view === 'styles') {
    return packs.find((pack) => pack.id === route.packId)?.name ?? 'Styles';
  }
  return 'All styles';
}

export function compactStyleParentRoute(route: CompactStyleRoute): CompactStyleRoute {
  if (route.view === 'styles') return { view: 'categories', packId: route.packId };
  if (route.view === 'categories') return { view: 'packs' };
  return { view: 'all' };
}
