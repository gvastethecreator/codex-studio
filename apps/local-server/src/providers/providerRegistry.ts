import type {
  GenerationProviderId,
  ProviderCapabilityDefinition,
  ProviderRuntimeKind,
} from '../../../../packages/shared/src';

export type WorkerRuntimeTarget = 'dry_run' | 'codex' | 'external';
export type ExternalExecutableProviderId = 'google' | 'fal' | 'comfy';

export interface ProviderRegistryEntry {
  providerId: GenerationProviderId;
  label: string;
  runtimeKind: ProviderRuntimeKind;
  hasAdapter: boolean;
  requiresSecret: boolean;
  requiresLocalRuntime?: boolean;
  activeDetail: string;
  plannedDetail: string;
  missingDetail: string;
  workerRuntimeTarget: WorkerRuntimeTarget;
  compiler: boolean;
  executor: boolean;
  secretEnvNames: string[];
  localRuntimeEnvNames: string[];
  requiredConfigEnvNames?: string[];
}

const PROVIDER_REGISTRY: ProviderRegistryEntry[] = [
  {
    providerId: 'codex',
    label: 'Codex app-server',
    runtimeKind: 'codex_app_server',
    hasAdapter: true,
    requiresSecret: false,
    activeDetail: 'Codex Product Runtime adapter is available.',
    plannedDetail: 'Codex adapter is available.',
    missingDetail: 'Codex adapter is available.',
    workerRuntimeTarget: 'codex',
    compiler: true,
    executor: true,
    secretEnvNames: [],
    localRuntimeEnvNames: [],
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
    workerRuntimeTarget: 'external',
    compiler: true,
    executor: true,
    secretEnvNames: ['GOOGLE_API_KEY', 'GEMINI_API_KEY', 'NANO_BANANA_API_KEY'],
    localRuntimeEnvNames: [],
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
    workerRuntimeTarget: 'external',
    compiler: true,
    executor: true,
    secretEnvNames: ['FAL_KEY', 'FAL_API_KEY'],
    localRuntimeEnvNames: [],
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
    workerRuntimeTarget: 'external',
    compiler: true,
    executor: true,
    secretEnvNames: [],
    localRuntimeEnvNames: ['COMFY_API_URL', 'COMFYUI_API_URL'],
    requiredConfigEnvNames: ['COMFY_WORKFLOW_TEMPLATE_PATH'],
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
    workerRuntimeTarget: 'dry_run',
    compiler: true,
    executor: true,
    secretEnvNames: [],
    localRuntimeEnvNames: [],
  },
];

export function listProviderRegistryEntries() {
  return PROVIDER_REGISTRY;
}

export function getProviderRegistryEntry(providerId: GenerationProviderId) {
  return PROVIDER_REGISTRY.find((entry) => entry.providerId === providerId) ?? null;
}

export function listProviderCapabilityDefinitions(): ProviderCapabilityDefinition[] {
  return PROVIDER_REGISTRY.map(
    ({
      providerId,
      label,
      runtimeKind,
      hasAdapter,
      requiresSecret,
      requiresLocalRuntime,
      activeDetail,
      plannedDetail,
      missingDetail,
    }) => ({
      providerId,
      label,
      runtimeKind,
      hasAdapter,
      requiresSecret,
      requiresLocalRuntime,
      activeDetail,
      plannedDetail,
      missingDetail,
    }),
  );
}

export function listExternalExecutableProviderEntries() {
  return PROVIDER_REGISTRY.filter(
    (entry): entry is ProviderRegistryEntry & { providerId: ExternalExecutableProviderId } =>
      entry.workerRuntimeTarget === 'external',
  );
}

export function isExternalExecutableProviderId(
  providerId: GenerationProviderId | null | undefined,
): providerId is ExternalExecutableProviderId {
  return Boolean(
    providerId && getProviderRegistryEntry(providerId)?.workerRuntimeTarget === 'external',
  );
}

export function resolveProviderWorkerRuntimeTarget(
  providerId: GenerationProviderId | null | undefined,
): WorkerRuntimeTarget | null {
  if (!providerId) return null;
  return getProviderRegistryEntry(providerId)?.workerRuntimeTarget ?? null;
}

export function hasProviderRegistryCompiler(providerId: GenerationProviderId) {
  return Boolean(getProviderRegistryEntry(providerId)?.compiler);
}
