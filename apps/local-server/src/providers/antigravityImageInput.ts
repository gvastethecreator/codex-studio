import {
  composeGenerationQualityPromptSections,
  createCompiledProviderInput,
  createGenerationTaskSpec,
  createProviderSessionContract,
  type CompiledProviderInput,
  type GenerationOutputContract,
  type GenerationTaskAssetRef,
  type GenerationTaskSpec,
} from '../../../../packages/shared/src/generationContracts';
import {
  isRecipeProviderDirectives,
  serializeRecipeProviderDirectives,
} from '../../../../packages/shared/src/recipeProviderDirectives';
import type { ProviderAssetInputRef } from './externalProviderInputs';
import type { GenerationProviderJob } from './types';

export type AntigravityImageOperation = 'image_generate' | 'image_edit';

export interface AntigravityImageCompiledPayload {
  operation: AntigravityImageOperation;
  model: string | null;
  reasoningEffort: string | null;
  prompt: string;
  output: GenerationOutputContract;
  assets: ProviderAssetInputRef[];
}

export type AntigravityImageCompiledInput = CompiledProviderInput<AntigravityImageCompiledPayload>;

export const ANTIGRAVITY_IMAGE_SESSION_CONTRACT = createProviderSessionContract({
  id: 'antigravity-image-cli-v1',
  providerId: 'antigravity',
  stableInstructions: [
    'Use the authenticated local Antigravity CLI session.',
    'Run one fresh bounded headless conversation per Persistent Job.',
    'Call generate_image exactly once and reject all other tool calls.',
    'Use sandbox mode and never bypass Antigravity permissions.',
    'Do not read, store, copy, or expose Antigravity authentication material.',
  ],
  outputRules: [
    'Require exactly one generated image from the matching conversation artifact directory.',
    'Import the validated image into the Studio Library before Catalog finalization.',
  ],
});

function resolveSourceSpec(job: GenerationProviderJob): GenerationTaskSpec {
  return (
    job.sourceSpec ??
    createGenerationTaskSpec({
      id: job.id,
      task: 'image_generate',
      providerId: 'antigravity',
      prompt: job.prompt,
    })
  );
}

function summarizeAssets(assets: GenerationTaskAssetRef[]): ProviderAssetInputRef[] {
  return assets.map((asset) => ({
    role: asset.role,
    name: asset.name,
    catalogId: asset.catalogId ?? null,
    localPath: asset.localPath?.trim() || null,
    sourceUrl: asset.sourceUrl?.trim() || null,
    strength: asset.strength ?? null,
    hasInlineData: Boolean(asset.dataUrl),
  }));
}

function buildAntigravityPrompt(sourceSpec: GenerationTaskSpec) {
  const sections = [sourceSpec.prompt];
  const quality = composeGenerationQualityPromptSections(sourceSpec);
  if (quality.length > 0) sections.push('', ...quality);
  const recipeDirectives = sourceSpec.metadata.recipeProviderDirectives;
  if (isRecipeProviderDirectives(recipeDirectives)) {
    sections.push('', 'Recipe directives:', serializeRecipeProviderDirectives(recipeDirectives));
  }
  const variationBrief = sourceSpec.metadata.variationBrief;
  if (typeof variationBrief === 'string' && variationBrief.trim()) {
    sections.push('', 'Variation brief:', variationBrief.trim());
  }
  if (sourceSpec.negativePrompt) sections.push('', 'Avoid:', sourceSpec.negativePrompt);
  return sections.join('\n');
}

export function compileAntigravityImageInput(
  job: GenerationProviderJob,
): AntigravityImageCompiledInput {
  const sourceSpec = resolveSourceSpec(job);
  const assets = summarizeAssets(sourceSpec.assets);
  const operation: AntigravityImageOperation =
    sourceSpec.task === 'image_edit' || assets.length > 0 ? 'image_edit' : 'image_generate';
  const prompt = buildAntigravityPrompt(sourceSpec);
  return createCompiledProviderInput({
    providerId: 'antigravity',
    contract: ANTIGRAVITY_IMAGE_SESSION_CONTRACT,
    sourceSpec,
    payloadKind: 'agent_cli_prompt',
    payload: {
      operation,
      model: job.execution?.model?.trim() || null,
      reasoningEffort: job.execution?.reasoningEffort?.trim() || null,
      prompt,
      output: sourceSpec.output,
      assets,
    },
    estimatedPromptChars: prompt.length,
  });
}
