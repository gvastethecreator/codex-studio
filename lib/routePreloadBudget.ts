import type { AppPageView } from '../hooks/useHashRouter';
import type { RecipeId } from '../types';

export type RoutePreloadSurface = 'studio-page' | 'recipes-view' | 'recipe-page';

export interface RoutePreloadPlan {
  delayMs: number;
  surfaces: RoutePreloadSurface[];
  recipeIds: Exclude<RecipeId, null>[];
}

export const ROUTE_PRELOAD_BUDGET = {
  studioIdleDelayMs: 3000,
  recipesIdleDelayMs: 1200,
  recipeIdleDelayMs: 800,
  recipeIntentDelayMs: 0,
} as const;

export function buildRoutePreloadPlan({
  routeView,
  activeRecipe,
}: {
  routeView: AppPageView;
  activeRecipe: RecipeId | null;
}): RoutePreloadPlan {
  if (routeView === 'recipe' && activeRecipe) {
    return {
      delayMs: ROUTE_PRELOAD_BUDGET.recipeIdleDelayMs,
      surfaces: ['recipes-view'],
      recipeIds: [activeRecipe],
    };
  }

  if (routeView === 'recipes') {
    return {
      delayMs: ROUTE_PRELOAD_BUDGET.recipesIdleDelayMs,
      surfaces: ['studio-page', 'recipe-page'],
      recipeIds: [],
    };
  }

  return {
    delayMs: ROUTE_PRELOAD_BUDGET.studioIdleDelayMs,
    surfaces: ['recipes-view'],
    recipeIds: [],
  };
}

export function buildRecipeIntentPreloadPlan(recipeId: RecipeId | null): RoutePreloadPlan {
  return {
    delayMs: ROUTE_PRELOAD_BUDGET.recipeIntentDelayMs,
    surfaces: [],
    recipeIds: recipeId ? [recipeId] : [],
  };
}
