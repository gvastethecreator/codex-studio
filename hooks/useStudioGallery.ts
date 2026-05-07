import { useMemo } from 'react';
import type { GenerationBatch, GeneratedImageWithConfig } from '../types';
import { useImageManager } from './useImageManager';

interface UseStudioGalleryProps {
  batches: GenerationBatch[];
  activeWorkspaceId: string;
  deleteImage: (imageId: string) => void;
  deleteImages: (imageIds: string[]) => void;
  toggleImageFavorite: (imageId: string) => void;
  clearWorkspace: (workspaceId: string) => void;
  log: (message: string) => void;
  modalImage: GeneratedImageWithConfig | null;
  closeModal: () => void;
  onRequestClearWorkspace?: (workspaceId: string, imageCount: number) => void;
}

/**
 * Build the Studio's visual image grid from the current Visual Batches and own
 * selection/archive interactions behind one module.
 */
export function useStudioGallery({
  batches,
  activeWorkspaceId,
  deleteImage,
  deleteImages,
  toggleImageFavorite,
  clearWorkspace,
  log,
  modalImage,
  closeModal,
  onRequestClearWorkspace,
}: UseStudioGalleryProps) {
  const workspaceBatches = useMemo(() => {
    return batches.filter(
      (batch) =>
        batch.workspaceId === activeWorkspaceId ||
        (!batch.workspaceId && activeWorkspaceId === 'default'),
    );
  }, [activeWorkspaceId, batches]);

  const {
    allImages,
    selectedImageIds,
    handleSelectionChange,
    handleDelete,
    handleDeleteSelected,
    handleSelectAll,
    handleDeselectAll,
    handleToggleFavorite,
    handleClearWorkspace,
  } = useImageManager({
    batches: workspaceBatches,
    deleteImage,
    deleteImages,
    toggleImageFavorite,
    clearWorkspace,
    log,
    modalImage,
    handleCloseModal: closeModal,
    onRequestClearWorkspace,
  });

  const imagesWithConfig = useMemo(() => {
    return allImages
      .map((image) => {
        const batch = batches.find((entry) => entry.id === image.batchId);
        return { ...image, config: batch?.config } as GeneratedImageWithConfig;
      })
      .sort((left, right) => {
        if (left.isFavorite === right.isFavorite) return right.createdAt - left.createdAt;
        return left.isFavorite ? -1 : 1;
      });
  }, [allImages, batches]);

  return {
    allImages,
    imagesWithConfig,
    selectedImageIds,
    handleSelectionChange,
    handleDelete,
    handleDeleteSelected,
    handleSelectAll,
    handleDeselectAll,
    handleToggleFavorite,
    handleClearWorkspace,
  };
}
