import {
  createRecipeProviderDirectives,
  type RecipeProviderDirectiveSection,
} from '../../packages/shared/src/recipeProviderDirectives';
import type { RecipeModule, RecipeParams } from './types';

export function getString(params: RecipeParams, key: string) {
  const value = params[key];
  return typeof value === 'string' ? value : '';
}

export function getNumber(params: RecipeParams, key: string, fallback = 0) {
  const value = params[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function getBoolean(params: RecipeParams, key: string, fallback = false) {
  const value = params[key];
  return typeof value === 'boolean' ? value : fallback;
}

export function getRecord(params: RecipeParams, key: string) {
  const value = params[key];
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function getStringArray(params: RecipeParams, key: string) {
  const value = params[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

export function directive(label: string, value: string | number | boolean | null | undefined) {
  return { label, value: value === undefined || value === null ? '' : `${value}` };
}

export function paramDirective(params: RecipeParams, key: string, label: string) {
  return directive(label, getString(params, key));
}

/** Empty for "let the model decide" choices, so they don't reach the provider as noise. */
export function chosenOption(params: RecipeParams, key: string) {
  const value = getString(params, key);
  return value === 'Auto-Detect' || value === 'Auto' ? '' : value;
}

export function createModuleDirectives(
  module: RecipeModule,
  sections: RecipeProviderDirectiveSection[],
) {
  return createRecipeProviderDirectives({ recipeId: module.id, title: module.title, sections });
}
