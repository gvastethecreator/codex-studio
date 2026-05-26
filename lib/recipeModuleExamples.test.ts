import { describe, expect, it } from 'vite-plus/test';

import {
  RECIPE_MODULE_EXAMPLES,
  buildRecipeModuleExampleSpec,
  validateRecipeModuleExamples,
} from './recipeModuleExamples';

describe('recipeModuleExamples', () => {
  it('covers future asset tasks without enabling provider-specific runtime', () => {
    expect(validateRecipeModuleExamples().errors).toEqual([]);
    expect(RECIPE_MODULE_EXAMPLES.map((example) => example.task)).toEqual([
      'sprite_sheet',
      'texture_generate',
    ]);
    expect(RECIPE_MODULE_EXAMPLES.every((example) => example.activation === 'example_only')).toBe(
      true,
    );
    expect(
      RECIPE_MODULE_EXAMPLES.flatMap((example) => example.supportedProviders).every((providerId) =>
        ['codex', 'dry_run'].includes(providerId),
      ),
    ).toBe(true);
  });

  it('builds provider-independent Generation Task Specs from examples', () => {
    const texture = RECIPE_MODULE_EXAMPLES.find((example) => example.task === 'texture_generate');
    expect(texture).toBeTruthy();

    const spec = buildRecipeModuleExampleSpec(texture!);

    expect(spec).toMatchObject({
      id: 'texture-material-tile-v1',
      task: 'texture_generate',
      providerId: null,
      recipeId: 'texture-material',
      output: {
        aspectRatio: '1:1',
        imageSize: '1K',
        requiresCatalogEntry: true,
      },
      metadata: {
        recipeModuleExample: {
          activation: 'example_only',
          providerBoundary: 'provider_independent',
          supportedProviders: ['codex', 'dry_run'],
        },
      },
    });
  });

  it('rejects non Codex-first provider examples', () => {
    const invalid = {
      ...RECIPE_MODULE_EXAMPLES[0],
      id: 'sprite-sheet-grid-v1' as const,
      supportedProviders: ['fal'],
    };

    expect(validateRecipeModuleExamples([invalid]).errors).toContain(
      'Recipe Module example sprite-sheet-grid-v1 uses non Codex-first provider: fal.',
    );
  });
});
