import { useCallback, useState } from 'react';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { Attachment, ImageGenerationConfig, RecipeId } from '../types';
import { detectRecipeFromContext } from '../utils/recipeUtils';

interface UseStudioGenerationActionsProps {
  generationConfig: ImageGenerationConfig;
  activeWorkspaceId: string;
  setGenerationConfig: React.Dispatch<React.SetStateAction<ImageGenerationConfig>>;
  updateGenerationConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  executeEdit: (original: Attachment, mask: string, prompt: string) => Promise<unknown>;
  enqueue: (
    prompt: string,
    config: ImageGenerationConfig,
    workspaceId: string,
    force?: boolean,
  ) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  closeModal: () => void;
  closeOverlay: () => void;
  isModalOpen: boolean;
  onRecipeSelection: (id: RecipeId) => void;
  onViewChange: (view: 'studio' | 'recipes') => void;
  onEditSettled?: () => void;
}

export function prepareStudioGenerationRequest({
  generationConfig,
  promptOverride,
  configOverrides,
}: {
  generationConfig: ImageGenerationConfig;
  promptOverride?: string;
  configOverrides?: Partial<ImageGenerationConfig>;
}):
  | {
      ok: true;
      queuePrompt: string;
      finalConfig: ImageGenerationConfig;
      shouldClearComposerAttachments: boolean;
    }
  | {
      ok: false;
      message: string;
    } {
  const promptSource =
    promptOverride !== undefined
      ? promptOverride
      : typeof configOverrides?.prompt === 'string'
        ? configOverrides.prompt
        : generationConfig.prompt;
  const finalPrompt = promptSource?.trim() ?? '';
  const baseAttachments = configOverrides?.attachments ?? generationConfig.attachments;
  const effectiveRecipeId = configOverrides?.recipeId ?? generationConfig.recipeId;
  const finalAttachments =
    effectiveRecipeId === 'timeline' ? baseAttachments : baseAttachments.slice(0, 1);
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

/**
 * Own the Studio's generation-facing actions: enqueue, prompt refinement,
 * image editing and recipe restore.
 */
export function useStudioGenerationActions({
  generationConfig,
  activeWorkspaceId,
  setGenerationConfig,
  updateGenerationConfig,
  executeEdit,
  enqueue,
  addToast,
  closeModal,
  closeOverlay,
  isModalOpen,
  onRecipeSelection,
  onViewChange,
  onEditSettled,
}: UseStudioGenerationActionsProps) {
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);

  const handleGenerate = useCallback(
    (
      promptOverride?: string,
      configOverrides?: Partial<ImageGenerationConfig>,
      options?: { force?: boolean; preventModal?: boolean },
    ) => {
      if (isModalOpen && !options?.preventModal) {
        closeModal();
      }

      const request = prepareStudioGenerationRequest({
        generationConfig,
        promptOverride,
        configOverrides,
      });

      if (!request.ok) {
        addToast(request.message, 'info');
        return;
      }

      enqueue(request.queuePrompt, request.finalConfig, activeWorkspaceId, options?.force);

      if (request.shouldClearComposerAttachments) {
        setGenerationConfig((previous) => ({
          ...previous,
          attachments: [],
        }));
      }
    },
    [
      activeWorkspaceId,
      addToast,
      closeModal,
      enqueue,
      generationConfig,
      isModalOpen,
      setGenerationConfig,
    ],
  );

  const handleEnhancePrompt = useCallback(async () => {
    if (isEnhancingPrompt) return;
    setIsEnhancingPrompt(true);

    try {
      const currentPrompt = (generationConfig.prompt ?? '').trim();
      if (!currentPrompt) {
        addToast('Type a prompt before refining it', 'info');
        return;
      }

      updateGenerationConfig(
        'prompt',
        [
          currentPrompt,
          '',
          'Refinement notes:',
          '- High-quality local image generation through Codex ImageGen.',
          '- Preserve the requested subject, composition, lighting, material detail, and aspect ratio.',
        ].join('\n'),
      );
      addToast('Prompt prepared for Codex ImageGen', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Prompt refinement failed', 'error');
    } finally {
      setIsEnhancingPrompt(false);
    }
  }, [addToast, generationConfig.prompt, isEnhancingPrompt, updateGenerationConfig]);

  const handleExecuteEdit = useCallback(
    async (original: Attachment, mask: string, prompt: string) => {
      setIsEditingImage(true);
      try {
        await executeEdit(original, mask, prompt);
        closeOverlay();
      } catch {
        // The generation pipeline already reports failures.
      } finally {
        setIsEditingImage(false);
        onEditSettled?.();
      }
    },
    [closeOverlay, executeEdit, onEditSettled],
  );

  const handleLoadRecipe = useCallback(
    (nextConfig: ImageGenerationConfig) => {
      setGenerationConfig(nextConfig);
      addToast('Recipe restored', 'success');

      const detectedRecipe =
        nextConfig.recipeId ?? detectRecipeFromContext(nextConfig.recipeContext);
      if (detectedRecipe) {
        onRecipeSelection(detectedRecipe);
      } else {
        onViewChange('studio');
      }
    },
    [addToast, onRecipeSelection, onViewChange, setGenerationConfig],
  );

  const resetGenerationUi = useCallback(() => {
    setGenerationConfig({
      ...DEFAULT_GENERATION_CONFIG,
      attachments: [],
      recipeParams: null,
    });
    setIsEnhancingPrompt(false);
    setIsEditingImage(false);
  }, [setGenerationConfig]);

  return {
    isEnhancingPrompt,
    isEditingImage,
    handleGenerate,
    handleEnhancePrompt,
    handleExecuteEdit,
    handleLoadRecipe,
    resetGenerationUi,
  };
}
