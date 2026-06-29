import { useState, useCallback, useMemo } from 'react';
import type { GeneratedImage, GeneratedImageWithConfig } from '../types';

import { startViewTransition } from '../utils/transitionUtils';

interface UseImageManagerProps {
  log: (message: string) => void;
  handleCloseModal: () => void;
  modalImage?: GeneratedImageWithConfig | null;
  images?: GeneratedImage[];
  deleteImage: (imageId: string) => void;
  deleteImages: (imageIds: string[]) => void;
  toggleImageFavorite: (imageId: string) => void;
  clearWorkspace: (workspaceId: string) => void;
  onRequestClearWorkspace?: (workspaceId: string, imageCount: number) => void;
}

/**
 * A custom hook to manage the state and actions related to the image gallery.
 * This includes handling image selection, deletion (single and multiple),
 * and providing a flattened list of all images for rendering.
 */
export const useImageManager = ({
  log,
  handleCloseModal,
  modalImage,
  images,
  deleteImage,
  deleteImages,
  toggleImageFavorite,
  clearWorkspace,
  onRequestClearWorkspace,
}: UseImageManagerProps) => {
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);

  const allImages = useMemo(() => {
    return images ?? [];
  }, [images]);

  const handleSelectionChange = useCallback((id: string, selected: boolean) => {
    startViewTransition(() => {
      setSelectedImageIds((prev) =>
        selected ? [...prev, id] : prev.filter((imageId) => imageId !== id),
      );
    });
  }, []);

  const handleDelete = useCallback(
    (imageId: string) => {
      const performDelete = () => {
        if (!allImages.some((image) => image.id === imageId)) return;

        deleteImage(imageId);

        setSelectedImageIds((prev) => prev.filter((id) => id !== imageId));
        if (modalImage?.id === imageId) {
          handleCloseModal();
        }
        log(`Moved image ${imageId} to archives`);
      };

      startViewTransition(performDelete);
    },
    [allImages, modalImage, deleteImage, handleCloseModal, log],
  );

  const handleDeleteSelected = useCallback(
    (imageIds = selectedImageIds) => {
      const performDelete = () => {
        if (imageIds.length > 0) {
          deleteImages(imageIds);
          log(`Moved ${imageIds.length} selected images to archives.`);
          if (modalImage && imageIds.includes(modalImage.id)) {
            handleCloseModal();
          }
          setSelectedImageIds((prev) => prev.filter((id) => !imageIds.includes(id)));
        }
      };
      startViewTransition(performDelete);
    },
    [selectedImageIds, deleteImages, log, modalImage, handleCloseModal],
  );

  const handleSelectAll = useCallback(
    (images: GeneratedImage[]) => {
      startViewTransition(() => {
        setSelectedImageIds(images.map((img) => img.id));
        log(`Selected all ${images.length} images.`);
      });
    },
    [log],
  );

  const handleDeselectAll = useCallback(() => {
    startViewTransition(() => {
      setSelectedImageIds([]);
      log('Deselected all images.');
    });
  }, [log]);

  const handleToggleFavorite = useCallback(
    (imgId: string) => {
      toggleImageFavorite(imgId);
    },
    [toggleImageFavorite],
  );

  const handleClearWorkspace = useCallback(
    (activeWorkspaceId: string) => {
      if (onRequestClearWorkspace) {
        onRequestClearWorkspace(activeWorkspaceId, allImages.length);
        return;
      }

      startViewTransition(() => {
        clearWorkspace(activeWorkspaceId);
        setSelectedImageIds([]);
        log(`Moved workspace ${activeWorkspaceId} images to archives.`);
      });
    },
    [allImages.length, clearWorkspace, log, onRequestClearWorkspace],
  );

  return {
    allImages,
    selectedImageIds,
    handleSelectionChange,
    handleDelete,
    handleDeleteSelected,
    handleSelectAll,
    handleDeselectAll,
    handleToggleFavorite,
    handleClearWorkspace,
  };
};
