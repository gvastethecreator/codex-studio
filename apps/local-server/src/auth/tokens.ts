import type { SubscriptionProviderId } from '../../../../packages/shared/src';
import { SubscriptionHttpError } from '../providers/subscriptionHttpError';
import {
  CODEX_ACCESS_TOKEN_REFRESH_SKEW_MS,
  CODEX_OAUTH_CLIENT_ID,
  CODEX_OAUTH_TOKEN_URL,
  XAI_ACCESS_TOKEN_REFRESH_SKEW_MS,
  XAI_OAUTH_CLIENT_ID,
  XAI_OAUTH_TOKEN_URL,
  studioUserAgent,
} from './constants';
import { readChatgptAccountId, readJwtAccountLabel, readJwtExpiryMs } from './jwt';
import {
  type StoredSubscriptionTokens,
  type SubscriptionAuthStore,
  getSubscriptionAuthStore,
  isSubscriptionLoggedIn,
} from './store';

export type AuthFetch = typeof fetch;

export interface TokenRefreshDependencies {
  store?: SubscriptionAuthStore;
  fetch?: AuthFetch;
  now?: () => number;
  env?: Record<string, string | undefined>;
}

function formBody(fields: Record<string, string>) {
  return new URLSearchParams(fields).toString();
}

function expiryIso(accessToken: string, expiresIn: unknown, nowMs: number) {
  if (typeof expiresIn === 'number' && Number.isFinite(expiresIn) && expiresIn > 0) {
    return new Date(nowMs + expiresIn * 1000).toISOString();
  }
  const jwtExpiry = readJwtExpiryMs(accessToken);
  return jwtExpiry ? new Date(jwtExpiry).toISOString() : null;
}

function isExpired(record: StoredSubscriptionTokens, nowMs: number, skewMs: number) {
  if (!record.expiresAt) {
    const jwtExpiry = readJwtExpiryMs(record.accessToken);
    if (!jwtExpiry) return false;
    return jwtExpiry - skewMs <= nowMs;
  }
  const expiresAt = Date.parse(record.expiresAt);
  if (!Number.isFinite(expiresAt)) return false;
  return expiresAt - skewMs <= nowMs;
}

async function parseJson(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function oauthErrorCode(payload: Record<string, unknown>) {
  const error = payload.error;
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (error && typeof error === 'object') {
    const nested = error as Record<string, unknown>;
    const code = nested.code ?? nested.type;
    if (typeof code === 'string' && code.trim()) return code.trim();
  }
  return null;
}

function oauthErrorMessage(payload: Record<string, unknown>, fallback: string) {
  const description = payload.error_description;
  if (typeof description === 'string' && description.trim()) return description.trim();
  const error = payload.error;
  if (error && typeof error === 'object') {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === 'string' && message.trim()) return message.trim();
  }
  if (typeof error === 'string' && error.trim()) return error.trim();
  return fallback;
}

export function tokensFromOAuthPayload(
  payload: Record<string, unknown>,
  previous: Pick<StoredSubscriptionTokens, 'refreshToken' | 'accountLabel' | 'chatgptAccountId'>,
  nowMs: number,
): StoredSubscriptionTokens {
  const accessToken = typeof payload.access_token === 'string' ? payload.access_token.trim() : '';
  if (!accessToken) {
    throw new SubscriptionHttpError('Token response did not include an access token.', {
      code: 'invalid_grant',
      fallbackAllowed: false,
    });
  }
  const nextRefresh =
    typeof payload.refresh_token === 'string' && payload.refresh_token.trim()
      ? payload.refresh_token.trim()
      : previous.refreshToken;
  const idToken = typeof payload.id_token === 'string' ? payload.id_token : null;
  return {
    status: 'logged_in',
    accessToken,
    refreshToken: nextRefresh,
    expiresAt: expiryIso(accessToken, payload.expires_in, nowMs),
    accountLabel:
      readJwtAccountLabel(idToken) ?? readJwtAccountLabel(accessToken) ?? previous.accountLabel,
    chatgptAccountId: readChatgptAccountId(accessToken) ?? previous.chatgptAccountId,
    lastError: null,
    updatedAt: new Date(nowMs).toISOString(),
  };
}

async function refreshCodexToken(
  refreshToken: string,
  fetchImpl: AuthFetch,
): Promise<Record<string, unknown>> {
  const response = await fetchImpl(CODEX_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': studioUserAgent(),
    },
    body: formBody({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CODEX_OAUTH_CLIENT_ID,
    }),
  });
  const payload = await parseJson(response);
  if (response.status === 429) {
    throw new SubscriptionHttpError(
      'Codex token refresh is rate-limited. Credentials are still valid.',
      {
        code: 'http_error',
        fallbackAllowed: true,
        httpStatus: 429,
      },
    );
  }
  if (!response.ok) {
    const code = oauthErrorCode(payload);
    const relogin = code === 'invalid_grant' || code === 'invalid_token' || response.status === 401;
    throw new SubscriptionHttpError(oauthErrorMessage(payload, 'Codex token refresh failed.'), {
      code: relogin ? 'invalid_grant' : 'refresh_failed',
      fallbackAllowed: false,
      httpStatus: response.status,
    });
  }
  return payload;
}

async function refreshXaiToken(
  refreshToken: string,
  fetchImpl: AuthFetch,
): Promise<Record<string, unknown>> {
  const response = await fetchImpl(XAI_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({
      grant_type: 'refresh_token',
      client_id: XAI_OAUTH_CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });
  const payload = await parseJson(response);
  if (response.status === 403) {
    throw new SubscriptionHttpError(
      'This xAI account is not authorized for API image generation. Grok Build CLI can still run if it is signed in.',
      {
        code: 'entitlement_denied',
        fallbackAllowed: true,
        httpStatus: 403,
      },
    );
  }
  if (!response.ok) {
    const code = oauthErrorCode(payload);
    const relogin = code === 'invalid_grant' || response.status === 400 || response.status === 401;
    throw new SubscriptionHttpError(oauthErrorMessage(payload, 'xAI token refresh failed.'), {
      code: relogin ? 'invalid_grant' : 'refresh_failed',
      fallbackAllowed: false,
      httpStatus: response.status,
    });
  }
  return payload;
}

const refreshLocks = new Map<SubscriptionProviderId, Promise<string>>();

export async function getUsableAccessToken(
  providerId: SubscriptionProviderId,
  {
    store = getSubscriptionAuthStore(),
    fetch: fetchImpl = fetch,
    now = Date.now,
    env = process.env,
  }: TokenRefreshDependencies = {},
): Promise<string> {
  if (providerId === 'xai') {
    const apiKey = env.XAI_API_KEY?.trim();
    if (apiKey) return apiKey;
  }

  const pending = refreshLocks.get(providerId);
  if (pending) return pending;

  const run = (async () => {
    const record = store.readProvider(providerId);
    if (!record.accessToken && !record.refreshToken) {
      throw new SubscriptionHttpError('Studio Sign in is required before HTTP image generation.', {
        code: 'not_signed_in',
        fallbackAllowed: true,
      });
    }
    const skew =
      providerId === 'codex'
        ? CODEX_ACCESS_TOKEN_REFRESH_SKEW_MS
        : XAI_ACCESS_TOKEN_REFRESH_SKEW_MS;
    if (record.accessToken && !isExpired(record, now(), skew)) {
      return record.accessToken;
    }
    if (!record.refreshToken) {
      store.writeProvider(providerId, {
        ...record,
        status: 'refresh_failed',
        lastError: 'Missing refresh token. Sign in again.',
      });
      throw new SubscriptionHttpError('Missing refresh token. Sign in again.', {
        code: 'invalid_grant',
        fallbackAllowed: false,
      });
    }
    try {
      const payload =
        providerId === 'codex'
          ? await refreshCodexToken(record.refreshToken, fetchImpl)
          : await refreshXaiToken(record.refreshToken, fetchImpl);
      const next = tokensFromOAuthPayload(payload, record, now());
      store.writeProvider(providerId, next);
      return next.accessToken!;
    } catch (error) {
      if (error instanceof SubscriptionHttpError && error.code === 'invalid_grant') {
        store.writeProvider(providerId, {
          ...record,
          status: 'refresh_failed',
          accessToken: null,
          lastError: error.message,
        });
      } else if (error instanceof SubscriptionHttpError && error.code === 'refresh_failed') {
        store.writeProvider(providerId, {
          ...record,
          status: 'refresh_failed',
          lastError: error.message,
        });
      }
      throw error;
    }
  })();

  refreshLocks.set(providerId, run);
  try {
    return await run;
  } finally {
    refreshLocks.delete(providerId);
  }
}

export function readXaiApiKey(env: Record<string, string | undefined> = process.env) {
  return env.XAI_API_KEY?.trim() || null;
}

export function isCodexHttpCredentialReady(
  store: SubscriptionAuthStore = getSubscriptionAuthStore(),
) {
  return isSubscriptionLoggedIn(store.readProvider('codex'));
}

export function isGrokHttpCredentialReady(
  store: SubscriptionAuthStore = getSubscriptionAuthStore(),
  env: Record<string, string | undefined> = process.env,
) {
  return isSubscriptionLoggedIn(store.readProvider('xai')) || Boolean(readXaiApiKey(env));
}
