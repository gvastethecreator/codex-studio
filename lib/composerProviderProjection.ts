import {
  formatCodexModelLabel,
  formatCodexSpeedLabel,
  getCodexReasoningOptions,
  getCodexSpeedOptions,
  pickPreferredCodexModel,
} from './codexExecution';
import {
  listGrokImagineRatioOptions,
  resolveGrokImagineGenerateBlock,
  type GrokImagineGenerateBlock,
} from './grokImagineUiPolicy';
import type {
  CodexModel,
  CodexModelCatalogResponse,
  GenerationProviderId,
} from '../packages/shared/src';
import type { AspectRatio, Attachment, ImageGenerationConfig, RecipeId } from '../types';
import { IMAGE_GEN_RATIO_OPTIONS } from '../utils/imageGenSizing';
import {
  CODEX_HTTP_IMAGE_MODELS,
  CODEX_HTTP_MAX_INPUT_IMAGES,
  CODEX_HTTP_MODEL,
  CODEX_HTTP_REASONING,
  getCodexHttpImageModelOption,
  listCodexHttpImageSizeOptions,
  resolveCodexExecutionPolicy,
  resolveCodexHttpImageSizeTier,
  type CodexExecutionTransport,
  type CodexHttpImageModelOption,
  type CodexHttpImageSizeOption,
} from '../packages/shared/src/codexExecutionContract';
import { MAX_GROK_IMAGINE_SOURCE_IMAGES } from '../packages/shared/src/grokImagineContract';

const EMPTY_CODEX_MODELS: CodexModel[] = [];

export type ComposerProviderKind = 'codex' | 'chatgpt' | 'grok' | 'other';

export const PROVIDER_BATCH_MAX = 10;
export const STUDIO_MAX_INPUT_IMAGES = 10;

export function resolveProviderMaxOutputCount(providerId: GenerationProviderId): number {
  if (providerId === 'grok' || providerId === 'google' || providerId === 'antigravity') return 1;
  if (providerId === 'fal') return 4;
  return PROVIDER_BATCH_MAX;
}

export function resolveProviderMaxInputImages(providerId: GenerationProviderId): number {
  if (providerId === 'grok') return MAX_GROK_IMAGINE_SOURCE_IMAGES;
  if (providerId === 'google' || providerId === 'antigravity') return STUDIO_MAX_INPUT_IMAGES;
  if (providerId === 'codex') return Math.min(STUDIO_MAX_INPUT_IMAGES, CODEX_HTTP_MAX_INPUT_IMAGES);
  return STUDIO_MAX_INPUT_IMAGES;
}

export interface ComposerProviderProjection {
  kind: ComposerProviderKind;
  ratios: typeof IMAGE_GEN_RATIO_OPTIONS;
  showCodexPromptTools: boolean;
  showCodexModelChrome: boolean;
  maxOutputCount: number;
  generateBlock: GrokImagineGenerateBlock | null;
  execution: {
    models: CodexModel[];
    selectedModel: CodexModel | null;
    preferredModelId: string | null;
    availableTransports: CodexExecutionTransport[];
    selectedTransport: CodexExecutionTransport | null;
    imageModels: CodexHttpImageModelOption[];
    selectedImageModel: CodexHttpImageModelOption | null;
    imageSizeOptions: CodexHttpImageSizeOption[];
    selectedImageSize: CodexHttpImageSizeOption | null;
    showImageSizeControl: boolean;
    reasoningOptions: ReturnType<typeof getCodexReasoningOptions>;
    speedOptions: ReturnType<typeof getCodexSpeedOptions>;
    summary: string;
    sourceMessage: string | null;
  };
}

export function resolveComposerProviderKind(
  providerId: GenerationProviderId,
): ComposerProviderKind {
  if (providerId === 'codex') return 'codex';
  if (providerId === 'chatgpt') return 'chatgpt';
  if (providerId === 'grok') return 'grok';
  return 'other';
}

function buildCodexFallbackCatalogErrorMessage(catalog: CodexModelCatalogResponse | null) {
  if (!catalog || catalog.source !== 'fallback' || !catalog.error) {
    return null;
  }

  return 'Using documented catalog while Codex app-server is not responding live.';
}

export function buildComposerProviderProjection({
  providerId,
  recipeId,
  aspectRatio,
  attachments,
  grokCanExecute,
  grokStatus,
  grokDiagnostics,
  codexModelCatalog,
  codexTransport,
  codexAvailableTransports,
  executionModel,
  executionReasoningEffort,
  executionSpeed,
  codexImageModel,
  imageSize,
  catalogError,
}: {
  providerId: GenerationProviderId;
  recipeId: RecipeId;
  aspectRatio: AspectRatio;
  attachments: Attachment[];
  grokCanExecute: boolean;
  grokStatus?: string;
  grokDiagnostics?: string[];
  codexModelCatalog: CodexModelCatalogResponse | null;
  codexTransport?: CodexExecutionTransport | null;
  codexAvailableTransports?: readonly CodexExecutionTransport[];
  executionModel: ImageGenerationConfig['executionModel'];
  executionReasoningEffort: ImageGenerationConfig['executionReasoningEffort'];
  executionSpeed: ImageGenerationConfig['executionSpeed'];
  codexImageModel?: ImageGenerationConfig['codexImageModel'];
  imageSize?: ImageGenerationConfig['imageSize'];
  catalogError: string | null;
}): ComposerProviderProjection {
  const kind = resolveComposerProviderKind(providerId);
  if (kind === 'chatgpt') codexTransport = 'subscription_http';
  else if (kind === 'codex') codexTransport = 'codex_app_server';
  const availableTransports = codexAvailableTransports
    ? [...new Set(codexAvailableTransports)]
    : codexTransport
      ? [codexTransport]
      : [];
  const selectedTransport = codexTransport ?? null;
  const transportAvailabilityKnown = codexAvailableTransports !== undefined;
  const selectedTransportAvailable =
    (kind !== 'codex' && kind !== 'chatgpt') ||
    !selectedTransport ||
    !transportAvailabilityKnown ||
    availableTransports.includes(selectedTransport);
  const isHttp = kind === 'chatgpt';
  const models = isHttp ? [CODEX_HTTP_MODEL] : (codexModelCatalog?.models ?? EMPTY_CODEX_MODELS);
  const preferredModelId = pickPreferredCodexModel(models, executionModel);
  const selectedModel = isHttp
    ? CODEX_HTTP_MODEL
    : (models.find((model) => model.id === executionModel) ?? null);
  const imageModels = isHttp ? [...CODEX_HTTP_IMAGE_MODELS] : [];
  const selectedImageModel = isHttp ? getCodexHttpImageModelOption(codexImageModel) : null;
  const imageSizeOptions = isHttp ? listCodexHttpImageSizeOptions(aspectRatio) : [];
  const selectedImageSizeTier = resolveCodexHttpImageSizeTier(imageSize);
  const selectedImageSize =
    imageSizeOptions.find((option) => option.tier === selectedImageSizeTier) ?? null;
  const effectiveModelId = selectedModel?.id ?? executionModel;
  const effectiveReasoningEffort = isHttp ? CODEX_HTTP_REASONING : executionReasoningEffort;
  const effectiveSpeed = isHttp ? 'standard' : executionSpeed;
  const modelLabel = isHttp
    ? (selectedModel?.displayName ?? CODEX_HTTP_MODEL.displayName)
    : formatCodexModelLabel(effectiveModelId, selectedModel?.displayName);
  const sourceMessage = buildCodexFallbackCatalogErrorMessage(codexModelCatalog) || catalogError;
  let codexBlock: GrokImagineGenerateBlock | null = null;
  let transportSummary =
    codexTransport === 'codex_app_server'
      ? 'Codex app'
      : codexTransport === 'subscription_http'
        ? 'ChatGPT'
        : '';
  if (kind === 'codex' || kind === 'chatgpt') {
    if (!codexTransport)
      codexBlock = {
        code: 'codex_execution_checking',
        message: 'Checking the Codex execution route.',
      };
    else if (!selectedTransportAvailable) {
      codexBlock = {
        code: 'codex_transport_unavailable',
        message:
          codexTransport === 'subscription_http'
            ? 'ChatGPT Sign in is not ready. Sign in again in Studio Settings before generating.'
            : 'Codex app-server is not ready. Start the local Codex runtime before generating.',
      };
      transportSummary =
        codexTransport === 'subscription_http'
          ? 'ChatGPT Sign in · unavailable'
          : 'Codex app-server · unavailable';
    } else if (isHttp) {
      try {
        resolveCodexExecutionPolicy(
          {
            model: effectiveModelId,
            reasoningEffort: effectiveReasoningEffort,
            serviceTier: effectiveSpeed === 'standard' ? null : effectiveSpeed,
            providerOptions: {
              codex: {
                transport: 'subscription_http',
                imageModel: selectedImageModel?.id,
              },
            },
          },
          {
            output: { aspectRatio, imageSize: selectedImageSizeTier },
            assets: attachments,
          },
          codexTransport,
        );
      } catch (error) {
        codexBlock = {
          code: 'codex_execution_unsupported',
          message: error instanceof Error ? error.message : 'Review HTTP execution settings.',
        };
        transportSummary = 'ChatGPT HTTP · review execution settings';
      }
    } else if (
      !selectedModel ||
      !getCodexReasoningOptions(selectedModel).includes(executionReasoningEffort) ||
      !getCodexSpeedOptions(selectedModel).includes(executionSpeed)
    ) {
      codexBlock = {
        code: 'codex_execution_unsupported',
        message: 'Choose a current Codex model, reasoning effort and speed before generating.',
      };
    }
  }

  return {
    kind,
    ratios: kind === 'grok' ? listGrokImagineRatioOptions() : IMAGE_GEN_RATIO_OPTIONS,
    showCodexPromptTools: kind !== 'grok',
    showCodexModelChrome: kind === 'codex' || kind === 'chatgpt',
    maxOutputCount: resolveProviderMaxOutputCount(providerId),
    generateBlock:
      codexBlock ??
      resolveGrokImagineGenerateBlock({
        providerId,
        recipeId,
        aspectRatio,
        attachments,
        canExecute: grokCanExecute,
        status: grokStatus,
        diagnostics: grokDiagnostics,
      }),
    execution: {
      models,
      selectedModel,
      preferredModelId,
      availableTransports,
      selectedTransport,
      imageModels,
      selectedImageModel,
      imageSizeOptions,
      selectedImageSize,
      showImageSizeControl: isHttp,
      reasoningOptions: isHttp ? [CODEX_HTTP_REASONING] : getCodexReasoningOptions(selectedModel),
      speedOptions: isHttp ? ['standard'] : getCodexSpeedOptions(selectedModel),
      summary: [
        modelLabel,
        transportSummary,
        isHttp ? selectedImageModel?.shortName : null,
        isHttp ? selectedImageSizeTier : null,
        isHttp ? 'AUTO' : executionReasoningEffort?.toUpperCase(),
        !isHttp && executionSpeed !== 'standard' ? formatCodexSpeedLabel(executionSpeed) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      sourceMessage: isHttp ? null : sourceMessage,
    },
  };
}
