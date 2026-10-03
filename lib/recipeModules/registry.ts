import type { RegisteredRecipeId } from '../recipeIds';
import { animationSequenceRecipe } from './animationSequence';
import { cameraRecipe } from './camera';
import { characterRecipe } from './character';
import { characterLabRecipe } from './characterLab';
import { cinematicRecipe } from './cinematic';
import { defaultRecipe } from './default';
import { remasterRecipe } from './remaster';
import { spriteAtlasRecipe } from './spriteAtlas';
import { spritesheetRecipe } from './spritesheet';
import { stylesRecipe } from './styles';
import { timelineRecipe } from './timeline';
import type { RecipeBehavior, RecipeDefinition, RecipeModule } from './types';

const RECIPE_DEFINITIONS: Record<RegisteredRecipeId, RecipeDefinition> = {
  'animation-sequence': animationSequenceRecipe,
  remaster: remasterRecipe,
  spritesheet: spritesheetRecipe,
  'sprite-atlas': spriteAtlasRecipe,
  cinematic: cinematicRecipe,
  'character-lab': characterLabRecipe,
  character: characterRecipe,
  styles: stylesRecipe,
  camera: cameraRecipe,
  timeline: timelineRecipe,
};

const RECIPE_LIST_ORDER: RegisteredRecipeId[] = [
  'animation-sequence',
  'styles',
  'remaster',
  'spritesheet',
  'sprite-atlas',
  'cinematic',
  'character-lab',
  'character',
  'camera',
  'timeline',
];

export const RECIPE_MODULES = Object.fromEntries(
  Object.entries(RECIPE_DEFINITIONS).map(([recipeId, definition]) => [recipeId, definition.module]),
) as Record<RegisteredRecipeId, RecipeModule>;

/** Behavior for a request without a Recipe Module. */
export const DEFAULT_RECIPE: RecipeBehavior = defaultRecipe;

export function getRecipeBehavior(recipeId: string | null | undefined): RecipeDefinition | null {
  return recipeId && Object.hasOwn(RECIPE_DEFINITIONS, recipeId)
    ? RECIPE_DEFINITIONS[recipeId as RegisteredRecipeId]
    : null;
}

export function getRecipeModule(recipeId: RegisteredRecipeId | null | undefined) {
  return recipeId ? RECIPE_MODULES[recipeId] : null;
}

export function listRecipeModules() {
  return RECIPE_LIST_ORDER.map((recipeId) => RECIPE_MODULES[recipeId]);
}
