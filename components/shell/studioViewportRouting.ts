import type { AppPageView } from '../../hooks/useHashRouter';
import type { RecipeAliasId } from '../../lib/recipeAliases';
import type { RecipeId } from '../../types';

export function resolveStudioViewportRouteKey(
  routeView: AppPageView,
  activeRecipe: RecipeId | null,
  activeRecipeAliasId: RecipeAliasId | null = null,
) {
  if (routeView === 'recipe' && activeRecipe) {
    return `recipe-${activeRecipeAliasId ?? activeRecipe}`;
  }
  if (routeView === 'studio') return 'studio';
  return 'recipes-list';
}

export function isRecipesViewVisible(routeView: AppPageView) {
  return ['recipes', 'default'].includes(routeView);
}

export function getStudioViewportTransitionClassName(direction: number) {
  if (direction > 0) return 'studio-route-enter studio-route-enter-forward';
  if (direction < 0) return 'studio-route-enter studio-route-enter-back';
  return 'studio-route-enter studio-route-enter-neutral';
}
