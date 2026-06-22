import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { getSettings } from './config';

const DEFAULT_THUMBNAIL_MAX_EDGE = 512;
const MIN_THUMBNAIL_MAX_EDGE = 48;
const MAX_THUMBNAIL_MAX_EDGE = 1024;
const DEFAULT_ASSET_CACHE_SECONDS = 60 * 60;
const DEFAULT_THUMBNAIL_CACHE_SECONDS = 24 * 60 * 60;

const thumbnailGenerationByPath = new Map<string, Promise<string>>();

function normalizeRelativePath(relativePath: string) {
  return relativePath.replaceAll('\\', '/').replace(/^\/+/, '');
}

function toPathSegments(relativePath: string) {
  return normalizeRelativePath(relativePath)
    .split('/')
    .flatMap((segment) => {
      const trimmed = segment.trim();
      return trimmed ? [trimmed] : [];
    });
}

function resolveThumbnailParentSegments(relativePath: string) {
  if (relativePath.startsWith('outputs/.trash/assets/')) {
    return {
      parentSegments: ['outputs', '.trash', 'thumbnails'],
      nestedRelativePath: relativePath.slice('outputs/.trash/assets/'.length),
    };
  }

  if (relativePath.startsWith('outputs/')) {
    return {
      parentSegments: ['outputs', 'thumbnails'],
      nestedRelativePath: relativePath.slice('outputs/'.length),
    };
  }

  return {
    parentSegments: ['outputs', 'thumbnails', 'library'],
    nestedRelativePath: relativePath,
  };
}

export function resolveThumbnailMaxEdge(rawValue?: number | string | null) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_THUMBNAIL_MAX_EDGE;
  }

  return Math.max(MIN_THUMBNAIL_MAX_EDGE, Math.min(MAX_THUMBNAIL_MAX_EDGE, Math.round(parsed)));
}

function isThumbnailAssetPath(filePath: string, libraryDir: string = getSettings().libraryDir) {
  const relativePath = normalizeRelativePath(path.relative(libraryDir, filePath));
  return (
    relativePath.startsWith('outputs/thumbnails/') ||
    relativePath.startsWith('outputs/.trash/thumbnails/')
  );
}

export function resolveLibraryThumbnailPath(
  sourceFilePath: string,
  options: { libraryDir?: string; maxEdge?: number | string | null } = {},
) {
  const libraryDir = options.libraryDir ?? getSettings().libraryDir;
  const relativePath = normalizeRelativePath(path.relative(libraryDir, sourceFilePath));
  const maxEdge = resolveThumbnailMaxEdge(options.maxEdge);
  const stat = statSync(sourceFilePath);
  const cacheKey = createHash('sha1')
    .update(`${relativePath}:${stat.size}:${Math.floor(stat.mtimeMs)}:${maxEdge}`)
    .digest('hex')
    .slice(0, 12);

  const { parentSegments, nestedRelativePath } = resolveThumbnailParentSegments(relativePath);
  const nestedSegments = toPathSegments(path.dirname(nestedRelativePath));
  const nestedPathParts = path.parse(nestedRelativePath);

  return path.join(
    libraryDir,
    ...parentSegments,
    ...nestedSegments,
    `${nestedPathParts.name}.${cacheKey}.${maxEdge}.webp`,
  );
}

export async function ensureThumbnailVariant(
  sourceFilePath: string,
  options: { libraryDir?: string; maxEdge?: number | string | null } = {},
) {
  const libraryDir = options.libraryDir ?? getSettings().libraryDir;
  const maxEdge = resolveThumbnailMaxEdge(options.maxEdge);

  if (isThumbnailAssetPath(sourceFilePath, libraryDir)) {
    return sourceFilePath;
  }

  const thumbnailPath = resolveLibraryThumbnailPath(sourceFilePath, {
    libraryDir,
    maxEdge,
  });

  if (existsSync(thumbnailPath)) {
    return thumbnailPath;
  }

  const pendingGeneration = thumbnailGenerationByPath.get(thumbnailPath);
  if (pendingGeneration) {
    return pendingGeneration;
  }

  const generation = (async () => {
    mkdirSync(path.dirname(thumbnailPath), { recursive: true });

    await sharp(sourceFilePath)
      .rotate()
      .resize({
        width: maxEdge,
        height: maxEdge,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  })();

  thumbnailGenerationByPath.set(thumbnailPath, generation);

  try {
    return await generation;
  } finally {
    thumbnailGenerationByPath.delete(thumbnailPath);
  }
}

function resolveLibraryAssetContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.svg':
      return 'image/svg+xml; charset=utf-8';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.avif':
      return 'image/avif';
    default:
      return 'application/octet-stream';
  }
}

export function buildLibraryAssetHeaders(
  filePath: string,
  options: { cacheSeconds?: number } = {},
) {
  const stats = statSync(filePath);
  const cacheSeconds = options.cacheSeconds ?? DEFAULT_ASSET_CACHE_SECONDS;

  return {
    'Content-Type': resolveLibraryAssetContentType(filePath),
    'Cache-Control': `private, max-age=${cacheSeconds}, stale-while-revalidate=86400`,
    'Content-Length': String(stats.size),
    'Last-Modified': stats.mtime.toUTCString(),
    ETag: `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`,
  };
}

export function resolveAssetCacheSeconds(variant?: string | null) {
  return variant === 'thumb' ? DEFAULT_THUMBNAIL_CACHE_SECONDS : DEFAULT_ASSET_CACHE_SECONDS;
}
