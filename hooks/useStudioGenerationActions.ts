import { useCallback, useState } from 'react';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import { resolveGrokImagineGenerateBlock } from '../lib/grokImagineUiPolicy';
import {
  prepareStudioGenerationRequest,
  resolveStudioGenerateRecipeId,
} from '../lib/studioGenerationRequest';
import type { Attachment, ImageGenerationConfig, RecipeId } from '../types';
import type {
  CodexExecutionTransport,
  GenerationProviderId,
  Job as StudioJob,
} from '../packages/shared/src';
import { parseRecipeIdFromContext } from '../lib/recipeShellMetadata';

type GenerateOptions = {
  preventModal?: boolean;
  useCurrentAttachments?: boolean;
  onJobCreated?: (job: StudioJob) => void;
};

const QUALITY_NOTES_HEADING = 'Quality notes:';
const QUALITY_NOTE =
  'Preserve the requested subject, composition, lighting, material detail, and aspect ratio.';

/**
 * Add one bullet under a heading block in the prompt. No model is called.
 * Returns the prompt unchanged when the bullet is already there.
 */
export function addPromptNote(prompt: string, heading: string, note: string) {
  const lines = prompt.trim().split('\n');
  const bullet = `- ${note.trim()}`;
  const headingIndex = lines.indexOf(heading);
  if (headingIndex < 0) return [prompt.trim(), '', heading, bullet].join('\n').trim();
  let end = headingIndex + 1;
  while (end < lines.length && lines[end]!.startsWith('- ')) {
    if (lines[end] === bullet) return prompt.trim();
    end += 1;
  }
  lines.splice(end, 0, bullet);
  return lines.join('\n');
}

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
  generationConfigRef: React.RefObject<ImageGenerationConfig>;
  activeWorkspaceId: string;
  setGenerationConfig: React.Dispatch<React.SetStateAction<ImageGenerationConfig>>;
  setRecipeDraft: (recipeId: RecipeId, config: ImageGenerationConfig) => void;
  updateGenerationConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  executeEdit: (original: Attachment, mask: string, prompt: string) => Promise<unknown>;
  executeGeneration: (
    config: Partial<ImageGenerationConfig>,
    options?: {
      preventModal?: boolean;
      workspaceId?: string;
      onJobCreated?: (job: StudioJob) => void;
    },
  ) => Promise<unknown>;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  closeModal: () => void;
  closeOverlay: () => void;
  isModalOpen: boolean;
  onRecipeSelection: (id: RecipeId) => void;
  onViewChange: (view: 'studio' | 'recipes') => void;
  onEditSettled?: () => void;
  activeProviderId: GenerationProviderId;
  defaultCodexTransport?: CodexExecutionTransport;
  grokCanExecute: boolean;
  grokStatus?: string;
  grokDiagnostics?: string[];
  activeRecipe: RecipeId;
}

/**
 * Own the Studio's generation-facing actions: enqueue, prompt refinement,
 * image editing and recipe restore.
 */
export function useStudioGenerationActions({
  generationConfigRef,
  activeWorkspaceId,
  setGenerationConfig,
  setRecipeDraft,
  updateGenerationConfig,
  executeEdit,
  executeGeneration,
  addToast,
  closeModal,
  closeOverlay,
  isModalOpen,
  onRecipeSelection,
  onViewChange,
  onEditSettled,
  activeProviderId,
  defaultCodexTransport,
  grokCanExecute,
  grokStatus,
  grokDiagnostics,
  activeRecipe,
}: UseStudioGenerationActionsProps) {
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const handleGenerate = useCallback(
    (
      promptOverride?: string,
      configOverrides?: Partial<ImageGenerationConfig>,
      options?: GenerateOptions,
    ) => {
      if (isModalOpen && !options?.preventModal) {
        closeModal();
      }

      const requestConfigOverrides = {
        ...(options?.useCurrentAttachments
          ? buildGenerateOverridesWithCurrentAttachments(
              configOverrides,
              generationConfigRef.current.attachments,
            )
          : configOverrides),
        recipeId: resolveStudioGenerateRecipeId(configOverrides, activeRecipe),
      };

      const request = prepareStudioGenerationRequest({
        generationConfig: generationConfigRef.current,
        promptOverride,
        configOverrides: requestConfigOverrides,
        providerId: activeProviderId,
        defaultCodexTransport,
        grokCanExecute,
        grokStatus,
        grokDiagnostics,
      });

      if (!request.ok) {
        addToast(request.message, 'info');
        return;
      }

      void executeGeneration(request.finalConfig, {
        preventModal: options?.preventModal,
        workspaceId: activeWorkspaceId,
        onJobCreated: options?.onJobCreated,
      });

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
      executeGeneration,
      generationConfigRef,
      isModalOpen,
      setGenerationConfig,
      activeProviderId,
      defaultCodexTransport,
      grokCanExecute,
      grokStatus,
      grokDiagnostics,
      activeRecipe,
    ],
  );

  const handleEnhancePrompt = useCallback(async () => {
    if (isEnhancingPrompt) return;
    setIsEnhancingPrompt(true);

    try {
      const currentPrompt = (generationConfigRef.current.prompt ?? '').trim();
      if (!currentPrompt) {
        addToast('Type a prompt before adding quality notes', 'info');
        return;
      }

      const nextPrompt = addPromptNote(currentPrompt, QUALITY_NOTES_HEADING, QUALITY_NOTE);
      if (nextPrompt === currentPrompt) {
        addToast('Quality notes are already in the prompt', 'info');
        return;
      }
      updateGenerationConfig('prompt', nextPrompt);
      addToast('Quality notes added to the prompt', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Could not add quality notes', 'error');
    } finally {
      setIsEnhancingPrompt(false);
    }
  }, [addToast, generationConfigRef, isEnhancingPrompt, updateGenerationConfig]);

  const handleExecuteEdit = useCallback(
    async (original: Attachment, mask: string, prompt: string) => {
      const grokBlock = resolveGrokImagineGenerateBlock({
        providerId: activeProviderId,
        recipeId: activeRecipe,
        aspectRatio: generationConfigRef.current.aspectRatio,
        attachments: [original],
        canExecute: grokCanExecute,
        status: grokStatus,
        diagnostics: grokDiagnostics,
      });
      if (grokBlock) {
        addToast(grokBlock.message, 'info');
        return;
      }

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
    [
      activeProviderId,
      activeRecipe,
      addToast,
      closeOverlay,
      executeEdit,
      generationConfigRef,
      grokCanExecute,
      grokStatus,
      grokDiagnostics,
      onEditSettled,
    ],
  );

  const handleLoadRecipe = useCallback(
    (nextConfig: ImageGenerationConfig) => {
      addToast('Recipe restored', 'success');

      const detectedRecipe =
        nextConfig.recipeId ?? parseRecipeIdFromContext(nextConfig.recipeContext);
      setRecipeDraft(
        detectedRecipe,
        buildRecipeRestoreConfig(nextConfig, generationConfigRef.current.attachments),
      );
      if (detectedRecipe) {
        onRecipeSelection(detectedRecipe);
      } else {
        onViewChange('recipes');
      }
    },
    [addToast, onRecipeSelection, onViewChange, setRecipeDraft, generationConfigRef],
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
