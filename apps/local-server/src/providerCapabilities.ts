import {
  createGenerationProviderCapabilities,
  type GenerationProviderRuntimePreflight,
  type GenerationProviderCapabilitiesResponse,
} from '../../../packages/shared/src/providerCapabilities';
import type { CodexRuntimeDoctorReport } from '../../../packages/shared/src';
import type { EditableStudioSettings } from '../../../packages/shared/src/studioSettings';
import type { GenerationProviderId } from '../../../packages/shared/src/generationContracts';
import type { ProviderCapabilityDefinition } from '../../../packages/shared/src';
import { createProviderReadinessMaps } from './providers/runtimeConfig';

const PROVIDER_CAPABILITIES: ProviderCapabilityDefinition[] = [
  {
    providerId: 'codex',
    label: 'Codex app-server',
    runtimeKind: 'codex_app_server',
    hasAdapter: true,
    requiresSecret: false,
    requiresLocalRuntime: true,
    activeDetail: 'Codex Product Runtime adapter is available.',
    plannedDetail: 'Codex adapter is available.',
    missingDetail: 'Codex Product Runtime is blocked by local runtime preflight.',
  },
  {
    providerId: 'google',
    label: 'Google image API',
    runtimeKind: 'hosted_api',
    hasAdapter: true,
    requiresSecret: true,
    activeDetail: 'Google adapter is available.',
    plannedDetail: 'Google adapter is available once backend Provider Secret is configured.',
    missingDetail: 'Add a backend Google API key before enabling this adapter.',
  },
  {
    providerId: 'fal',
    label: 'fal.ai',
    runtimeKind: 'hosted_api',
    hasAdapter: true,
    requiresSecret: true,
    activeDetail: 'fal.ai adapter is available.',
    plannedDetail: 'fal.ai adapter is available once the backend Provider Secret is configured.',
    missingDetail: 'Add a backend FAL_KEY or FAL_API_KEY before enabling this adapter.',
  },
  {
    providerId: 'comfy',
    label: 'ComfyUI local',
    runtimeKind: 'local_workflow',
    hasAdapter: true,
    requiresSecret: false,
    requiresLocalRuntime: true,
    activeDetail: 'ComfyUI adapter is available.',
    plannedDetail:
      'Local runtime endpoint detected. Configure the workflow template before enabling this adapter.',
    missingDetail:
      'Configure a backend ComfyUI endpoint and workflow template before enabling this adapter.',
  },
  {
    providerId: 'dry_run',
    label: 'Dry run',
    runtimeKind: 'dry_run',
    hasAdapter: true,
    requiresSecret: false,
    activeDetail: 'Diagnostic local adapter is available.',
    plannedDetail: 'Diagnostic local adapter is available.',
    missingDetail: 'Diagnostic local adapter is available.',
  },
];

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
): GenerationProviderCapabilitiesResponse {
  const readiness = createProviderReadinessMaps(env);
  readiness.localRuntimeConfigured.codex = codexRuntime?.canRunJobs ?? true;

  return createGenerationProviderCapabilities({
    settings,
    providers: PROVIDER_CAPABILITIES,
    secretConfigured: readiness.secretConfigured,
    localRuntimeConfigured: readiness.localRuntimeConfigured,
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
