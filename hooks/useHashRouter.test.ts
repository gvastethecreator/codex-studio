import { describe, expect, it } from 'bun:test';

import { resolveHashRouterState } from './useHashRouter';

const studioRoute = {
  view: 'studio' as const,
  activeRecipeId: null,
  overlay: 'none' as const,
};

describe('resolveHashRouterState', () => {
  it('maps recipes hash to the recipes view', () => {
    const next = resolveHashRouterState(studioRoute, '#recipes');

    expect(next).toEqual({
      view: 'recipes',
      activeRecipeId: null,
      overlay: 'none',
    });
  });

  it('maps recipe hashes to the concrete recipe page', () => {
    const next = resolveHashRouterState(studioRoute, '#recipe-camera');

    expect(next).toEqual({
      view: 'recipe',
      activeRecipeId: 'camera',
      overlay: 'none',
    });
  });

  it('keeps the previous recipe route when opening the modal overlay', () => {
    const next = resolveHashRouterState(
      {
        view: 'recipe',
        activeRecipeId: 'timeline',
        overlay: 'none',
      },
      '#modal',
    );

    expect(next).toEqual({
      view: 'recipe',
      activeRecipeId: 'timeline',
      overlay: 'modal',
    });
  });

  it('keeps the previous studio route when opening the editor overlay', () => {
    const next = resolveHashRouterState(
      {
        view: 'studio',
        activeRecipeId: null,
        overlay: 'none',
      },
      '#editor',
    );

    expect(next).toEqual({
      view: 'studio',
      activeRecipeId: null,
      overlay: 'editor',
    });
  });

  it('falls back to studio for unknown hashes', () => {
    const next = resolveHashRouterState(studioRoute, '#totally-unknown');

    expect(next).toEqual({
      view: 'studio',
      activeRecipeId: null,
      overlay: 'none',
    });
  });
});
