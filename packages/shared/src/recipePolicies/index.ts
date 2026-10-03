import { animationSequencePolicy } from './animationSequence';
import { characterPolicy } from './character';
import { characterLabPolicy } from './characterLab';
import { cinematicPolicy } from './cinematic';
import { remasterPolicy } from './remaster';
import { spritesheetPolicy } from './spritesheet';
import { stylesPolicy } from './styles';
import { timelinePolicy } from './timeline';
import type { RecipePolicy } from './types';

export type { RecipePolicy, RecipePolicyParams } from './types';

/** Recipes without requirement or summary rules have no entry. */
export const RECIPE_POLICIES: Readonly<Record<string, RecipePolicy>> = {
  remaster: remasterPolicy,
  spritesheet: spritesheetPolicy,
  styles: stylesPolicy,
  timeline: timelinePolicy,
  'character-lab': characterLabPolicy,
  'animation-sequence': animationSequencePolicy,
  cinematic: cinematicPolicy,
  character: characterPolicy,
};

const NO_POLICY: RecipePolicy = {};

export function getRecipePolicy(recipeId: string | null | undefined): RecipePolicy {
  return recipeId && Object.hasOwn(RECIPE_POLICIES, recipeId)
    ? RECIPE_POLICIES[recipeId]!
    : NO_POLICY;
}
