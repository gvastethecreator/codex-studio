import { describe, expect, it, vi } from 'vite-plus/test';
import { createLibraryRoutes } from './libraryRoutes';

describe('libraryRoutes', () => {
  function createTestHeaders(contentType: string) {
    return {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=60',
      'Content-Length': '2',
      'Last-Modified': 'Wed, 29 May 2026 00:00:00 GMT',
      ETag: 'W/"2-1"',
    };
  }

  it('returns 404 for traversal attempts', async () => {
    const routes = createLibraryRoutes({
      resolvePublicLibraryPath: (relative) => `D:/library/${relative}`,
      ensureThumbnailVariant: vi.fn(async (filePath) => filePath),
      buildLibraryAssetHeaders: () => createTestHeaders('image/png'),
      resolveAssetCacheSeconds: () => 60,
      resolveThumbnailMaxEdge: () => 512,
      fileExists: () => true,
      createFileResponse: () => new Response('ok'),
    });

    const response = await routes.request('/library/../secret.png');
    expect(response.status).toBe(404);
  });

  it('returns 404 when file does not exist', async () => {
    const routes = createLibraryRoutes({
      resolvePublicLibraryPath: () => 'D:/library/outputs/missing.png',
      ensureThumbnailVariant: vi.fn(async (filePath) => filePath),
      buildLibraryAssetHeaders: () => createTestHeaders('image/png'),
      resolveAssetCacheSeconds: () => 60,
      resolveThumbnailMaxEdge: () => 512,
      fileExists: () => false,
      createFileResponse: () => new Response('ok'),
    });

    const response = await routes.request('/library/outputs/missing.png');
    expect(response.status).toBe(404);
  });

  it('serves thumbnail variant and applies cache headers', async () => {
    const ensureThumbnailVariant = vi.fn(
      async () => 'D:/library/outputs/thumbnails/img-thumb.webp',
    );
    const createFileResponse = vi.fn(() => new Response('thumbnail'));

    const routes = createLibraryRoutes({
      resolvePublicLibraryPath: () => 'D:/library/outputs/img.png',
      ensureThumbnailVariant,
      buildLibraryAssetHeaders: () => createTestHeaders('image/webp'),
      resolveAssetCacheSeconds: (variant) => (variant === 'thumb' ? 86400 : 3600),
      resolveThumbnailMaxEdge: () => 640,
      fileExists: () => true,
      createFileResponse,
    });

    const response = await routes.request(
      'http://local.test/library/outputs/img.png?variant=thumb&max=640',
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('thumbnail');
    expect(ensureThumbnailVariant).toHaveBeenCalledWith('D:/library/outputs/img.png', {
      maxEdge: 640,
    });
    expect(createFileResponse).toHaveBeenCalledWith('D:/library/outputs/thumbnails/img-thumb.webp');
    expect(response.headers.get('Content-Type')).toBe('image/webp');
  });
});
