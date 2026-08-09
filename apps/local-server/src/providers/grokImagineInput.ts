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

export type GrokImagineOperation = 'image_generate' | 'image_edit';

export interface GrokImagineCompiledPayload {
  operation: GrokImagineOperation;
  model: string | null;
  reasoningEffort: string | null;
  prompt: string;
  output: GenerationOutputContract;
  assets: ProviderAssetInputRef[];
}

export type GrokImagineCompiledInput = CompiledProviderInput<GrokImagineCompiledPayload>;

export const GROK_IMAGINE_SESSION_CONTRACT = createProviderSessionContract({
  id: 'grok-imagine-cli-v1',
  providerId: 'grok',
  stableInstructions: [
    'Use the authenticated local Grok Build CLI session.',
    'Run one fresh bounded headless session per Persistent Job.',
    'Allow only image_gen or image_edit for the selected operation.',
    'Do not use shell, file editing, web search, memory, plans, or subagents.',
    'Do not read, store, or expose Grok authentication material.',
  ],
  outputRules: [
    'Require exactly one generated image and copy it into the Studio Library before Catalog finalization.',
  ],
});

function resolveSourceSpec(job: GenerationProviderJob): GenerationTaskSpec {
  return (
    job.sourceSpec ??
    createGenerationTaskSpec({
      id: job.id,
      task: 'image_generate',
      providerId: 'grok',
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

function buildGrokPrompt(sourceSpec: GenerationTaskSpec) {
  const sections = [sourceSpec.prompt];
  const quality = composeGenerationQualityPromptSections(sourceSpec);
  if (quality.length > 0) sections.push('', ...quality);

  const recipeDirectives = sourceSpec.metadata.recipeProviderDirectives;
  const recipeContext = sourceSpec.metadata.recipeContext;
  if (isRecipeProviderDirectives(recipeDirectives)) {
    sections.push('', 'Recipe directives:', serializeRecipeProviderDirectives(recipeDirectives));
  } else if (typeof recipeContext === 'string' && recipeContext.trim()) {
    sections.push('', 'Recipe instructions:', recipeContext.trim());
  }

  const variationBrief = sourceSpec.metadata.variationBrief;
  if (typeof variationBrief === 'string' && variationBrief.trim()) {
    sections.push('', 'Variation brief:', variationBrief.trim());
  }
  if (sourceSpec.negativePrompt) sections.push('', 'Avoid:', sourceSpec.negativePrompt);
  if (sourceSpec.output.imageSize) {
    sections.push('', 'Requested image size (best effort):', sourceSpec.output.imageSize);
  }
  return sections.join('\n');
}

export function compileGrokImagineInput(job: GenerationProviderJob): GrokImagineCompiledInput {
  const sourceSpec = resolveSourceSpec(job);
  const assets = summarizeAssets(sourceSpec.assets);
  const operation: GrokImagineOperation =
    sourceSpec.task === 'image_edit' || assets.length > 0 ? 'image_edit' : 'image_generate';
  const prompt = buildGrokPrompt(sourceSpec);

  return createCompiledProviderInput({
    providerId: 'grok',
    contract: GROK_IMAGINE_SESSION_CONTRACT,
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
