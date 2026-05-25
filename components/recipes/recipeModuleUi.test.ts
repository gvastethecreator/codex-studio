import { describe, expect, it } from 'vite-plus/test';

import {
  getRecipeModuleUiModel,
  getRecipeNumberDefault,
  getRecipeNumberOptions,
  getRecipeOptions,
  getRecipeRange,
  getRecipeStringDefault,
} from './recipeModuleUi';

describe('recipeModuleUi', () => {
  it('projects Recipe Module defaults and options for recipe surfaces', () => {
    const { module, defaults } = getRecipeModuleUiModel('cinematic');

    expect(getRecipeNumberDefault(defaults, 'frames', 3)).toBe(9);
    expect(getRecipeStringDefault(defaults, 'genre', 'Manual')).toBe('Auto-Detect');
    expect(getRecipeOptions(module, 'lens')).toContain('Anamorphic');
    expect(getRecipeNumberOptions(module, 'frames')).toEqual([3, 6, 9]);
  });

  it('projects numeric range controls from Recipe Module parameters', () => {
    const { module } = getRecipeModuleUiModel('camera');

    expect(getRecipeRange(module, 'azimuth', { min: 0, max: 0 })).toEqual({
      min: -180,
      max: 180,
      step: 1,
    });
  });
});
