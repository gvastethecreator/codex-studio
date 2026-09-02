import type { SubscriptionProviderId } from '../../../../packages/shared/src';
import {
  CODEX_OAUTH_CLIENT_ID,
  CODEX_OAUTH_REVOKE_URL,
  XAI_OAUTH_CLIENT_ID,
  XAI_OAUTH_REVOKE_URL,
  studioUserAgent,
} from './constants';
import type { StoredSubscriptionTokens } from './store';
import type { AuthFetch } from './tokens';

export interface RevokeSubscriptionTokenDependencies {
  fetch?: AuthFetch;
  timeoutMs?: number;
}

export type RevokeSubscriptionTokenResult = 'revoked' | 'failed' | 'skipped';

export async function revokeSubscriptionToken(
  providerId: SubscriptionProviderId,
  record: Pick<StoredSubscriptionTokens, 'accessToken' | 'refreshToken'>,
  { fetch: fetchImpl = fetch, timeoutMs = 10_000 }: RevokeSubscriptionTokenDependencies = {},
): Promise<RevokeSubscriptionTokenResult> {
  const token = record.refreshToken || record.accessToken;
  if (!token) return 'skipped';
  const tokenTypeHint = record.refreshToken ? 'refresh_token' : 'access_token';

  try {
    const response =
      providerId === 'codex'
        ? await fetchImpl(CODEX_OAUTH_REVOKE_URL, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'User-Agent': studioUserAgent(),
            },
            body: JSON.stringify({
              token,
              token_type_hint: tokenTypeHint,
              client_id: record.refreshToken ? CODEX_OAUTH_CLIENT_ID : undefined,
            }),
            redirect: 'error',
            signal: AbortSignal.timeout(timeoutMs),
          })
        : await fetchImpl(XAI_OAUTH_REVOKE_URL, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': studioUserAgent(),
            },
            body: new URLSearchParams({
              token,
              token_type_hint: tokenTypeHint,
              client_id: XAI_OAUTH_CLIENT_ID,
            }).toString(),
            redirect: 'error',
            signal: AbortSignal.timeout(timeoutMs),
          });
    return response.ok ? 'revoked' : 'failed';
  } catch {
    return 'failed';
  }
}
