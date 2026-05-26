import { useState, useCallback } from 'react';
import type {
  Attachment,
  ImageGenerationConfig,
  GenerationBatch,
  GeneratedImageWithConfig,
  RecipeId,
} from '../types';
import type { Job as StudioJob } from '../packages/shared/src';
import { startViewTransition } from '../utils/transitionUtils';
import { runLocalGeneration } from '../services/localGenerationRun';

interface GenerationOptions {
  preventModal?: boolean;
  signal?: AbortSignal;
  onJobCreated?: (job: StudioJob) => void;
}

interface UseGenerationPipelineProps {
  generationConfig: ImageGenerationConfig;
  activeWorkspaceId: string;
  prependGeneratedVisualBatch: (
    batch: GenerationBatch,
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
  prependGeneratedVisualBatch,
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

      try {
        // Validate Recipe Requirements
        if (recipeId && configToUse.attachments.length === 0 && !configToUse.prompt?.trim()) {
          throw new Error('This recipe needs a reference image or a prompt before it can run.');
        }

        const { batch, generatedCount } = await runLocalGeneration({
          config: configToUse,
          workspaceId: activeWorkspaceId,
          signal: options?.signal,
          onJobCreated: options?.onJobCreated,
          onProgress: log,
        });

        startViewTransition(() => {
          prependGeneratedVisualBatch(batch);
        });

        if (batch.images.length > 0 && !options?.preventModal) {
          const resultImage = {
            ...batch.images[0],
            config: configToUse,
          } as GeneratedImageWithConfig;
          openModal(resultImage);
          setIsInteractingWithToolbar(false);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        log(`Generated batch: ${batch.id} (${generatedCount} asset(s)) in ${duration}s`);
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
      prependGeneratedVisualBatch,
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
        const { batch, generatedCount } = await runLocalGeneration({
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

        startViewTransition(() => {
          prependGeneratedVisualBatch(batch, { maxPerWorkspace: 20 });
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        log(`Generated edit batch: ${batch.id} (${generatedCount} asset(s)) in ${duration}s`);
        addToast('Image edit complete', 'success');
        return batch;
      } catch (error) {
        handleGenerationError(error);
      } finally {
        finishRun();
      }
    },
    [
      generationConfig,
      activeWorkspaceId,
      prependGeneratedVisualBatch,
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
