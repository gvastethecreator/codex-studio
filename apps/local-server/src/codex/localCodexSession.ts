import type {
  CodexAuthMode,
  CodexUsageSnapshot,
  LocalCodexSessionResponse,
} from '../../../../packages/shared/src';
import { CodexRpcClient } from './rpcClient';
import { extractUsageSnapshot, pickRateLimitSnapshot } from './rateLimitUsage';

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
                : typeof snapshot?.plan_type === 'string'
                  ? snapshot.plan_type
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
