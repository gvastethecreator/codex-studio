import type {
  CodexAccountStatusResponse,
  CodexAuthMode,
  CodexUsageSnapshot,
} from '../../../../packages/shared/src';
import { CodexRpcClient } from './rpcClient';

function now() {
  return new Date().toISOString();
}

function resolveAuthMode(account: any): CodexAuthMode {
  if (!account || typeof account !== 'object') return null;
  if (account.type === 'apiKey') return 'apikey';
  if (account.type === 'chatgpt') return 'chatgpt';
  if (account.type === 'chatgptAuthTokens') return 'chatgptAuthTokens';
  return null;
}

function pickRateLimitSnapshot(response: any) {
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

function extractUsageSnapshot(snapshot: any, pathPrefix: string | null): CodexUsageSnapshot | null {
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

function buildFallbackAccountStatus(error: unknown): CodexAccountStatusResponse {
  return {
    authMode: null,
    planType: null,
    usage: null,
    source: 'fallback',
    fetchedAt: now(),
    error: error instanceof Error ? error.message : String(error),
  };
}

export async function getCodexAccountStatus(): Promise<CodexAccountStatusResponse> {
  const client = new CodexRpcClient();

  try {
    await client.connect();
    await client.request('initialize', {
      clientInfo: {
        name: 'codex-studio',
        title: 'Codex Studio',
        version: '0.1.0',
      },
      capabilities: null,
    });
    client.notify('initialized');

    const [accountResponse, rateLimitResponse] = await Promise.all([
      client.request('account/read', { refreshToken: false }).catch(() => null),
      client.request('account/rateLimits/read', undefined).catch(() => null),
    ]);

    const account = (accountResponse as any)?.account ?? null;
    const { snapshot, path } = pickRateLimitSnapshot(rateLimitResponse);

    return {
      authMode: resolveAuthMode(account),
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
    };
  } catch (error) {
    return buildFallbackAccountStatus(error);
  } finally {
    client.close();
  }
}