import type { GenerationProviderId, GenerationTaskKind } from '../packages/shared/src';
import {
  RECIPE_DISCOVERY_CATALOG,
  type RecipeCatalogDisplayEntry,
  type RecipeCatalogSearchFilters,
} from './recipeCatalog';

export interface RecipeDiscoveryProjection {
  entries: RecipeCatalogDisplayEntry[];
}

function isRecipesGridEntry(entry: RecipeCatalogDisplayEntry) {
  return !entry.isAlias;
}

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function recipeMatchesFilters(
  entry: RecipeCatalogDisplayEntry,
  filters: RecipeCatalogSearchFilters,
) {
  const query = normalize(filters.query);
  const parameterId = normalize(filters.parameterId);
  const supportedTasksSet = new Set<GenerationTaskKind>(entry.supportedTasks);
  const supportedProvidersSet = new Set<GenerationProviderId>(entry.supportedProviders);

  if (filters.task && !supportedTasksSet.has(filters.task)) return false;
  if (filters.providerId && !supportedProvidersSet.has(filters.providerId)) return false;
  if (
    parameterId &&
    !entry.parameters.some((parameter) => normalize(parameter.id) === parameterId)
  ) {
    return false;
  }

  if (!query) return true;

  const searchableText = [
    entry.id,
    entry.targetRecipeId,
    entry.routeAliasId ?? '',
    entry.title,
    entry.subtitle,
    entry.description,
    entry.tag,
    entry.defaultTask,
    ...entry.supportedTasks,
    ...entry.supportedProviders,
    ...entry.parameters.flatMap((parameter) => [parameter.id, parameter.label, parameter.kind]),
  ]
    .join(' ')
    .toLowerCase();

  return searchableText.includes(query);
}

export function createRecipeDiscoveryProjection(
  entries: RecipeCatalogDisplayEntry[] = RECIPE_DISCOVERY_CATALOG,
): RecipeDiscoveryProjection {
  return { entries };
}

export function createRecipesGridProjection(
  entries: RecipeCatalogDisplayEntry[] = RECIPE_DISCOVERY_CATALOG,
): RecipeDiscoveryProjection {
  return { entries: entries.filter(isRecipesGridEntry) };
}

export function searchRecipeDiscoveryProjection(
  filters: RecipeCatalogSearchFilters = {},
  projection = createRecipeDiscoveryProjection(),
) {
  const limit = filters.limit && filters.limit > 0 ? filters.limit : undefined;
  const results: RecipeCatalogDisplayEntry[] = [];

  for (const entry of projection.entries) {
    if (!recipeMatchesFilters(entry, filters)) continue;

    results.push(entry);
    if (limit && results.length >= limit) break;
  }

  return results;
}
