import type {
  CodexAuthMode,
  CodexUsageSnapshot,
  LocalCodexSessionReason,
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

export interface CachedLocalCodexSessionReader {
  (): Promise<LocalCodexSessionResponse>;
  invalidate(): void;
}

interface LocalCodexSessionBase {
  authMode: CodexAuthMode;
  planType: string | null;
  usage: CodexUsageSnapshot | null;
  source: LocalCodexSessionResponse['source'];
  fetchedAt: string;
  error: string | null;
  fallbackReason?: Exclude<LocalCodexSessionReason, null>;
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

const APP_SERVER_UNAVAILABLE_PATTERN =
  /app-server|connect|connection|econnrefused|socket|websocket|timed out|timeout/i;
const PROTOCOL_INCOMPATIBLE_PATTERN =
  /method not found|unknown method|protocol|json[- ]?rpc|-32601/i;
const ACCOUNT_READ_PROTOCOL_FAILURE_PATTERN =
  /method not found|unknown method|protocol|json[- ]?rpc|-32601|timed out|timeout|deadline|invalid (?:account\/read )?response|invalid payload/i;

type CodexAccountType = 'chatgpt' | 'apiKey' | 'chatgptAuthTokens' | 'externalTokens';
type CodexAccountRecord = {
  type: CodexAccountType;
  planType?: unknown;
};
type AccountReadResponse = { account: CodexAccountRecord | null };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isCodexAccountType(value: unknown): value is CodexAccountType {
  return (
    value === 'chatgpt' ||
    value === 'apiKey' ||
    value === 'chatgptAuthTokens' ||
    value === 'externalTokens'
  );
}

export function normalizeCodexSessionErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function classifyLocalCodexSessionFallbackReason(
  error: unknown,
): Exclude<LocalCodexSessionReason, null> {
  const message = normalizeCodexSessionErrorMessage(error);
  if (!message || message === 'undefined' || message === 'null') {
    return 'unknown';
  }
  if (PROTOCOL_INCOMPATIBLE_PATTERN.test(message)) {
    return 'protocol_incompatible';
  }
  return APP_SERVER_UNAVAILABLE_PATTERN.test(message) ? 'app_server_unavailable' : 'unknown';
}

function classifyAccountReadFailureReason(error: unknown): Exclude<LocalCodexSessionReason, null> {
  const message = normalizeCodexSessionErrorMessage(error);
  if (ACCOUNT_READ_PROTOCOL_FAILURE_PATTERN.test(message)) {
    return 'protocol_incompatible';
  }
  if (APP_SERVER_UNAVAILABLE_PATTERN.test(message)) {
    return 'app_server_unavailable';
  }
  return 'protocol_incompatible';
}

function isAccountReadResponse(value: unknown): value is AccountReadResponse {
  if (!isRecord(value) || !Object.prototype.hasOwnProperty.call(value, 'account')) {
    return false;
  }
  if (value.account === null) return true;
  return isRecord(value.account) && isCodexAccountType(value.account.type);
}

export function resolveCodexAuthMode(account: unknown): CodexAuthMode {
  if (!isRecord(account)) return null;
  if (account.type === 'apiKey') return 'apikey';
  if (account.type === 'chatgpt') return 'chatgpt';
  if (account.type === 'chatgptAuthTokens' || account.type === 'externalTokens') {
    return 'chatgptAuthTokens';
  }
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
    reason = base.error ? (base.fallbackReason ?? 'app_server_unavailable') : null;
  } else if (base.error) {
    state = 'unavailable';
    reason =
      base.fallbackReason ?? (base.source === 'fallback' ? 'unknown' : 'app_server_unavailable');
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
        const rateLimitResponsePromise = client
          .request('account/rateLimits/read', undefined)
          .catch(() => null);
        let accountResponse: unknown;
        try {
          accountResponse = await client.request('account/read', { refreshToken: false });
        } catch (error) {
          return buildLocalCodexSessionResponse({
            authMode: null,
            planType: null,
            usage: null,
            source: 'app-server',
            fetchedAt: now(),
            error: normalizeCodexSessionErrorMessage(error),
            fallbackReason: classifyAccountReadFailureReason(error),
          });
        }

        if (!isAccountReadResponse(accountResponse)) {
          const error = new Error('Codex app-server account/read returned an invalid response');
          return buildLocalCodexSessionResponse({
            authMode: null,
            planType: null,
            usage: null,
            source: 'app-server',
            fetchedAt: now(),
            error: error.message,
            fallbackReason: 'protocol_incompatible',
          });
        }

        const rateLimitResponse = await rateLimitResponsePromise;

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
      const errorMessage = normalizeCodexSessionErrorMessage(error);
      return buildLocalCodexSessionResponse({
        authMode: null,
        planType: null,
        usage: null,
        source: 'fallback',
        fetchedAt: now(),
        error: errorMessage,
        fallbackReason: classifyLocalCodexSessionFallbackReason(error),
      });
    }
  };
}

export function createCachedLocalCodexSessionReader({
  read,
  maxAgeMs = 1_000,
  now = Date.now,
}: {
  read: () => Promise<LocalCodexSessionResponse>;
  maxAgeMs?: number;
  now?: () => number;
}): CachedLocalCodexSessionReader {
  let cached: LocalCodexSessionResponse | null = null;
  let expiresAt = 0;
  let inFlight: Promise<LocalCodexSessionResponse> | null = null;
  let generation = 0;

  const readCached = async () => {
    if (cached && now() < expiresAt) return cached;
    if (inFlight) return inFlight;

    const requestGeneration = generation;
    const request = read()
      .then((response) => {
        if (requestGeneration === generation) {
          cached = response;
          expiresAt = now() + maxAgeMs;
        }
        return response;
      })
      .finally(() => {
        if (inFlight === request) inFlight = null;
      });
    inFlight = request;
    return request;
  };

  readCached.invalidate = () => {
    generation += 1;
    cached = null;
    expiresAt = 0;
    inFlight = null;
  };

  return readCached;
}

const readUncachedLocalCodexSession = createLocalCodexSessionReader();

export const getLocalCodexSession = createCachedLocalCodexSessionReader({
  read: readUncachedLocalCodexSession,
});
