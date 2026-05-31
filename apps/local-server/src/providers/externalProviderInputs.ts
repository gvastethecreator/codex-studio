import {
  createCompiledProviderInput,
  createGenerationTaskSpec,
  createProviderSessionContract,
  composeGenerationQualityPromptSections,
  type CompiledProviderInput,
  type GenerationOutputContract,
  type GenerationProviderId,
  type GenerationTaskAssetRef,
  type GenerationTaskKind,
  type GenerationTaskSpec,
} from '../../../../packages/shared/src/generationContracts';
import {
  isRecipeProviderDirectives,
  serializeRecipeProviderDirectives,
} from '../../../../packages/shared/src/recipeProviderDirectives';
import type { GenerationProviderJob } from './types';

export type HostedImageApiProviderId = 'google' | 'fal';

export interface ProviderAssetInputRef {
  role: GenerationTaskAssetRef['role'];
  name: string;
  catalogId: string | null;
  localPath: string | null;
  sourceUrl: string | null;
  strength: number | null;
  hasInlineData: boolean;
}

export interface HostedImageApiCompiledPayload {
  apiFamily: 'google_image' | 'fal_image';
  model: string | null;
  prompt: string;
  negativePrompt: string | null;
  output: GenerationOutputContract;
  assets: ProviderAssetInputRef[];
  metadata: {
    recipeId: string | null;
    stylePresetId: string | null;
    sourceProviderId: GenerationProviderId | null;
    qualityPresetId: string | null;
    hasQualityIntent: boolean;
    hasRecipeProviderDirectives: boolean;
  };
}

export interface ComfyWorkflowCompiledPayload {
  workflowPreset: GenerationTaskKind;
  model: string | null;
  prompt: string;
  negativePrompt: string | null;
  output: GenerationOutputContract;
  assets: ProviderAssetInputRef[];
  metadata: {
    recipeId: string | null;
    stylePresetId: string | null;
    sourceProviderId: GenerationProviderId | null;
    qualityPresetId: string | null;
    hasQualityIntent: boolean;
    hasRecipeProviderDirectives: boolean;
  };
}

export type HostedImageApiCompiledInput = CompiledProviderInput<HostedImageApiCompiledPayload>;
export type ComfyWorkflowCompiledInput = CompiledProviderInput<ComfyWorkflowCompiledPayload>;

export const GOOGLE_IMAGE_API_SESSION_CONTRACT = createProviderSessionContract({
  id: 'google-image-api-v1',
  providerId: 'google',
  stableInstructions: [
    'Use the backend Google image adapter for hosted image generation.',
    'Read Provider Secrets from backend configuration only.',
    'Do not serialize API keys or user secrets into compiled provider inputs.',
    'Upload local assets through an adapter-managed asset step before API execution.',
  ],
  outputRules: ['Return imported Local Assets and Catalog Entries through the standard job flow.'],
});

export const FAL_IMAGE_API_SESSION_CONTRACT = createProviderSessionContract({
  id: 'fal-image-api-v1',
  providerId: 'fal',
  stableInstructions: [
    'Use the backend fal.ai adapter for hosted image generation.',
    'Read Provider Secrets from backend configuration only.',
    'Do not serialize API keys or user secrets into compiled provider inputs.',
    'Upload local assets through an adapter-managed asset step before API execution.',
  ],
  outputRules: ['Return imported Local Assets and Catalog Entries through the standard job flow.'],
});

export const COMFY_WORKFLOW_SESSION_CONTRACT = createProviderSessionContract({
  id: 'comfy-workflow-v1',
  providerId: 'comfy',
  stableInstructions: [
    'Use the backend ComfyUI adapter for local workflow execution.',
    'Resolve workflow templates and node mappings inside the adapter.',
    'Do not serialize provider endpoints or local runtime credentials into compiled provider inputs.',
    'Import resulting files into the Studio Library before catalog operations.',
  ],
  outputRules: ['Return imported Local Assets and Catalog Entries through the standard job flow.'],
});

export function compileGoogleImageApiInput(
  job: GenerationProviderJob,
): HostedImageApiCompiledInput {
  return compileHostedImageApiInput({
    job,
    providerId: 'google',
    apiFamily: 'google_image',
    contract: GOOGLE_IMAGE_API_SESSION_CONTRACT,
  });
}

export function compileFalImageApiInput(job: GenerationProviderJob): HostedImageApiCompiledInput {
  return compileHostedImageApiInput({
    job,
    providerId: 'fal',
    apiFamily: 'fal_image',
    contract: FAL_IMAGE_API_SESSION_CONTRACT,
  });
}

export function compileComfyWorkflowInput(job: GenerationProviderJob): ComfyWorkflowCompiledInput {
  const sourceSpec = resolveSourceSpec(job, 'comfy');
  const prompt = buildProviderPrompt(sourceSpec);
  const payload: ComfyWorkflowCompiledPayload = {
    workflowPreset: sourceSpec.task,
    model: job.execution?.model ?? null,
    prompt,
    negativePrompt: sourceSpec.negativePrompt,
    output: sourceSpec.output,
    assets: summarizeAssets(sourceSpec.assets),
    metadata: createProviderPayloadMetadata(sourceSpec),
  };

  return createCompiledProviderInput({
    providerId: 'comfy',
    contract: COMFY_WORKFLOW_SESSION_CONTRACT,
    sourceSpec,
    payloadKind: 'comfy_workflow',
    payload,
    estimatedPromptChars: estimatePromptChars(sourceSpec, prompt),
  });
}

function compileHostedImageApiInput({
  job,
  providerId,
  apiFamily,
  contract,
}: {
  job: GenerationProviderJob;
  providerId: HostedImageApiProviderId;
  apiFamily: HostedImageApiCompiledPayload['apiFamily'];
  contract: typeof GOOGLE_IMAGE_API_SESSION_CONTRACT;
}): HostedImageApiCompiledInput {
  const sourceSpec = resolveSourceSpec(job, providerId);
  const prompt = buildProviderPrompt(sourceSpec);
  const payload: HostedImageApiCompiledPayload = {
    apiFamily,
    model: job.execution?.model ?? null,
    prompt,
    negativePrompt: sourceSpec.negativePrompt,
    output: sourceSpec.output,
    assets: summarizeAssets(sourceSpec.assets),
    metadata: createProviderPayloadMetadata(sourceSpec),
  };

  return createCompiledProviderInput({
    providerId,
    contract,
    sourceSpec,
    payloadKind: 'api_request',
    payload,
    estimatedPromptChars: estimatePromptChars(sourceSpec, prompt),
  });
}

function resolveSourceSpec(
  job: GenerationProviderJob,
  providerId: GenerationProviderId,
): GenerationTaskSpec {
  return (
    job.sourceSpec ??
    createGenerationTaskSpec({
      id: job.id,
      task: 'image_generate',
      providerId,
      prompt: job.prompt,
    })
  );
}

function summarizeAssets(assets: GenerationTaskAssetRef[]): ProviderAssetInputRef[] {
  return assets.map((asset) => ({
    role: asset.role,
    name: asset.name,
    catalogId: asset.catalogId ?? null,
    localPath: asset.localPath ?? null,
    sourceUrl: asset.sourceUrl ?? null,
    strength: asset.strength ?? null,
    hasInlineData: Boolean(asset.dataUrl),
  }));
}

function createProviderPayloadMetadata(sourceSpec: GenerationTaskSpec) {
  return {
    recipeId: sourceSpec.recipeId,
    stylePresetId: sourceSpec.stylePresetId,
    sourceProviderId: sourceSpec.providerId,
    qualityPresetId: sourceSpec.quality?.qualityPresetId ?? null,
    hasQualityIntent: Boolean(sourceSpec.quality),
    hasRecipeProviderDirectives: isRecipeProviderDirectives(
      sourceSpec.metadata.recipeProviderDirectives,
    ),
  };
}

function buildProviderPrompt(sourceSpec: GenerationTaskSpec) {
  const recipeProviderDirectives = sourceSpec.metadata.recipeProviderDirectives;
  const variationBrief =
    typeof sourceSpec.metadata.variationBrief === 'string'
      ? sourceSpec.metadata.variationBrief.trim()
      : '';
  const sections = [sourceSpec.prompt];
  const qualitySections = composeGenerationQualityPromptSections(sourceSpec);

  if (qualitySections.length > 0) {
    sections.push('', ...qualitySections);
  }

  if (!isRecipeProviderDirectives(recipeProviderDirectives)) {
    if (variationBrief) {
      sections.push('', 'Variation brief:', variationBrief);
    }

    return sections.join('\n');
  }

  sections.push(
    '',
    'Recipe directives:',
    serializeRecipeProviderDirectives(recipeProviderDirectives),
  );

  if (variationBrief) {
    sections.push('', 'Variation brief:', variationBrief);
  }

  return sections.join('\n');
}

function estimatePromptChars(sourceSpec: GenerationTaskSpec, prompt: string) {
  return prompt.length + (sourceSpec.negativePrompt?.length ?? 0);
}
