import { describe, expect, it } from 'vitest';

import {
  LAST_CREATE_ROUTE_KEY,
  persistableCreateRouteSegment,
  readLastCreateRoute,
  resolveCreateTabAction,
  writeLastCreateRoute,
} from './lastCreateRoute';
import type { HashRouterState } from '../hooks/useHashRouter';

const studio: HashRouterState = {
  view: 'studio',
  activeRecipeId: null,
  activeRecipeAliasId: null,
  overlay: 'none',
};

const recipes: HashRouterState = {
  view: 'recipes',
  activeRecipeId: null,
  activeRecipeAliasId: null,
  overlay: 'none',
};

const styles: HashRouterState = {
  view: 'recipe',
  activeRecipeId: 'styles',
  activeRecipeAliasId: null,
  overlay: 'none',
};

const sprites: HashRouterState = {
  view: 'recipe',
  activeRecipeId: 'character-lab',
  activeRecipeAliasId: 'character-sprites',
  overlay: 'none',
};

describe('lastCreateRoute', () => {
  it('stores Default and recipe identity without catalog subpaths', () => {
    expect(persistableCreateRouteSegment(studio)).toBeNull();
    expect(persistableCreateRouteSegment(recipes)).toBe('recipes');
    expect(persistableCreateRouteSegment(styles)).toBe('recipe-styles');
    expect(persistableCreateRouteSegment(sprites)).toBe('recipe-character-sprites');
  });

  it('leaves Create as a no-op while a workflow is already open', () => {
    expect(resolveCreateTabAction(styles, 'recipes', 'recipes')).toEqual({ kind: 'noop' });
    expect(resolveCreateTabAction(recipes, 'recipes', 'recipe-styles')).toEqual({ kind: 'noop' });
  });

  it('restores the last create workflow from Library and defaults to Default', () => {
    expect(resolveCreateTabAction(studio, 'studio', 'recipe-styles')).toEqual({ kind: 'studio' });
    expect(resolveCreateTabAction(studio, 'recipes', 'recipe-styles')).toEqual({
      kind: 'recipe',
      recipeId: 'styles',
      aliasId: null,
    });
    expect(resolveCreateTabAction(studio, 'recipes', 'recipe-character-sprites')).toEqual({
      kind: 'recipe',
      recipeId: 'character-lab',
      aliasId: 'character-sprites',
    });
    expect(resolveCreateTabAction(studio, 'recipes', null)).toEqual({ kind: 'recipes' });
  });

  it('reads and writes the session key through the supplied storage', () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
      clear: () => memory.clear(),
      key: (index: number) => [...memory.keys()][index] ?? null,
      get length() {
        return memory.size;
      },
    } as Storage;

    writeLastCreateRoute('recipe-styles', storage);
    expect(storage.getItem(LAST_CREATE_ROUTE_KEY)).toBe('recipe-styles');
    expect(readLastCreateRoute(storage)).toBe('recipe-styles');
  });
});
