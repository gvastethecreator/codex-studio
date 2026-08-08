import React, { Suspense, useCallback, useEffect } from 'react';

import type { AppPageView } from '../../hooks/useHashRouter';
import type { StudioPageController } from '../../lib/buildStudioPageController';
import type { RecipeAliasId } from '../../lib/recipeAliases';
import type { RecipeId } from '../../types';
import { useGenerationDraft } from '../../contexts/GenerationContext';
import { ErrorBoundary } from '../ErrorBoundary';
import type { RecipePageProps, RecipePageRuntimeProps } from '../RecipePage';
import { preloadRecipeComponent } from '../../lib/recipeRouteModules';
import { LazySurfaceFallback } from '../ui/LazySurfaceFallback';
import {
  buildRecipeIntentPreloadPlan,
  buildRoutePreloadPlan,
  type RoutePreloadPlan,
} from '../../lib/routePreloadBudget';
import {
  preloadStudioViewportSurface,
  recipePageSurface,
  recipesViewSurface,
  studioPageSurface,
} from '../../lib/studioViewportRouteSurfaces';
import {
  getStudioViewportTransitionClassName,
  resolveStudioViewportRouteKey,
} from './studioViewportRouting';

const RecipePage = recipePageSurface.Component;
const RecipesView = recipesViewSurface.Component;
const StudioPage = studioPageSurface.Component;

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
  recipePageProps: RecipePageRuntimeProps;
  studioPageController: StudioPageController;
  onSelectRecipe: (recipeId: RecipeId, aliasId?: RecipeAliasId | null) => void;
}

interface ConnectedRecipePageProps extends RecipePageRuntimeProps {
  Component: React.ComponentType<RecipePageProps>;
  activeRecipe: RecipeId;
  activeRecipeAliasId: RecipeAliasId | null;
}

function ConnectedRecipePage({
  Component,
  activeRecipe,
  activeRecipeAliasId,
  ...runtimeProps
}: ConnectedRecipePageProps) {
  const draft = useGenerationDraft();

  return (
    <Component
      {...runtimeProps}
      activeRecipe={activeRecipe}
      activeRecipeAliasId={activeRecipeAliasId}
      generationConfig={draft.generationConfig}
      updateGenerationConfig={draft.updateGenerationConfig}
      updateAttachment={draft.updateAttachment}
      handlePastedFiles={draft.handlePastedFiles}
      handleAddToContext={draft.handleAddToContext}
    />
  );
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
            <ConnectedRecipePage
              Component={RouteRecipePage}
              activeRecipe={activeRecipe}
              {...recipePageProps}
              activeRecipeAliasId={activeRecipeAliasId}
            />
          ) : routeView === 'studio' ? (
            <RouteStudioPage {...studioPageController.grid} />
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
