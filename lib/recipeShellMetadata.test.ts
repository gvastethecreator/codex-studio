import { describe, expect, it } from 'vitest';
import { listRecipeModules } from './recipeModules';
import { getRecipeShellTitle, parseRecipeIdFromContext } from './recipeShellMetadata';

describe('recipeShellMetadata', () => {
  it('keeps lightweight shell titles aligned with the full recipe registry', () => {
    for (const recipe of listRecipeModules()) {
      expect(getRecipeShellTitle(recipe.id)).toBe(recipe.title);
    }
  });

  it('parses only registered recipe IDs from context envelopes', () => {
    expect(parseRecipeIdFromContext('--- CODEX RECIPE CONTEXT ---\nrecipe: camera')).toBe('camera');
    expect(parseRecipeIdFromContext('CAMERA VIEW PROMPT')).toBeNull();
    expect(
      parseRecipeIdFromContext('--- CODEX RECIPE CONTEXT ---\nrecipe: constructor'),
    ).toBeNull();
  });
});
