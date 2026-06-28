import type { GenerationProviderId, ProviderRuntimeKind } from './generationContracts';
import type { EditableStudioSettings } from './studioSettings';

export type ProviderCapabilityStatus = 'active' | 'planned' | 'not_configured';
export type ProviderSecretState = 'not_required' | 'configured' | 'missing';
export type ProviderLocalRuntimeState = 'not_required' | 'configured' | 'missing' | 'invalid';

export interface GenerationProviderCapability {
  providerId: GenerationProviderId;
  label: string;
  runtimeKind: ProviderRuntimeKind;
  status: ProviderCapabilityStatus;
  isDefault: boolean;
  hasAdapter: boolean;
  canExecute: boolean;
  secretState: ProviderSecretState;
  detail: string;
}

export interface GenerationProviderCapabilitiesResponse {
  providers: GenerationProviderCapability[];
}

export interface GenerationProviderRuntimePreflight {
  providerId: GenerationProviderId;
  runtimeKind: ProviderRuntimeKind;
  secretState: ProviderSecretState;
  secretSource: string | null;
  localRuntimeState: ProviderLocalRuntimeState;
  localRuntimeSource: string | null;
  canAttemptExecution: boolean;
  diagnostics: string[];
}

export interface GenerationProviderRuntimePreflightResponse {
  providers: GenerationProviderRuntimePreflight[];
}

export interface CreateProviderCapabilitiesInput {
  settings: Pick<EditableStudioSettings, 'defaultProviderId'>;
  secretConfigured?: Partial<Record<GenerationProviderId, boolean>>;
  localRuntimeConfigured?: Partial<Record<GenerationProviderId, boolean>>;
  providers?: ProviderCapabilityDefinition[];
}

export interface ProviderCapabilityDefinition {
  providerId: GenerationProviderId;
  label: string;
  runtimeKind: ProviderRuntimeKind;
  hasAdapter: boolean;
  requiresSecret: boolean;
  requiresLocalRuntime?: boolean;
  activeDetail: string;
  plannedDetail: string;
  missingDetail: string;
}

const PROVIDERS: ProviderCapabilityDefinition[] = [
  {
    providerId: 'codex',
    label: 'Codex app-server',
    runtimeKind: 'codex_app_server',
    hasAdapter: true,
    requiresSecret: false,
    activeDetail: 'Codex Product Runtime adapter is available.',
    plannedDetail: 'Codex adapter is available.',
    missingDetail: 'Codex adapter is available.',
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
    plannedDetail:
      'API key detected. Compiler and preflight are ready; execution executor is still planned.',
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

function resolveSecretState(requiresSecret: boolean, configured: boolean): ProviderSecretState {
  if (!requiresSecret) return 'not_required';
  return configured ? 'configured' : 'missing';
}

export function createGenerationProviderCapabilities({
  settings,
  secretConfigured = {},
  localRuntimeConfigured = {},
  providers = PROVIDERS,
}: CreateProviderCapabilitiesInput): GenerationProviderCapabilitiesResponse {
  return {
    providers: providers.map((provider) => {
      const secretReady = Boolean(secretConfigured[provider.providerId]);
      const runtimeReady = provider.requiresLocalRuntime
        ? Boolean(localRuntimeConfigured[provider.providerId])
        : true;
      const configured = (!provider.requiresSecret || secretReady) && runtimeReady;
      const canExecute = provider.hasAdapter && configured;
      const status: ProviderCapabilityStatus = canExecute
        ? 'active'
        : configured
          ? 'planned'
          : 'not_configured';

      return {
        providerId: provider.providerId,
        label: provider.label,
        runtimeKind: provider.runtimeKind,
        status,
        isDefault: settings.defaultProviderId === provider.providerId,
        hasAdapter: provider.hasAdapter,
        canExecute,
        secretState: resolveSecretState(provider.requiresSecret, secretReady),
        detail:
          status === 'active'
            ? provider.activeDetail
            : status === 'planned'
              ? provider.plannedDetail
              : provider.missingDetail,
      };
    }),
  };
}
