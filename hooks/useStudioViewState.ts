import type React from 'react';
import { useCallback, useState } from 'react';
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

export interface StudioViewStateController {
  queue: {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };
  editor: {
    isOpen: boolean;
    setIsOpen: (value: React.SetStateAction<boolean>) => void;
    image: Attachment | null;
    setImage: (value: React.SetStateAction<Attachment | null>) => void;
    open: (attachment: Attachment, openEditorRoute: () => void) => void;
    close: () => void;
    closeState: () => void;
  };
  preview: {
    ratio: AspectRatio | null;
    setRatio: React.Dispatch<React.SetStateAction<AspectRatio | null>>;
  };
  overlays: {
    dashboard: {
      isOpen: boolean;
      open: () => void;
      close: () => void;
    };
    settings: {
      isOpen: boolean;
      open: () => void;
      close: () => void;
    };
    trash: {
      isOpen: boolean;
      open: () => void;
      close: () => void;
    };
  };
  actions: {
    handleDownloadAndClear: () => Promise<boolean>;
    reset: () => void;
  };
}

export function useStudioViewState({
  closeOverlay,
}: UseStudioViewStateProps): StudioViewStateController {
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

  const setEditorIsOpen = useCallback((value: React.SetStateAction<boolean>) => {
    setEditorState((prev) => ({
      ...prev,
      isOpen: typeof value === 'function' ? value(prev.isOpen) : value,
    }));
  }, []);

  const setEditorImage = useCallback((value: React.SetStateAction<Attachment | null>) => {
    setEditorState((prev) => ({
      ...prev,
      image: typeof value === 'function' ? value(prev.image) : value,
    }));
  }, []);

  const closeEditorState = useCallback(() => {
    setEditorState(INITIAL_EDITOR_STATE);
  }, []);

  return {
    queue: {
      isOpen: isQueueOpen,
      setIsOpen: setIsQueueOpen,
    },
    editor: {
      isOpen: editorState.isOpen,
      setIsOpen: setEditorIsOpen,
      image: editorState.image,
      setImage: setEditorImage,
      open: openEditor,
      close: closeEditor,
      closeState: closeEditorState,
    },
    preview: {
      ratio: previewRatio,
      setRatio: setPreviewRatio,
    },
    overlays: {
      dashboard: {
        isOpen: isDashboardModalOpen,
        open: openDashboard,
        close: closeDashboard,
      },
      settings: {
        isOpen: isSettingsModalOpen,
        open: openSettings,
        close: closeSettings,
      },
      trash: {
        isOpen: isTrashModalOpen,
        open: openTrash,
        close: closeTrash,
      },
    },
    actions: {
      handleDownloadAndClear,
      reset: resetViewState,
    },
  };
}
