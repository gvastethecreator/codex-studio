import type { SubscriptionProviderId } from '../../../../packages/shared/src';
import {
  CODEX_DEVICE_POLL_MAX_MS,
  CODEX_DEVICE_REDIRECT_URI,
  CODEX_DEVICE_TOKEN_URL,
  CODEX_DEVICE_USERCODE_URL,
  CODEX_DEVICE_VERIFICATION_URL,
  CODEX_OAUTH_CLIENT_ID,
  CODEX_OAUTH_TOKEN_URL,
  XAI_OAUTH_CLIENT_ID,
  XAI_OAUTH_DEVICE_CODE_URL,
  XAI_OAUTH_DISCOVERY_URL,
  XAI_OAUTH_SCOPE,
  XAI_OAUTH_TOKEN_URL,
  XAI_OAUTH_ISSUER,
  studioPackageVersion,
  studioUserAgent,
} from './constants';
import { readOAuthJson, safeOAuthText } from './oauthHttp';
import type { AuthFetch } from './tokens';
import { tokensFromOAuthPayload } from './tokens';
import type { StoredSubscriptionTokens } from './store';

export type DeviceCodeProviderId = Exclude<SubscriptionProviderId, 'google'>;

export interface DeviceCodeStart {
  providerId: DeviceCodeProviderId;
  verificationUrl: string;
  userCode: string;
  expiresAt: string;
  intervalMs: number;
  poll: (signal: AbortSignal) => Promise<StoredSubscriptionTokens>;
}

export interface DeviceCodeDependencies {
  fetch?: AuthFetch;
  now?: () => number;
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
  signal?: AbortSignal;
}

function requestSignal(signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(20_000);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

function formBody(fields: Record<string, string>) {
  return new URLSearchParams(fields).toString();
}

function asString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function asBoundedString(value: unknown, maxLength: number) {
  const result = asString(value);
  return result.length <= maxLength && !/[\u0000-\u001f\u007f]/.test(result) ? result : '';
}

function asUserCode(value: unknown) {
  const result = asBoundedString(value, 128);
  return /^[A-Za-z0-9-]{1,128}$/.test(result) ? result : '';
}

function asPositiveInt(value: unknown, fallback: number, maximum: number) {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseInt(value, 10)
        : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
}

export function isAllowedXaiAuthUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'auth.x.ai' &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === '443')
    );
  } catch {
    return false;
  }
}

export function isAllowedXaiVerificationUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === '443') &&
      (hostname === 'x.ai' || hostname.endsWith('.x.ai'))
    );
  } catch {
    return false;
  }
}

export function sleepWithSignal(ms: number, signal?: AbortSignal) {
  if (signal?.aborted) {
    const error = new Error('Login cancelled.');
    error.name = 'AbortError';
    return Promise.reject(error);
  }
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      const error = new Error('Login cancelled.');
      error.name = 'AbortError';
      reject(error);
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

async function startCodexDeviceCode({
  fetch: fetchImpl = fetch,
  now = Date.now,
  sleep = sleepWithSignal,
  signal,
}: DeviceCodeDependencies): Promise<DeviceCodeStart> {
  let response: Response | null = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    response = await fetchImpl(CODEX_DEVICE_USERCODE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': studioUserAgent(),
      },
      body: JSON.stringify({ client_id: CODEX_OAUTH_CLIENT_ID }),
      redirect: 'error',
      signal: requestSignal(signal),
    });
    if (response.status !== 429) break;
    if (attempt < 4) {
      const retryAfter = Number.parseInt(response.headers.get('retry-after') ?? '', 10);
      await sleep(
        Number.isFinite(retryAfter)
          ? Math.min(Math.max(retryAfter, 1), 60) * 1000
          : 2 ** attempt * 1000,
        signal,
      );
    }
  }
  if (!response || !response.ok) {
    throw new Error(
      response?.status === 429
        ? 'OpenAI is rate-limiting ChatGPT login requests. Wait a minute and try again.'
        : `ChatGPT device-code request failed (${response?.status ?? 'unknown'}).`,
    );
  }
  const payload = await readOAuthJson(response);
  const userCode = asUserCode(payload.user_code);
  const deviceAuthId = asBoundedString(payload.device_auth_id, 4096);
  if (!userCode || !deviceAuthId) {
    throw new Error('ChatGPT device-code response was incomplete.');
  }
  const intervalMs = Math.max(3000, asPositiveInt(payload.interval, 5, 24 * 60 * 60) * 1000);
  const expiresAt = new Date(now() + CODEX_DEVICE_POLL_MAX_MS).toISOString();

  return {
    providerId: 'codex',
    verificationUrl: CODEX_DEVICE_VERIFICATION_URL,
    userCode,
    expiresAt,
    intervalMs,
    async poll(signal) {
      const deadline = now() + CODEX_DEVICE_POLL_MAX_MS;
      while (now() < deadline) {
        await sleep(intervalMs, signal);
        if (now() >= deadline) break;
        const pollResponse = await fetchImpl(CODEX_DEVICE_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': studioUserAgent(),
          },
          body: JSON.stringify({ device_auth_id: deviceAuthId, user_code: userCode }),
          redirect: 'error',
          signal: requestSignal(signal),
        });
        if (pollResponse.status === 429) {
          await sleep(intervalMs, signal);
          continue;
        }
        if (pollResponse.status === 403 || pollResponse.status === 404) continue;
        if (!pollResponse.ok) {
          throw new Error(`ChatGPT login poll failed (${pollResponse.status}).`);
        }
        const codePayload = await readOAuthJson(pollResponse);
        const authorizationCode = asBoundedString(codePayload.authorization_code, 4096);
        const codeVerifier = asBoundedString(codePayload.code_verifier, 4096);
        if (!authorizationCode || !codeVerifier) {
          throw new Error('ChatGPT login poll was missing authorization_code or code_verifier.');
        }
        const tokenResponse = await fetchImpl(CODEX_OAUTH_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            'User-Agent': studioUserAgent(),
          },
          body: formBody({
            grant_type: 'authorization_code',
            code: authorizationCode,
            redirect_uri: CODEX_DEVICE_REDIRECT_URI,
            client_id: CODEX_OAUTH_CLIENT_ID,
            code_verifier: codeVerifier,
          }),
          redirect: 'error',
          signal: requestSignal(signal),
        });
        const tokenPayload = await readOAuthJson(tokenResponse);
        if (!tokenResponse.ok) {
          throw new Error(`ChatGPT token exchange failed (${tokenResponse.status}).`);
        }
        return tokensFromOAuthPayload(
          tokenPayload,
          {
            refreshToken: null,
            accountLabel: null,
            chatgptAccountId: null,
          },
          now(),
        );
      }
      throw new Error('ChatGPT login timed out after 15 minutes.');
    },
  };
}

async function startXaiDeviceCode({
  fetch: fetchImpl = fetch,
  now = Date.now,
  sleep = sleepWithSignal,
  signal,
}: DeviceCodeDependencies): Promise<DeviceCodeStart> {
  let tokenEndpoint = XAI_OAUTH_TOKEN_URL;
  try {
    const discovery = await fetchImpl(XAI_OAUTH_DISCOVERY_URL, {
      headers: { Accept: 'application/json', 'User-Agent': studioUserAgent() },
      redirect: 'error',
      signal: requestSignal(signal),
    });
    if (discovery.ok) {
      const payload = await readOAuthJson(discovery);
      const discovered = asString(payload.token_endpoint);
      if (asString(payload.issuer) === XAI_OAUTH_ISSUER && isAllowedXaiAuthUrl(discovered)) {
        tokenEndpoint = discovered;
      }
    }
  } catch (error) {
    if (signal?.aborted) throw error;
    // Use the documented token URL when discovery is unavailable.
  }

  const response = await fetchImpl(XAI_OAUTH_DEVICE_CODE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'User-Agent': studioUserAgent(),
      'x-grok-client-version': studioPackageVersion(),
      'x-grok-client-surface': 'ui',
    },
    body: formBody({
      client_id: XAI_OAUTH_CLIENT_ID,
      scope: XAI_OAUTH_SCOPE,
      referrer: 'grok-build',
    }),
    redirect: 'error',
    signal: requestSignal(signal),
  });
  const payload = await readOAuthJson(response);
  if (!response.ok) {
    throw new Error(`xAI device-code request failed (${response.status}).`);
  }
  const userCode = asUserCode(payload.user_code);
  const deviceCode = asBoundedString(payload.device_code, 4096);
  const verificationUrl =
    asString(payload.verification_uri_complete) || asString(payload.verification_uri);
  if (!userCode || !deviceCode || !isAllowedXaiVerificationUrl(verificationUrl)) {
    throw new Error('xAI device-code response was incomplete.');
  }
  const intervalMs = Math.max(1000, asPositiveInt(payload.interval, 5, 24 * 60 * 60) * 1000);
  const expiresInMs =
    Math.max(10 * 60, asPositiveInt(payload.expires_in, 900, 24 * 60 * 60)) * 1000;
  const expiresAt = new Date(now() + expiresInMs).toISOString();

  return {
    providerId: 'xai',
    verificationUrl,
    userCode,
    expiresAt,
    intervalMs,
    async poll(signal) {
      const deadline = now() + expiresInMs;
      let currentInterval = intervalMs;
      while (now() < deadline) {
        await sleep(currentInterval, signal);
        if (now() >= deadline) break;
        const pollResponse = await fetchImpl(tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            'User-Agent': studioUserAgent(),
            'x-grok-client-version': studioPackageVersion(),
            'x-grok-client-surface': 'ui',
          },
          body: formBody({
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            client_id: XAI_OAUTH_CLIENT_ID,
            device_code: deviceCode,
          }),
          redirect: 'error',
          signal: requestSignal(signal),
        });
        const tokenPayload = await readOAuthJson(pollResponse);
        if (pollResponse.ok) {
          return tokensFromOAuthPayload(
            tokenPayload,
            {
              refreshToken: null,
              accountLabel: null,
              chatgptAccountId: null,
            },
            now(),
          );
        }
        if (pollResponse.status === 429) {
          currentInterval = Math.min(currentInterval + 5000, expiresInMs);
          continue;
        }
        const errorCode = safeOAuthText(tokenPayload.error, 80);
        if (errorCode === 'authorization_pending') {
          continue;
        }
        if (errorCode === 'slow_down') {
          currentInterval = Math.min(currentInterval + 5000, expiresInMs);
          continue;
        }
        const providerDescription = safeOAuthText(tokenPayload.error_description, 270);
        throw new Error(
          providerDescription
            ? `xAI login failed: ${providerDescription}`
            : `xAI login poll failed (${errorCode || pollResponse.status}).`,
        );
      }
      throw new Error('xAI login timed out.');
    },
  };
}

export async function startDeviceCode(
  providerId: DeviceCodeProviderId,
  deps: DeviceCodeDependencies = {},
): Promise<DeviceCodeStart> {
  return providerId === 'codex' ? startCodexDeviceCode(deps) : startXaiDeviceCode(deps);
}
