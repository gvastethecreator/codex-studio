import type { RecipeId } from '../../types';

export type RegisteredRecipeId = Exclude<RecipeId, null>;
export type RecipeContextParams = Record<string, unknown>;

export interface RecipeContextBuilder {
  readonly protocol: string;
  readonly title: string;
  buildContext: (params: RecipeContextParams) => string;
}

export const RECIPE_CONTEXT_PROTOCOL = 'codex-recipe-v1';

export function getString(params: RecipeContextParams, key: string, fallback = '') {
  const value = params[key];
  return typeof value === 'string' ? value : fallback;
}

export function getNumber(params: RecipeContextParams, key: string, fallback = 0) {
  const value = params[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function getBoolean(params: RecipeContextParams, key: string, fallback = false) {
  const value = params[key];
  return typeof value === 'boolean' ? value : fallback;
}

export function getRecord(params: RecipeContextParams, key: string) {
  const value = params[key];
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function recipeDocument(recipeId: RegisteredRecipeId, title: string, body: string) {
  return [
    '--- CODEX RECIPE CONTEXT ---',
    `protocol: ${RECIPE_CONTEXT_PROTOCOL}`,
    `recipe: ${recipeId}`,
    `title: ${title}`,
    '',
    body.trim(),
    '--- END CODEX RECIPE CONTEXT ---',
  ].join('\n');
}
