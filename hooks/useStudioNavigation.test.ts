import { describe, expect, it } from 'vitest';

import { resolveCreateTabAction } from '../lib/lastCreateRoute';
import { shouldCloseModalForOverlay } from './useStudioNavigation';

describe('shouldCloseModalForOverlay', () => {
  it('keeps the modal route open while modal image state catches up', () => {
    expect(shouldCloseModalForOverlay('modal', false)).toBe(false);
  });

  it('closes an existing modal once the route leaves the modal overlay', () => {
    expect(shouldCloseModalForOverlay('none', true)).toBe(true);
  });
});

describe('Create tab navigation', () => {
  const studio = {
    view: 'studio' as const,
    activeRecipeId: null,
    activeRecipeAliasId: null,
    overlay: 'none' as const,
  };
  const styles = {
    view: 'recipe' as const,
    activeRecipeId: 'styles' as const,
    activeRecipeAliasId: null,
    overlay: 'none' as const,
  };

  it('does not force Default while a recipe is open', () => {
    expect(resolveCreateTabAction(styles, 'recipes', 'recipes')).toEqual({ kind: 'noop' });
  });

  it('restores the last create recipe from Library', () => {
    expect(resolveCreateTabAction(studio, 'recipes', 'recipe-styles')).toEqual({
      kind: 'recipe',
      recipeId: 'styles',
      aliasId: null,
    });
  });
});
