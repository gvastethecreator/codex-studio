import { describe, expect, it } from 'vite-plus/test';

import {
  createRecipeDiscoveryProjection,
  createRecipesGridProjection,
  searchRecipeDiscoveryProjection,
} from './recipeDiscoveryProjection';
import { RECIPE_DISCOVERY_CATALOG } from './recipeCatalog';

describe('recipeDiscoveryProjection', () => {
  it('keeps aliases as discovery entries without creating recipe modules', () => {
    const projection = createRecipeDiscoveryProjection(RECIPE_DISCOVERY_CATALOG);

    expect(projection.entries.find((entry) => entry.id === 'character-sprites')).toMatchObject({
      isAlias: true,
      targetRecipeId: 'character-lab',
      routeAliasId: 'character-sprites',
    });
    expect(projection.entries.find((entry) => entry.id === 'character-lab')).toMatchObject({
      isAlias: false,
      targetRecipeId: 'character-lab',
    });
  });

  it('searches modules and aliases through one discovery contract', () => {
    expect(searchRecipeDiscoveryProjection({ query: 'sprites' }).map((entry) => entry.id)).toEqual(
      expect.arrayContaining(['spritesheet', 'character-sprites']),
    );
    expect(
      searchRecipeDiscoveryProjection({ task: 'sprite_sheet' }).map((entry) => entry.id),
    ).toEqual(expect.arrayContaining(['spritesheet', 'character-lab', 'character-sprites']));
  });

  it('keeps Character Lab alias cards out of the Recipes grid', () => {
    const projection = createRecipesGridProjection(RECIPE_DISCOVERY_CATALOG);

    expect(projection.entries.map((entry) => entry.id)).toEqual([
      'styles',
      'remaster',
      'spritesheet',
      'cinematic',
      'character-lab',
      'character',
      'camera',
      'timeline',
    ]);
    expect(projection.entries.some((entry) => entry.id === 'character-variants')).toBe(false);
  });
});
