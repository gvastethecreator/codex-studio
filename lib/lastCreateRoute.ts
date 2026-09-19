import { resolveRecipeRouteHashSegment, type RecipeAliasId } from './recipeAliases';
import { resolveHashRouterState, type HashRouterState } from '../hooks/useHashRouter';
import type { RecipeId } from '../types';

export const LAST_CREATE_ROUTE_KEY = 'codex-studio:last-create-route';

const EMPTY_ROUTE: HashRouterState = {
  view: 'studio',
  activeRecipeId: null,
  activeRecipeAliasId: null,
  overlay: 'none',
};

export type CreateTabAction =
  | { kind: 'noop' }
  | { kind: 'studio' }
  | { kind: 'recipes' }
  | { kind: 'recipe'; recipeId: Exclude<RecipeId, null>; aliasId: RecipeAliasId | null };

export function persistableCreateRouteSegment(route: HashRouterState): string | null {
  if (route.view === 'recipes') return 'recipes';
  if (route.view === 'recipe' && route.activeRecipeId) {
    return `recipe-${resolveRecipeRouteHashSegment(route.activeRecipeId, route.activeRecipeAliasId)}`;
  }
  return null;
}

export function readLastCreateRoute(storage?: Storage | null): string | null {
  try {
    const value = (storage ?? globalThis.sessionStorage)?.getItem(LAST_CREATE_ROUTE_KEY);
    return value && value.trim() ? value : null;
  } catch {
    return null;
  }
}

export function writeLastCreateRoute(segment: string, storage?: Storage | null) {
  try {
    (storage ?? globalThis.sessionStorage)?.setItem(LAST_CREATE_ROUTE_KEY, segment);
  } catch {
    /* sessionStorage can be unavailable in private mode */
  }
}

export function persistCreateRoute(route: HashRouterState, storage?: Storage | null) {
  const segment = persistableCreateRouteSegment(route);
  if (segment) writeLastCreateRoute(segment, storage);
}

export function resolveCreateTabAction(
  current: HashRouterState,
  requested: 'studio' | 'recipes',
  lastCreateSegment: string | null,
): CreateTabAction {
  if (requested === 'studio') return { kind: 'studio' };
  if (current.view === 'recipes' || current.view === 'recipe') return { kind: 'noop' };

  const restored = resolveHashRouterState(EMPTY_ROUTE, lastCreateSegment ?? 'recipes');
  if (restored.view === 'recipe' && restored.activeRecipeId) {
    return {
      kind: 'recipe',
      recipeId: restored.activeRecipeId,
      aliasId: restored.activeRecipeAliasId,
    };
  }
  return { kind: 'recipes' };
}
