import {
  createGenerationProviderCapabilities,
  type GenerationProviderCapabilitiesResponse,
} from '../../../packages/shared/src/providerCapabilities';
import type { EditableStudioSettings } from '../../../packages/shared/src/studioSettings';
import type { GenerationProviderId } from '../../../packages/shared/src/generationContracts';
import { listProviderCapabilityDefinitions } from './providers/providerRegistry';
import { createProviderReadinessMaps } from './providers/runtimeConfig';

export interface ProviderExecutionBlocker {
  error: string;
  providerId: GenerationProviderId;
  status: string;
  detail: string;
}

export function readProviderCapabilities(
  settings: Pick<EditableStudioSettings, 'defaultProviderId'>,
  env: Record<string, string | undefined> = process.env,
): GenerationProviderCapabilitiesResponse {
  const readiness = createProviderReadinessMaps(env);

  return createGenerationProviderCapabilities({
    settings,
    providers: listProviderCapabilityDefinitions(),
    secretConfigured: readiness.secretConfigured,
    localRuntimeConfigured: readiness.localRuntimeConfigured,
  });
}

export function getProviderExecutionBlocker(
  capabilities: GenerationProviderCapabilitiesResponse,
  providerId: GenerationProviderId,
): ProviderExecutionBlocker | null {
  const capability = capabilities.providers.find((provider) => provider.providerId === providerId);

  if (!capability) {
    return {
      error: 'Provider is not registered.',
      providerId,
      status: 'unknown',
      detail: 'Add the provider to the backend capability catalog before creating jobs.',
    };
  }

  if (capability.canExecute) {
    return null;
  }

  return {
    error: 'Provider cannot execute jobs yet.',
    providerId,
    status: capability.status,
    detail: capability.detail,
  };
}
