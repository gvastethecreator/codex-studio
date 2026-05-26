import { useMemo } from 'react';
import type { StudioCatalogView } from '../lib/studioCatalogView';
import { materializeCatalogEntryImageWithConfig } from '../lib/studioCatalogVisualBatchAdapter';
import type { GeneratedImage, GenerationBatch, GeneratedImageWithConfig } from '../types';
import { useImageManager } from './useImageManager';

interface UseStudioGalleryProps {
  catalogView?: StudioCatalogView;
  legacyVisualBatches?: GenerationBatch[];
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

export function buildStudioGalleryImages({
  catalogView,
  allImages,
  legacyVisualBatches = [],
}: {
  catalogView?: StudioCatalogView;
  allImages: GeneratedImage[];
  legacyVisualBatches?: GenerationBatch[];
}): GeneratedImageWithConfig[] {
  const images = catalogView
    ? catalogView.entries.map(materializeCatalogEntryImageWithConfig)
    : allImages.map((image) => {
        const batch = legacyVisualBatches.find((entry) => entry.id === image.batchId);
        return { ...image, config: batch?.config } as GeneratedImageWithConfig;
      });

  return images.sort((left, right) => {
    if (left.isFavorite === right.isFavorite) return right.createdAt - left.createdAt;
    return left.isFavorite ? -1 : 1;
  });
}

/**
 * Build the Studio's visual image grid from Catalog Entries first, with legacy
 * Visual Batches left only as fallback compatibility input.
 */
export function useStudioGallery({
  catalogView,
  legacyVisualBatches = [],
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
  const workspaceLegacyVisualBatches = useMemo(() => {
    return legacyVisualBatches.filter(
      (batch) =>
        batch.workspaceId === activeWorkspaceId ||
        (!batch.workspaceId && activeWorkspaceId === 'default'),
    );
  }, [activeWorkspaceId, legacyVisualBatches]);

  const catalogImagesWithConfig = useMemo(() => {
    if (!catalogView) return null;
    return buildStudioGalleryImages({
      catalogView,
      allImages: [],
    });
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
    legacyVisualBatches: workspaceLegacyVisualBatches,
    images: catalogImagesWithConfig ?? undefined,
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
    if (catalogImagesWithConfig) {
      return catalogImagesWithConfig;
    }

    return buildStudioGalleryImages({
      allImages,
      legacyVisualBatches,
    });
  }, [allImages, catalogImagesWithConfig, legacyVisualBatches]);

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
