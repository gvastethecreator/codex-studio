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
import type { CodexModel, CodexModelCatalogResponse, GenerationProviderId } from '../packages/shared/src';
import type { AspectRatio, Attachment, ImageGenerationConfig, RecipeId } from '../types';
import { IMAGE_GEN_RATIO_OPTIONS } from '../utils/imageGenSizing';

const EMPTY_CODEX_MODELS: CodexModel[] = [];

export type ComposerProviderKind = 'codex' | 'grok' | 'other';

export interface ComposerProviderProjection {
  kind: ComposerProviderKind;
  ratios: typeof IMAGE_GEN_RATIO_OPTIONS;
  showCodexPromptTools: boolean;
  showCodexModelChrome: boolean;
  generateBlock: GrokImagineGenerateBlock | null;
  execution: {
    models: CodexModel[];
    selectedModel: CodexModel | null;
    preferredModelId: string | null;
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
  executionModel,
  executionReasoningEffort,
  executionSpeed,
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
  executionModel: ImageGenerationConfig['executionModel'];
  executionReasoningEffort: ImageGenerationConfig['executionReasoningEffort'];
  executionSpeed: ImageGenerationConfig['executionSpeed'];
  catalogError: string | null;
}): ComposerProviderProjection {
  const kind = resolveComposerProviderKind(providerId);
  const models = codexModelCatalog?.models ?? EMPTY_CODEX_MODELS;
  const preferredModelId = pickPreferredCodexModel(models, executionModel);
  const selectedModel =
    models.find((model) => model.id === executionModel) ??
    models.find((model) => model.id === preferredModelId) ??
    null;
  const modelLabel = formatCodexModelLabel(executionModel, selectedModel?.displayName);
  const sourceMessage = buildCodexFallbackCatalogErrorMessage(codexModelCatalog) || catalogError;

  return {
    kind,
    ratios: kind === 'grok' ? listGrokImagineRatioOptions() : IMAGE_GEN_RATIO_OPTIONS,
    showCodexPromptTools: kind !== 'grok',
    showCodexModelChrome: kind === 'codex',
    generateBlock: resolveGrokImagineGenerateBlock({
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
      reasoningOptions: getCodexReasoningOptions(selectedModel),
      speedOptions: getCodexSpeedOptions(selectedModel),
      summary: [
        modelLabel,
        executionReasoningEffort?.toUpperCase(),
        executionSpeed !== 'standard' ? formatCodexSpeedLabel(executionSpeed) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      sourceMessage,
    },
  };
}
