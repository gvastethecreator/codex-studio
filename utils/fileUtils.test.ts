import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { GeneratedImageWithConfig } from '../types';
import { downloadMultipleImagesAsZip, fetchImageBlob, generateSmartFilename } from './fileUtils';

const archive = vi.hoisted(() => ({
  file: vi.fn(),
  generateAsync: vi.fn().mockResolvedValue('archive'),
  saveAs: vi.fn(),
}));
vi.mock('jszip', () => ({
  default: class {
    file = archive.file;
    generateAsync = archive.generateAsync;
  },
}));
vi.mock('file-saver', () => ({ saveAs: archive.saveAs }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('download filenames', () => {
  it('preserves saved Windows and POSIX basenames with safe names and the image extension', () => {
    const filename = (localPath: string, mimeType?: string) =>
      generateSmartFilename('alpha', 'one', 'gpt-image-2', '1:1', undefined, mimeType, localPath);
    expect(filename('B:\\#OUTPUTS\\CozyStudio\\2026-10-03_000009_owl.png', 'image/png')).toBe(
      '2026-10-03_000009_owl.png',
    );
    expect(filename('/home/user/Pictures/2026-10-03_000010_owl.jpeg', 'image/jpeg')).toBe(
      '2026-10-03_000010_owl.jpeg',
    );
    expect(filename('/home/user/Pictures/image.jpeg')).toBe('image.jpeg');
    expect(filename('/home/user/Pictures/CON:owl?.png', 'image/webp')).toBe('CON-owl-.webp');
    expect(filename('/home/user/Pictures/CON.png', 'image/png')).toBe('_CON.png');
    expect(filename('/home/user/Pictures/CON', 'image/png')).toBe('_CON.png');
    expect(generateSmartFilename('alpha', 'one', 'model', '1:1', 2, 'image/png')).toBe(
      '002-alpha-model-1-1.png',
    );
  });

  it('keeps ZIP names unique in selection order when fetches complete out of order', async () => {
    const paths = ['/first/shot.png', '/second/SHOT.png', '/third/SHOT-000002.png'];
    const images: GeneratedImageWithConfig[] = paths.map((localPath, index) => ({
      id: String(index),
      src: `/image-${index}`,
      localPath,
      batchId: 'download-batch',
      createdAt: 0,
      config: { ...DEFAULT_GENERATION_CONFIG, prompt: 'alpha' },
    }));
    let resolveFirst!: (value: Response) => void;
    const first = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });
    const fetch = vi.fn((src: string) =>
      src === '/image-0'
        ? first
        : Promise.resolve(new Response(new Blob([src], { type: 'image/png' }))),
    );
    vi.stubGlobal('fetch', fetch);

    const download = downloadMultipleImagesAsZip(images, 'selection.zip');
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    resolveFirst(new Response(new Blob(['first'], { type: 'image/png' })));
    await download;

    expect(archive.file.mock.calls.map(([name]) => name)).toEqual([
      'shot.png',
      'SHOT-000003.png',
      'SHOT-000002.png',
    ]);
    expect(archive.file.mock.calls.map(([, blob]) => blob.type)).toEqual([
      'image/png',
      'image/png',
      'image/png',
    ]);
    expect(archive.saveAs).toHaveBeenCalledWith('archive', 'selection.zip');
  });
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
