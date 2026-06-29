import { describe, expect, it } from 'vite-plus/test';
import {
  buildRecipeIntentPreloadPlan,
  buildRoutePreloadPlan,
  ROUTE_PRELOAD_BUDGET,
} from './routePreloadBudget';

describe('routePreloadBudget', () => {
  it('keeps Home preload bounded to the recipes list shell', () => {
    expect(buildRoutePreloadPlan({ routeView: 'studio', activeRecipe: null })).toEqual({
      delayMs: ROUTE_PRELOAD_BUDGET.studioIdleDelayMs,
      surfaces: ['recipes-view'],
      recipeIds: [],
    });
  });

  it('preloads only the active recipe from recipe routes', () => {
    expect(buildRoutePreloadPlan({ routeView: 'recipe', activeRecipe: 'styles' })).toEqual({
      delayMs: ROUTE_PRELOAD_BUDGET.recipeIdleDelayMs,
      surfaces: ['recipes-view'],
      recipeIds: ['styles'],
    });
  });

  it('does not fan out every recipe while browsing recipe cards', () => {
    expect(buildRoutePreloadPlan({ routeView: 'recipes', activeRecipe: null })).toEqual({
      delayMs: ROUTE_PRELOAD_BUDGET.recipesIdleDelayMs,
      surfaces: ['studio-page', 'recipe-page'],
      recipeIds: [],
    });
  });

  it('turns a recipe-card hover or focus into a single recipe preload', () => {
    expect(buildRecipeIntentPreloadPlan('camera')).toEqual({
      delayMs: ROUTE_PRELOAD_BUDGET.recipeIntentDelayMs,
      surfaces: [],
      recipeIds: ['camera'],
    });
    expect(buildRecipeIntentPreloadPlan(null)).toEqual({
      delayMs: ROUTE_PRELOAD_BUDGET.recipeIntentDelayMs,
      surfaces: [],
      recipeIds: [],
    });
  });
});
