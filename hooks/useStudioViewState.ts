import { useCallback, useEffect, useState } from 'react';
import type { Attachment, AspectRatio } from '../types';
import { startViewTransition } from '../utils/transitionUtils';

interface UseStudioViewStateProps {
  batchCount: number;
  downloadAndClearWorkspace: () => Promise<boolean>;
  closeOverlay: () => void;
}

/**
 * Manage local Studio view state (queue, editor, dashboard, trash, limit and
 * toolbar visibility) so AppContent does not own each toggle directly.
 */
export function useStudioViewState({
  batchCount,
  downloadAndClearWorkspace,
  closeOverlay,
}: UseStudioViewStateProps) {
  const [isQueueOpen, setIsQueueOpen] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<Attachment | null>(null);
  const [previewRatio, setPreviewRatio] = useState<AspectRatio | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [hasDismissedLimitModal, setHasDismissedLimitModal] = useState(false);

  useEffect(() => {
    if (batchCount > 100 && !hasDismissedLimitModal && !isLimitModalOpen) {
      setIsLimitModalOpen(true);
    }
  }, [batchCount, hasDismissedLimitModal, isLimitModalOpen]);

  const toggleToolbar = useCallback(() => {
    startViewTransition(() => setIsToolbarVisible((previous) => !previous));
  }, []);

  const openDashboard = useCallback(() => {
    startViewTransition(() => setIsDashboardModalOpen(true));
  }, []);

  const closeDashboard = useCallback(() => {
    startViewTransition(() => setIsDashboardModalOpen(false));
  }, []);

  const openTrash = useCallback(() => {
    startViewTransition(() => setIsTrashModalOpen(true));
  }, []);

  const closeTrash = useCallback(() => {
    startViewTransition(() => setIsTrashModalOpen(false));
  }, []);

  const openEditor = useCallback(
    (attachment: Attachment, openEditorRoute: () => void) => {
      startViewTransition(() => {
        setImageToEdit(attachment);
        setIsEditorOpen(true);
        openEditorRoute();
      });
    },
    [],
  );

  const closeEditor = useCallback(() => {
    startViewTransition(() => {
      setIsEditorOpen(false);
      setImageToEdit(null);
      closeOverlay();
    });
  }, [closeOverlay]);

  const dismissLimitModal = useCallback(() => {
    setIsLimitModalOpen(false);
    setHasDismissedLimitModal(true);
  }, []);

  const handleDownloadAndClear = useCallback(async () => {
    const didClear = await downloadAndClearWorkspace();
    if (!didClear) return;

    setIsLimitModalOpen(false);
    setHasDismissedLimitModal(true);
  }, [downloadAndClearWorkspace]);

  const resetViewState = useCallback(() => {
    setIsQueueOpen(true);
    setIsEditorOpen(false);
    setImageToEdit(null);
    setPreviewRatio(null);
    setIsToolbarVisible(true);
    setIsDashboardModalOpen(false);
    setIsTrashModalOpen(false);
    setIsLimitModalOpen(false);
    setHasDismissedLimitModal(false);
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
    isToolbarVisible,
    toggleToolbar,
    isDashboardModalOpen,
    openDashboard,
    closeDashboard,
    isTrashModalOpen,
    openTrash,
    closeTrash,
    isLimitModalOpen,
    openEditor,
    closeEditor,
    dismissLimitModal,
    handleDownloadAndClear,
    resetViewState,
  };
}
