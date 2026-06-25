import { describe, expect, it } from 'vite-plus/test';

import { RECIPE_CONTEXT_BUILDERS } from './index';
import type { RegisteredRecipeId } from './shared';

const EXPECTED_RECIPE_IDS: RegisteredRecipeId[] = [
  'camera',
  'character-lab',
  'character',
  'cinematic',
  'remaster',
  'spritesheet',
  'styles',
  'timeline',
];

describe('recipeContextBuilders registry', () => {
  it('registers every current recipe context builder behind one interface', () => {
    expect(Object.keys(RECIPE_CONTEXT_BUILDERS).sort()).toEqual([...EXPECTED_RECIPE_IDS].sort());

    for (const recipeId of EXPECTED_RECIPE_IDS) {
      const builder = RECIPE_CONTEXT_BUILDERS[recipeId];
      const context = builder.buildContext({});

      expect(builder.protocol).toBe('codex-recipe-v1');
      expect(context).toContain('protocol: codex-recipe-v1');
      expect(context).toContain(`recipe: ${recipeId}`);
      expect(context).toContain(`title: ${builder.title}`);
    }
  });
});
