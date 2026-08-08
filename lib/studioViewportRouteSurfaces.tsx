import React from 'react';

import type { AppPageView } from '../hooks/useHashRouter';
import type { RecipeId } from '../types';
import type { RecipePage as RecipePageComponent } from '../components/RecipePage';
import type { RecipesView as RecipesViewComponent } from '../components/RecipesView';
import type { StudioGridSurface as StudioGridSurfaceComponent } from '../components/studio/StudioGridSurface';
import { preloadRecipeComponent } from './recipeRouteModules';
import type { RoutePreloadSurface } from './routePreloadBudget';

function createPreloadableSurface<TProps>(
  loader: () => Promise<{ default: React.ComponentType<TProps> }>,
) {
  let loadedComponent: React.ComponentType<TProps> | null = null;
  let loadingPromise: Promise<{ default: React.ComponentType<TProps> }> | null = null;

  const load = () => {
    if (loadedComponent) return Promise.resolve({ default: loadedComponent });

    loadingPromise ??= loader().then((module) => {
      loadedComponent = module.default;
      return module;
    });

    return loadingPromise;
  };

  return {
    Component: React.lazy(load),
    getLoaded: () => loadedComponent,
    load,
  };
}

export const recipePageSurface = createPreloadableSurface<
  React.ComponentProps<typeof RecipePageComponent>
>(() => import('../components/RecipePage').then((module) => ({ default: module.RecipePage })));

export const recipesViewSurface = createPreloadableSurface<
  React.ComponentProps<typeof RecipesViewComponent>
>(() => import('../components/RecipesView').then((module) => ({ default: module.RecipesView })));

export const studioPageSurface = createPreloadableSurface<
  React.ComponentProps<typeof StudioGridSurfaceComponent>
>(() =>
  import('../components/studio/StudioGridSurface').then((module) => ({
    default: module.StudioGridSurface,
  })),
);

export function preloadStudioViewportRoute(routeView: AppPageView, activeRecipe: RecipeId | null) {
  if (routeView === 'recipe' && activeRecipe) {
    return Promise.all([recipePageSurface.load(), preloadRecipeComponent(activeRecipe)]).then(
      () => {},
    );
  }

  if (routeView === 'studio') return studioPageSurface.load().then(() => {});
  return recipesViewSurface.load().then(() => {});
}

export function preloadStudioViewportSurface(surface: RoutePreloadSurface) {
  switch (surface) {
    case 'studio-page':
      return studioPageSurface.load();
    case 'recipes-view':
      return recipesViewSurface.load();
    case 'recipe-page':
      return recipePageSurface.load();
  }
}
