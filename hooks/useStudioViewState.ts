import React, { useCallback, useState } from 'react';
import type { Attachment, AspectRatio } from '../types';
import { startViewTransition } from '../utils/transitionUtils';

interface UseStudioViewStateProps {
  closeOverlay: () => void;
}

interface EditorState {
  isOpen: boolean;
  image: Attachment | null;
}

const INITIAL_EDITOR_STATE: EditorState = { isOpen: false, image: null };

export function useStudioViewState({ closeOverlay }: UseStudioViewStateProps) {
  const [isQueueOpen, setIsQueueOpen] = useState(true);
  const [editorState, setEditorState] = useState<EditorState>(INITIAL_EDITOR_STATE);
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
      setEditorState({ isOpen: true, image: attachment });
      openEditorRoute();
    });
  }, []);

  const closeEditor = useCallback(() => {
    startViewTransition(() => {
      setEditorState(INITIAL_EDITOR_STATE);
      closeOverlay();
    });
  }, [closeOverlay]);

  const handleDownloadAndClear = useCallback(async () => {
    return false;
  }, []);

  const resetViewState = useCallback(() => {
    setIsQueueOpen(true);
    setEditorState(INITIAL_EDITOR_STATE);
    setPreviewRatio(null);
    setIsDashboardModalOpen(false);
    setIsSettingsModalOpen(false);
    setIsTrashModalOpen(false);
  }, []);

  return {
    isQueueOpen,
    setIsQueueOpen,
    isEditorOpen: editorState.isOpen,
    setIsEditorOpen: (value: React.SetStateAction<boolean>) =>
      setEditorState((prev) => ({
        ...prev,
        isOpen: typeof value === 'function' ? value(prev.isOpen) : value,
      })),
    setImageToEdit: (value: React.SetStateAction<Attachment | null>) =>
      setEditorState((prev) => ({
        ...prev,
        image: typeof value === 'function' ? value(prev.image) : value,
      })),
    closeEditorState: () => setEditorState(INITIAL_EDITOR_STATE),
    imageToEdit: editorState.image,
    setImageToEdit: (value: React.SetStateAction<Attachment | null>) =>
      setEditorState((prev) => ({
        ...prev,
        image: typeof value === 'function' ? value(prev.image) : value,
      })),
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
