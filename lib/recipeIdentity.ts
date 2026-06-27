import type { ImageGenerationConfig, RecipeId } from '../types';
import { extractRecipeIdFromRecipeContext } from '../packages/shared/src/promptTransport';
import { RECIPE_MODULES } from './recipeModules';

export type RegisteredRecipeId = Exclude<RecipeId, null>;

export interface RecipeIdentity {
  recipeId: RegisteredRecipeId;
  recipeParams: Record<string, unknown>;
  recipeContext: string;
}

const KNOWN_RECIPE_IDS = new Set<RegisteredRecipeId>(
  Object.keys(RECIPE_MODULES) as RegisteredRecipeId[],
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isRegisteredRecipeId(value: unknown): value is RegisteredRecipeId {
  return typeof value === 'string' && KNOWN_RECIPE_IDS.has(value as RegisteredRecipeId);
}

export function resolveRecipeIdentity(
  config: Pick<ImageGenerationConfig, 'recipeContext' | 'recipeId' | 'recipeParams'>,
): RecipeIdentity | null {
  const recipeId = isRegisteredRecipeId(config.recipeId)
    ? config.recipeId
    : extractRecipeIdFromRecipeContext(config.recipeContext);

  if (!isRegisteredRecipeId(recipeId)) {
    return null;
  }

  return {
    recipeId,
    recipeParams: isRecord(config.recipeParams) ? config.recipeParams : {},
    recipeContext: config.recipeContext ?? '',
  };
}

export function hasRecipeIdentity(
  config: Pick<ImageGenerationConfig, 'recipeContext' | 'recipeId' | 'recipeParams'>,
  recipeId: RegisteredRecipeId,
) {
  return resolveRecipeIdentity(config)?.recipeId === recipeId;
}

function getRecipeParam(
  config: Pick<ImageGenerationConfig, 'recipeContext' | 'recipeId' | 'recipeParams'>,
  key: string,
) {
  return resolveRecipeIdentity(config)?.recipeParams[key];
}

function getRecipeStringParam(
  config: Pick<ImageGenerationConfig, 'recipeContext' | 'recipeId' | 'recipeParams'>,
  key: string,
  fallback = '',
) {
  const value = getRecipeParam(config, key);
  return typeof value === 'string' ? value : fallback;
}

export function getRecipeNumberParam(
  config: Pick<ImageGenerationConfig, 'recipeContext' | 'recipeId' | 'recipeParams'>,
  key: string,
  fallback = 0,
) {
  const value = getRecipeParam(config, key);
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function hasSelectedStylePresetId(
  config: Pick<ImageGenerationConfig, 'recipeContext' | 'recipeId' | 'recipeParams'>,
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
  config: Pick<ImageGenerationConfig, 'recipeContext' | 'recipeId' | 'recipeParams'>,
  presetId: string,
) {
  return (
    hasRecipeIdentity(config, 'styles') &&
    (getRecipeStringParam(config, 'presetId') === presetId ||
      hasSelectedStylePresetId(config, presetId))
  );
}
