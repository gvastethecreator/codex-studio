import { describe, expect, it } from 'vite-plus/test';

import {
  getStudioViewportTransitionClassName,
  isRecipesViewVisible,
  resolveStudioViewportRouteKey,
} from './studioViewportRouting';

describe('StudioViewport routing', () => {
  it('maps views to route keys for viewport transitions', () => {
    expect(resolveStudioViewportRouteKey('studio', null)).toBe('studio');
    expect(resolveStudioViewportRouteKey('recipes', null)).toBe('recipes-list');
    expect(resolveStudioViewportRouteKey('recipe', 'character')).toBe('recipe-character');
    expect(resolveStudioViewportRouteKey('recipe', 'camera')).toBe('recipe-camera');
    expect(resolveStudioViewportRouteKey('recipe', null)).toBe('recipes-list');
  });

  it('shows RecipesView for recipes and default routes', () => {
    expect(isRecipesViewVisible('recipes')).toBe(true);
    expect(isRecipesViewVisible('studio')).toBe(false);
    expect(isRecipesViewVisible('recipe')).toBe(false);
  });

  it('keeps viewport transitions compositor-friendly', () => {
    expect(getStudioViewportTransitionClassName(1)).not.toMatch(/filter|blur/);
    expect(getStudioViewportTransitionClassName(-1)).not.toMatch(/filter|blur/);
    expect(getStudioViewportTransitionClassName(0)).not.toMatch(/filter|blur/);
  });
});
