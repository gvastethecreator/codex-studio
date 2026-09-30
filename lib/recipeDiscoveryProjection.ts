import {
  RECIPE_DISCOVERY_CATALOG,
  type RecipeCatalogDisplayEntry,
  type RecipeCatalogSearchFilters,
} from './recipeCatalog';
import { WORKFLOW_CATEGORIES, getWorkflowCategory } from '../packages/shared/src/workflowCatalog';
import { isWorkflowEnabled } from './workflowModuleState';

export interface RecipeDiscoveryProjection {
  entries: RecipeCatalogDisplayEntry[];
}

export function groupRecipeDiscoveryEntries(entries: RecipeCatalogDisplayEntry[]) {
  return WORKFLOW_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    entries: category.workflows.flatMap((id) => entries.filter((entry) => entry.id === id)),
  })).filter((group) => group.entries.length > 0);
}

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function recipeMatchesFilters(
  entry: RecipeCatalogDisplayEntry,
  filters: RecipeCatalogSearchFilters,
  query: string,
  parameterId: string,
) {
  if (filters.task && !entry.supportedTasks.includes(filters.task)) return false;
  if (filters.providerId && !entry.supportedProviders.includes(filters.providerId)) return false;
  if (
    parameterId &&
    !entry.parameters.some((parameter) => normalize(parameter.id) === parameterId)
  ) {
    return false;
  }

  if (!query) return true;

  const searchableText = [
    getWorkflowCategory(entry.id)?.label ?? '',
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

/** Recipes and aliases whose workflow module is on. */
function enabledDiscoveryEntries() {
  return RECIPE_DISCOVERY_CATALOG.filter(
    (entry) => entry.id !== 'styles' && isWorkflowEnabled(entry.id),
  );
}

export function createRecipeDiscoveryProjection(
  entries: RecipeCatalogDisplayEntry[] = enabledDiscoveryEntries(),
): RecipeDiscoveryProjection {
  return { entries };
}

export function createRecipesGridProjection(
  entries: RecipeCatalogDisplayEntry[] = enabledDiscoveryEntries(),
): RecipeDiscoveryProjection {
  return { entries };
}

export function searchRecipeDiscoveryProjection(
  filters: RecipeCatalogSearchFilters = {},
  projection = createRecipeDiscoveryProjection(),
) {
  const limit = filters.limit && filters.limit > 0 ? filters.limit : undefined;
  const results: RecipeCatalogDisplayEntry[] = [];
  const query = normalize(filters.query);
  const parameterId = normalize(filters.parameterId);

  for (const entry of projection.entries) {
    if (!recipeMatchesFilters(entry, filters, query, parameterId)) continue;

    results.push(entry);
    if (limit && results.length >= limit) break;
  }

  return results;
}
