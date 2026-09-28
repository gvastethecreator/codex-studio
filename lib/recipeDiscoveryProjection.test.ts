import { describe, expect, it } from 'vitest';

import {
  createRecipeDiscoveryProjection,
  createRecipesGridProjection,
  searchRecipeDiscoveryProjection,
  groupRecipeDiscoveryEntries,
} from './recipeDiscoveryProjection';
import { RECIPE_DISCOVERY_CATALOG } from './recipeCatalog';
import { registerDisabledWorkflowModules } from './workflowModuleState';

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

  it('groups all Character workflows identically in the Recipes grid and picker', () => {
    const projection = createRecipesGridProjection(RECIPE_DISCOVERY_CATALOG);

    const groups = groupRecipeDiscoveryEntries(projection.entries);
    expect(groups).toEqual(groupRecipeDiscoveryEntries(createRecipeDiscoveryProjection().entries));
    expect(
      groups.find((group) => group.label === 'Character')?.entries.map((entry) => entry.id),
    ).toEqual([
      'character-poses',
      'character-sprites',
      'character-scenes',
      'character-variants',
      'character-transforms',
      'character',
      'character-lab',
    ]);
    expect(groups.flatMap((group) => group.entries)).toHaveLength(RECIPE_DISCOVERY_CATALOG.length);
    expect(groups.map((group) => group.label)).toEqual([
      'Create & Edit',
      'Character',
      'Camera & Story',
      'Animation',
      'Game Assets',
    ]);
    expect(
      searchRecipeDiscoveryProjection({ query: 'Camera & Story' }).map((entry) => entry.id),
    ).toEqual(expect.arrayContaining(['camera', 'cinematic', 'timeline']));
  });

  it('hides every workflow of a turned-off module, aliases included', () => {
    registerDisabledWorkflowModules(['character-lab', 'timeline']);
    try {
      const ids = createRecipesGridProjection().entries.map((entry) => entry.id);
      expect(ids).not.toContain('timeline');
      expect(ids.some((id) => id.startsWith('character-') || id === 'character-lab')).toBe(false);
      expect(ids).toEqual(expect.arrayContaining(['styles', 'character', 'camera']));
    } finally {
      registerDisabledWorkflowModules([]);
    }
  });
});
