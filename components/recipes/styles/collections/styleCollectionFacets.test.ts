import { describe, expect, it } from 'vite-plus/test';

import { STYLE_COLLECTIONS_BY_ID } from './styleCollectionDefinitions';
import {
  collectStyleCollectionFacetValues,
  styleCollectionMatchesFacetFilters,
} from './styleCollectionFacets';

describe('style collection facets', () => {
  it('matches collection-level workflow filters', () => {
    const cinema = STYLE_COLLECTIONS_BY_ID.get('cinema_film_genres')!;

    expect(styleCollectionMatchesFacetFilters(cinema, { workflow: ['image'] })).toBe(true);
    expect(styleCollectionMatchesFacetFilters(cinema, { workflow: ['video'] })).toBe(false);
  });

  it('includes entry-level lighting overrides in aggregate facets', () => {
    const lighting = STYLE_COLLECTIONS_BY_ID.get('lighting_optics_atmosphere')!;
    const facets = collectStyleCollectionFacetValues(lighting);

    expect(facets.domain).toEqual(expect.arrayContaining(['broadcast', 'cinema']));
    expect(facets.medium).toEqual(expect.arrayContaining(['3d', 'cgi', 'photography']));
    expect(facets.technique).toEqual(expect.arrayContaining(['atmosphere', 'lighting', 'optics']));
    expect(styleCollectionMatchesFacetFilters(lighting, { technique: ['atmosphere'] })).toBe(true);
  });

  it('includes entry-level cartoon overrides for domain filtering', () => {
    const cartoons = STYLE_COLLECTIONS_BY_ID.get('animation_cartoons')!;

    expect(styleCollectionMatchesFacetFilters(cartoons, { domain: ['caricature'] })).toBe(true);
    expect(styleCollectionMatchesFacetFilters(cartoons, { medium: ['cartoon'] })).toBe(true);
    expect(styleCollectionMatchesFacetFilters(cartoons, { technique: ['watercolor'] })).toBe(false);
  });
});
