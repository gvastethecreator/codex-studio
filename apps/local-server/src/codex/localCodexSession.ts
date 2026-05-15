import type {
  CodexAuthMode,
  CodexUsageSnapshot,
  LocalCodexSessionResponse,
} from '../../../../packages/shared/src';
import { CodexRpcClient } from './rpcClient';

export interface CodexRpcTransport {
  connect(): Promise<void>;
  request(method: string, params?: unknown): Promise<any>;
  notify(method: string, params?: unknown): void;
  close(): void;
}

export type CodexRpcTransportFactory = () => CodexRpcTransport;

interface LocalCodexSessionBase {
  authMode: CodexAuthMode;
  planType: string | null;
  usage: CodexUsageSnapshot | null;
  source: LocalCodexSessionResponse['source'];
  fetchedAt: string;
  error: string | null;
}

const CODEX_CLIENT_INFO = {
  name: 'codex-studio',
  title: 'Codex Studio',
  version: '0.1.0',
} as const;

function now() {
  return new Date().toISOString();
}

function defaultClientFactory(): CodexRpcTransport {
  return new CodexRpcClient();
}

export function resolveCodexAuthMode(account: any): CodexAuthMode {
  if (!account || typeof account !== 'object') return null;
  if (account.type === 'apiKey') return 'apikey';
  if (account.type === 'chatgpt') return 'chatgpt';
  if (account.type === 'chatgptAuthTokens') return 'chatgptAuthTokens';
  return null;
}

export function formatCodexAuthLabel(authMode: CodexAuthMode) {
  switch (authMode) {
    case 'chatgpt':
      return 'ChatGPT login';
    case 'apikey':
      return 'API key';
    case 'chatgptAuthTokens':
      return 'Externally managed ChatGPT tokens';
    default:
      return 'Not signed in';
  }
}

export function pickRateLimitSnapshot(response: any) {
  const byLimitId = response?.rateLimitsByLimitId;
  if (byLimitId && typeof byLimitId === 'object') {
    if (byLimitId.codex && typeof byLimitId.codex === 'object') {
      return { snapshot: byLimitId.codex, path: 'rateLimitsByLimitId.codex' };
    }

    for (const [limitId, snapshot] of Object.entries(byLimitId)) {
      if (snapshot && typeof snapshot === 'object') {
        return { snapshot, path: `rateLimitsByLimitId.${limitId}` };
      }
    }
  }

  if (response?.rateLimits && typeof response.rateLimits === 'object') {
    return { snapshot: response.rateLimits, path: 'rateLimits' };
  }

  return { snapshot: null, path: null };
}

export function extractUsageSnapshot(
  snapshot: any,
  pathPrefix: string | null,
): CodexUsageSnapshot | null {
  if (!snapshot || typeof snapshot !== 'object') return null;

  const credits = snapshot.credits;
  if (credits && typeof credits === 'object') {
    if (credits.unlimited === true) {
      return {
        available: 'unlimited',
        unit: 'credits',
        display: 'Unlimited',
        path: pathPrefix ? `${pathPrefix}.credits` : 'credits',
        raw: credits,
      };
    }

    if (typeof credits.balance === 'string' && credits.balance.trim().length > 0) {
      const numericBalance = Number(credits.balance);
      return {
        available: Number.isFinite(numericBalance) ? numericBalance : credits.balance.trim(),
        unit: 'credits',
        display: credits.balance.trim(),
        path: pathPrefix ? `${pathPrefix}.credits.balance` : 'credits.balance',
        raw: credits,
      };
    }

    if (credits.hasCredits === false) {
      return {
        available: 0,
        unit: 'credits',
        display: '0',
        path: pathPrefix ? `${pathPrefix}.credits` : 'credits',
        raw: credits,
      };
    }
  }

  const primary = snapshot.primary;
  if (primary && typeof primary.usedPercent === 'number') {
    const remaining = Math.max(0, Math.min(100, 100 - primary.usedPercent));
    return {
      available: remaining,
      unit: 'window_percent',
      display: `${Math.round(remaining)}% left`,
      path: pathPrefix ? `${pathPrefix}.primary.usedPercent` : 'primary.usedPercent',
      raw: primary,
    };
  }

  return null;
}

export function buildLocalCodexSessionResponse(
  base: LocalCodexSessionBase,
): LocalCodexSessionResponse {
  const isChatgptLogin = base.authMode === 'chatgpt';
  const isSupportedAuthMode = isChatgptLogin;

  let state: LocalCodexSessionResponse['state'];
  let reason: LocalCodexSessionResponse['reason'];

  if (base.authMode === 'apikey') {
    state = 'unsupported_auth';
    reason = 'api_key_not_supported';
  } else if (base.authMode === 'chatgptAuthTokens') {
    state = 'unsupported_auth';
    reason = 'external_tokens_not_supported';
  } else if (isChatgptLogin) {
    state = base.error ? 'unavailable' : 'ready';
    reason = base.error ? 'app_server_unavailable' : null;
  } else if (base.error) {
    state = 'unavailable';
    reason = 'app_server_unavailable';
  } else {
    state = 'requires_chatgpt_login';
    reason = 'chatgpt_login_required';
  }

  return {
    ...base,
    authLabel: formatCodexAuthLabel(base.authMode),
    state,
    reason,
    isChatgptLogin,
    isSupportedAuthMode,
    canRunLocalJobs: isChatgptLogin && !base.error,
  };
}

export async function withInitializedCodexClient<T>(
  {
    createClient = defaultClientFactory,
  }: {
    createClient?: CodexRpcTransportFactory;
  } = {},
  run: (client: CodexRpcTransport) => Promise<T>,
): Promise<T> {
  const client = createClient();

  try {
    await client.connect();
    await client.request('initialize', {
      clientInfo: CODEX_CLIENT_INFO,
      capabilities: null,
    });
    client.notify('initialized');
    return await run(client);
  } finally {
    client.close();
  }
}

export function createLocalCodexSessionReader({
  createClient = defaultClientFactory,
}: {
  createClient?: CodexRpcTransportFactory;
} = {}) {
  return async function getLocalCodexSession(): Promise<LocalCodexSessionResponse> {
    try {
      return await withInitializedCodexClient({ createClient }, async (client) => {
        const [accountResponse, rateLimitResponse] = await Promise.all([
          client.request('account/read', { refreshToken: false }).catch(() => null),
          client.request('account/rateLimits/read', undefined).catch(() => null),
        ]);

        const account = accountResponse?.account ?? null;
        const authMode = resolveCodexAuthMode(account);
        const { snapshot, path } = pickRateLimitSnapshot(rateLimitResponse);

        return buildLocalCodexSessionResponse({
          authMode,
          planType:
            typeof account?.planType === 'string'
              ? account.planType
              : typeof snapshot?.planType === 'string'
                ? snapshot.planType
                : null,
          usage: extractUsageSnapshot(snapshot, path),
          source: 'app-server',
          fetchedAt: now(),
          error: null,
        });
      });
    } catch (error) {
      return buildLocalCodexSessionResponse({
        authMode: null,
        planType: null,
        usage: null,
        source: 'fallback',
        fetchedAt: now(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };
}

export const getLocalCodexSession = createLocalCodexSessionReader();