import type {
  GenerationProviderId,
  GenerationProviderRuntimePreflight,
  ProviderSecretState,
} from '../../../../packages/shared/src';
import {
  listExternalExecutableProviderEntries,
  type ExternalExecutableProviderId,
  type ProviderRegistryEntry,
} from './providerRegistry';

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

function resolveSecretState(secretEnvNames: string[], secretSource: string | null) {
  if (secretEnvNames.length === 0) return 'not_required' satisfies ProviderSecretState;
  return secretSource ? 'configured' : 'missing';
}

function resolveLocalRuntimeState(
  env: Record<string, string | undefined>,
  localRuntimeEnvNames: string[],
  localRuntimeSource: string | null,
) {
  if (localRuntimeEnvNames.length === 0) return 'not_required';
  if (!localRuntimeSource) return 'missing';
  return isValidLocalRuntimeUrl(env[localRuntimeSource]) ? 'configured' : 'invalid';
}

function createPreflight(
  definition: ProviderRegistryEntry & { providerId: ExternalExecutableProviderId },
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
  return listExternalExecutableProviderEntries().map((definition) =>
    createPreflight(definition, env),
  );
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
