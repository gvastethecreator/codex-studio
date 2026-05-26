import { useState, useCallback } from 'react';
import type {
  Attachment,
  ImageGenerationConfig,
  GeneratedImageWithConfig,
  RecipeId,
} from '../types';
import type { Job as StudioJob } from '../packages/shared/src';
import { startViewTransition } from '../utils/transitionUtils';
import { runLocalGeneration, type LocalGenerationRunResult } from '../services/localGenerationRun';

interface GenerationOptions {
  preventModal?: boolean;
  workspaceId?: string;
  signal?: AbortSignal;
  onJobCreated?: (job: StudioJob) => void;
}

export function resolveGenerationWorkspaceId(
  activeWorkspaceId: string,
  workspaceIdOverride?: string,
) {
  return workspaceIdOverride ?? activeWorkspaceId;
}

interface UseGenerationPipelineProps {
  generationConfig: ImageGenerationConfig;
  activeWorkspaceId: string;
  appendLocalGenerationResult?: (
    result: LocalGenerationRunResult,
    options?: { maxPerWorkspace?: number },
  ) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  log: (msg: string) => void;
  activeRecipe: RecipeId;
  openModal: (img: GeneratedImageWithConfig) => void;
  setIsInteractingWithToolbar: (val: boolean) => void;
}

export const useGenerationPipeline = ({
  generationConfig,
  activeWorkspaceId,
  appendLocalGenerationResult,
  addToast,
  log,
  activeRecipe,
  openModal,
  setIsInteractingWithToolbar,
}: UseGenerationPipelineProps) => {
  const [activeCount, setActiveCount] = useState(0);
  const isGenerating = activeCount > 0;
  const [activeGenerationConfig, setActiveGenerationConfig] =
    useState<ImageGenerationConfig | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);

  const beginRun = useCallback((configToUse: ImageGenerationConfig) => {
    setActiveGenerationConfig(configToUse);
    setActiveCount((prev) => prev + 1);
    const startTime = Date.now();
    setGenerationStartTime(startTime);
    return startTime;
  }, []);

  const finishRun = useCallback(() => {
    setActiveCount((prev) => Math.max(0, prev - 1));
    setActiveGenerationConfig(null);
    setGenerationStartTime(null);
  }, []);

  const handleGenerationError = useCallback(
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      const isCancellation =
        error instanceof Error && (error.name === 'AbortError' || /cancel/i.test(error.message));

      if (isCancellation) {
        addToast('Generation cancelled', 'info');
        log(`Generation cancelled: ${message}`);
        throw error;
      }

      addToast(message, 'error');
      log(`Generation Error: ${message}`);
      throw error;
    },
    [addToast, log],
  );

  const executeGeneration = useCallback(
    async (configOverrides: Partial<ImageGenerationConfig>, options?: GenerationOptions) => {
      const configToUse = { ...generationConfig, ...configOverrides };
      const startTime = beginRun(configToUse);
      const recipeId = configToUse.recipeId ?? activeRecipe;
      const workspaceId = resolveGenerationWorkspaceId(activeWorkspaceId, options?.workspaceId);

      try {
        // Validate Recipe Requirements
        if (recipeId && configToUse.attachments.length === 0 && !configToUse.prompt?.trim()) {
          throw new Error('This recipe needs a reference image or a prompt before it can run.');
        }

        const result = await runLocalGeneration({
          config: configToUse,
          workspaceId,
          signal: options?.signal,
          onJobCreated: options?.onJobCreated,
          onProgress: log,
        });
        const { batchId, generatedCount, images } = result;

        startViewTransition(() => {
          appendLocalGenerationResult?.(result);
        });

        if (images.length > 0 && !options?.preventModal) {
          const resultImage = {
            ...images[0],
            config: configToUse,
          } as GeneratedImageWithConfig;
          openModal(resultImage);
          setIsInteractingWithToolbar(false);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        log(`Generated local result: ${batchId} (${generatedCount} asset(s)) in ${duration}s`);
        addToast(
          `Generation complete: ${generatedCount} asset${generatedCount === 1 ? '' : 's'} ready in ${duration}s`,
          'success',
        );
      } catch (error) {
        handleGenerationError(error);
      } finally {
        finishRun();
      }
    },
    [
      generationConfig,
      activeWorkspaceId,
      activeRecipe,
      appendLocalGenerationResult,
      addToast,
      log,
      openModal,
      setIsInteractingWithToolbar,
      beginRun,
      finishRun,
      handleGenerationError,
    ],
  );

  const executeEdit = useCallback(
    async (original: Attachment, mask: string, prompt: string) => {
      const configToUse: ImageGenerationConfig = {
        ...generationConfig,
        prompt,
        recipeId: null,
        recipeParams: null,
        recipeContext: '',
        batchCount: 1,
        attachments: mask
          ? [
              ...generationConfig.attachments,
              {
                id: `mask-${Date.now()}`,
                name: `${original.name.replace(/\.[^.]+$/, '')}-mask.png`,
                dataUrl: mask,
                strength: 1,
              },
            ]
          : generationConfig.attachments,
      };

      const startTime = beginRun(configToUse);

      try {
        const result = await runLocalGeneration({
          workspaceId: activeWorkspaceId,
          config: configToUse,
          inputImage: {
            src: original.dataUrl,
            prompt: [
              prompt,
              '',
              'Use the input image as the edit source.',
              `Original attachment: ${original.name}`,
              `Mask reference: ${mask ? 'provided' : 'not provided'}`,
            ].join('\n'),
          },
        });
        const { batchId, generatedCount } = result;

        startViewTransition(() => {
          appendLocalGenerationResult?.(result, { maxPerWorkspace: 20 });
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        log(`Generated edit result: ${batchId} (${generatedCount} asset(s)) in ${duration}s`);
        addToast('Image edit complete', 'success');
      } catch (error) {
        handleGenerationError(error);
      } finally {
        finishRun();
      }
    },
    [
      generationConfig,
      activeWorkspaceId,
      appendLocalGenerationResult,
      addToast,
      log,
      beginRun,
      finishRun,
      handleGenerationError,
    ],
  );

  return {
    isGenerating,
    activeGenerationConfig,
    generationStartTime,
    executeGeneration,
    executeEdit,
  };
};
