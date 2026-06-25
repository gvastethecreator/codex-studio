import { cameraRecipeContextBuilder } from './camera';
import { characterLabRecipeContextBuilder } from './characterLab';
import { characterRecipeContextBuilder } from './character';
import { cinematicRecipeContextBuilder } from './cinematic';
import { remasterRecipeContextBuilder } from './remaster';
import { spritesheetRecipeContextBuilder } from './spritesheet';
import { stylesRecipeContextBuilder } from './styles';
import { timelineRecipeContextBuilder } from './timeline';
import type { RecipeContextBuilder, RegisteredRecipeId } from './shared';

export const RECIPE_CONTEXT_BUILDERS = {
  camera: cameraRecipeContextBuilder,
  'character-lab': characterLabRecipeContextBuilder,
  character: characterRecipeContextBuilder,
  cinematic: cinematicRecipeContextBuilder,
  remaster: remasterRecipeContextBuilder,
  spritesheet: spritesheetRecipeContextBuilder,
  styles: stylesRecipeContextBuilder,
  timeline: timelineRecipeContextBuilder,
} satisfies Record<RegisteredRecipeId, RecipeContextBuilder>;

export type { RecipeContextBuilder, RecipeContextParams, RegisteredRecipeId } from './shared';
