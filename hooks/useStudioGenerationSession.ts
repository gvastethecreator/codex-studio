import { useCallback } from 'react';
import type { Attachment, RecipeId } from '../types';
import type { ToastMessage } from './useToasts';
import type { useGeneration } from '../contexts/GenerationContext';
import type { ShellActivityJob } from '../lib/shellActivityJob';
import { useQueueManager } from './useQueueManager';
import { useStudioGenerationActions } from './useStudioGenerationActions';
import { useStudioGenerationLifecycle } from './useStudioGenerationLifecycle';

interface UseStudioGenerationSessionOptions {
  activeWorkspaceId: string;
  config: ReturnType<typeof useGeneration>['config'];
  pipeline: ReturnType<typeof useGeneration>['pipeline'];
  modal: ReturnType<typeof useGeneration>['modal'];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  closeOverlay: () => void;
  closeModal: () => void;
  onRecipeSelection: (recipeId: RecipeId) => void;
  onViewChange: (view: 'studio' | 'recipes') => void;
  setIsEditorOpen: (isOpen: boolean) => void;
  setImageToEdit: (attachment: Attachment | null) => void;
  backendJobs?: ShellActivityJob[];
}

export interface StudioGenerationSessionController {
  queue: ReturnType<typeof useQueueManager> & {
    cancelPersistentJob: (jobId: string) => Promise<void>;
  };
  actions: ReturnType<typeof useStudioGenerationActions>;
}

export function useStudioGenerationSession({
  activeWorkspaceId,
  config,
  pipeline,
  modal,
  addToast,
  closeOverlay,
  closeModal,
  onRecipeSelection,
  onViewChange,
  setIsEditorOpen,
  setImageToEdit,
  backendJobs,
}: UseStudioGenerationSessionOptions): StudioGenerationSessionController {
  const lifecycle = useStudioGenerationLifecycle({ pipeline, addToast });

  const queue = useQueueManager({
    executeGeneration: lifecycle.executeGeneration,
    isGenerating: lifecycle.isGenerating,
    addToast,
    cancelPersistentJob: lifecycle.cancelPersistentJob,
    backendJobs,
  });

  const onEditSettled = useCallback(() => {
    setIsEditorOpen(false);
    setImageToEdit(null);
  }, [setIsEditorOpen, setImageToEdit]);

  const actions = useStudioGenerationActions({
    generationConfig: config.generationConfig,
    activeWorkspaceId,
    setGenerationConfig: config.setGenerationConfig,
    updateGenerationConfig: config.updateGenerationConfig,
    executeEdit: lifecycle.executeEdit,
    enqueue: queue.enqueue,
    addToast,
    closeModal,
    closeOverlay,
    isModalOpen: modal.isModalOpen,
    onRecipeSelection,
    onViewChange,
    onEditSettled,
  });

  return {
    queue: {
      ...queue,
      cancelPersistentJob: lifecycle.cancelPersistentJob,
    },
    actions,
  };
}
