import {
  createGenerationProviderCapabilities,
  type GenerationProviderRuntimePreflight,
  type GenerationProviderCapabilitiesResponse,
} from '../../../packages/shared/src/providerCapabilities';
import type { CodexRuntimeDoctorReport } from '../../../packages/shared/src';
import type { GrokRuntimeDoctorReport } from './grokRuntimeDoctor';
import type { AntigravityRuntimeDoctorReport } from './antigravityRuntimeDoctor';
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
    missingDetail: 'Start Codex Product Runtime and sign in through Codex.',
  },
  {
    providerId: 'chatgpt',
    label: 'ChatGPT',
    runtimeKind: 'subscription_http',
    hasAdapter: true,
    requiresSecret: true,
    activeDetail: 'ChatGPT session connected. Availability is checked when generating.',
    plannedDetail: 'ChatGPT direct HTTP adapter is available.',
    missingDetail: 'Sign in with ChatGPT in Studio Settings.',
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
  grokRuntime?: GrokRuntimeDoctorReport,
  subscriptionReady?: { codexHttpReady?: boolean; grokHttpReady?: boolean },
  antigravityRuntime?: AntigravityRuntimeDoctorReport,
): GenerationProviderCapabilitiesResponse {
  const readiness = createProviderReadinessMaps(env, grokRuntime, {
    ...subscriptionReady,
    antigravityRuntime,
  });
  readiness.localRuntimeConfigured.codex = codexRuntime?.canRunJobs ?? true;

  return createGenerationProviderCapabilities({
    settings,
    providers: PROVIDER_CAPABILITIES,
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
