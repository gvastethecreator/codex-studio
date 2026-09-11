import type {
  CodexRuntimeDoctorReport,
  GenerationProviderId,
  GenerationProviderRuntimePreflight,
  ProviderRuntimeKind,
  ProviderSecretState,
  ProviderSubscriptionAuthState,
} from '../../../../packages/shared/src';
import {
  DEFAULT_GROK_IMAGINE_HTTP_MODEL,
  GROK_IMAGINE_HTTP_MODELS,
} from '../../../../packages/shared/src/grokImagineContract';
import {
  DEFAULT_GOOGLE_IMAGE_MODEL,
  GOOGLE_IMAGE_MODELS,
} from '../../../../packages/shared/src/googleImageContract';
import { readCodexRuntimeDoctor } from '../codexRuntimeDoctor';
import {
  readAntigravityRuntimeDoctor,
  type AntigravityRuntimeDoctorReport,
} from '../antigravityRuntimeDoctor';
import { readGrokRuntimeDoctor, type GrokRuntimeDoctorReport } from '../grokRuntimeDoctor';
import {
  isCodexHttpCredentialReady,
  isGoogleOAuthCredentialReady,
  isGrokHttpCredentialReady,
} from '../auth/tokens';
import { getSubscriptionAuthStore } from '../auth/store';
import { readGoogleOAuthConfig } from '../auth/googleOAuthConfig';

export type ExternalExecutableProviderId = 'grok' | 'google' | 'antigravity' | 'fal' | 'comfy';

interface ExternalProviderRuntimeDefinition {
  providerId: ExternalExecutableProviderId;
  runtimeKind: ProviderRuntimeKind;
  secretEnvNames: readonly string[];
  localRuntimeEnvNames: readonly string[];
  requiredConfigEnvNames?: readonly string[];
}

const EXTERNAL_PROVIDER_RUNTIMES: ExternalProviderRuntimeDefinition[] = [
  {
    providerId: 'fal',
    runtimeKind: 'hosted_api',
    secretEnvNames: ['FAL_KEY', 'FAL_API_KEY'],
    localRuntimeEnvNames: [],
  },
  {
    providerId: 'comfy',
    runtimeKind: 'local_workflow',
    secretEnvNames: [],
    localRuntimeEnvNames: ['COMFY_API_URL', 'COMFYUI_API_URL'],
    requiredConfigEnvNames: ['COMFY_WORKFLOW_TEMPLATE_PATH'],
  },
];

export function isExternalExecutableProviderId(
  providerId: GenerationProviderId | null | undefined,
): providerId is ExternalExecutableProviderId {
  return (
    providerId === 'grok' ||
    providerId === 'google' ||
    providerId === 'antigravity' ||
    providerId === 'fal' ||
    providerId === 'comfy'
  );
}

export type ProviderRuntimePreflight = GenerationProviderRuntimePreflight & {
  providerId: ExternalExecutableProviderId;
};

function firstConfiguredEnvName(env: Record<string, string | undefined>, names: readonly string[]) {
  return names.find((name) => Boolean(env[name]?.trim())) ?? null;
}

function isValidLocalRuntimeUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    return ['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function resolveSecretState(secretEnvNames: readonly string[], secretSource: string | null) {
  if (secretEnvNames.length === 0) return 'not_required' satisfies ProviderSecretState;
  return secretSource ? 'configured' : 'missing';
}

function resolveLocalRuntimeState(
  env: Record<string, string | undefined>,
  localRuntimeEnvNames: readonly string[],
  localRuntimeSource: string | null,
) {
  if (localRuntimeEnvNames.length === 0) return 'not_required';
  if (!localRuntimeSource) return 'missing';
  return isValidLocalRuntimeUrl(env[localRuntimeSource]) ? 'configured' : 'invalid';
}

function createPreflight(
  definition: ExternalProviderRuntimeDefinition,
  env: Record<string, string | undefined>,
): ProviderRuntimePreflight {
  const secretSource = firstConfiguredEnvName(env, definition.secretEnvNames);
  const localRuntimeSource = firstConfiguredEnvName(env, definition.localRuntimeEnvNames);
  const missingRequiredConfig = (definition.requiredConfigEnvNames ?? []).filter(
    (name) => !env[name]?.trim(),
  );
  const secretState = resolveSecretState(definition.secretEnvNames, secretSource);
  const localRuntimeState = resolveLocalRuntimeState(
    env,
    definition.localRuntimeEnvNames,
    localRuntimeSource,
  );
  const diagnostics: string[] = [];

  if (secretState === 'missing') {
    diagnostics.push(`Missing Provider Secret source: ${definition.secretEnvNames.join(' or ')}.`);
  }
  if (localRuntimeState === 'missing') {
    diagnostics.push(
      `Missing local runtime endpoint source: ${definition.localRuntimeEnvNames.join(' or ')}.`,
    );
  }
  if (localRuntimeState === 'invalid' && localRuntimeSource) {
    diagnostics.push(`Invalid local runtime endpoint in ${localRuntimeSource}.`);
  }
  if (missingRequiredConfig.length > 0) {
    diagnostics.push(`Missing provider config source: ${missingRequiredConfig.join(' or ')}.`);
  }

  return {
    providerId: definition.providerId,
    runtimeKind: definition.runtimeKind,
    secretState,
    secretSource,
    localRuntimeState,
    localRuntimeSource,
    canAttemptExecution:
      secretState !== 'missing' &&
      localRuntimeState !== 'missing' &&
      localRuntimeState !== 'invalid' &&
      missingRequiredConfig.length === 0,
    diagnostics,
  };
}

export function readExternalProviderRuntimePreflights(
  env: Record<string, string | undefined> = process.env,
) {
  return [
    createGoogleRuntimePreflight(env),
    ...EXTERNAL_PROVIDER_RUNTIMES.map((definition) => createPreflight(definition, env)),
  ];
}

export function createGoogleRuntimePreflight(
  env: Record<string, string | undefined> = process.env,
): ProviderRuntimePreflight {
  const apiKeySource = firstConfiguredEnvName(env, [
    'GOOGLE_API_KEY',
    'GEMINI_API_KEY',
    'NANO_BANANA_API_KEY',
  ]);
  let oauthConfigurationError: string | null = null;
  try {
    readGoogleOAuthConfig(env);
  } catch (error) {
    oauthConfigurationError =
      error instanceof Error ? error.message : 'Google OAuth configuration is invalid.';
  }
  const storedAuthState = readStoredSubscriptionState('google');
  const oauthReady = !oauthConfigurationError && storedAuthState === 'logged_in';
  const credentialReady = Boolean(apiKeySource) || oauthReady;
  const diagnostics: string[] = [];
  if (apiKeySource) {
    diagnostics.push(`Google API key detected in ${apiKeySource}.`);
  } else if (oauthReady) {
    diagnostics.push('Google OAuth and Cloud billing project are ready.');
  } else if (oauthConfigurationError) {
    diagnostics.push(oauthConfigurationError);
  } else if (storedAuthState === 'refresh_failed') {
    diagnostics.push('Google OAuth refresh failed. Sign in to Google again in Studio Settings.');
  } else {
    diagnostics.push(
      'Google OAuth is configured but disconnected. Connect Google in Studio Settings.',
    );
  }
  return {
    providerId: 'google',
    runtimeKind: 'hosted_api',
    secretState: credentialReady ? 'configured' : 'missing',
    secretSource: apiKeySource ?? (oauthReady ? 'Studio Google OAuth' : null),
    localRuntimeState: 'not_required',
    localRuntimeSource: null,
    canAttemptExecution: credentialReady,
    diagnostics,
    availableModels: [...GOOGLE_IMAGE_MODELS],
    defaultModel: DEFAULT_GOOGLE_IMAGE_MODEL,
  };
}

export function createCodexRuntimePreflight(
  codexRuntime: CodexRuntimeDoctorReport,
  options: { httpReady?: boolean } = {},
): GenerationProviderRuntimePreflight {
  const unavailable = codexRuntime.issues.some((issue) => issue.code === 'codex_cli_unavailable');
  const httpReady = options.httpReady ?? safeCodexHttpReady();
  const cliReady = codexRuntime.canRunJobs;
  const availableRuntimeKinds = [
    ...(cliReady ? (['codex_app_server'] as const) : []),
    ...(httpReady ? (['subscription_http'] as const) : []),
  ];
  const diagnostics: string[] = [];
  if (cliReady) diagnostics.push('Codex app-server is ready. Live Codex models are available.');
  if (httpReady)
    diagnostics.push('ChatGPT HTTP is ready. Each job keeps its accepted execution route.');
  if (codexRuntime.issues.length > 0) {
    diagnostics.push(...codexRuntime.issues.map((issue) => `${issue.message} ${issue.action}`));
  } else if (!cliReady && !httpReady) {
    diagnostics.push(codexRuntime.recommendedAction);
  }
  return {
    providerId: 'codex',
    runtimeKind: cliReady
      ? 'codex_app_server'
      : httpReady
        ? 'subscription_http'
        : 'codex_app_server',
    availableRuntimeKinds,
    secretState: 'not_required',
    secretSource: null,
    localRuntimeState: cliReady ? 'configured' : unavailable ? 'missing' : 'invalid',
    localRuntimeSource: codexRuntime.selectedExecutable,
    canAttemptExecution: httpReady || cliReady,
    diagnostics,
  };
}

export function createGrokRuntimePreflight(
  grokRuntime: GrokRuntimeDoctorReport,
  options: { env?: Record<string, string | undefined>; httpReady?: boolean } = {},
): ProviderRuntimePreflight {
  const env = options.env ?? process.env;
  const unavailable = grokRuntime.issues.some((issue) => issue.code === 'grok_cli_unavailable');
  const httpReady = options.httpReady ?? safeGrokHttpReady(env);
  const cliReady = grokRuntime.canRunJobs;
  const diagnostics: string[] = [];
  if (httpReady)
    diagnostics.push('xAI HTTP credentials are ready. Grok Build CLI stays as fallback.');
  if (grokRuntime.issues.length > 0) {
    diagnostics.push(...grokRuntime.issues.map((issue) => `${issue.message} ${issue.action}`));
  } else if (!httpReady) {
    diagnostics.push(grokRuntime.recommendedAction);
  }
  const availableModels = uniqueStrings([
    ...(httpReady ? GROK_IMAGINE_HTTP_MODELS : []),
    ...grokRuntime.availableModels,
  ]);
  return {
    providerId: 'grok',
    runtimeKind: httpReady ? 'subscription_http' : 'agent_cli',
    secretState: 'not_required',
    secretSource: null,
    localRuntimeState: cliReady ? 'configured' : unavailable ? 'missing' : 'invalid',
    localRuntimeSource: grokRuntime.selectedExecutable,
    canAttemptExecution: httpReady || cliReady,
    diagnostics,
    availableModels,
    defaultModel: httpReady ? DEFAULT_GROK_IMAGINE_HTTP_MODEL : grokRuntime.defaultModel,
  };
}

export function createAntigravityRuntimePreflight(
  runtime: AntigravityRuntimeDoctorReport,
): ProviderRuntimePreflight {
  const unavailable = runtime.issues.some((issue) => issue.code === 'antigravity_cli_unavailable');
  return {
    providerId: 'antigravity',
    runtimeKind: 'agent_cli',
    secretState: 'not_required',
    secretSource: null,
    localRuntimeState: runtime.canRunJobs ? 'configured' : unavailable ? 'missing' : 'invalid',
    localRuntimeSource: runtime.selectedExecutable,
    canAttemptExecution: runtime.canRunJobs,
    diagnostics:
      runtime.issues.length > 0
        ? runtime.issues.map((issue) => `${issue.message} ${issue.action}`)
        : [runtime.recommendedAction],
    availableModels: runtime.availableModels,
    defaultModel: runtime.defaultModel,
  };
}

function uniqueStrings(values: readonly string[]) {
  return [...new Set(values.filter(Boolean))];
}

function safeCodexHttpReady() {
  try {
    return isCodexHttpCredentialReady();
  } catch {
    return false;
  }
}

function safeGrokHttpReady(env: Record<string, string | undefined>) {
  try {
    return isGrokHttpCredentialReady(undefined, env);
  } catch {
    return Boolean(env.XAI_API_KEY?.trim());
  }
}

export function readGenerationProviderRuntimePreflights(
  env: Record<string, string | undefined> = process.env,
  codexRuntime: CodexRuntimeDoctorReport = readCodexRuntimeDoctor(),
  grokRuntime: GrokRuntimeDoctorReport = readGrokRuntimeDoctor(),
  antigravityRuntime: AntigravityRuntimeDoctorReport = readAntigravityRuntimeDoctor(),
) {
  return [
    createCodexRuntimePreflight(codexRuntime),
    createGrokRuntimePreflight(grokRuntime, { env }),
    createAntigravityRuntimePreflight(antigravityRuntime),
    ...readExternalProviderRuntimePreflights(env),
  ];
}

export function getExternalProviderRuntimePreflight(
  providerId: GenerationProviderId,
  env: Record<string, string | undefined> = process.env,
  grokRuntime?: GrokRuntimeDoctorReport,
) {
  if (providerId === 'grok') {
    return createGrokRuntimePreflight(grokRuntime ?? readGrokRuntimeDoctor(), { env });
  }
  if (providerId === 'antigravity') {
    return createAntigravityRuntimePreflight(readAntigravityRuntimeDoctor());
  }
  return (
    readExternalProviderRuntimePreflights(env).find(
      (preflight) => preflight.providerId === providerId,
    ) ?? null
  );
}

export function createProviderReadinessMaps(
  env: Record<string, string | undefined> = process.env,
  grokRuntime: GrokRuntimeDoctorReport = readGrokRuntimeDoctor(),
  options: {
    codexHttpReady?: boolean;
    grokHttpReady?: boolean;
    antigravityRuntime?: AntigravityRuntimeDoctorReport;
  } = {},
) {
  const secretConfigured: Partial<Record<GenerationProviderId, boolean>> = {};
  const localRuntimeConfigured: Partial<Record<GenerationProviderId, boolean>> = {};
  const subscriptionAuthConfigured: Partial<Record<GenerationProviderId, boolean>> = {};
  const subscriptionAuthState: Partial<
    Record<GenerationProviderId, ProviderSubscriptionAuthState>
  > = {
    google: 'logged_out',
    antigravity: 'not_applicable',
    fal: 'not_applicable',
    comfy: 'not_applicable',
    dry_run: 'not_applicable',
  };

  for (const preflight of readExternalProviderRuntimePreflights(env)) {
    secretConfigured[preflight.providerId] = preflight.secretState !== 'missing';
    localRuntimeConfigured[preflight.providerId] =
      preflight.localRuntimeState === 'not_required' || preflight.canAttemptExecution;
  }

  const googleOAuthReady = safeGoogleOAuthReady(env);
  subscriptionAuthConfigured.google = googleOAuthReady;
  subscriptionAuthState.google = readStoredSubscriptionState('google');
  localRuntimeConfigured.antigravity = Boolean(options.antigravityRuntime?.canRunJobs);
  secretConfigured.antigravity = true;

  const grokHttpReady = options.grokHttpReady ?? safeGrokHttpReady(env);
  const grokPreflight = createGrokRuntimePreflight(grokRuntime, { env, httpReady: grokHttpReady });
  secretConfigured.grok = true;
  localRuntimeConfigured.grok = grokPreflight.canAttemptExecution;
  subscriptionAuthConfigured.grok = grokHttpReady;
  subscriptionAuthState.grok = readStoredSubscriptionState('xai');
  const codexHttpReady = options.codexHttpReady ?? safeCodexHttpReady();
  subscriptionAuthConfigured.codex = codexHttpReady;
  subscriptionAuthState.codex = readStoredSubscriptionState('codex');

  return {
    secretConfigured,
    localRuntimeConfigured,
    subscriptionAuthConfigured,
    subscriptionAuthState,
  };
}

function readStoredSubscriptionState(providerId: 'codex' | 'xai' | 'google') {
  try {
    const record = getSubscriptionAuthStore().readProvider(providerId);
    if (record.status === 'logged_in' && !record.accessToken) return 'logged_out' as const;
    return record.status;
  } catch {
    return 'logged_out' as const;
  }
}

function safeGoogleOAuthReady(env: Record<string, string | undefined>) {
  try {
    return isGoogleOAuthCredentialReady(undefined, env);
  } catch {
    return false;
  }
}
