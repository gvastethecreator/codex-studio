import { describe, expect, it } from 'vite-plus/test';
import { STYLE_RUNTIME_PACK_SUMMARIES } from '../components/recipes/stylesData';
import { resolveRequiredStyleRuntimePackIds } from './useStyleRuntimePacks';

describe('resolveRequiredStyleRuntimePackIds', () => {
  it('deduplicates focused packs and rejects non-runtime tabs', () => {
    expect(
      resolveRequiredStyleRuntimePackIds({
        requiredPackIds: ['pack_01', 'favorites', 'pack_01', 'pack_02'],
        loadAll: false,
      }),
    ).toEqual(['pack_01', 'pack_02']);
  });

  it('returns the canonical summary order for all-pack views', () => {
    expect(resolveRequiredStyleRuntimePackIds({ requiredPackIds: [], loadAll: true })).toEqual(
      STYLE_RUNTIME_PACK_SUMMARIES.map((pack) => pack.id),
    );
  });
});
