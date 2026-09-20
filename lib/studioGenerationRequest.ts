import type { GenerationProviderId } from '../packages/shared/src/generationContracts';
import type { CodexExecutionTransport } from '../packages/shared/src/codexExecutionContract';
import type { ImageGenerationConfig } from '../types';
import { resolveProviderMaxInputImages } from './composerProviderProjection';
import { resolveGrokImagineGenerateBlock } from './grokImagineUiPolicy';

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
  const maxAttachments =
    effectiveRecipeId === 'timeline' ||
    effectiveRecipeId === 'character-lab' ||
    effectiveRecipeId === 'animation-sequence'
      ? 4
      : resolveProviderMaxInputImages(providerId);
  const finalAttachments = baseAttachments.slice(0, maxAttachments);
  if (finalAttachments.some((attachment) => attachment.isProcessing)) {
    return { ok: false, message: 'Wait for reference images to finish loading before generating.' };
  }
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

  return {
    ok: true,
    finalConfig: {
      ...generationConfig,
      ...configOverrides,
      codexTransport:
        configOverrides?.codexTransport ?? generationConfig.codexTransport ?? defaultCodexTransport,
      attachments: finalAttachments.map((attachment) => ({
        ...attachment,
        strength: effectiveRecipeId === 'styles' ? 0.15 : attachment.strength,
      })),
      prompt: finalPrompt,
    },
    shouldClearComposerAttachments: false,
  };
}
