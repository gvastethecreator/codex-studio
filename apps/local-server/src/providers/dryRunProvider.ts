import {
  createCompiledProviderInput,
  createGenerationTaskSpec,
  createProviderSessionContract,
  type CompiledProviderInput,
} from '../../../../packages/shared/src';
import type { GenerationProviderJob } from './types';

export type DryRunCompiledInput = CompiledProviderInput<{
  assetKind: 'svg_placeholder';
  promptPreview: string;
}>;

export const DRY_RUN_SESSION_CONTRACT = createProviderSessionContract({
  id: 'dry-run-v1',
  providerId: 'dry_run',
  stableInstructions: [
    'Create a deterministic local placeholder asset.',
    'Never call a hosted API or Codex Product Runtime.',
    'Return a local asset path that can be cataloged by the worker.',
  ],
  outputRules: ['Use SVG placeholder output only.'],
});

export function compileDryRunInput(job: GenerationProviderJob): DryRunCompiledInput {
  const sourceSpec =
    job.sourceSpec ??
    createGenerationTaskSpec({
      id: job.id,
      task: 'image_generate',
      providerId: 'dry_run',
      prompt: job.prompt,
    });

  return createCompiledProviderInput({
    providerId: 'dry_run',
    contract: DRY_RUN_SESSION_CONTRACT,
    sourceSpec,
    payloadKind: 'dry_run',
    payload: {
      assetKind: 'svg_placeholder',
      promptPreview: sourceSpec.prompt.slice(0, 180),
    },
    estimatedPromptChars: sourceSpec.prompt.length,
  });
}
