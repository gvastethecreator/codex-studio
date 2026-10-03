import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
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
  it('reads the structured recipe id and params', () => {
    const config: ImageGenerationConfig = {
      ...baseConfig,
      recipeId: 'styles',
      recipeParams: { presetId: 'SP99-001' },
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

  it('has no identity without a structured recipe id', () => {
    expect(resolveRecipeIdentity(baseConfig)).toBeNull();
    expect(hasRecipeIdentity(baseConfig, 'camera')).toBe(false);
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

  it('does not import the Recipe Module catalog', () => {
    const source = readFileSync(new URL('./recipeIdentity.ts', import.meta.url), 'utf8');
    expect(source.includes("from './recipeModules'")).toBe(false);
    expect(source.includes('RECIPE_MODULES')).toBe(false);
  });
});
