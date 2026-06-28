import type {
  StylePresetCatalog,
  StylePresetCatalogSearchFilters,
  StylePresetCatalogSearchIndex,
  StylePresetCatalogSearchPackSummary,
} from './stylePresetManifests';
import {
  resolveStylePresetCatalogSearchPackIds,
  searchStylePresetCatalog,
  searchStylePresetCatalogIndex,
} from './stylePresetManifests';

export const STYLE_SEARCH_TASK_FILTERS = [
  { id: '', label: 'All' },
  { id: 'image_generate', label: 'Image' },
  { id: 'image_edit', label: 'Edit' },
  { id: 'style_preset_card', label: 'Cards' },
  { id: 'sprite_sheet', label: 'Sprites' },
  { id: 'texture_generate', label: 'Textures' },
] as const;

export interface BuildStyleSearchFiltersInput {
  query?: string;
  packId?: string;
  categoryId?: string;
  categoryName?: string;
  domain?: string;
  tag?: string;
  task?: string;
  limit?: number;
}

function cleanOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildStyleSearchFilters({
  query,
  packId,
  categoryId,
  categoryName,
  domain,
  tag,
  task,
  limit = 80,
}: BuildStyleSearchFiltersInput = {}): StylePresetCatalogSearchFilters {
  return {
    query: cleanOptional(query),
    packId: cleanOptional(packId),
    categoryId: cleanOptional(categoryId),
    categoryName: cleanOptional(categoryName),
    domain: cleanOptional(domain),
    tag: cleanOptional(tag),
    task: cleanOptional(task),
    limit,
  };
}

export function planStyleSearchPackIds({
  packSummaries,
  filters,
}: {
  packSummaries: readonly StylePresetCatalogSearchPackSummary[];
  filters?: StylePresetCatalogSearchFilters;
}) {
  return resolveStylePresetCatalogSearchPackIds({ packSummaries, filters });
}

export function projectStyleSearchResultsFromIndex({
  searchIndex,
  filters,
}: {
  searchIndex: StylePresetCatalogSearchIndex;
  filters?: StylePresetCatalogSearchFilters;
}) {
  return searchStylePresetCatalogIndex(searchIndex, filters);
}

export function projectStyleSearchResultsFromManifestCatalog({
  catalog,
  filters,
}: {
  catalog: StylePresetCatalog;
  filters?: StylePresetCatalogSearchFilters;
}) {
  return searchStylePresetCatalog(catalog, filters);
}
