import type { SubscriptionProviderId } from '../../../../packages/shared/src';
import { SubscriptionHttpError } from '../providers/subscriptionHttpError';
import {
  CODEX_ACCESS_TOKEN_REFRESH_SKEW_MS,
  CODEX_OAUTH_CLIENT_ID,
  CODEX_OAUTH_TOKEN_URL,
  XAI_ACCESS_TOKEN_REFRESH_SKEW_MS,
  XAI_OAUTH_CLIENT_ID,
  XAI_OAUTH_TOKEN_URL,
  studioPackageVersion,
  studioUserAgent,
} from './constants';
import { readChatgptAccountId, readJwtAccountLabel, readJwtExpiryMs } from './jwt';
import { readOAuthJson, safeOAuthText } from './oauthHttp';
import { revokeSubscriptionToken } from './revoke';
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
  revokeToken?: typeof revokeSubscriptionToken;
}

function formBody(fields: Record<string, string>) {
  return new URLSearchParams(fields).toString();
}

function expiryIso(accessToken: string, expiresIn: unknown, nowMs: number) {
  const seconds =
    typeof expiresIn === 'number'
      ? expiresIn
      : typeof expiresIn === 'string'
        ? Number(expiresIn)
        : Number.NaN;
  if (Number.isFinite(seconds) && seconds > 0) {
    const expiryMs = nowMs + seconds * 1000;
    if (Number.isFinite(expiryMs) && Math.abs(expiryMs) <= 8.64e15) {
      return new Date(expiryMs).toISOString();
    }
  }
  const jwtExpiry = readJwtExpiryMs(accessToken);
  return jwtExpiry ? new Date(jwtExpiry).toISOString() : null;
}

function isExpired(record: StoredSubscriptionTokens, nowMs: number, skewMs: number) {
  if (!record.expiresAt) {
    const jwtExpiry = readJwtExpiryMs(record.accessToken);
    if (jwtExpiry) return jwtExpiry - skewMs <= nowMs;
    const updatedAt = Date.parse(record.updatedAt);
    return !Number.isFinite(updatedAt) || updatedAt + 30 * 24 * 60 * 60_000 - skewMs <= nowMs;
  }
  const expiresAt = Date.parse(record.expiresAt);
  if (!Number.isFinite(expiresAt)) return true;
  return expiresAt - skewMs <= nowMs;
}

function oauthErrorCode(payload: Record<string, unknown>) {
  const error = payload.error;
  const directCode = safeOAuthText(error, 80);
  if (directCode) return directCode;
  if (error && typeof error === 'object') {
    const nested = error as Record<string, unknown>;
    const code = nested.code ?? nested.type;
    const nestedCode = safeOAuthText(code, 80);
    if (nestedCode) return nestedCode;
  }
  return null;
}

function oauthErrorMessage(payload: Record<string, unknown>, fallback: string) {
  const description = payload.error_description;
  const safeDescription = safeOAuthText(description);
  if (safeDescription) return safeDescription;
  const error = payload.error;
  if (error && typeof error === 'object') {
    const message = (error as Record<string, unknown>).message;
    const safeMessage = safeOAuthText(message);
    if (safeMessage) return safeMessage;
  }
  const safeError = safeOAuthText(error);
  if (safeError) return safeError;
  return fallback;
}

function asOAuthToken(value: unknown) {
  if (typeof value !== 'string') return '';
  const token = value.trim();
  return token && token.length <= 64 * 1024 && !/[\s\u0000-\u001f\u007f]/.test(token) ? token : '';
}

async function readRefreshPayload(response: Response, providerLabel: string) {
  try {
    return await readOAuthJson(response);
  } catch {
    throw new SubscriptionHttpError(
      `${providerLabel} token refresh returned an invalid response.`,
      {
        code: 'refresh_failed',
        fallbackAllowed: true,
        httpStatus: response.status,
      },
    );
  }
}

export function tokensFromOAuthPayload(
  payload: Record<string, unknown>,
  previous: Pick<StoredSubscriptionTokens, 'refreshToken' | 'accountLabel' | 'chatgptAccountId'>,
  nowMs: number,
): StoredSubscriptionTokens {
  const accessToken = asOAuthToken(payload.access_token);
  if (!accessToken) {
    throw new SubscriptionHttpError('Token response did not include an access token.', {
      code: 'invalid_grant',
      fallbackAllowed: false,
    });
  }
  const tokenType = safeOAuthText(payload.token_type, 32);
  if (tokenType && tokenType.toLowerCase() !== 'bearer') {
    throw new SubscriptionHttpError('Token response returned an unsupported token type.', {
      code: 'invalid_grant',
      fallbackAllowed: false,
    });
  }
  let nextRefresh = previous.refreshToken;
  if (payload.refresh_token !== undefined && payload.refresh_token !== null) {
    const suppliedRefresh = asOAuthToken(payload.refresh_token);
    if (
      typeof payload.refresh_token !== 'string' ||
      (payload.refresh_token.trim() && !suppliedRefresh)
    ) {
      throw new SubscriptionHttpError('Token response returned an invalid refresh token.', {
        code: 'invalid_grant',
        fallbackAllowed: false,
      });
    }
    if (suppliedRefresh) nextRefresh = suppliedRefresh;
  }
  const idToken = asOAuthToken(payload.id_token) || null;
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

function throwRefreshTransportError(error: unknown): never {
  if (error instanceof SubscriptionHttpError) throw error;
  const name = error instanceof Error ? error.name : '';
  if (name === 'TimeoutError' || name === 'AbortError') {
    throw new SubscriptionHttpError('Token refresh timed out.', {
      code: 'timeout',
      fallbackAllowed: true,
    });
  }
  throw new SubscriptionHttpError('Token refresh could not reach the provider.', {
    code: 'refresh_failed',
    fallbackAllowed: true,
  });
}

function isTransientRefreshStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

async function refreshCodexToken(
  refreshToken: string,
  fetchImpl: AuthFetch,
): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetchImpl(CODEX_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': studioUserAgent(),
      },
      signal: AbortSignal.timeout(20_000),
      body: formBody({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CODEX_OAUTH_CLIENT_ID,
      }),
      redirect: 'error',
    });
  } catch (error) {
    throwRefreshTransportError(error);
  }
  const payload = await readRefreshPayload(response, 'Codex');
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
      fallbackAllowed: !relogin && isTransientRefreshStatus(response.status),
      httpStatus: response.status,
    });
  }
  return payload;
}

async function refreshXaiToken(
  refreshToken: string,
  fetchImpl: AuthFetch,
): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetchImpl(XAI_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': studioUserAgent(),
        'x-grok-client-version': studioPackageVersion(),
        'x-grok-client-surface': 'ui',
      },
      signal: AbortSignal.timeout(20_000),
      body: formBody({
        grant_type: 'refresh_token',
        client_id: XAI_OAUTH_CLIENT_ID,
        refresh_token: refreshToken,
      }),
      redirect: 'error',
    });
  } catch (error) {
    throwRefreshTransportError(error);
  }
  const payload = await readRefreshPayload(response, 'xAI');
  if (!response.ok) {
    const code = oauthErrorCode(payload);
    const relogin = code === 'invalid_grant' || code === 'invalid_token' || response.status === 401;
    throw new SubscriptionHttpError(oauthErrorMessage(payload, 'xAI token refresh failed.'), {
      code: relogin ? 'invalid_grant' : 'refresh_failed',
      fallbackAllowed: !relogin && isTransientRefreshStatus(response.status),
      httpStatus: response.status,
    });
  }
  return payload;
}

const refreshLocks = new WeakMap<
  SubscriptionAuthStore,
  Map<SubscriptionProviderId, Promise<string>>
>();

function refreshLockMap(store: SubscriptionAuthStore) {
  let locks = refreshLocks.get(store);
  if (!locks) {
    locks = new Map();
    refreshLocks.set(store, locks);
  }
  return locks;
}

export async function getUsableAccessToken(
  providerId: SubscriptionProviderId,
  {
    store = getSubscriptionAuthStore(),
    fetch: fetchImpl = fetch,
    now = Date.now,
    env = process.env,
    revokeToken = revokeSubscriptionToken,
  }: TokenRefreshDependencies = {},
): Promise<string> {
  if (providerId === 'xai') {
    const apiKey = env.XAI_API_KEY?.trim();
    if (apiKey) return apiKey;
  }

  const storeRefreshLocks = refreshLockMap(store);
  const pending = storeRefreshLocks.get(providerId);
  if (pending) return pending;

  let settle!: (value: string) => void;
  let fail!: (reason: unknown) => void;
  const gate = new Promise<string>((resolve, reject) => {
    settle = resolve;
    fail = reject;
  });
  storeRefreshLocks.set(providerId, gate);

  void (async () => {
    const writeIfCurrent = (generation: number, record: StoredSubscriptionTokens) => {
      if (store.generation(providerId) !== generation) return;
      store.writeProvider(providerId, record);
    };
    try {
      const generation = store.generation(providerId);
      const record = store.readProvider(providerId);
      if (!record.accessToken && !record.refreshToken) {
        throw new SubscriptionHttpError(
          'Studio Sign in is required before HTTP image generation.',
          {
            code: 'not_signed_in',
            fallbackAllowed: true,
          },
        );
      }
      const skew =
        providerId === 'codex'
          ? CODEX_ACCESS_TOKEN_REFRESH_SKEW_MS
          : XAI_ACCESS_TOKEN_REFRESH_SKEW_MS;
      if (record.accessToken && !isExpired(record, now(), skew)) {
        settle(record.accessToken);
        return;
      }
      if (!record.refreshToken) {
        writeIfCurrent(generation, {
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
        let next: StoredSubscriptionTokens;
        try {
          next = tokensFromOAuthPayload(payload, record, now());
        } catch (error) {
          if (error instanceof SubscriptionHttpError && error.code === 'invalid_grant') {
            const providerLabel = providerId === 'codex' ? 'Codex' : 'xAI';
            throw new SubscriptionHttpError(
              `${providerLabel} token refresh returned an invalid response.`,
              {
                code: 'refresh_failed',
                fallbackAllowed: true,
              },
            );
          }
          throw error;
        }
        if (store.generation(providerId) !== generation) {
          try {
            await revokeToken(providerId, next, { fetch: fetchImpl });
          } catch {
            // The local generation changed; never restore these newly issued tokens.
          }
          throw new SubscriptionHttpError('Studio Sign in was cancelled.', {
            code: 'not_signed_in',
            fallbackAllowed: true,
          });
        }
        store.writeProvider(providerId, next);
        settle(next.accessToken!);
      } catch (error) {
        if (error instanceof SubscriptionHttpError && error.code === 'invalid_grant') {
          writeIfCurrent(generation, {
            ...record,
            status: 'refresh_failed',
            accessToken: null,
            refreshToken: null,
            lastError: error.message,
          });
        } else if (
          error instanceof SubscriptionHttpError &&
          (error.code === 'refresh_failed' ||
            error.code === 'timeout' ||
            error.code === 'http_error')
        ) {
          writeIfCurrent(generation, {
            ...record,
            status: 'refresh_failed',
            lastError: error.message,
          });
        }
        throw error;
      }
    } catch (error) {
      fail(error);
    } finally {
      if (storeRefreshLocks.get(providerId) === gate) storeRefreshLocks.delete(providerId);
    }
  })();

  return gate;
}

export function readXaiApiKey(env: Record<string, string | undefined> = process.env) {
  return env.XAI_API_KEY?.trim() || null;
}

export function invalidateStoredAccessToken(
  providerId: SubscriptionProviderId,
  message: string,
  store: SubscriptionAuthStore = getSubscriptionAuthStore(),
) {
  store.bumpGeneration(providerId);
  const record = store.readProvider(providerId);
  store.writeProvider(providerId, {
    ...record,
    status: record.refreshToken ? 'refresh_failed' : 'logged_out',
    accessToken: null,
    lastError: safeOAuthText(message) || 'Provider rejected the access token.',
  });
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
