import { beforeAll, describe, expect, it } from 'vitest';
import { STYLE_RUNTIME_PACK_SUMMARIES } from '../components/recipes/stylesData';
import { registerInstalledStylePacks } from '../lib/installedStylePacks';
import type { ExtensionManifest } from '../packages/shared/src/extensions';

function installed(packId: string): ExtensionManifest {
  return {
    schemaVersion: 1,
    id: `cozy.${packId.replace('_', '-')}`,
    kind: 'style-pack',
    version: '1.0.0',
    studio: '>=0.1.0',
    title: packId,
    files: {
      pack: 'pack.json',
      runtime: 'runtime.json',
      search: 'search.json',
      thumbnails: 'thumbnails.json',
    },
    stylePack: { id: packId, name: packId, description: packId, presetCount: 1 },
    assets: [],
  };
}

beforeAll(() => registerInstalledStylePacks([installed('pack_02'), installed('pack_01')]));
import {
  chunkStyleRuntimePackIds,
  resolveRequiredStyleRuntimePackIds,
} from './useStyleRuntimePacks';

describe('resolveRequiredStyleRuntimePackIds', () => {
  it('deduplicates focused packs and rejects non-runtime tabs', () => {
    expect(
      resolveRequiredStyleRuntimePackIds({
        requiredPackIds: ['pack_01', 'favorites', 'pack_01', 'pack_02'],
        loadAll: false,
      }),
    ).toEqual(['pack_01', 'pack_02']);
    expect(STYLE_RUNTIME_PACK_SUMMARIES.map((pack) => pack.id)).toEqual(['pack_01', 'pack_02']);
  });

  it('returns the canonical summary order for all-pack views', () => {
    expect(resolveRequiredStyleRuntimePackIds({ requiredPackIds: [], loadAll: true })).toEqual(
      STYLE_RUNTIME_PACK_SUMMARIES.map((pack) => pack.id),
    );
  });

  it('loads global browse packs in small batches', () => {
    expect(chunkStyleRuntimePackIds(['pack_01', 'pack_02', 'pack_03', 'pack_04'], 2)).toEqual([
      ['pack_01', 'pack_02'],
      ['pack_03', 'pack_04'],
    ]);
  });
});
