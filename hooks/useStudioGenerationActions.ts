import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import { prepareStudioGenerationRequest } from '../lib/studioGenerationRequest';
import type { Attachment, ImageGenerationConfig, RecipeId } from '../types';
import { detectRecipeFromContext } from '../utils/recipeUtils';

type GenerateOptions = {
  force?: boolean;
  preventModal?: boolean;
  useCurrentAttachments?: boolean;
};

function cloneGenerationAttachments(attachments: Attachment[]): Attachment[] {
  return attachments.map((attachment) => ({ ...attachment }));
}

export function buildGenerateOverridesWithCurrentAttachments(
  configOverrides: Partial<ImageGenerationConfig> | undefined,
  currentAttachments: Attachment[],
): Partial<ImageGenerationConfig> | undefined {
  if (!configOverrides) {
    return undefined;
  }

  return {
    ...configOverrides,
    attachments: cloneGenerationAttachments(currentAttachments),
  };
}

export function buildRecipeRestoreConfig(
  nextConfig: ImageGenerationConfig,
  currentAttachments: Attachment[],
): ImageGenerationConfig {
  return {
    ...nextConfig,
    attachments: cloneGenerationAttachments(currentAttachments),
  };
}

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
  const generationConfigRef = useRef(generationConfig);

  useEffect(() => {
    generationConfigRef.current = generationConfig;
  }, [generationConfig]);

  const handleGenerate = useCallback(
    (
      promptOverride?: string,
      configOverrides?: Partial<ImageGenerationConfig>,
      options?: GenerateOptions,
    ) => {
      if (isModalOpen && !options?.preventModal) {
        closeModal();
      }

      const requestConfigOverrides = options?.useCurrentAttachments
        ? buildGenerateOverridesWithCurrentAttachments(
            configOverrides,
            generationConfigRef.current.attachments,
          )
        : configOverrides;

      const request = prepareStudioGenerationRequest({
        generationConfig: generationConfigRef.current,
        promptOverride,
        configOverrides: requestConfigOverrides,
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
    [activeWorkspaceId, addToast, closeModal, enqueue, isModalOpen, setGenerationConfig],
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
      setGenerationConfig((previousConfig) =>
        buildRecipeRestoreConfig(nextConfig, previousConfig.attachments),
      );
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
