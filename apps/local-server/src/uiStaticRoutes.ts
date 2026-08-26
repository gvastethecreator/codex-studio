import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Handler } from 'hono';

export function resolveUiDistDir(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
) {
  const fromEnv = env.STUDIO_UI_DIST?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.resolve(cwd, 'dist');
}

export function uiDistIsReady(
  rootDir: string,
  fileExists: (filePath: string) => boolean = existsSync,
) {
  return fileExists(path.join(rootDir, 'index.html'));
}

export function isReservedStudioAppPath(pathname: string) {
  return (
    pathname === '/api' ||
    pathname.startsWith('/api/') ||
    pathname === '/library' ||
    pathname.startsWith('/library/')
  );
}

function isInsideRoot(rootDir: string, candidate: string) {
  const resolvedRoot = path.resolve(rootDir);
  const resolvedCandidate = path.resolve(candidate);
  return (
    resolvedCandidate === resolvedRoot || resolvedCandidate.startsWith(`${resolvedRoot}${path.sep}`)
  );
}

function contentTypeFor(filePath: string) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
    case '.mjs':
      return 'text/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.ico':
      return 'image/x-icon';
    case '.woff2':
      return 'font/woff2';
    default:
      return 'application/octet-stream';
  }
}

function defaultCreateFileResponse(filePath: string) {
  if (typeof globalThis.Bun !== 'undefined') {
    return new Response(globalThis.Bun.file(filePath));
  }
  return new Response(readFileSync(filePath), {
    headers: { 'Content-Type': contentTypeFor(filePath) },
  });
}

export function createUiStaticHandler(options: {
  rootDir: string;
  fileExists?: (filePath: string) => boolean;
  createFileResponse?: (filePath: string) => Response;
}): Handler {
  const fileExists = options.fileExists ?? existsSync;
  const createFileResponse = options.createFileResponse ?? defaultCreateFileResponse;
  const rootDir = path.resolve(options.rootDir);
  const indexPath = path.join(rootDir, 'index.html');

  return (c) => {
    const pathname = new URL(c.req.url).pathname;
    if (isReservedStudioAppPath(pathname)) return c.notFound();
    if (!fileExists(indexPath)) return c.notFound();

    let relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    try {
      relative = decodeURIComponent(relative);
    } catch {
      return c.notFound();
    }

    const candidate = path.resolve(rootDir, relative);
    if (!isInsideRoot(rootDir, candidate)) return c.notFound();

    if (fileExists(candidate)) {
      return createFileResponse(candidate);
    }

    if (path.extname(relative)) return c.notFound();
    return createFileResponse(indexPath);
  };
}
