import { describe, expect, it } from 'vitest';

import {
  getStyleThumbnail,
  loadStyleThumbnailPack,
  resolveStyleDefaultImageVariantThumbnails,
  subscribeStyleThumbnailCatalog,
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
    expect(getStyleThumbnail('SP05-001')).toBe(pack16['SP05-001']);
  });

  it('notifies subscribers after a pack load', async () => {
    let notified = 0;
    const unsubscribe = subscribeStyleThumbnailCatalog(() => {
      notified += 1;
    });

    await loadStyleThumbnailPack('pack_16');
    unsubscribe();

    expect(notified).toBeGreaterThan(0);
    expect(getStyleThumbnail('SP05-001')).toBeTruthy();
  });

  it('appends a labeled Grok provider variant without occupying a numeric slot', () => {
    const catalog: Record<string, string> = {
      'SP99-001-01': '/thumbs/SP99-001-01.webp',
      'SP99-001-grok': '/thumbs/SP99-001-grok.webp',
    };

    expect(resolveStyleDefaultImageVariantThumbnails('SP99-001', (key) => catalog[key])).toEqual([
      { src: '/thumbs/SP99-001-01.webp', label: 'Variant 1' },
      { src: '/thumbs/SP99-001-grok.webp', label: 'Grok' },
    ]);
  });
});
