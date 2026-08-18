import type { RecipeId } from '../types';

export type RegisteredRecipeId = Exclude<RecipeId, null>;

const REGISTERED_RECIPE_ID_FLAGS = {
  'animation-sequence': true,
  remaster: true,
  'sprite-atlas': true,
  spritesheet: true,
  cinematic: true,
  'character-lab': true,
  character: true,
  styles: true,
  camera: true,
  timeline: true,
} as const satisfies Record<RegisteredRecipeId, true>;

export const REGISTERED_RECIPE_IDS = Object.keys(
  REGISTERED_RECIPE_ID_FLAGS,
) as RegisteredRecipeId[];

const KNOWN_RECIPE_IDS = new Set<RegisteredRecipeId>(REGISTERED_RECIPE_IDS);

export function isRegisteredRecipeId(value: unknown): value is RegisteredRecipeId {
  return typeof value === 'string' && KNOWN_RECIPE_IDS.has(value as RegisteredRecipeId);
}
