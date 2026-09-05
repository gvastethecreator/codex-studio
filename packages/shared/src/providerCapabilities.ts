import type { GenerationProviderId, ProviderRuntimeKind } from './generationContracts';
import type { EditableStudioSettings } from './studioSettings';

export type ProviderCapabilityStatus = 'active' | 'planned' | 'not_configured';
export type ProviderSecretState = 'not_required' | 'configured' | 'missing';
export type ProviderLocalRuntimeState = 'not_required' | 'configured' | 'missing' | 'invalid';
export type ProviderSubscriptionAuthState =
  | 'not_applicable'
  | 'logged_out'
  | 'pending'
  | 'logged_in'
  | 'refresh_failed';

export interface GenerationProviderCapability {
  providerId: GenerationProviderId;
  label: string;
  runtimeKind: ProviderRuntimeKind;
  status: ProviderCapabilityStatus;
  isDefault: boolean;
  hasAdapter: boolean;
  canExecute: boolean;
  secretState: ProviderSecretState;
  subscriptionAuthState: ProviderSubscriptionAuthState;
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
  availableModels?: string[];
  defaultModel?: string | null;
}

export interface GenerationProviderRuntimePreflightResponse {
  providers: GenerationProviderRuntimePreflight[];
}

export interface CreateProviderCapabilitiesInput {
  settings: Pick<EditableStudioSettings, 'defaultProviderId'>;
  secretConfigured?: Partial<Record<GenerationProviderId, boolean>>;
  localRuntimeConfigured?: Partial<Record<GenerationProviderId, boolean>>;
  subscriptionAuthConfigured?: Partial<Record<GenerationProviderId, boolean>>;
  subscriptionAuthState?: Partial<Record<GenerationProviderId, ProviderSubscriptionAuthState>>;
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
  subscriptionReadyDetail?: string;
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
    requiresLocalRuntime: true,
    activeDetail: 'Codex Product Runtime adapter is available.',
    subscriptionReadyDetail: 'ChatGPT HTTP is ready. Each job keeps its accepted execution route.',
    plannedDetail: 'Codex adapter is available.',
    missingDetail: 'Sign in with ChatGPT in Studio Settings, or start Codex Product Runtime.',
  },
  {
    providerId: 'grok',
    label: 'Grok Imagine',
    runtimeKind: 'agent_cli',
    hasAdapter: true,
    requiresSecret: false,
    requiresLocalRuntime: true,
    activeDetail: 'Grok Imagine is available through the authenticated local Grok Build CLI.',
    subscriptionReadyDetail: 'xAI HTTP credentials are ready. Grok Build CLI stays as fallback.',
    plannedDetail: 'Grok Imagine adapter is available.',
    missingDetail: 'Sign in with xAI in Studio Settings, set XAI_API_KEY, or install Grok Build.',
  },
  {
    providerId: 'google',
    label: 'Google Nano Banana',
    runtimeKind: 'hosted_api',
    hasAdapter: true,
    requiresSecret: true,
    activeDetail: 'Nano Banana is ready through the Google Interactions API.',
    subscriptionReadyDetail: 'Google OAuth is connected for direct Nano Banana requests.',
    plannedDetail: 'Google Nano Banana adapter is available.',
    missingDetail: 'Add a Google API key or connect Google OAuth in Studio Settings.',
  },
  {
    providerId: 'antigravity',
    label: 'Antigravity',
    runtimeKind: 'agent_cli',
    hasAdapter: true,
    requiresSecret: false,
    requiresLocalRuntime: true,
    activeDetail: 'Antigravity image generation is ready through the authenticated local CLI.',
    plannedDetail: 'Antigravity adapter is available.',
    missingDetail: 'Install Antigravity CLI and complete its local login.',
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

function resolveSubscriptionAuthState(
  providerId: GenerationProviderId,
  subscriptionAuthState: Partial<Record<GenerationProviderId, ProviderSubscriptionAuthState>>,
): ProviderSubscriptionAuthState {
  if (providerId === 'codex' || providerId === 'grok' || providerId === 'google') {
    return subscriptionAuthState[providerId] ?? 'logged_out';
  }
  return 'not_applicable';
}

export function createGenerationProviderCapabilities({
  settings,
  secretConfigured = {},
  localRuntimeConfigured = {},
  subscriptionAuthConfigured = {},
  subscriptionAuthState = {},
  providers = PROVIDERS,
}: CreateProviderCapabilitiesInput): GenerationProviderCapabilitiesResponse {
  return {
    providers: providers.map((provider) => {
      const secretReady = Boolean(secretConfigured[provider.providerId]);
      const subscriptionReady = Boolean(subscriptionAuthConfigured[provider.providerId]);
      const localReady = Boolean(localRuntimeConfigured[provider.providerId]);
      const runtimeReady = provider.requiresLocalRuntime ? localReady || subscriptionReady : true;
      const credentialReady = !provider.requiresSecret || secretReady || subscriptionReady;
      const configured = credentialReady && runtimeReady;
      const canExecute = provider.hasAdapter && configured;
      const status: ProviderCapabilityStatus = canExecute
        ? 'active'
        : configured
          ? 'planned'
          : 'not_configured';
      const runtimeKind =
        subscriptionReady && (provider.providerId === 'codex' || provider.providerId === 'grok')
          ? 'subscription_http'
          : provider.runtimeKind;
      const activeDetail =
        subscriptionReady && provider.subscriptionReadyDetail
          ? provider.subscriptionReadyDetail
          : provider.activeDetail;

      return {
        providerId: provider.providerId,
        label: provider.label,
        runtimeKind,
        status,
        isDefault: settings.defaultProviderId === provider.providerId,
        hasAdapter: provider.hasAdapter,
        canExecute,
        secretState: resolveSecretState(provider.requiresSecret, secretReady),
        subscriptionAuthState: resolveSubscriptionAuthState(
          provider.providerId,
          subscriptionAuthState,
        ),
        detail:
          status === 'active'
            ? activeDetail
            : status === 'planned'
              ? provider.plannedDetail
              : provider.missingDetail,
      };
    }),
  };
}
