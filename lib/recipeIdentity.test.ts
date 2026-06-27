import { describe, expect, it } from 'vite-plus/test';
import type { ImageGenerationConfig } from '../types';
import {
  getRecipeNumberParam,
  hasRecipeIdentity,
  hasStylePresetIdentity,
  resolveRecipeIdentity,
} from './recipeIdentity';

const baseConfig: ImageGenerationConfig = {
  attachments: [],
  aspectRatio: '2:3',
  imageSize: '1K',
  model: 'codex-imagegen',
  executionModel: 'gpt-5.4-mini',
  executionReasoningEffort: 'low',
  executionSpeed: 'standard',
  batchCount: 1,
};

describe('recipeIdentity', () => {
  it('prefers structured recipe id and params over prompt text', () => {
    const config: ImageGenerationConfig = {
      ...baseConfig,
      recipeId: 'styles',
      recipeParams: { presetId: 'SP99-001' },
      recipeContext: 'TARGET STYLE: SOMETHING ELSE',
    };

    expect(resolveRecipeIdentity(config)).toMatchObject({ recipeId: 'styles' });
    expect(hasStylePresetIdentity(config, 'SP99-001')).toBe(true);
  });

  it('matches style identity from multi-style selected slots', () => {
    const config: ImageGenerationConfig = {
      ...baseConfig,
      recipeId: 'styles',
      recipeParams: {
        presetId: 'SP01-001',
        selectedStyles: [
          { presetId: 'SP01-001', presetName: 'Studio Headshot' },
          { presetId: 'SP02-010', presetName: 'Film Noir' },
        ],
      },
    };

    expect(hasStylePresetIdentity(config, 'SP01-001')).toBe(true);
    expect(hasStylePresetIdentity(config, 'SP02-010')).toBe(true);
    expect(hasStylePresetIdentity(config, 'SP03-001')).toBe(false);
  });

  it('can read the recipe id from the structured context envelope', () => {
    expect(
      hasRecipeIdentity(
        {
          ...baseConfig,
          recipeContext: ['--- CODEX RECIPE CONTEXT ---', 'recipe: timeline'].join('\n'),
        },
        'timeline',
      ),
    ).toBe(true);
  });

  it('does not classify recipes from legacy title substrings alone', () => {
    expect(
      hasRecipeIdentity(
        {
          ...baseConfig,
          recipeContext: 'CAMERA VIEW PROMPT without a recipe envelope',
        },
        'camera',
      ),
    ).toBe(false);
  });

  it('reads numeric params without parsing recipe prose', () => {
    expect(
      getRecipeNumberParam(
        {
          ...baseConfig,
          recipeId: 'timeline',
          recipeParams: { nextIndex: 3 },
        },
        'nextIndex',
        0,
      ),
    ).toBe(3);
  });
});
