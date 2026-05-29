import { existsSync } from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';
import type { resolvePublicLibraryPath } from './library';
import {
  buildLibraryAssetHeaders,
  ensureThumbnailVariant,
  resolveAssetCacheSeconds,
  resolveThumbnailMaxEdge,
} from './libraryAssetVariants';
import type { log } from './logger';

interface LibraryRoutesDependencies {
  resolvePublicLibraryPath: typeof resolvePublicLibraryPath;
  ensureThumbnailVariant: typeof ensureThumbnailVariant;
  buildLibraryAssetHeaders: typeof buildLibraryAssetHeaders;
  resolveAssetCacheSeconds: typeof resolveAssetCacheSeconds;
  resolveThumbnailMaxEdge: typeof resolveThumbnailMaxEdge;
  fileExists?: (filePath: string) => boolean;
  createFileResponse?: (filePath: string) => Response;
  logger?: typeof log;
}

export function createLibraryRoutes({
  resolvePublicLibraryPath,
  ensureThumbnailVariant,
  buildLibraryAssetHeaders,
  resolveAssetCacheSeconds,
  resolveThumbnailMaxEdge,
  fileExists = existsSync,
  createFileResponse = (filePath: string) => new Response(Bun.file(filePath)),
  logger,
}: LibraryRoutesDependencies) {
  const routes = new Hono();

  routes.get('/library/*', async (c) => {
    const encoded = c.req.path.replace('/library/', '');
    const relative = decodeURIComponent(encoded);
    if (relative.includes('..')) return c.notFound();
    const filePath = resolvePublicLibraryPath(relative);
    if (!fileExists(filePath)) return c.notFound();

    const url = new URL(c.req.url);
    const variant = url.searchParams.get('variant');
    let servedPath = filePath;

    if (variant === 'thumb') {
      try {
        servedPath = await ensureThumbnailVariant(filePath, {
          maxEdge: resolveThumbnailMaxEdge(url.searchParams.get('max')),
        });
      } catch (error) {
        logger?.(
          'warn',
          'library',
          `Thumbnail generation failed for ${path.basename(filePath)}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    const fileResponse = createFileResponse(servedPath);
    const headers = buildLibraryAssetHeaders(servedPath, {
      cacheSeconds: resolveAssetCacheSeconds(variant),
    });

    return new Response(fileResponse.body, {
      status: fileResponse.status,
      statusText: fileResponse.statusText,
      headers,
    });
  });

  return routes;
}
