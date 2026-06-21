import React, { Suspense } from 'react';

import type { AppPageView } from '../../hooks/useHashRouter';
import type { StudioPageController } from '../../lib/buildStudioPageController';
import type { RecipeId } from '../../types';
import { ErrorBoundary } from '../ErrorBoundary';
import type { RecipePageProps } from '../RecipePage';
import { LazySurfaceFallback } from '../ui/LazySurfaceFallback';

const RecipePage = React.lazy(() =>
  import('../RecipePage').then((module) => ({ default: module.RecipePage })),
);
const RecipesView = React.lazy(() =>
  import('../RecipesView').then((module) => ({ default: module.RecipesView })),
);
const StudioPage = React.lazy(() =>
  import('../StudioPage').then((module) => ({ default: module.StudioPage })),
);

const VIEWPORT_SURFACE_BASE_CLASS = 'absolute inset-0 w-full h-full overflow-hidden';

export function resolveStudioViewportRouteKey(
  routeView: AppPageView,
  activeRecipe: RecipeId | null,
) {
  if (routeView === 'recipe' && activeRecipe) return `recipe-${activeRecipe}`;
  if (routeView === 'studio') return 'studio';
  return 'recipes-list';
}

export function isRecipesViewVisible(routeView: AppPageView) {
  return ['recipes', 'default'].includes(routeView);
}

export function getStudioViewportTransitionClassName(direction: number) {
  const slideClass =
    direction > 0 ? 'slide-in-from-right-3' : direction < 0 ? 'slide-in-from-left-3' : 'zoom-in-95';
  return `animate-in fade-in-0 ${slideClass} duration-200`;
}

interface StudioViewportProps {
  routeView: AppPageView;
  direction: number;
  activeRecipe: RecipeId | null;
  recipePageProps: Omit<RecipePageProps, 'activeRecipe'>;
  studioPageController: StudioPageController;
  onSelectRecipe: (recipeId: RecipeId) => void;
}

export const StudioViewport: React.FC<StudioViewportProps> = ({
  routeView,
  direction,
  activeRecipe,
  recipePageProps,
  studioPageController,
  onSelectRecipe,
}) => {
  const routeKey = resolveStudioViewportRouteKey(routeView, activeRecipe);
  const transitionClassName = getStudioViewportTransitionClassName(direction);
  const surfaceClassName =
    routeKey === 'studio'
      ? `${VIEWPORT_SURFACE_BASE_CLASS} flex flex-row ${transitionClassName}`
      : `${VIEWPORT_SURFACE_BASE_CLASS} ${transitionClassName}`;

  return (
    <ErrorBoundary fallbackMessage="Could not load this studio view.">
      <Suspense fallback={<LazySurfaceFallback label="Loading view" />}>
        <div key={routeKey} className={surfaceClassName}>
          {routeView === 'recipe' && activeRecipe ? (
            <RecipePage activeRecipe={activeRecipe} {...recipePageProps} />
          ) : routeView === 'studio' ? (
            <StudioPage controller={studioPageController} />
          ) : (
            <RecipesView onSelectRecipe={onSelectRecipe} />
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};
