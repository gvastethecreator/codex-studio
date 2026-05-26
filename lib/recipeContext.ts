import type { ImageGenerationConfig, RecipeId } from '../types';
import { extractRecipeIdFromRecipeContext } from '../packages/shared/src/promptTransport';
import { RECIPE_CONTEXT_BUILDERS } from './recipeContextBuilders';
import type { RecipeContextParams, RegisteredRecipeId } from './recipeContextBuilders';

export function buildRecipeContext(
  recipeId: RegisteredRecipeId | null | undefined,
  params: RecipeContextParams | null | undefined,
) {
  if (!recipeId || !params) {
    return '';
  }

  const builder = RECIPE_CONTEXT_BUILDERS[recipeId];
  if (!builder) {
    return '';
  }

  return builder.buildContext(params);
}

export function resolveGenerationConfig(config: ImageGenerationConfig): ImageGenerationConfig {
  const recipeContext = config.recipeId
    ? buildRecipeContext(config.recipeId, config.recipeParams ?? null) || config.recipeContext || ''
    : config.recipeContext || '';

  return {
    ...config,
    recipeContext,
  };
}

export function parseRecipeIdFromContext(context: string = ''): RecipeId {
  const recipeId = extractRecipeIdFromRecipeContext(context);
  if (recipeId && recipeId in RECIPE_CONTEXT_BUILDERS) return recipeId as RegisteredRecipeId;
  return null;
}

export function getRecipeContextBuilder(recipeId: RegisteredRecipeId) {
  return RECIPE_CONTEXT_BUILDERS[recipeId];
}
