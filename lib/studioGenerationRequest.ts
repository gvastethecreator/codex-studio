import type { GenerationProviderId } from '../packages/shared/src/generationContracts';
import type { ImageGenerationConfig } from '../types';
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
  grokCanExecute = true,
}: {
  generationConfig: ImageGenerationConfig;
  promptOverride?: string;
  configOverrides?: Partial<ImageGenerationConfig>;
  providerId?: GenerationProviderId;
  grokCanExecute?: boolean;
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
    effectiveRecipeId === 'styles'
      ? 5
      : effectiveRecipeId === 'timeline' ||
          effectiveRecipeId === 'character-lab' ||
          effectiveRecipeId === 'animation-sequence'
        ? 4
        : 1;
  const finalAttachments = baseAttachments.slice(0, maxAttachments);
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
  });
  if (grokBlock) {
    return { ok: false, message: grokBlock.message };
  }

  return {
    ok: true,
    finalConfig: {
      ...generationConfig,
      ...configOverrides,
      attachments: finalAttachments.map((attachment) => ({ ...attachment })),
      prompt: finalPrompt,
    },
    shouldClearComposerAttachments: false,
  };
}
