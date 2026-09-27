import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchImageBlob, generateSmartFilename } from './fileUtils';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchImageBlob', () => {
  it('returns successful image bodies', async () => {
    const blob = new Blob(['image'], { type: 'image/png' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(blob, { status: 200 })));

    const result = await fetchImageBlob('/image.png');
    expect(result.type).toBe('image/png');
    expect(
      generateSmartFilename('alpha', 'one', 'gpt-image-2', '1:1', undefined, result.type),
    ).toMatch(/\.png$/);
    expect(
      generateSmartFilename('alpha', 'two', 'gpt-image-2', '1:1', undefined, 'image/webp'),
    ).toMatch(/\.webp$/);
  });

  it('rejects HTTP error bodies instead of adding them to an archive', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('missing', { status: 404 })));

    await expect(fetchImageBlob('/missing.png')).rejects.toThrow(
      'Image request failed with HTTP 404.',
    );
  });
});
