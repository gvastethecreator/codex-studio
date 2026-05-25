import type { CompiledProviderInput, GenerationProviderId } from '../../../../packages/shared/src';
import { compileCodexImagegenInput } from './codexProvider';
import { compileDryRunInput } from './dryRunProvider';
import {
  compileComfyWorkflowInput,
  compileFalImageApiInput,
  compileGoogleImageApiInput,
} from './externalProviderInputs';
import type { GenerationProviderJob } from './types';

export type ProviderInputCompiler = (job: GenerationProviderJob) => CompiledProviderInput;

const PROVIDER_INPUT_COMPILERS = {
  codex: compileCodexImagegenInput,
  dry_run: compileDryRunInput,
  google: compileGoogleImageApiInput,
  fal: compileFalImageApiInput,
  comfy: compileComfyWorkflowInput,
} satisfies Record<string, ProviderInputCompiler>;

export type CompilableProviderId = keyof typeof PROVIDER_INPUT_COMPILERS;

export function hasProviderInputCompiler(
  providerId: GenerationProviderId,
): providerId is CompilableProviderId {
  return providerId in PROVIDER_INPUT_COMPILERS;
}

export function compileProviderInputForJob(
  providerId: GenerationProviderId,
  job: GenerationProviderJob,
): CompiledProviderInput {
  const compiler = PROVIDER_INPUT_COMPILERS[providerId as CompilableProviderId];

  if (!compiler) {
    throw new Error(`No provider input compiler registered for "${providerId}".`);
  }

  return compiler(job);
}
