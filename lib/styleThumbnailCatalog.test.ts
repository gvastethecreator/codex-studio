import { describe, expect, it } from 'vitest';

import {
  loadStyleThumbnailPack,
  resolveStyleDefaultImageVariantThumbnails,
  STYLE_CARD_THUMBNAILS,
} from './styleThumbnailCatalog';

describe('styleThumbnailCatalog', () => {
  it('loads default-image fallbacks into the owning pack projection', async () => {
    const pack05 = await loadStyleThumbnailPack('pack_05');
    const pack13 = await loadStyleThumbnailPack('pack_13');
    const pack16 = await loadStyleThumbnailPack('pack_16');

    expect(pack05['SP05-034']).toBeTruthy();
    expect(pack05['SP05-001']).toBeUndefined();
    expect(pack13['SP13-001']).toBeTruthy();
    expect(pack13['SP05-013']).toBeTruthy();
    expect(pack13['SP13-026']).toBeUndefined();
    expect(pack16['SP05-001']).toBeTruthy();
    expect(pack16['SP13-026']).toBeTruthy();
    expect(pack16['pack_16__70s_and_80s_retro_anime']).toBeTruthy();
  });

  it('appends a labeled Grok provider variant without occupying a numeric slot', () => {
    STYLE_CARD_THUMBNAILS['SP99-001-01'] = '/thumbs/SP99-001-01.webp';
    STYLE_CARD_THUMBNAILS['SP99-001-grok'] = '/thumbs/SP99-001-grok.webp';

    expect(resolveStyleDefaultImageVariantThumbnails('SP99-001')).toEqual([
      { src: '/thumbs/SP99-001-01.webp', label: 'Variant 1' },
      { src: '/thumbs/SP99-001-grok.webp', label: 'Grok' },
    ]);

    delete STYLE_CARD_THUMBNAILS['SP99-001-01'];
    delete STYLE_CARD_THUMBNAILS['SP99-001-grok'];
  });
});
