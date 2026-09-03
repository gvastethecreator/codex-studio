import { GOOGLE_OAUTH_AUTHORIZE_URL, GOOGLE_OAUTH_TOKEN_URL } from './constants';

export interface GoogleOAuthClientCredentials {
  clientId: string;
  clientSecret: string | null;
}

export interface GoogleOAuthConfig extends GoogleOAuthClientCredentials {
  cloudProjectId: string;
  authorizeUrl: string;
  tokenUrl: string;
}

function boundedConfigValue(value: string | undefined, field: string, maximum = 4096) {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || trimmed.length > maximum || /[\u0000-\u001f\u007f\s]/.test(trimmed)) {
    throw new Error(`Google OAuth requires a valid ${field}.`);
  }
  return trimmed;
}

function isLoopbackHost(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  return normalized === '127.0.0.1' || normalized === 'localhost' || normalized === '::1';
}

export function resolveGoogleOAuthEndpoint(value: string | undefined, fallback: string) {
  const raw = value?.trim() || fallback;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('Google OAuth endpoint configuration is invalid.');
  }
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLoopbackHost(url.hostname)))
  ) {
    throw new Error('Google OAuth endpoint must use HTTPS or a credential-free loopback URL.');
  }
  return url.href.replace(/\/$/, '');
}

export function readGoogleOAuthClientCredentials(
  env: Record<string, string | undefined> = process.env,
): GoogleOAuthClientCredentials {
  return {
    clientId: boundedConfigValue(env.GOOGLE_OAUTH_CLIENT_ID, 'GOOGLE_OAUTH_CLIENT_ID'),
    clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET?.trim()
      ? boundedConfigValue(env.GOOGLE_OAUTH_CLIENT_SECRET, 'GOOGLE_OAUTH_CLIENT_SECRET', 64 * 1024)
      : null,
  };
}

export function readGoogleOAuthConfig(
  env: Record<string, string | undefined> = process.env,
): GoogleOAuthConfig {
  return {
    ...readGoogleOAuthClientCredentials(env),
    cloudProjectId: boundedConfigValue(env.GOOGLE_CLOUD_PROJECT_ID, 'GOOGLE_CLOUD_PROJECT_ID', 256),
    authorizeUrl: resolveGoogleOAuthEndpoint(
      env.GOOGLE_OAUTH_AUTHORIZE_URL,
      GOOGLE_OAUTH_AUTHORIZE_URL,
    ),
    tokenUrl: resolveGoogleOAuthEndpoint(env.GOOGLE_OAUTH_TOKEN_URL, GOOGLE_OAUTH_TOKEN_URL),
  };
}

export function isGoogleOAuthConfigured(env: Record<string, string | undefined> = process.env) {
  try {
    readGoogleOAuthConfig(env);
    return true;
  } catch {
    return false;
  }
}
