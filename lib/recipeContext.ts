import type { ImageGenerationConfig, RecipeId } from '../types';
import { extractRecipeIdFromRecipeContext } from '../packages/shared/src/promptTransport';
import { buildRecipeModuleContext, getRecipeModule } from './recipeModules';
import type { RecipeContextParams } from './recipeContextBuilders';

type RegisteredRecipeId = Exclude<RecipeId, null>;

export function buildRecipeContext(
  recipeId: RegisteredRecipeId | null | undefined,
  params: RecipeContextParams | null | undefined,
) {
  return buildRecipeModuleContext(recipeId, params);
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
  if (recipeId && getRecipeModule(recipeId as RegisteredRecipeId)) {
    return recipeId as RegisteredRecipeId;
  }
  return null;
}

export function getRecipeContextBuilder(recipeId: RegisteredRecipeId) {
  const recipeModule = getRecipeModule(recipeId);
  if (!recipeModule) {
    return null;
  }

  return {
    protocol: 'codex-recipe-v1',
    title: recipeModule.title,
    buildContext: (params: RecipeContextParams) => recipeModule.buildContext(params),
  };
}
