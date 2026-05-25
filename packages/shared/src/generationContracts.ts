export const GENERATION_TASK_SPEC_VERSION = 'generation-task-spec/v1' as const;

export const GENERATION_TASK_KINDS = [
  'image_generate',
  'image_edit',
  'style_preset_card',
  'sprite_sheet',
  'texture_generate',
] as const;

export type GenerationTaskKind = (typeof GENERATION_TASK_KINDS)[number];

export const BUILT_IN_GENERATION_PROVIDERS = [
  'codex',
  'google',
  'fal',
  'comfy',
  'dry_run',
] as const;

export type BuiltInGenerationProvider = (typeof BUILT_IN_GENERATION_PROVIDERS)[number];
export type GenerationProviderId = BuiltInGenerationProvider | (string & {});

export type ProviderRuntimeKind = 'codex_app_server' | 'hosted_api' | 'local_workflow' | 'dry_run';

export type CompiledProviderPayloadKind =
  | 'codex_prompt'
  | 'api_request'
  | 'comfy_workflow'
  | 'dry_run';

export interface GenerationTaskAssetRef {
  role: 'input' | 'reference' | 'mask' | 'control' | 'external_output';
  name: string;
  dataUrl?: string;
  catalogId?: string;
  localPath?: string;
  sourceUrl?: string;
  strength?: number;
}

export interface GenerationOutputContract {
  count: number;
  aspectRatio: string | null;
  imageSize: string | null;
  mimeType: string | null;
  requiresLocalAsset: boolean;
  requiresCatalogEntry: boolean;
  requiresExactPath: boolean;
}

export interface GenerationTaskSpec {
  id: string;
  version: typeof GENERATION_TASK_SPEC_VERSION;
  task: GenerationTaskKind;
  providerId: GenerationProviderId | null;
  prompt: string;
  negativePrompt: string | null;
  recipeId: string | null;
  recipeParams: Record<string, unknown> | null;
  stylePresetId: string | null;
  assets: GenerationTaskAssetRef[];
  output: GenerationOutputContract;
  metadata: Record<string, unknown>;
}

export interface CreateGenerationTaskSpecInput {
  id: string;
  task: GenerationTaskKind;
  providerId?: GenerationProviderId | null;
  prompt: string;
  negativePrompt?: string | null;
  recipeId?: string | null;
  recipeParams?: Record<string, unknown> | null;
  stylePresetId?: string | null;
  assets?: GenerationTaskAssetRef[];
  output?: Partial<GenerationOutputContract>;
  metadata?: Record<string, unknown>;
}

export interface ProviderSessionContract {
  id: string;
  providerId: GenerationProviderId;
  version: string;
  stableInstructions: string[];
  outputRules: string[];
}

export interface CreateProviderSessionContractInput {
  id: string;
  providerId: GenerationProviderId;
  version?: string;
  stableInstructions?: string[];
  outputRules?: string[];
}

export interface CompiledProviderInput<TPayload = unknown> {
  providerId: GenerationProviderId;
  contractId: string | null;
  sourceSpecId: string;
  task: GenerationTaskKind;
  payloadKind: CompiledProviderPayloadKind;
  payload: TPayload;
  audit: {
    compact: boolean;
    omittedStableInstructions: boolean;
    estimatedPromptChars: number | null;
  };
}

export interface CreateCompiledProviderInputArgs<TPayload = unknown> {
  providerId: GenerationProviderId;
  contract?: ProviderSessionContract | null;
  sourceSpec: GenerationTaskSpec;
  payloadKind: CompiledProviderPayloadKind;
  payload: TPayload;
  compact?: boolean;
  omittedStableInstructions?: boolean;
  estimatedPromptChars?: number | null;
}

const DEFAULT_OUTPUT_CONTRACT: GenerationOutputContract = {
  count: 1,
  aspectRatio: null,
  imageSize: null,
  mimeType: null,
  requiresLocalAsset: true,
  requiresCatalogEntry: true,
  requiresExactPath: true,
};

function cleanOptionalString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function isBuiltInGenerationProvider(
  providerId: string,
): providerId is BuiltInGenerationProvider {
  return BUILT_IN_GENERATION_PROVIDERS.includes(providerId as BuiltInGenerationProvider);
}

export function isGenerationTaskKind(value: string): value is GenerationTaskKind {
  return GENERATION_TASK_KINDS.includes(value as GenerationTaskKind);
}

export function createGenerationTaskSpec({
  id,
  task,
  providerId = null,
  prompt,
  negativePrompt = null,
  recipeId = null,
  recipeParams = null,
  stylePresetId = null,
  assets = [],
  output = {},
  metadata = {},
}: CreateGenerationTaskSpecInput): GenerationTaskSpec {
  const cleanedPrompt = prompt.trim();
  if (!cleanedPrompt) {
    throw new Error('Generation Task Spec requires a prompt.');
  }

  return {
    id,
    version: GENERATION_TASK_SPEC_VERSION,
    task,
    providerId,
    prompt: cleanedPrompt,
    negativePrompt: cleanOptionalString(negativePrompt),
    recipeId: cleanOptionalString(recipeId),
    recipeParams,
    stylePresetId: cleanOptionalString(stylePresetId),
    assets,
    output: {
      ...DEFAULT_OUTPUT_CONTRACT,
      ...output,
      count: output.count ?? DEFAULT_OUTPUT_CONTRACT.count,
      aspectRatio: output.aspectRatio ?? DEFAULT_OUTPUT_CONTRACT.aspectRatio,
      imageSize: output.imageSize ?? DEFAULT_OUTPUT_CONTRACT.imageSize,
      mimeType: output.mimeType ?? DEFAULT_OUTPUT_CONTRACT.mimeType,
      requiresLocalAsset: output.requiresLocalAsset ?? DEFAULT_OUTPUT_CONTRACT.requiresLocalAsset,
      requiresCatalogEntry:
        output.requiresCatalogEntry ?? DEFAULT_OUTPUT_CONTRACT.requiresCatalogEntry,
      requiresExactPath: output.requiresExactPath ?? DEFAULT_OUTPUT_CONTRACT.requiresExactPath,
    },
    metadata,
  };
}

export function createProviderSessionContract({
  id,
  providerId,
  version = 'v1',
  stableInstructions = [],
  outputRules = [],
}: CreateProviderSessionContractInput): ProviderSessionContract {
  return {
    id,
    providerId,
    version,
    stableInstructions: stableInstructions.map((item) => item.trim()).filter(Boolean),
    outputRules: outputRules.map((item) => item.trim()).filter(Boolean),
  };
}

export function createCompiledProviderInput<TPayload>({
  providerId,
  contract = null,
  sourceSpec,
  payloadKind,
  payload,
  compact = true,
  omittedStableInstructions = Boolean(contract),
  estimatedPromptChars = null,
}: CreateCompiledProviderInputArgs<TPayload>): CompiledProviderInput<TPayload> {
  return {
    providerId,
    contractId: contract?.id ?? null,
    sourceSpecId: sourceSpec.id,
    task: sourceSpec.task,
    payloadKind,
    payload,
    audit: {
      compact,
      omittedStableInstructions,
      estimatedPromptChars,
    },
  };
}
