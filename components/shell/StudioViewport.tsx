import React, { Suspense, useCallback, useEffect } from 'react';

import type { AppPageView } from '../../hooks/useHashRouter';
import type { StudioPageController } from '../../lib/buildStudioPageController';
import type { RecipeAliasId } from '../../lib/recipeAliases';
import type { RecipeId } from '../../types';
import { ErrorBoundary } from '../ErrorBoundary';
import type { RecipePage as RecipePageComponent, RecipePageProps } from '../RecipePage';
import { preloadRecipeComponent } from '../RecipeRouter';
import type { RecipesView as RecipesViewComponent } from '../RecipesView';
import type { StudioPage as StudioPageComponent } from '../StudioPage';
import { LazySurfaceFallback } from '../ui/LazySurfaceFallback';
import {
  buildRecipeIntentPreloadPlan,
  buildRoutePreloadPlan,
  type RoutePreloadPlan,
  type RoutePreloadSurface,
} from '../../lib/routePreloadBudget';
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

function preloadStudioViewportSurface(surface: RoutePreloadSurface) {
  switch (surface) {
    case 'studio-page':
      return studioPageSurface.load();
    case 'recipes-view':
      return recipesViewSurface.load();
    case 'recipe-page':
      return recipePageSurface.load();
  }
}

function preloadStudioViewportPlan(plan: RoutePreloadPlan) {
  for (const surface of plan.surfaces) {
    void preloadStudioViewportSurface(surface);
  }
  for (const recipeId of plan.recipeIds) {
    void preloadRecipeComponent(recipeId);
  }
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
    const plan = buildRoutePreloadPlan({ routeView, activeRecipe });
    const preload = () => preloadStudioViewportPlan(plan);

    let idleId: number | null = null;
    const timeoutId = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(preload, { timeout: 1000 });
        return;
      }

      preload();
    }, plan.delayMs);

    return () => {
      window.clearTimeout(timeoutId);
      if (idleId !== null) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [activeRecipe, routeView]);

  const RouteRecipePage = recipePageSurface.getLoaded() ?? RecipePage;
  const RouteRecipesView = recipesViewSurface.getLoaded() ?? RecipesView;
  const RouteStudioPage = studioPageSurface.getLoaded() ?? StudioPage;
  const handlePreviewRecipe = useCallback((recipeId: RecipeId) => {
    preloadStudioViewportPlan(buildRecipeIntentPreloadPlan(recipeId));
  }, []);

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
            <RouteRecipesView
              onPreviewRecipe={handlePreviewRecipe}
              onSelectRecipe={onSelectRecipe}
            />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};
