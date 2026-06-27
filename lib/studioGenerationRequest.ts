import type { ImageGenerationConfig } from '../types';

export type StudioGenerationRequest =
  | {
      ok: true;
      queuePrompt: string;
      finalConfig: ImageGenerationConfig;
      shouldClearComposerAttachments: boolean;
    }
  | {
      ok: false;
      message: string;
    };

export function prepareStudioGenerationRequest({
  generationConfig,
  promptOverride,
  configOverrides,
}: {
  generationConfig: ImageGenerationConfig;
  promptOverride?: string;
  configOverrides?: Partial<ImageGenerationConfig>;
}): StudioGenerationRequest {
  const promptSource =
    promptOverride !== undefined
      ? promptOverride
      : typeof configOverrides?.prompt === 'string'
        ? configOverrides.prompt
        : generationConfig.prompt;
  const finalPrompt = promptSource?.trim() ?? '';
  const baseAttachments = configOverrides?.attachments ?? generationConfig.attachments;
  const effectiveRecipeId = configOverrides?.recipeId ?? generationConfig.recipeId;
  const maxAttachments =
    effectiveRecipeId === 'styles'
      ? 5
      : effectiveRecipeId === 'timeline' || effectiveRecipeId === 'character-lab'
        ? 4
        : 1;
  const finalAttachments = baseAttachments.slice(0, maxAttachments);
  const hasReferenceImage = finalAttachments.length > 0;

  if (!finalPrompt && !hasReferenceImage) {
    return { ok: false, message: 'Type a prompt before generating' };
  }

  return {
    ok: true,
    queuePrompt: finalPrompt || 'Image-guided generation',
    finalConfig: {
      ...generationConfig,
      ...configOverrides,
      attachments: finalAttachments.map((attachment) => ({ ...attachment })),
      prompt: finalPrompt,
    },
    shouldClearComposerAttachments: false,
  };
}
