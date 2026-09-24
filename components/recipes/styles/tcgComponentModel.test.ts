import { describe, expect, it } from 'vitest';
import {
  TCG_FINISHES,
  TCG_LAYOUTS,
  TCG_RECIPES,
  buildTcgRecipeArtPrompt,
  resolveTcgRecipe,
} from './tcgComponentModel';
import { getRequiredTcgArtworkCount, getRequiredTcgMasks } from './tcgCardRenderer';

describe('TCG component catalog', () => {
  it('resolves every crossover to a visual preset and executable layout requirements', () => {
    expect([TCG_FINISHES.length, TCG_LAYOUTS.length, TCG_RECIPES.length]).toEqual([18, 12, 12]);
    for (const recipe of TCG_RECIPES) {
      const resolved = resolveTcgRecipe(recipe.id);
      expect(resolved.primaryPresetId).toMatch(/^SP22-\d{3}$/);
      expect(resolved.secondaryPresetId).toMatch(/^SP22-\d{3}$/);
      expect(getRequiredTcgArtworkCount(recipe.layoutId)).toBeGreaterThan(0);
      expect(getRequiredTcgMasks(recipe.finishId, recipe.layoutId)).toEqual(
        expect.arrayContaining(resolved.finish.masks),
      );
      expect(buildTcgRecipeArtPrompt(recipe.id, 'A red fox crossing a bridge')).toContain(
        'A red fox crossing a bridge',
      );
    }
    expect(getRequiredTcgMasks('TCG-F003', 'TCG-L005')).toEqual([
      'stampMask',
      'subjectMask',
      'occlusionMask',
    ]);
  });
});
