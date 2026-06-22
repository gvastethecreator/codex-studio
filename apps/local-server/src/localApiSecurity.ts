import type { MiddlewareHandler } from 'hono';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:17222',
  'http://127.0.0.1:17222',
  'http://[::1]:17222',
  'http://localhost:17223',
  'http://127.0.0.1:17223',
  'http://[::1]:17223',
];

const CORS_METHODS = 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS';
const CORS_HEADERS = 'Content-Type, Authorization, X-Requested-With';

export interface LocalApiSecurityOptions {
  allowedOrigins?: Iterable<string>;
}

function normalizeOrigin(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

function readEnvAllowedOrigins() {
  const raw = process.env.STUDIO_ALLOWED_ORIGINS;
  if (!raw) return [];
  return raw.split(/[;,]/).flatMap((origin) => {
    const trimmed = origin.trim();
    return trimmed ? [trimmed] : [];
  });
}

function createAllowedOriginSet(extraOrigins: Iterable<string> = []) {
  const origins = new Set<string>();
  for (const origin of [...DEFAULT_ALLOWED_ORIGINS, ...readEnvAllowedOrigins(), ...extraOrigins]) {
    const normalized = normalizeOrigin(origin);
    if (normalized) origins.add(normalized);
  }
  return origins;
}

function applyCorsHeaders(headers: Headers, origin: string) {
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', CORS_METHODS);
  headers.set('Access-Control-Allow-Headers', CORS_HEADERS);
  headers.set('Vary', 'Origin');
}

function isAllowedLocalApiOrigin(
  origin: string | undefined,
  allowedOrigins: Iterable<string> = DEFAULT_ALLOWED_ORIGINS,
) {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  return createAllowedOriginSet(allowedOrigins).has(normalized);
}

export function createLocalApiSecurityMiddleware(
  options: LocalApiSecurityOptions = {},
): MiddlewareHandler {
  const allowedOrigins = createAllowedOriginSet(options.allowedOrigins);

  return async (c, next) => {
    const origin = c.req.header('Origin');
    const normalizedOrigin = origin ? normalizeOrigin(origin) : null;

    if (origin && (!normalizedOrigin || !allowedOrigins.has(normalizedOrigin))) {
      return c.json(
        {
          error: 'Forbidden origin',
          code: 'forbidden_origin',
        },
        403,
      );
    }

    if (c.req.method === 'OPTIONS') {
      const headers = new Headers();
      if (normalizedOrigin) applyCorsHeaders(headers, normalizedOrigin);
      headers.set('Access-Control-Max-Age', '600');
      return new Response(null, { status: 204, headers });
    }

    await next();

    if (normalizedOrigin) {
      applyCorsHeaders(c.res.headers, normalizedOrigin);
    }
  };
}
