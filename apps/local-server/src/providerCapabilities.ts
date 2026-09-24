import {
  BUILT_IN_PROVIDER_CAPABILITIES,
  createGenerationProviderCapabilities,
  type GenerationProviderRuntimePreflight,
  type GenerationProviderCapabilitiesResponse,
} from '../../../packages/shared/src/providerCapabilities';
import type { CodexRuntimeDoctorReport } from '../../../packages/shared/src';
import type { GrokRuntimeDoctorReport } from './grokRuntimeDoctor';
import type { AntigravityRuntimeDoctorReport } from './antigravityRuntimeDoctor';
import type { EditableStudioSettings } from '../../../packages/shared/src/studioSettings';
import type { GenerationProviderId } from '../../../packages/shared/src/generationContracts';
import {
  createProviderReadinessMaps,
  createProviderReadinessMapsFromPreflights,
} from './providers/runtimeConfig';

export interface ProviderExecutionBlocker {
  [key: string]: unknown;
  error: string;
  code: 'provider_not_registered' | 'provider_runtime_blocked';
  providerId: GenerationProviderId;
  status: string;
  detail: string;
  diagnostics: string[];
}

export function readProviderCapabilities(
  settings: Pick<EditableStudioSettings, 'defaultProviderId'>,
  env: Record<string, string | undefined> = process.env,
  codexRuntime?: Pick<CodexRuntimeDoctorReport, 'canRunJobs'>,
  grokRuntime?: GrokRuntimeDoctorReport,
  subscriptionReady?: { codexHttpReady?: boolean; grokHttpReady?: boolean },
  antigravityRuntime?: AntigravityRuntimeDoctorReport,
  preflights?: readonly GenerationProviderRuntimePreflight[],
): GenerationProviderCapabilitiesResponse {
  const readiness = preflights
    ? createProviderReadinessMapsFromPreflights(preflights)
    : createProviderReadinessMaps(env, grokRuntime, {
        ...subscriptionReady,
        antigravityRuntime,
      });
  if (!preflights) readiness.localRuntimeConfigured.codex = codexRuntime?.canRunJobs ?? true;

  return createGenerationProviderCapabilities({
    settings,
    providers: BUILT_IN_PROVIDER_CAPABILITIES,
    secretConfigured: readiness.secretConfigured,
    localRuntimeConfigured: readiness.localRuntimeConfigured,
    subscriptionAuthConfigured: readiness.subscriptionAuthConfigured,
    subscriptionAuthState: readiness.subscriptionAuthState,
  });
}

export function getProviderExecutionBlocker(
  capabilities: GenerationProviderCapabilitiesResponse,
  providerId: GenerationProviderId,
  runtimePreflights: GenerationProviderRuntimePreflight[] = [],
): ProviderExecutionBlocker | null {
  const capability = capabilities.providers.find((provider) => provider.providerId === providerId);
  const runtimePreflight = runtimePreflights.find((provider) => provider.providerId === providerId);

  if (!capability) {
    return {
      error: 'Provider is not registered.',
      code: 'provider_not_registered',
      providerId,
      status: 'unknown',
      detail: 'Add the provider to the backend capability catalog before creating jobs.',
      diagnostics: [],
    };
  }

  if (capability.canExecute) {
    return null;
  }

  return {
    error: 'Provider cannot execute jobs yet.',
    code: 'provider_runtime_blocked',
    providerId,
    status: capability.status,
    detail: capability.detail,
    diagnostics: runtimePreflight?.diagnostics ?? [],
  };
}
