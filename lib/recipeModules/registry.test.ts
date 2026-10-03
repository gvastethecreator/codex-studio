import { describe, expect, it } from 'vitest';

import { RECIPE_POLICIES } from '../../packages/shared/src/recipePolicies';
import { REGISTERED_RECIPE_IDS } from '../recipeIds';
import { getRecipeBehavior, listRecipeModules, RECIPE_MODULES } from './registry';

describe('recipe registry', () => {
  it('has one module and the shared policy for every registered recipe id', () => {
    for (const recipeId of REGISTERED_RECIPE_IDS) {
      const recipe = getRecipeBehavior(recipeId);
      expect(recipe?.module.id).toBe(recipeId);
      expect(RECIPE_MODULES[recipeId]).toBe(recipe?.module);
      expect(recipe?.policy).toEqual(RECIPE_POLICIES[recipeId] ?? {});
    }
    expect(Object.keys(RECIPE_POLICIES).every((id) => getRecipeBehavior(id))).toBe(true);
    expect(
      listRecipeModules()
        .map((module) => module.id)
        .sort(),
    ).toEqual([...REGISTERED_RECIPE_IDS].sort());
    expect(getRecipeBehavior('toString')).toBeNull();
  });
});
