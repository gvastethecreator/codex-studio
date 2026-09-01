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
  studioUserAgent,
} from './constants';
import type { AuthFetch } from './tokens';
import { tokensFromOAuthPayload } from './tokens';
import type { StoredSubscriptionTokens } from './store';

export interface DeviceCodeStart {
  providerId: SubscriptionProviderId;
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
}

function formBody(fields: Record<string, string>) {
  return new URLSearchParams(fields).toString();
}

async function parseJson(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function asString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function asPositiveInt(value: unknown, fallback: number) {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseInt(value, 10)
        : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function isAllowedXaiAuthUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'auth.x.ai';
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
    });
    if (response.status !== 429) break;
    if (attempt < 4) {
      const retryAfter = Number.parseInt(response.headers.get('retry-after') ?? '', 10);
      await sleep(
        Number.isFinite(retryAfter)
          ? Math.min(Math.max(retryAfter, 1), 60) * 1000
          : 2 ** attempt * 1000,
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
  const payload = await parseJson(response);
  const userCode = asString(payload.user_code);
  const deviceAuthId = asString(payload.device_auth_id);
  if (!userCode || !deviceAuthId) {
    throw new Error('ChatGPT device-code response was incomplete.');
  }
  const intervalMs = Math.max(3000, asPositiveInt(payload.interval, 5) * 1000);
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
        const pollResponse = await fetchImpl(CODEX_DEVICE_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': studioUserAgent(),
          },
          body: JSON.stringify({ device_auth_id: deviceAuthId, user_code: userCode }),
          signal,
        });
        if (pollResponse.status === 429) {
          await sleep(intervalMs, signal);
          continue;
        }
        if (pollResponse.status === 403 || pollResponse.status === 404) continue;
        if (!pollResponse.ok) {
          throw new Error(`ChatGPT login poll failed (${pollResponse.status}).`);
        }
        const codePayload = await parseJson(pollResponse);
        const authorizationCode = asString(codePayload.authorization_code);
        const codeVerifier = asString(codePayload.code_verifier);
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
          signal,
        });
        const tokenPayload = await parseJson(tokenResponse);
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
}: DeviceCodeDependencies): Promise<DeviceCodeStart> {
  let tokenEndpoint = XAI_OAUTH_TOKEN_URL;
  try {
    const discovery = await fetchImpl(XAI_OAUTH_DISCOVERY_URL, {
      headers: { Accept: 'application/json', 'User-Agent': studioUserAgent() },
      redirect: 'error',
    });
    if (discovery.ok) {
      const payload = await parseJson(discovery);
      const discovered = asString(payload.token_endpoint);
      if (isAllowedXaiAuthUrl(discovered)) {
        tokenEndpoint = discovered;
      }
    }
  } catch {
    // Use the documented token URL when discovery is unavailable.
  }

  const response = await fetchImpl(XAI_OAUTH_DEVICE_CODE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'User-Agent': studioUserAgent(),
    },
    body: formBody({
      client_id: XAI_OAUTH_CLIENT_ID,
      scope: XAI_OAUTH_SCOPE,
    }),
  });
  const payload = await parseJson(response);
  if (!response.ok) {
    throw new Error(`xAI device-code request failed (${response.status}).`);
  }
  const userCode = asString(payload.user_code);
  const deviceCode = asString(payload.device_code);
  const verificationUrl =
    asString(payload.verification_uri_complete) || asString(payload.verification_uri);
  if (!userCode || !deviceCode || !verificationUrl) {
    throw new Error('xAI device-code response was incomplete.');
  }
  const intervalMs = Math.max(1000, asPositiveInt(payload.interval, 5) * 1000);
  const expiresInMs = asPositiveInt(payload.expires_in, 900) * 1000;
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
        const pollResponse = await fetchImpl(tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            'User-Agent': studioUserAgent(),
          },
          body: formBody({
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            client_id: XAI_OAUTH_CLIENT_ID,
            device_code: deviceCode,
          }),
          signal,
        });
        const tokenPayload = await parseJson(pollResponse);
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
          currentInterval = Math.min(currentInterval + 1000, 30_000);
          await sleep(currentInterval, signal);
          continue;
        }
        const errorCode = asString(tokenPayload.error);
        if (errorCode === 'authorization_pending') {
          await sleep(currentInterval, signal);
          continue;
        }
        if (errorCode === 'slow_down') {
          currentInterval = Math.min(currentInterval + 1000, 30_000);
          await sleep(currentInterval, signal);
          continue;
        }
        throw new Error(
          asString(tokenPayload.error_description) ||
            `xAI login poll failed (${errorCode || pollResponse.status}).`,
        );
      }
      throw new Error('xAI login timed out.');
    },
  };
}

export async function startDeviceCode(
  providerId: SubscriptionProviderId,
  deps: DeviceCodeDependencies = {},
): Promise<DeviceCodeStart> {
  return providerId === 'codex' ? startCodexDeviceCode(deps) : startXaiDeviceCode(deps);
}
