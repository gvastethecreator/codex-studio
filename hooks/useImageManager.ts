import { useState, useCallback, useMemo } from 'react';
import type { GeneratedImage, GenerationBatch, GeneratedImageWithConfig } from '../types';

import { startViewTransition } from '../utils/transitionUtils';

interface UseImageManagerProps {
  log: (message: string) => void;
  handleCloseModal: () => void;
  modalImage?: GeneratedImageWithConfig | null;
  batches: GenerationBatch[];
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
  batches,
  deleteImage,
  deleteImages,
  toggleImageFavorite,
  clearWorkspace,
  onRequestClearWorkspace,
}: UseImageManagerProps) => {
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);

  // OPTIMIZATION: Memoize allImages to prevent new references on every render
  const allImages = useMemo(() => {
    return batches.flatMap((b) => b.images);
  }, [batches]);

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
        if (!batches.some((batch) => batch.images.some((img) => img.id === imageId))) return;

        deleteImage(imageId);

        setSelectedImageIds((prev) => prev.filter((id) => id !== imageId));
        if (modalImage?.id === imageId) {
          handleCloseModal();
        }
        log(`Moved image ${imageId} to archives`);
      };

      startViewTransition(performDelete);
    },
    [batches, modalImage, deleteImage, handleCloseModal, log],
  );

  const handleDeleteSelected = useCallback(() => {
    const performDelete = () => {
      if (selectedImageIds.length > 0) {
        deleteImages(selectedImageIds);
        log(`Moved ${selectedImageIds.length} selected images to archives.`);
        if (modalImage && selectedImageIds.includes(modalImage.id)) {
          handleCloseModal();
        }
        setSelectedImageIds([]);
      }
    };
    startViewTransition(performDelete);
  }, [selectedImageIds, deleteImages, log, modalImage, handleCloseModal]);

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
        log(`Moved workspace ${activeWorkspaceId} batches to archives.`);
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
