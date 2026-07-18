import type { CompiledProviderInput, GenerationProviderId } from '../../../../packages/shared/src';
import type { TurnResult } from '../codex/turn';
import { createComfyWorkflowExecutor } from './comfyExecutor';
import { createFalImageExecutor } from './falExecutor';
import { createGoogleImageExecutor } from './googleExecutor';
import {
  getExternalProviderRuntimePreflight,
  isExternalExecutableProviderId,
  type ExternalExecutableProviderId,
  type ProviderRuntimePreflight,
} from './runtimeConfig';
import { compileProviderInputForJob } from './providerInputCompiler';
import type { GenerationProvider, GenerationProviderJob } from './types';

export interface ExternalProviderExecutionContext {
  providerId: ExternalExecutableProviderId;
  job: GenerationProviderJob;
  compiledInput: CompiledProviderInput;
  preflight: ProviderRuntimePreflight;
}

export type ExternalProviderExecutor = (
  context: ExternalProviderExecutionContext,
) => Promise<TurnResult>;

export interface CreateExternalGenerationProviderDependencies {
  readPreflight?: (providerId: GenerationProviderId) => ProviderRuntimePreflight | null;
  execute?: ExternalProviderExecutor;
  createExecutor?: (providerId: ExternalExecutableProviderId) => ExternalProviderExecutor | null;
}

function createDefaultExecutor(providerId: ExternalExecutableProviderId) {
  switch (providerId) {
    case 'google':
      return createGoogleImageExecutor();
    case 'fal':
      return createFalImageExecutor();
    case 'comfy':
      return createComfyWorkflowExecutor();
  }
}

function formatPreflightDiagnostics(preflight: ProviderRuntimePreflight) {
  return preflight.diagnostics.length > 0
    ? preflight.diagnostics.join(' ')
    : 'Provider runtime is not ready.';
}

export function createExternalGenerationProvider({
  readPreflight = getExternalProviderRuntimePreflight,
  execute,
  createExecutor = createDefaultExecutor,
}: CreateExternalGenerationProviderDependencies = {}): GenerationProvider {
  return {
    id: 'external',
    async run(job) {
      const providerId = job.providerId ?? job.sourceSpec?.providerId;

      if (!isExternalExecutableProviderId(providerId)) {
        throw new Error(`Unsupported external provider: ${providerId ?? 'null'}.`);
      }

      const compiledInput = compileProviderInputForJob(providerId, job);
      const preflight = readPreflight(providerId);

      if (!preflight) {
        throw new Error(`Provider runtime preflight is not registered for ${providerId}.`);
      }

      if (!preflight.canAttemptExecution) {
        throw new Error(
          `Provider runtime preflight failed for ${providerId}: ${formatPreflightDiagnostics(preflight)}`,
        );
      }

      const executor = execute ?? createExecutor(providerId);

      if (!executor) {
        throw new Error(
          `External provider adapter "${providerId}" has no execution executor wired yet. Compiled Provider Input is ready for payload "${compiledInput.payloadKind}".`,
        );
      }

      return executor({
        providerId,
        job,
        compiledInput,
        preflight,
      });
    },
  };
}
