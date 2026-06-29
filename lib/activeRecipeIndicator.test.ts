import { describe, expect, it } from 'vite-plus/test';

import type { RecipeId } from '../types';
import { getActiveRecipeIndicator, listActiveRecipeIndicators } from './activeRecipeIndicator';

const REGISTERED_RECIPE_IDS: Exclude<RecipeId, null>[] = [
  'styles',
  'remaster',
  'spritesheet',
  'cinematic',
  'character-lab',
  'character',
  'camera',
  'timeline',
];

describe('activeRecipeIndicator', () => {
  it('covers every registered recipe with compact display copy', () => {
    for (const recipeId of REGISTERED_RECIPE_IDS) {
      const indicator = getActiveRecipeIndicator(recipeId);

      expect(indicator?.id).toBe(recipeId);
      expect(indicator?.title.trim()).not.toBe('');
      expect(indicator?.summary.trim()).not.toBe('');
      expect(indicator?.summary.length).toBeLessThanOrEqual(16);
    }
  });

  it('keeps each recipe visually distinct', () => {
    const indicators = listActiveRecipeIndicators();
    const toneClasses = new Set(indicators.map((indicator) => indicator.toneClassName));
    const dotClasses = new Set(indicators.map((indicator) => indicator.dotClassName));

    expect(indicators).toHaveLength(REGISTERED_RECIPE_IDS.length);
    expect(toneClasses.size).toBe(indicators.length);
    expect(dotClasses.size).toBe(indicators.length);
  });

  it('stays hidden without active recipe', () => {
    expect(getActiveRecipeIndicator(null)).toBeNull();
    expect(getActiveRecipeIndicator(undefined)).toBeNull();
  });
});
