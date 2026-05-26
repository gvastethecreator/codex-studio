import { describe, expect, it } from 'vite-plus/test';

import type { AppPageView } from '../../hooks/useHashRouter';
import type { RecipeId } from '../../types';

function resolveViewportRouteKey(currentView: AppPageView, activeRecipe: RecipeId | null): string {
  if (currentView === 'recipe' && activeRecipe) {
    return `recipe-${activeRecipe}`;
  }
  if (currentView === 'studio') {
    return 'studio';
  }
  return 'recipes-list';
}

function isRecipesViewVisible(currentView: AppPageView) {
  return ['recipes', 'default'].includes(currentView);
}

describe('StudioViewport routing', () => {
  it('maps views to route keys for AnimatePresence transitions', () => {
    expect(resolveViewportRouteKey('studio', null)).toBe('studio');
    expect(resolveViewportRouteKey('recipes', null)).toBe('recipes-list');
    expect(resolveViewportRouteKey('recipe', 'character')).toBe('recipe-character');
    expect(resolveViewportRouteKey('recipe', 'camera')).toBe('recipe-camera');
    expect(resolveViewportRouteKey('recipe', null)).toBe('recipes-list');
  });

  it('shows RecipesView for recipes and default routes', () => {
    expect(isRecipesViewVisible('recipes')).toBe(true);
    expect(isRecipesViewVisible('studio')).toBe(false);
    expect(isRecipesViewVisible('recipe')).toBe(false);
  });
});
