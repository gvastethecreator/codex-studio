import React, { Suspense, useEffect } from 'react';

import type { AppPageView } from '../../hooks/useHashRouter';
import type { StudioPageController } from '../../lib/buildStudioPageController';
import type { RecipeAliasId } from '../../lib/recipeAliases';
import type { RecipeId } from '../../types';
import { ErrorBoundary } from '../ErrorBoundary';
import type { RecipePage as RecipePageComponent, RecipePageProps } from '../RecipePage';
import { preloadAllRecipeComponents, preloadRecipeComponent } from '../RecipeRouter';
import type { RecipesView as RecipesViewComponent } from '../RecipesView';
import type { StudioPage as StudioPageComponent } from '../StudioPage';
import { LazySurfaceFallback } from '../ui/LazySurfaceFallback';
import {
  getStudioViewportTransitionClassName,
  resolveStudioViewportRouteKey,
} from './studioViewportRouting';

type RecipePageSurfaceProps = React.ComponentProps<typeof RecipePageComponent>;
type RecipesViewSurfaceProps = React.ComponentProps<typeof RecipesViewComponent>;
type StudioPageSurfaceProps = React.ComponentProps<typeof StudioPageComponent>;

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

const recipePageSurface = createPreloadableSurface<RecipePageSurfaceProps>(() =>
  import('../RecipePage').then((module) => ({ default: module.RecipePage })),
);
const recipesViewSurface = createPreloadableSurface<RecipesViewSurfaceProps>(() =>
  import('../RecipesView').then((module) => ({ default: module.RecipesView })),
);
const studioPageSurface = createPreloadableSurface<StudioPageSurfaceProps>(() =>
  import('../StudioPage').then((module) => ({ default: module.StudioPage })),
);

const RecipePage = recipePageSurface.Component;
const RecipesView = recipesViewSurface.Component;
const StudioPage = studioPageSurface.Component;

export function preloadStudioViewportRoute(routeView: AppPageView, activeRecipe: RecipeId | null) {
  if (routeView === 'recipe' && activeRecipe) {
    return Promise.all([recipePageSurface.load(), preloadRecipeComponent(activeRecipe)]).then(
      () => {},
    );
  }

  if (routeView === 'studio') {
    return studioPageSurface.load().then(() => {});
  }

  return recipesViewSurface.load().then(() => {});
}

function preloadCoreStudioViewportRoutes() {
  void recipePageSurface.load();
  void recipesViewSurface.load();
  void studioPageSurface.load();
}

const VIEWPORT_SURFACE_BASE_CLASS =
  'studio-viewport-route absolute inset-0 w-full h-full overflow-hidden';

interface StudioViewportProps {
  routeView: AppPageView;
  direction: number;
  activeRecipe: RecipeId | null;
  activeRecipeAliasId: RecipeAliasId | null;
  recipePageProps: Omit<RecipePageProps, 'activeRecipe'>;
  studioPageController: StudioPageController;
  onSelectRecipe: (recipeId: RecipeId, aliasId?: RecipeAliasId | null) => void;
}

export const StudioViewport: React.FC<StudioViewportProps> = ({
  routeView,
  direction,
  activeRecipe,
  activeRecipeAliasId,
  recipePageProps,
  studioPageController,
  onSelectRecipe,
}) => {
  const routeKey = resolveStudioViewportRouteKey(routeView, activeRecipe, activeRecipeAliasId);
  const transitionClassName = getStudioViewportTransitionClassName(direction);
  const surfaceClassName =
    routeKey === 'studio'
      ? `${VIEWPORT_SURFACE_BASE_CLASS} flex flex-row ${transitionClassName}`
      : `${VIEWPORT_SURFACE_BASE_CLASS} ${transitionClassName}`;

  useEffect(() => {
    const preload = () => {
      preloadCoreStudioViewportRoutes();
      void preloadAllRecipeComponents();
      if (activeRecipe) {
        void preloadRecipeComponent(activeRecipe);
      }
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preload, { timeout: 1000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(preload, 250);
    return () => globalThis.clearTimeout(timeoutId);
  }, [activeRecipe]);

  const RouteRecipePage = recipePageSurface.getLoaded() ?? RecipePage;
  const RouteRecipesView = recipesViewSurface.getLoaded() ?? RecipesView;
  const RouteStudioPage = studioPageSurface.getLoaded() ?? StudioPage;

  return (
    <ErrorBoundary fallbackMessage="Could not load this studio view.">
      <div
        key={routeKey}
        className={surfaceClassName}
        data-route-key={routeKey}
        data-route-view={routeView}
        data-active-recipe={activeRecipe ?? undefined}
        data-active-recipe-alias={activeRecipeAliasId ?? undefined}
      >
        <Suspense fallback={<LazySurfaceFallback label="Loading view" />}>
          {routeView === 'recipe' && activeRecipe ? (
            <RouteRecipePage
              activeRecipe={activeRecipe}
              {...recipePageProps}
              activeRecipeAliasId={activeRecipeAliasId}
            />
          ) : routeView === 'studio' ? (
            <RouteStudioPage controller={studioPageController} />
          ) : (
            <RouteRecipesView onSelectRecipe={onSelectRecipe} />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};
