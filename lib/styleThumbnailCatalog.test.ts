import { describe, expect, it } from 'vitest';

import { loadStyleThumbnailPack } from './styleThumbnailCatalog';

describe('styleThumbnailCatalog', () => {
  it('loads default-image fallbacks into the owning pack projection', async () => {
    const pack05 = await loadStyleThumbnailPack('pack_05');
    const pack13 = await loadStyleThumbnailPack('pack_13');

    expect(pack05['SP05-001']).toBeTruthy();
    expect(pack05['SP05-013']).toBeTruthy();
    expect(pack13['SP13-026']).toBeTruthy();
  });
});
