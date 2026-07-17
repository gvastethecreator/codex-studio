import { useState, useCallback, useRef } from 'react';
import type {
  Attachment,
  ImageGenerationConfig,
  GeneratedImageWithConfig,
  GenerationExecutionOutcome,
  RecipeId,
} from '../types';
import type { Job as StudioJob } from '../packages/shared/src';
import { startViewTransition } from '../utils/transitionUtils';
import type {
  LocalGenerationLifecycleOutcome,
  LocalGenerationRunResult,
} from '../services/localGenerationRun';

async function runLocalGeneration(
  input: Parameters<
    typeof import('../services/localGenerationRun').runLocalGenerationWithLifecycle
  >[0],
) {
  const { runLocalGenerationWithLifecycle } = await import('../services/localGenerationRun');
  return runLocalGenerationWithLifecycle(input);
}

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

export function buildEditGenerationConfig({
  generationConfig,
  original,
  mask,
  prompt,
}: {
  generationConfig: ImageGenerationConfig;
  original: Attachment;
  mask: string;
  prompt: string;
}): ImageGenerationConfig {
  const trimmedPrompt = prompt.trim();

  const maskAttachments = mask
    ? [
        {
          id: `mask-${Date.now()}`,
          name: `${original.name.replace(/\.[^.]+$/, '')}-mask.png`,
          dataUrl: mask,
          strength: 1,
        },
      ]
    : [];

  return {
    ...generationConfig,
    prompt: trimmedPrompt,
    recipeId: null,
    recipeParams: null,
    recipeContext: '',
    batchCount: 1,
    attachments: maskAttachments,
  };
}

function formatGenerationDuration(durationMs: number) {
  return (durationMs / 1000).toFixed(1);
}

function reportGenerationError({
  error,
  addToast,
  log,
}: {
  error: unknown;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  log: (msg: string) => void;
}) {
  const message = error instanceof Error ? error.message : String(error);
  addToast(message, 'error');
  log(`Generation Error: ${message}`);
}

function buildFailedGenerationExecutionOutcome(error: unknown): GenerationExecutionOutcome {
  return {
    status: 'failed',
    message: error instanceof Error ? error.message : String(error),
  };
}

function handleNonCompletedGenerationOutcome({
  outcome,
  addToast,
  log,
}: {
  outcome: LocalGenerationLifecycleOutcome;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  log: (msg: string) => void;
}) {
  if (outcome.status === 'cancelled') {
    addToast('Generation cancelled', 'info');
    log(`Generation cancelled: ${outcome.message}`);
    return true;
  }

  if (outcome.status === 'failed') {
    addToast(outcome.message, 'error');
    log(`Generation Error: ${outcome.message}`);
    return true;
  }

  return false;
}

function isCompletedGenerationOutcome(
  outcome: LocalGenerationLifecycleOutcome,
): outcome is Extract<LocalGenerationLifecycleOutcome, { status: 'completed' }> {
  return outcome.status === 'completed';
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

export interface ActiveGenerationRun {
  id: number;
  config: ImageGenerationConfig;
  startedAt: number;
}

export function removeActiveGenerationRun(runs: ActiveGenerationRun[], runId: number) {
  return runs.filter((run) => run.id !== runId);
}

export function getCurrentActiveGenerationRun(runs: ActiveGenerationRun[]) {
  return runs.at(-1) ?? null;
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
  const [activeRuns, setActiveRuns] = useState<ActiveGenerationRun[]>([]);
  const nextRunIdRef = useRef(0);
  const activeRun = getCurrentActiveGenerationRun(activeRuns);
  const isGenerating = activeRuns.length > 0;
  const activeGenerationConfig = activeRun?.config ?? null;
  const generationStartTime = activeRun?.startedAt ?? null;

  const beginRun = useCallback((configToUse: ImageGenerationConfig) => {
    const run = {
      id: ++nextRunIdRef.current,
      config: configToUse,
      startedAt: Date.now(),
    };
    setActiveRuns((runs) => [...runs, run]);
    return run.id;
  }, []);

  const finishRun = useCallback((runId: number) => {
    setActiveRuns((runs) => removeActiveGenerationRun(runs, runId));
  }, []);

  const executeGeneration = useCallback(
    async (
      configOverrides: Partial<ImageGenerationConfig>,
      options?: GenerationOptions,
    ): Promise<GenerationExecutionOutcome> => {
      const configToUse = { ...generationConfig, ...configOverrides };
      const runId = beginRun(configToUse);
      const recipeId = configToUse.recipeId ?? activeRecipe;
      const workspaceId = resolveGenerationWorkspaceId(activeWorkspaceId, options?.workspaceId);

      try {
        // Validate Recipe Requirements
        if (recipeId && configToUse.attachments.length === 0 && !configToUse.prompt?.trim()) {
          throw new Error('This recipe needs a reference image or a prompt before it can run.');
        }

        const outcome = await runLocalGeneration({
          config: configToUse,
          workspaceId,
          signal: options?.signal,
          onJobCreated: options?.onJobCreated,
          onProgress: log,
        });

        if (handleNonCompletedGenerationOutcome({ outcome, addToast, log })) {
          if (outcome.status === 'cancelled') {
            return { status: 'cancelled', message: outcome.message };
          }

          if (outcome.status === 'failed') {
            return { status: 'failed', message: outcome.message };
          }
        }

        if (!isCompletedGenerationOutcome(outcome)) {
          return { status: 'failed', message: 'Generation ended without a terminal outcome.' };
        }

        const result = outcome.result;
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

        const duration = formatGenerationDuration(outcome.durationMs);
        log(`Generated local result: ${batchId} (${generatedCount} asset(s)) in ${duration}s`);
        addToast(
          `Generation complete: ${generatedCount} asset${generatedCount === 1 ? '' : 's'} ready in ${duration}s`,
          'success',
        );
        return { status: 'completed' };
      } catch (error) {
        reportGenerationError({ error, addToast, log });
        return buildFailedGenerationExecutionOutcome(error);
      } finally {
        finishRun(runId);
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
    ],
  );

  const executeEdit = useCallback(
    async (original: Attachment, mask: string, prompt: string) => {
      const configToUse = buildEditGenerationConfig({
        generationConfig,
        original,
        mask,
        prompt,
      });

      const runId = beginRun(configToUse);

      try {
        const outcome = await runLocalGeneration({
          workspaceId: activeWorkspaceId,
          config: configToUse,
          inputImage: {
            src: original.dataUrl,
            prompt: configToUse.prompt,
          },
        });

        if (handleNonCompletedGenerationOutcome({ outcome, addToast, log })) {
          return;
        }

        if (!isCompletedGenerationOutcome(outcome)) {
          return;
        }

        const result = outcome.result;
        const { batchId, generatedCount } = result;

        startViewTransition(() => {
          appendLocalGenerationResult?.(result, { maxPerWorkspace: 20 });
        });

        const duration = formatGenerationDuration(outcome.durationMs);
        log(`Generated edit result: ${batchId} (${generatedCount} asset(s)) in ${duration}s`);
        addToast('Image edit complete', 'success');
      } catch (error) {
        reportGenerationError({ error, addToast, log });
      } finally {
        finishRun(runId);
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
