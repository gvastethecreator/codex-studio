import type { AppPageView } from '../../hooks/useHashRouter';
import type { RecipeId } from '../../types';

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
