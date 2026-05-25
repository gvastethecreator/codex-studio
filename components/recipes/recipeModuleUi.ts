import type { RecipeId } from '../../types';
import {
  createRecipeDefaultParams,
  getRecipeModule,
  getRecipeParameter,
  getRecipeParameterOptions,
  type RecipeModule,
} from '../../lib/recipeModules';

type RegisteredRecipeId = Exclude<RecipeId, null>;

export function getRecipeModuleUiModel(recipeId: RegisteredRecipeId) {
  const module = getRecipeModule(recipeId);
  if (!module) {
    throw new Error(`Recipe Module ${recipeId} is not registered.`);
  }

  return {
    module,
    defaults: createRecipeDefaultParams(module),
  };
}

export function getRecipeStringDefault(
  defaults: Record<string, unknown>,
  parameterId: string,
  fallback: string,
) {
  const value = defaults[parameterId];
  return typeof value === 'string' ? value : fallback;
}

export function getRecipeNumberDefault(
  defaults: Record<string, unknown>,
  parameterId: string,
  fallback: number,
) {
  const value = defaults[parameterId];
  return typeof value === 'number' ? value : fallback;
}

export function getRecipeOptions(module: RecipeModule, parameterId: string) {
  return getRecipeParameterOptions(module, parameterId);
}

export function getRecipeNumberOptions(module: RecipeModule, parameterId: string) {
  return getRecipeParameterOptions(module, parameterId)
    .map((option) => Number(option))
    .filter((option) => Number.isFinite(option));
}

export function getRecipeRange(
  module: RecipeModule,
  parameterId: string,
  fallback: { min: number; max: number; step?: number },
) {
  const parameter = getRecipeParameter(module, parameterId);
  return {
    min: parameter?.min ?? fallback.min,
    max: parameter?.max ?? fallback.max,
    step: parameter?.step ?? fallback.step,
  };
}
