import type { GenerationProviderId } from '../packages/shared/src/generationContracts';
import type { CodexExecutionTransport } from '../packages/shared/src/codexExecutionContract';
import type { ImageGenerationConfig } from '../types';
import {
  resolveProviderImageSize,
  resolveProviderMaxInputImages,
  resolveRecipeProviderBlock,
} from './composerProviderProjection';
import { resolveGrokImagineGenerateBlock } from './grokImagineUiPolicy';
import { RECIPE_REFERENCE_RULES } from './recipeModules/composerRules';

function withoutCharacterLabDraft<T extends Partial<ImageGenerationConfig>>(config: T) {
  const { characterLabDraft: _draft, ...request } = config;
  return request;
}

export type StudioGenerationRequest =
  | {
      ok: true;
      finalConfig: ImageGenerationConfig;
      shouldClearComposerAttachments: boolean;
    }
  | {
      ok: false;
      message: string;
    };

export function resolveStudioGenerateRecipeId(
  configOverrides: Partial<ImageGenerationConfig> | undefined,
  fallbackRecipeId: ImageGenerationConfig['recipeId'],
): ImageGenerationConfig['recipeId'] {
  if (configOverrides && Object.hasOwn(configOverrides, 'recipeId')) {
    return configOverrides.recipeId ?? null;
  }
  return fallbackRecipeId ?? null;
}

export function prepareStudioGenerationRequest({
  generationConfig,
  promptOverride,
  configOverrides,
  providerId = 'codex',
  defaultCodexTransport,
  grokCanExecute = true,
  grokStatus,
  grokDiagnostics,
}: {
  generationConfig: ImageGenerationConfig;
  promptOverride?: string;
  configOverrides?: Partial<ImageGenerationConfig>;
  providerId?: GenerationProviderId;
  defaultCodexTransport?: CodexExecutionTransport;
  grokCanExecute?: boolean;
  grokStatus?: string;
  grokDiagnostics?: string[];
}): StudioGenerationRequest {
  const promptSource =
    promptOverride !== undefined
      ? promptOverride
      : typeof configOverrides?.prompt === 'string'
        ? configOverrides.prompt
        : generationConfig.prompt;
  const finalPrompt = promptSource?.trim() ?? '';
  const baseAttachments = configOverrides?.attachments ?? generationConfig.attachments;
  const effectiveRecipeId = resolveStudioGenerateRecipeId(
    configOverrides,
    generationConfig.recipeId,
  );
  const recipe = effectiveRecipeId ? RECIPE_REFERENCE_RULES[effectiveRecipeId] : undefined;
  const maxAttachments = recipe?.maxReferences ?? resolveProviderMaxInputImages(providerId);
  const finalAttachments = baseAttachments.slice(0, maxAttachments);
  if (finalAttachments.some((attachment) => attachment.isProcessing)) {
    return { ok: false, message: 'Wait for reference images to finish loading before generating.' };
  }
  const recipeParams = {
    ...(generationConfig.recipeParams ?? {}),
    ...(configOverrides?.recipeParams ?? {}),
  };
  const referenceStrength = recipe?.referenceStrength?.(recipeParams);
  const hasReferenceImage = finalAttachments.length > 0;

  if (!finalPrompt && !hasReferenceImage) {
    return { ok: false, message: 'Type a prompt before generating' };
  }

  const grokBlock = resolveGrokImagineGenerateBlock({
    providerId,
    recipeId: effectiveRecipeId,
    aspectRatio: configOverrides?.aspectRatio ?? generationConfig.aspectRatio,
    attachments: finalAttachments,
    canExecute: grokCanExecute,
    status: grokStatus,
    diagnostics: grokDiagnostics,
  });
  if (grokBlock) {
    return { ok: false, message: grokBlock.message };
  }
  const recipeProviderBlock = resolveRecipeProviderBlock(providerId, effectiveRecipeId ?? null);
  if (recipeProviderBlock) {
    return { ok: false, message: recipeProviderBlock.message };
  }

  return {
    ok: true,
    finalConfig: {
      ...withoutCharacterLabDraft(generationConfig),
      ...withoutCharacterLabDraft(configOverrides ?? {}),
      codexTransport:
        configOverrides?.codexTransport ?? generationConfig.codexTransport ?? defaultCodexTransport,
      attachments: finalAttachments.map((attachment) => ({
        ...attachment,
        strength: referenceStrength ?? attachment.strength,
      })),
      prompt: finalPrompt,
      imageSize: resolveProviderImageSize(
        providerId,
        configOverrides?.imageSize ?? generationConfig.imageSize,
      ),
    },
    shouldClearComposerAttachments: false,
  };
}
