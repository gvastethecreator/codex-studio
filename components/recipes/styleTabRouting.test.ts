import { describe, expect, it } from 'vitest';

import {
  getStyleCollectionIdFromTabId,
  getStyleCollectionTabId,
  getStyleTabHash,
  normalizeStyleTabId,
  readStyleTabIdFromHash,
  STYLE_PACKS_TAB_ID,
  STYLE_RECIPE_HASH_PREFIX,
  type StyleTabRouteOptions,
} from './styleTabRouting';

const routeOptions = {
  favoritesPackId: 'favorites',
  runtimePackIds: ['pack_01', 'pack_04'],
  specialTabIds: ['all_categories', 'all_cards'],
  userStylePackId: 'user_styles',
} satisfies StyleTabRouteOptions;

describe('styleTabRouting', () => {
  it('normalizes landing and unknown routes to the packs landing', () => {
    expect(normalizeStyleTabId(null, routeOptions)).toBe(STYLE_PACKS_TAB_ID);
    expect(normalizeStyleTabId('', routeOptions)).toBe(STYLE_PACKS_TAB_ID);
    expect(normalizeStyleTabId('landing', routeOptions)).toBe(STYLE_PACKS_TAB_ID);
    expect(normalizeStyleTabId('missing_pack', routeOptions)).toBe(STYLE_PACKS_TAB_ID);
  });

  it('preserves source pack, personal, and favorites route ids', () => {
    expect(normalizeStyleTabId('pack_04', routeOptions)).toBe('pack_04');
    expect(normalizeStyleTabId('user_styles', routeOptions)).toBe('user_styles');
    expect(normalizeStyleTabId('favorites', routeOptions)).toBe('favorites');
  });

  it('preserves special style browser route ids', () => {
    expect(normalizeStyleTabId('all_categories', routeOptions)).toBe('all_categories');
    expect(normalizeStyleTabId('all_cards', routeOptions)).toBe('all_cards');
    expect(getStyleTabHash('all_cards', routeOptions)).toBe('recipe-styles/all_cards');
  });

  it('preserves collection route ids without requiring source pack membership', () => {
    expect(getStyleCollectionTabId('analog_film_process')).toBe('collection/analog_film_process');
    expect(getStyleCollectionIdFromTabId('collection/analog_film_process')).toBe(
      'analog_film_process',
    );
    expect(normalizeStyleTabId('collection/analog_film_process', routeOptions)).toBe(
      'collection/analog_film_process',
    );
  });

  it('reads style route hashes and strips trailing slash/query fragments', () => {
    expect(readStyleTabIdFromHash('#recipe-styles/pack_04?x=1', routeOptions)).toBe('pack_04');
    expect(
      readStyleTabIdFromHash('#recipe-styles/collection/analog_film_process/', routeOptions),
    ).toBe('collection/analog_film_process');
    expect(readStyleTabIdFromHash('#other/pack_04', routeOptions)).toBeNull();
  });

  it('writes normalized route hashes', () => {
    expect(getStyleTabHash('pack_04', routeOptions)).toBe('recipe-styles/pack_04');
    expect(getStyleTabHash('collection/analog_film_process', routeOptions)).toBe(
      'recipe-styles/collection/analog_film_process',
    );
    expect(getStyleTabHash('unknown', routeOptions)).toBe(
      `${STYLE_RECIPE_HASH_PREFIX}/${STYLE_PACKS_TAB_ID}`,
    );
  });
});
