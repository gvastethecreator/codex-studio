import type { ImageGenerationConfig } from '../types';
import { isRegisteredRecipeId, type RegisteredRecipeId } from './recipeIds';

export type { RegisteredRecipeId } from './recipeIds';

export interface RecipeIdentity {
  recipeId: RegisteredRecipeId;
  recipeParams: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function resolveRecipeIdentity(
  config: Pick<ImageGenerationConfig, 'recipeId' | 'recipeParams'>,
): RecipeIdentity | null {
  const recipeId = config.recipeId;
  if (!isRegisteredRecipeId(recipeId)) {
    return null;
  }

  return {
    recipeId,
    recipeParams: isRecord(config.recipeParams) ? config.recipeParams : {},
  };
}

export function hasRecipeIdentity(
  config: Pick<ImageGenerationConfig, 'recipeId' | 'recipeParams'>,
  recipeId: RegisteredRecipeId,
) {
  return resolveRecipeIdentity(config)?.recipeId === recipeId;
}

function getRecipeParam(
  config: Pick<ImageGenerationConfig, 'recipeId' | 'recipeParams'>,
  key: string,
) {
  return resolveRecipeIdentity(config)?.recipeParams[key];
}

export function getRecipeStringParam(
  config: Pick<ImageGenerationConfig, 'recipeId' | 'recipeParams'>,
  key: string,
  fallback = '',
) {
  const value = getRecipeParam(config, key);
  return typeof value === 'string' ? value : fallback;
}

export function getRecipeNumberParam(
  config: Pick<ImageGenerationConfig, 'recipeId' | 'recipeParams'>,
  key: string,
  fallback = 0,
) {
  const value = getRecipeParam(config, key);
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function hasSelectedStylePresetId(
  config: Pick<ImageGenerationConfig, 'recipeId' | 'recipeParams'>,
  presetId: string,
) {
  const selectedStyles = getRecipeParam(config, 'selectedStyles');
  if (!Array.isArray(selectedStyles)) return false;

  return selectedStyles.some(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      !Array.isArray(entry) &&
      (entry as Record<string, unknown>).presetId === presetId,
  );
}

export function hasStylePresetIdentity(
  config: Pick<ImageGenerationConfig, 'recipeId' | 'recipeParams'>,
  presetId: string,
) {
  return (
    hasRecipeIdentity(config, 'styles') &&
    (getRecipeStringParam(config, 'presetId') === presetId ||
      hasSelectedStylePresetId(config, presetId))
  );
}
