import { useCallback } from 'react';
import { cancelStudioJob } from '../services/localStudioService';
import type { Attachment, RecipeId } from '../types';
import type { ToastMessage } from './useToasts';
import type { useGeneration } from '../contexts/GenerationContext';
import { useQueueManager } from './useQueueManager';
import { useStudioGenerationActions } from './useStudioGenerationActions';

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
}: UseStudioGenerationSessionOptions) {
  const handleCancelPersistentJob = useCallback(
    async (jobId: string) => {
      const job = await cancelStudioJob(jobId);
      addToast(
        job.status === 'cancelled' ? 'Backend job cancelled' : 'Cancellation requested',
        'info',
      );
    },
    [addToast],
  );

  const queue = useQueueManager({
    executeGeneration: pipeline.executeGeneration,
    isGenerating: pipeline.isGenerating,
    addToast,
    cancelPersistentJob: handleCancelPersistentJob,
  });

  const actions = useStudioGenerationActions({
    generationConfig: config.generationConfig,
    activeWorkspaceId,
    setGenerationConfig: config.setGenerationConfig,
    updateGenerationConfig: config.updateGenerationConfig,
    executeEdit: pipeline.executeEdit,
    enqueue: queue.enqueue,
    addToast,
    closeModal,
    closeOverlay,
    isModalOpen: modal.isModalOpen,
    onRecipeSelection,
    onViewChange,
    onEditSettled: () => {
      setIsEditorOpen(false);
      setImageToEdit(null);
    },
  });

  return {
    ...actions,
    ...queue,
    handleCancelPersistentJob,
  };
}
