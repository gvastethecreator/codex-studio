import { useMemo } from 'react';
import type { StudioCatalogView } from '../lib/studioCatalogView';
import { materializeCatalogEntryImageWithConfig } from '../lib/studioCatalogImageAdapter';
import type { GeneratedImageWithConfig } from '../types';
import { useImageManager } from './useImageManager';

interface UseStudioGalleryProps {
  catalogView?: StudioCatalogView;
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

export function buildStudioGalleryImages(
  catalogView: StudioCatalogView,
): GeneratedImageWithConfig[] {
  return catalogView.entries.map(materializeCatalogEntryImageWithConfig);
}

/**
 * Build the Studio's visual image grid from Catalog Entries.
 */
export function useStudioGallery({
  catalogView,
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
  const catalogImagesWithConfig = useMemo(() => {
    if (!catalogView) return [];
    return buildStudioGalleryImages(catalogView);
  }, [catalogView]);

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
    images: catalogImagesWithConfig,
    deleteImage,
    deleteImages,
    toggleImageFavorite,
    clearWorkspace,
    log,
    modalImage,
    handleCloseModal: closeModal,
    onRequestClearWorkspace,
  });

  return {
    allImages,
    imagesWithConfig: catalogImagesWithConfig,
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
