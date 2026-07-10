import type { RecipeId } from '../types';

export function getStudioGenerationDockToolbarMode(activeRecipe: RecipeId | null) {
  return activeRecipe === 'animation-sequence' ? ('context-only' as const) : ('full' as const);
}
