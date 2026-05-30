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

export type GenerationTaskSpecValidationCode =
  | 'invalid_task_spec'
  | 'invalid_spec_id'
  | 'invalid_batch_id'
  | 'invalid_task'
  | 'invalid_provider'
  | 'invalid_prompt'
  | 'invalid_asset'
  | 'inline_asset_not_hydrated';

export interface GenerationTaskSpecValidationIssue {
  code: GenerationTaskSpecValidationCode;
  message: string;
  field: string;
  safeDetails?: Record<string, unknown>;
}

export interface GenerationTaskSpecValidationOptions {
  requireLocalRunIds?: boolean;
  requireHydratedAssets?: boolean;
  expectedProviderId?: GenerationProviderId | null;
}

export interface ProviderInputMetrics {
  sourceSpecChars: number;
  compiledInputChars: number;
  compiledPayloadChars: number;
  estimatedPromptChars: number | null;
  assetRefCount: number;
  inlineAssetBytesPresent: boolean;
  providerSessionContractId: string | null;
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

function jsonChars(value: unknown) {
  return JSON.stringify(value).length;
}

function readMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === 'string' ? value.trim() : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasAssetLocation(asset: GenerationTaskAssetRef) {
  return Boolean(asset.dataUrl?.trim() || asset.localPath?.trim() || asset.sourceUrl?.trim());
}

function hasInlineAssetBytes(asset: GenerationTaskAssetRef) {
  return /^data:image\/[^;]+;base64,/i.test(asset.dataUrl?.trim() ?? '');
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
    stableInstructions: stableInstructions.flatMap((item) => {
      const trimmed = item.trim();
      return trimmed ? [trimmed] : [];
    }),
    outputRules: outputRules.flatMap((item) => {
      const trimmed = item.trim();
      return trimmed ? [trimmed] : [];
    }),
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

export function validateGenerationTaskSpec(
  spec: GenerationTaskSpec | null | undefined,
  options: GenerationTaskSpecValidationOptions = {},
): GenerationTaskSpecValidationIssue[] {
  const issues: GenerationTaskSpecValidationIssue[] = [];
  if (!spec) {
    return [
      {
        code: 'invalid_task_spec',
        message: 'Generation Task Spec is required.',
        field: 'sourceSpec',
      },
    ];
  }

  if (spec.version !== GENERATION_TASK_SPEC_VERSION) {
    issues.push({
      code: 'invalid_task_spec',
      message: 'Generation Task Spec version is unsupported.',
      field: 'sourceSpec.version',
      safeDetails: { version: spec.version },
    });
  }

  if (!spec.id?.trim()) {
    issues.push({
      code: 'invalid_spec_id',
      message: 'Generation Task Spec id is required.',
      field: 'sourceSpec.id',
    });
  } else if (options.requireLocalRunIds && !/^spec-batch-[a-z0-9-]+$/i.test(spec.id)) {
    issues.push({
      code: 'invalid_spec_id',
      message: 'Local queued Generation Task Spec ids must use the spec-batch-* format.',
      field: 'sourceSpec.id',
      safeDetails: { specId: spec.id },
    });
  }

  if (!isGenerationTaskKind(spec.task)) {
    issues.push({
      code: 'invalid_task',
      message: 'Generation Task must use a provider-independent task kind.',
      field: 'sourceSpec.task',
      safeDetails: { task: spec.task },
    });
  }

  if (spec.providerId !== null && typeof spec.providerId !== 'string') {
    issues.push({
      code: 'invalid_provider',
      message: 'Generation Provider id must be a string or null.',
      field: 'sourceSpec.providerId',
    });
  }
  if (
    options.expectedProviderId !== undefined &&
    spec.providerId !== null &&
    spec.providerId !== options.expectedProviderId
  ) {
    issues.push({
      code: 'invalid_provider',
      message: 'Generation Task Spec providerId must match the job providerId.',
      field: 'sourceSpec.providerId',
      safeDetails: {
        sourceSpecProviderId: spec.providerId,
        expectedProviderId: options.expectedProviderId,
      },
    });
  }

  if (!spec.prompt?.trim()) {
    issues.push({
      code: 'invalid_prompt',
      message: 'Generation Task Spec prompt is required.',
      field: 'sourceSpec.prompt',
    });
  }

  const metadata = isRecord(spec.metadata) ? spec.metadata : {};
  if (!isRecord(spec.metadata)) {
    issues.push({
      code: 'invalid_task_spec',
      message: 'Generation Task Spec metadata must be an object.',
      field: 'sourceSpec.metadata',
    });
  }

  const batchId = readMetadataString(metadata, 'batchId');
  if (options.requireLocalRunIds || batchId) {
    if (!batchId) {
      issues.push({
        code: 'invalid_batch_id',
        message: 'Local queued Generation Task Specs require metadata.batchId.',
        field: 'sourceSpec.metadata.batchId',
      });
    } else if (!/^batch-[a-z0-9-]+$/i.test(batchId)) {
      issues.push({
        code: 'invalid_batch_id',
        message: 'Local queued batch ids must use the batch-* format.',
        field: 'sourceSpec.metadata.batchId',
        safeDetails: { batchId },
      });
    }
  }

  if (!Array.isArray(spec.assets)) {
    issues.push({
      code: 'invalid_asset',
      message: 'Generation Task Spec assets must be an array.',
      field: 'sourceSpec.assets',
    });
    return issues;
  }

  spec.assets.forEach((asset, index) => {
    const field = `sourceSpec.assets.${index}`;
    if (!isRecord(asset)) {
      issues.push({
        code: 'invalid_asset',
        message: 'Generation Task asset must be an object.',
        field,
      });
      return;
    }
    if (!asset.name?.trim()) {
      issues.push({
        code: 'invalid_asset',
        message: 'Generation Task asset name is required.',
        field: `${field}.name`,
      });
    }
    if (!hasAssetLocation(asset)) {
      issues.push({
        code: 'invalid_asset',
        message: 'Generation Task asset requires dataUrl, localPath, or sourceUrl.',
        field,
        safeDetails: { role: asset.role, name: asset.name },
      });
    }
    if (options.requireHydratedAssets && hasInlineAssetBytes(asset)) {
      issues.push({
        code: 'inline_asset_not_hydrated',
        message: 'Inline image asset must be persisted to localPath before provider execution.',
        field: `${field}.dataUrl`,
        safeDetails: { role: asset.role, name: asset.name },
      });
    }
  });

  return issues;
}

export function createProviderInputMetrics(
  sourceSpec: GenerationTaskSpec,
  compiledInput: CompiledProviderInput,
): ProviderInputMetrics {
  return {
    sourceSpecChars: jsonChars(sourceSpec),
    compiledInputChars: jsonChars(compiledInput),
    compiledPayloadChars: jsonChars(compiledInput.payload),
    estimatedPromptChars: compiledInput.audit.estimatedPromptChars,
    assetRefCount: sourceSpec.assets.length,
    inlineAssetBytesPresent: sourceSpec.assets.some(hasInlineAssetBytes),
    providerSessionContractId: compiledInput.contractId,
  };
}
