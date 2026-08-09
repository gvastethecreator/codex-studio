import type { RecipeId } from '../types';
import { extractRecipeIdFromRecipeContext } from '../packages/shared/src/promptTransport';

type RegisteredRecipeId = Exclude<RecipeId, null>;

const RECIPE_SHELL_TITLES: Record<RegisteredRecipeId, string> = {
  'animation-sequence': 'Animation Sequence',
  styles: 'Styles',
  remaster: 'Remaster',
  spritesheet: 'Sprite Sheet',
  'sprite-atlas': 'Sprite Atlas',
  cinematic: 'Cinematic Storyboard',
  'character-lab': 'Character Lab',
  character: 'Character Sheet',
  camera: 'Camera View',
  timeline: 'Timeline Frame',
};

export function getRecipeShellTitle(recipeId: RegisteredRecipeId) {
  return RECIPE_SHELL_TITLES[recipeId] ?? recipeId;
}

export function isRegisteredRecipeId(value: unknown): value is RegisteredRecipeId {
  return typeof value === 'string' && value in RECIPE_SHELL_TITLES;
}

export function parseRecipeIdFromContext(context: string = ''): RecipeId {
  const recipeId = extractRecipeIdFromRecipeContext(context);
  return isRegisteredRecipeId(recipeId) ? recipeId : null;
}
