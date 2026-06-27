import { describe, expect, it } from 'vite-plus/test';

import {
  RECIPE_CATALOG,
  RECIPE_DISCOVERY_CATALOG,
  searchRecipeCatalog,
  validateRecipeCatalog,
} from './recipeCatalog';

describe('recipeCatalog', () => {
  it('materializes UI catalog entries from Recipe Modules without duplicating module descriptions', () => {
    expect(validateRecipeCatalog().errors).toEqual([]);
    expect(RECIPE_CATALOG.map((recipe) => recipe.id)).toEqual([
      'styles',
      'remaster',
      'spritesheet',
      'cinematic',
      'character-lab',
      'character',
      'camera',
      'timeline',
    ]);
    expect(RECIPE_CATALOG.find((recipe) => recipe.id === 'styles')).toMatchObject({
      title: 'STYLES',
      description: 'Browse and apply styles, or generate style-card assets.',
      defaultTask: 'image_generate',
      supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
      supportedProviders: ['codex', 'dry_run'],
      parameterGroups: ['identity', 'application', 'visual-dna'],
      requiredParameterIds: ['presetId', 'presetName'],
    });
    expect(RECIPE_CATALOG.find((recipe) => recipe.id === 'remaster')).toMatchObject({
      defaultParams: {
        style: 'Realistic Reconstruction',
        fidelity: 35,
      },
    });
  });

  it('searches recipes by task, provider, text, and parameter', () => {
    expect(searchRecipeCatalog({ task: 'sprite_sheet' }).map((recipe) => recipe.id)).toEqual([
      'spritesheet',
      'character-lab',
    ]);
    expect(searchRecipeCatalog({ providerId: 'dry_run' })).toHaveLength(RECIPE_CATALOG.length);
    expect(searchRecipeCatalog({ query: 'storyboard' }).map((recipe) => recipe.id)).toEqual([
      'cinematic',
      'timeline',
    ]);
    expect(searchRecipeCatalog({ parameterId: 'presetId' }).map((recipe) => recipe.id)).toEqual([
      'styles',
    ]);
  });

  it('adds Character Lab aliases only to the discovery catalog', () => {
    expect(RECIPE_CATALOG.map((recipe) => recipe.id)).not.toContain('character-sprites');
    expect(
      RECIPE_DISCOVERY_CATALOG.filter((recipe) => recipe.targetRecipeId === 'character-lab').map(
        (recipe) => recipe.id,
      ),
    ).toEqual([
      'character-lab',
      'character-poses',
      'character-sprites',
      'character-scenes',
      'character-variants',
      'character-transforms',
    ]);
    expect(
      RECIPE_DISCOVERY_CATALOG.find((recipe) => recipe.id === 'character-sprites'),
    ).toMatchObject({
      targetRecipeId: 'character-lab',
      routeAliasId: 'character-sprites',
      cardImageKey: 'character-sprites',
      defaultTask: 'sprite_sheet',
      defaultParams: expect.objectContaining({ mode: 'spritesheets' }),
    });
  });
});
