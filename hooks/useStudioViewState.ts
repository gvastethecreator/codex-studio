import { useCallback, useState } from 'react';
import type { Attachment, AspectRatio } from '../types';
import { startViewTransition } from '../utils/transitionUtils';

interface UseStudioViewStateProps {
  closeOverlay: () => void;
}

export function useStudioViewState({ closeOverlay }: UseStudioViewStateProps) {
  const [isQueueOpen, setIsQueueOpen] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<Attachment | null>(null);
  const [previewRatio, setPreviewRatio] = useState<AspectRatio | null>(null);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);

  const openDashboard = useCallback(() => {
    startViewTransition(() => setIsDashboardModalOpen(true));
  }, []);

  const closeDashboard = useCallback(() => {
    startViewTransition(() => setIsDashboardModalOpen(false));
  }, []);

  const openSettings = useCallback(() => {
    startViewTransition(() => setIsSettingsModalOpen(true));
  }, []);

  const closeSettings = useCallback(() => {
    startViewTransition(() => setIsSettingsModalOpen(false));
  }, []);

  const openTrash = useCallback(() => {
    startViewTransition(() => setIsTrashModalOpen(true));
  }, []);

  const closeTrash = useCallback(() => {
    startViewTransition(() => setIsTrashModalOpen(false));
  }, []);

  const openEditor = useCallback((attachment: Attachment, openEditorRoute: () => void) => {
    startViewTransition(() => {
      setImageToEdit(attachment);
      setIsEditorOpen(true);
      openEditorRoute();
    });
  }, []);

  const closeEditor = useCallback(() => {
    startViewTransition(() => {
      setIsEditorOpen(false);
      setImageToEdit(null);
      closeOverlay();
    });
  }, [closeOverlay]);

  const handleDownloadAndClear = useCallback(async () => {
    return false;
  }, []);

  const resetViewState = useCallback(() => {
    setIsQueueOpen(true);
    setIsEditorOpen(false);
    setImageToEdit(null);
    setPreviewRatio(null);
    setIsDashboardModalOpen(false);
    setIsSettingsModalOpen(false);
    setIsTrashModalOpen(false);
  }, []);

  return {
    isQueueOpen,
    setIsQueueOpen,
    isEditorOpen,
    setIsEditorOpen,
    imageToEdit,
    setImageToEdit,
    previewRatio,
    setPreviewRatio,
    isDashboardModalOpen,
    openDashboard,
    closeDashboard,
    isSettingsModalOpen,
    openSettings,
    closeSettings,
    isTrashModalOpen,
    openTrash,
    closeTrash,
    openEditor,
    closeEditor,
    handleDownloadAndClear,
    resetViewState,
  };
}
