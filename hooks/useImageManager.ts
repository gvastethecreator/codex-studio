import { useState, useCallback, useMemo, useEffect } from 'react';
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
  const [storedSelection, setSelectedImageIds] = useState<string[]>([]);

  const allImages = useMemo(() => {
    return images ?? [];
  }, [images]);

  const availableIds = useMemo(() => new Set(allImages.map((image) => image.id)), [allImages]);
  const selectedImageIds = useMemo(
    () => storedSelection.filter((id) => availableIds.has(id)),
    [storedSelection, availableIds],
  );
  useEffect(() => {
    setSelectedImageIds((previous) =>
      previous.every((id) => availableIds.has(id))
        ? previous
        : previous.filter((id) => availableIds.has(id)),
    );
  }, [availableIds]);

  const handleSelectionChange = useCallback(
    (id: string, selected: boolean) => {
      startViewTransition(() => {
        setSelectedImageIds((prev) =>
          selected
            ? prev.includes(id) || !availableIds.has(id)
              ? prev
              : [...prev, id]
            : prev.filter((imageId) => imageId !== id),
        );
      });
    },
    [availableIds],
  );

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
      imageIds = [...new Set(imageIds)].filter((id) => availableIds.has(id));
      const performDelete = () => {
        if (imageIds.length > 0) {
          const imageIdSet = new Set(imageIds);
          deleteImages(imageIds);
          log(`Moved ${imageIds.length} selected images to archives.`);
          if (modalImage && imageIdSet.has(modalImage.id)) {
            handleCloseModal();
          }
          setSelectedImageIds((prev) => prev.filter((id) => !imageIdSet.has(id)));
        }
      };
      startViewTransition(performDelete);
    },
    [selectedImageIds, availableIds, deleteImages, log, modalImage, handleCloseModal],
  );

  const handleSelectAll = useCallback(
    (images: GeneratedImage[]) => {
      startViewTransition(() => {
        setSelectedImageIds(
          [...new Set(images.map((img) => img.id))].filter((id) => availableIds.has(id)),
        );
        log(`Selected all ${images.length} images.`);
      });
    },
    [log, availableIds],
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
