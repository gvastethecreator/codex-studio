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
  CODEX_HTTP_MODEL,
  CODEX_HTTP_REASONING,
  resolveCodexExecutionPolicy,
  describeCodexExecution,
  type CodexExecutionTransport,
} from '../packages/shared/src/codexExecutionContract';

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
  codexTransport,
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
  codexTransport?: CodexExecutionTransport | null;
  executionModel: ImageGenerationConfig['executionModel'];
  executionReasoningEffort: ImageGenerationConfig['executionReasoningEffort'];
  executionSpeed: ImageGenerationConfig['executionSpeed'];
  catalogError: string | null;
}): ComposerProviderProjection {
  const kind = resolveComposerProviderKind(providerId);
  const isHttp = kind === 'codex' && codexTransport === 'subscription_http';
  const models = isHttp ? [CODEX_HTTP_MODEL] : (codexModelCatalog?.models ?? EMPTY_CODEX_MODELS);
  const preferredModelId = pickPreferredCodexModel(models, executionModel);
  const selectedModel = models.find((model) => model.id === executionModel) ?? null;
  const modelLabel = formatCodexModelLabel(executionModel, selectedModel?.displayName);
  const sourceMessage = buildCodexFallbackCatalogErrorMessage(codexModelCatalog) || catalogError;
  let codexBlock: GrokImagineGenerateBlock | null = null;
  let transportSummary = codexTransport === 'codex_app_server' ? 'Codex app-server' : '';
  if (kind === 'codex') {
    if (!codexTransport)
      codexBlock = {
        code: 'codex_execution_checking',
        message: 'Checking the Codex execution route.',
      };
    else if (isHttp) {
      try {
        const policy = resolveCodexExecutionPolicy(
          {
            model: executionModel,
            reasoningEffort: executionReasoningEffort,
            serviceTier: executionSpeed === 'standard' ? null : executionSpeed,
          },
          { output: { aspectRatio }, assets: attachments },
          codexTransport,
        );
        transportSummary = describeCodexExecution(policy);
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
    showCodexModelChrome: kind === 'codex',
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
      reasoningOptions: isHttp ? [CODEX_HTTP_REASONING] : getCodexReasoningOptions(selectedModel),
      speedOptions: isHttp ? ['standard'] : getCodexSpeedOptions(selectedModel),
      summary: [
        modelLabel,
        transportSummary,
        !isHttp ? executionReasoningEffort?.toUpperCase() : null,
        !isHttp && executionSpeed !== 'standard' ? formatCodexSpeedLabel(executionSpeed) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      sourceMessage: isHttp
        ? 'HTTP uses GPT-5.5 and GPT Image 2. Image quality is medium; reasoning and speed are managed by the provider.'
        : sourceMessage,
    },
  };
}
