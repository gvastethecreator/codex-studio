import { createComfyWorkflowExecutor } from './comfyExecutor';
import { createFalImageExecutor } from './falExecutor';
import { createGoogleImageExecutor } from './googleExecutor';
import type { ExternalProviderExecutor } from './externalProvider';
import type { ExternalExecutableProviderId } from './runtimeConfig';

export type ExternalProviderExecutorRegistry = Partial<
  Record<ExternalExecutableProviderId, ExternalProviderExecutor>
>;

export function createDefaultExternalProviderExecutorRegistry(): ExternalProviderExecutorRegistry {
  return {
    google: createGoogleImageExecutor(),
    fal: createFalImageExecutor(),
    comfy: createComfyWorkflowExecutor(),
  };
}
