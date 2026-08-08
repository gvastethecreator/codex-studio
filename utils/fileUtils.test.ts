import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { fetchImageBlob } from './fileUtils';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchImageBlob', () => {
  it('returns successful image bodies', async () => {
    const blob = new Blob(['image'], { type: 'image/png' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(blob, { status: 200 })));

    await expect(fetchImageBlob('/image.png')).resolves.toBeInstanceOf(Blob);
  });

  it('rejects HTTP error bodies instead of adding them to an archive', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('missing', { status: 404 })));

    await expect(fetchImageBlob('/missing.png')).rejects.toThrow(
      'Image request failed with HTTP 404.',
    );
  });
});
