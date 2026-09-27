import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getStyleCategoryImage,
  getStyleThumbnail,
  loadStyleThumbnailPack,
  resolveStyleDefaultImageVariantThumbnails,
  subscribeStyleThumbnailCatalog,
} from './styleThumbnailCatalog';
import { registerInstalledStylePacks } from './installedStylePacks';
import type { ExtensionManifest } from '../packages/shared/src/extensions';

const pack16: ExtensionManifest = {
  schemaVersion: 1,
  id: 'cozy.pack-16',
  kind: 'style-pack',
  version: '1.0.0',
  studio: '>=0.1.0',
  title: 'Anime Eras',
  files: {
    pack: 'pack.json',
    runtime: 'runtime.json',
    search: 'search.json',
    thumbnails: 'thumbnails.json',
  },
  stylePack: { id: 'pack_16', name: 'Anime Eras', description: 'Anime.', presetCount: 2 },
  assets: [],
};

afterEach(() => vi.unstubAllGlobals());

describe('styleThumbnailCatalog', () => {
  it('loads an installed pack once and serves its thumbnails from the extension', async () => {
    registerInstalledStylePacks([pack16]);
    const fetchMock = vi.fn(async (_input: string, _init?: RequestInit) =>
      Response.json({
        'SP05-001': 'thumbnails/SP05-001.webp',
        pack_16__70s_and_80s_retro_anime: 'thumbnails/pack_16__70s_and_80s_retro_anime.webp',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    let notified = 0;
    const unsubscribe = subscribeStyleThumbnailCatalog(() => {
      notified += 1;
    });

    const [first, second] = await Promise.all([
      loadStyleThumbnailPack('pack_16'),
      loadStyleThumbnailPack('pack_16'),
    ]);
    unsubscribe();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      '/api/extensions/cozy.pack-16/files/thumbnails.json',
    );
    expect(first).toBe(second);
    expect(getStyleThumbnail('SP05-001')).toMatch(
      /\/api\/extensions\/cozy\.pack-16\/files\/thumbnails\/SP05-001\.webp$/,
    );
    expect(getStyleCategoryImage('pack_16__70s_and_80s_retro_anime')).toBeTruthy();
    expect(notified).toBe(1);
  });

  it('returns nothing for a pack that is not installed', async () => {
    registerInstalledStylePacks([]);
    await expect(loadStyleThumbnailPack('pack_99')).resolves.toEqual({});
  });

  it('places the previous default after the other image variants', () => {
    const catalog: Record<string, string> = {
      'SP99-001-01': '/thumbs/SP99-001-01.webp',
      'SP99-001-03': '/thumbs/SP99-001-03.webp',
      'SP99-001-grok': '/thumbs/SP99-001-grok.webp',
      'SP99-001-previous': '/thumbs/SP99-001-previous.webp',
    };

    expect(resolveStyleDefaultImageVariantThumbnails('SP99-001', (key) => catalog[key])).toEqual([
      { src: '/thumbs/SP99-001-01.webp', label: 'Variant 1' },
      { src: '/thumbs/SP99-001-03.webp', label: 'Variant 3' },
      { src: '/thumbs/SP99-001-grok.webp', label: 'Grok' },
      { src: '/thumbs/SP99-001-previous.webp', label: 'Previous GPT Image' },
    ]);
  });
});
