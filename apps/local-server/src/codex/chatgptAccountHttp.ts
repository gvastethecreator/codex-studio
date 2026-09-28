import type {
  CodexModel,
  CodexModelCatalogResponse,
  LocalCodexSessionResponse,
} from '../../../../packages/shared/src';
import {
  CODEX_RESPONSES_BASE_URL,
  studioCodexOriginator,
  studioUserAgent,
} from '../auth/constants';
import { readChatgptAccountId } from '../auth/jwt';
import { getUsableAccessToken, isCodexHttpCredentialReady } from '../auth/tokens';
import {
  buildLocalCodexSessionResponse,
  createCachedLocalCodexSessionReader,
  getLocalCodexSession,
  normalizeCodexSessionErrorMessage,
} from './localCodexSession';
import { isAppServerRunning } from './processSupervisor';
import { extractUsageSnapshot } from './rateLimitUsage';

/**
 * Reads the account plan, usage and model list for the Studio ChatGPT sign-in over HTTP, so Studio
 * does not need codex app-server for them. The Codex backend filters models by client version.
 */
const DEFAULT_CODEX_CLIENT_VERSION = '0.158.0';
const REQUEST_TIMEOUT_MS = 10_000;

export interface ChatgptAccountHttpDependencies {
  getAccessToken?: () => Promise<string>;
  fetch?: typeof fetch;
  env?: Record<string, string | undefined>;
  now?: () => Date;
}

async function getCodexJson(path: string, deps: ChatgptAccountHttpDependencies) {
  const env = deps.env ?? process.env;
  const fetchImpl = deps.fetch ?? fetch;
  const token = await (
    deps.getAccessToken ?? (() => getUsableAccessToken('codex', { env, fetch: fetchImpl }))
  )();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'User-Agent': studioUserAgent(),
    originator: studioCodexOriginator(env),
  };
  const accountId = readChatgptAccountId(token);
  if (accountId) headers['ChatGPT-Account-ID'] = accountId;
  const response = await fetchImpl(`${CODEX_RESPONSES_BASE_URL}${path}`, {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`ChatGPT ${path} returned HTTP ${response.status}`);
  return (await response.json()) as any;
}

function usageWindow(window: any) {
  if (!window || typeof window.used_percent !== 'number') return null;
  return {
    usedPercent: window.used_percent,
    windowMinutes:
      typeof window.limit_window_seconds === 'number'
        ? Math.round(window.limit_window_seconds / 60)
        : null,
    resetsAt: typeof window.reset_at === 'number' ? window.reset_at : null,
  };
}

/** Converts the Codex backend usage payload to the snapshot shape app-server returns. */
export function usageFromCodexUsagePayload(payload: any) {
  const credits = payload?.credits;
  return extractUsageSnapshot(
    {
      primary: usageWindow(payload?.rate_limit?.primary_window),
      secondary: usageWindow(payload?.rate_limit?.secondary_window),
      credits:
        credits && typeof credits === 'object'
          ? {
              hasCredits: credits.has_credits,
              unlimited: credits.unlimited,
              balance: credits.balance,
            }
          : undefined,
    },
    'rate_limit',
  );
}

export async function readChatgptHttpSession(
  deps: ChatgptAccountHttpDependencies = {},
): Promise<LocalCodexSessionResponse> {
  const fetchedAt = (deps.now ?? (() => new Date()))().toISOString();
  try {
    const payload = await getCodexJson('/usage', deps);
    const session = buildLocalCodexSessionResponse({
      authMode: 'chatgpt',
      planType: typeof payload?.plan_type === 'string' ? payload.plan_type : null,
      usage: usageFromCodexUsagePayload(payload),
      source: 'chatgpt-http',
      fetchedAt,
      error: null,
    });
    // Local Codex jobs need the Codex CLI login, which this HTTP read does not prove.
    return { ...session, canRunLocalJobs: false };
  } catch (error) {
    return buildLocalCodexSessionResponse({
      authMode: null,
      planType: null,
      usage: null,
      source: 'chatgpt-http',
      fetchedAt,
      error: normalizeCodexSessionErrorMessage(error),
      fallbackReason: 'unknown',
    });
  }
}

/** The Studio ChatGPT session over HTTP, or null when Studio has no ChatGPT sign-in. */
export async function readStudioChatgptSession() {
  return isCodexHttpCredentialReady() ? readChatgptHttpSession() : null;
}

/**
 * Session for `/api/codex/session`: a running app-server answers first because it reflects the
 * Codex CLI login. Otherwise the Studio sign-in answers over HTTP, and app-server starts only when
 * that is not possible.
 */
export const getAccountSession = createCachedLocalCodexSessionReader({
  read: async () => {
    if (!isAppServerRunning()) {
      const session = await readStudioChatgptSession();
      if (session && !session.error) return session;
    }
    return getLocalCodexSession();
  },
});

/** Maps one Codex backend model entry to the catalog shape app-server `model/list` produces. */
export function codexModelFromHttpEntry(entry: any): CodexModel | null {
  const slug = typeof entry?.slug === 'string' ? entry.slug : null;
  if (!slug) return null;
  return {
    id: slug,
    model: slug,
    displayName: typeof entry.display_name === 'string' ? entry.display_name : slug,
    description: typeof entry.description === 'string' ? entry.description : null,
    hidden: entry.visibility === 'hide',
    defaultReasoningEffort:
      typeof entry.default_reasoning_level === 'string' ? entry.default_reasoning_level : null,
    supportedReasoningEfforts: Array.isArray(entry.supported_reasoning_levels)
      ? entry.supported_reasoning_levels
          .filter((level: any) => typeof level?.effort === 'string')
          .map((level: any) => ({
            reasoningEffort: level.effort,
            description: typeof level.description === 'string' ? level.description : null,
          }))
      : [],
    additionalSpeedTiers: Array.isArray(entry.additional_speed_tiers)
      ? entry.additional_speed_tiers.filter(
          (tier: unknown): tier is 'fast' | 'flex' => tier === 'fast' || tier === 'flex',
        )
      : [],
    inputModalities: Array.isArray(entry.input_modalities)
      ? entry.input_modalities.filter((item: unknown): item is string => typeof item === 'string')
      : ['text', 'image'],
    supportsPersonality: Boolean(entry.supports_personality),
    isDefault: false,
  };
}

export async function readChatgptHttpModels(deps: ChatgptAccountHttpDependencies = {}) {
  const version = (deps.env ?? process.env).STUDIO_CODEX_CLIENT_VERSION?.trim();
  const payload = await getCodexJson(
    `/models?client_version=${encodeURIComponent(version || DEFAULT_CODEX_CLIENT_VERSION)}`,
    deps,
  );
  const entries: any[] = Array.isArray(payload?.models) ? payload.models : [];
  return entries
    .map(codexModelFromHttpEntry)
    .filter((model): model is CodexModel => model !== null);
}
