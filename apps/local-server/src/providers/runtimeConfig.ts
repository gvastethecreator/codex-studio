import type {
  CodexRuntimeDoctorReport,
  GenerationProviderId,
  GenerationProviderRuntimePreflight,
  ProviderRuntimeKind,
  ProviderSecretState,
} from '../../../../packages/shared/src';
import { readCodexRuntimeDoctor } from '../codexRuntimeDoctor';

export type ExternalExecutableProviderId = 'google' | 'fal' | 'comfy';

interface ExternalProviderRuntimeDefinition {
  providerId: ExternalExecutableProviderId;
  runtimeKind: ProviderRuntimeKind;
  secretEnvNames: readonly string[];
  localRuntimeEnvNames: readonly string[];
  requiredConfigEnvNames?: readonly string[];
}

const EXTERNAL_PROVIDER_RUNTIMES: ExternalProviderRuntimeDefinition[] = [
  {
    providerId: 'google',
    runtimeKind: 'hosted_api',
    secretEnvNames: ['GOOGLE_API_KEY', 'GEMINI_API_KEY', 'NANO_BANANA_API_KEY'],
    localRuntimeEnvNames: [],
  },
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
  return providerId === 'google' || providerId === 'fal' || providerId === 'comfy';
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
  return EXTERNAL_PROVIDER_RUNTIMES.map((definition) => createPreflight(definition, env));
}

export function createCodexRuntimePreflight(
  codexRuntime: CodexRuntimeDoctorReport,
): GenerationProviderRuntimePreflight {
  const unavailable = codexRuntime.issues.some((issue) => issue.code === 'codex_cli_unavailable');
  return {
    providerId: 'codex',
    runtimeKind: 'codex_app_server',
    secretState: 'not_required',
    secretSource: null,
    localRuntimeState: codexRuntime.canRunJobs ? 'configured' : unavailable ? 'missing' : 'invalid',
    localRuntimeSource: codexRuntime.selectedExecutable,
    canAttemptExecution: codexRuntime.canRunJobs,
    diagnostics:
      codexRuntime.issues.length > 0
        ? codexRuntime.issues.map((issue) => `${issue.message} ${issue.action}`)
        : [codexRuntime.recommendedAction],
  };
}

export function readGenerationProviderRuntimePreflights(
  env: Record<string, string | undefined> = process.env,
  codexRuntime: CodexRuntimeDoctorReport = readCodexRuntimeDoctor(),
) {
  return [createCodexRuntimePreflight(codexRuntime), ...readExternalProviderRuntimePreflights(env)];
}

export function getExternalProviderRuntimePreflight(
  providerId: GenerationProviderId,
  env: Record<string, string | undefined> = process.env,
) {
  return (
    readExternalProviderRuntimePreflights(env).find(
      (preflight) => preflight.providerId === providerId,
    ) ?? null
  );
}

export function createProviderReadinessMaps(env: Record<string, string | undefined> = process.env) {
  const secretConfigured: Partial<Record<GenerationProviderId, boolean>> = {};
  const localRuntimeConfigured: Partial<Record<GenerationProviderId, boolean>> = {};

  for (const preflight of readExternalProviderRuntimePreflights(env)) {
    secretConfigured[preflight.providerId] = preflight.secretState !== 'missing';
    localRuntimeConfigured[preflight.providerId] =
      preflight.localRuntimeState === 'not_required' || preflight.canAttemptExecution;
  }

  return { secretConfigured, localRuntimeConfigured };
}
