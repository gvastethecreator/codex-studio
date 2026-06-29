import React, { useCallback } from 'react';

import type { AspectRatio, GeneratedImage, GeneratedImageWithConfig } from '../../types';
import { downloadMultipleImagesAsZip } from '../../utils/fileUtils';
import { ErrorBoundary } from '../ErrorBoundary';
import { FormatPreview } from '../FormatPreview';
import { ImageGrid } from '../ImageGrid';

export interface StudioGridSurfaceProps {
  activeWorkspaceId: string;
  allImages: GeneratedImage[];
  imagesWithConfig: GeneratedImageWithConfig[];
  selectedImageIds: string[];
  openModal: (image: GeneratedImageWithConfig) => void;
  handleSelectionChange: (id: string, selected: boolean) => void;
  handleGenerate: (
    promptOverride?: string,
    configOverrides?: Partial<GeneratedImageWithConfig['config']>,
    options?: { force?: boolean; preventModal?: boolean; useCurrentAttachments?: boolean },
  ) => void;
  handleAddToContext: (image: GeneratedImageWithConfig) => void;
  handleLoadRecipe: (config: GeneratedImageWithConfig['config']) => void;
  handleDelete: (imageId: string) => void;
  handleToggleFavorite: (imageId: string) => void;
  transitioningImageId: string | null;
  activeModalImageId: string | null;
  handleSelectAll: (images: GeneratedImage[]) => void;
  handleDeselectAll: () => void;
  handleDeleteSelected: (imageIds?: string[]) => void;
  handleClearWorkspace: (workspaceId: string) => void;
  chrome: {
    isModalOpen: boolean;
    isInteractingWithToolbar: boolean;
    previewRatio: AspectRatio | null;
    generationAspectRatio: AspectRatio;
  };
  generation: {
    isGenerating: boolean;
    placeholders?: React.ComponentProps<typeof ImageGrid>['generationPlaceholders'];
  };
  catalog: {
    total: number;
    hasMore: boolean;
    isLoading: boolean;
    error: string | null;
    loadMore: () => void;
    refresh: () => void;
  };
}

export const StudioGridSurface: React.FC<StudioGridSurfaceProps> = ({
  activeWorkspaceId,
  allImages,
  imagesWithConfig,
  selectedImageIds,
  openModal,
  handleSelectionChange,
  handleGenerate,
  handleAddToContext,
  handleLoadRecipe,
  handleDelete,
  handleToggleFavorite,
  transitioningImageId,
  activeModalImageId,
  handleSelectAll,
  handleDeselectAll,
  handleDeleteSelected,
  handleClearWorkspace,
  chrome,
  generation,
  catalog,
}) => {
  const handleGridRegenerate = useCallback(
    (config: GeneratedImageWithConfig['config']) => {
      handleGenerate(config.prompt, config, {
        preventModal: true,
        useCurrentAttachments: true,
      });
    },
    [handleGenerate],
  );

  const handleGridSelectAll = useCallback(
    (visibleImages: GeneratedImageWithConfig[]) => {
      handleSelectAll(visibleImages);
    },
    [handleSelectAll],
  );

  const handleGridDownloadSelected = useCallback(
    (visibleImages: GeneratedImageWithConfig[]) => {
      const selectedImages = visibleImages.filter((image) => selectedImageIds.includes(image.id));
      if (selectedImages.length > 0) {
        void downloadMultipleImagesAsZip(selectedImages, `assets-${Date.now()}.zip`);
      }
    },
    [selectedImageIds],
  );

  const handleGridDownloadAll = useCallback((visibleImages: GeneratedImageWithConfig[]) => {
    if (visibleImages.length > 0) {
      void downloadMultipleImagesAsZip(visibleImages, `assets-${Date.now()}.zip`);
    }
  }, []);

  const handleGridDeleteSelected = useCallback(
    (visibleImages: GeneratedImageWithConfig[]) => {
      handleDeleteSelected(
        visibleImages
          .filter((image) => selectedImageIds.includes(image.id))
          .map((image) => image.id),
      );
    },
    [handleDeleteSelected, selectedImageIds],
  );

  const handleGridClearWorkspace = useCallback(() => {
    handleClearWorkspace(activeWorkspaceId);
  }, [activeWorkspaceId, handleClearWorkspace]);

  return (
    <div className="flex-1 h-full relative overflow-hidden flex flex-col">
      <div className="flex-1 relative min-h-0">
        <ErrorBoundary fallbackMessage="Failed to render the image grid.">
          <ImageGrid
            key={activeWorkspaceId}
            images={imagesWithConfig}
            selectedImageIds={selectedImageIds}
            onImageClick={openModal}
            onSelectionChange={handleSelectionChange}
            onRegenerate={handleGridRegenerate}
            onAddToContext={handleAddToContext}
            onLoadConfig={handleLoadRecipe}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
            isGenerating={generation.isGenerating}
            transitioningImageId={transitioningImageId}
            activeModalImageId={activeModalImageId}
            generationPlaceholders={generation.placeholders}
            onSelectAll={handleGridSelectAll}
            onDeselectAll={handleDeselectAll}
            onDownloadSelected={handleGridDownloadSelected}
            onDownloadAll={handleGridDownloadAll}
            onDeleteSelected={handleGridDeleteSelected}
            onClearWorkspace={handleGridClearWorkspace}
            catalogTotal={catalog.total}
            hasMore={catalog.hasMore}
            isCatalogLoading={catalog.isLoading}
            catalogError={catalog.error}
            onLoadMore={catalog.loadMore}
            onRetryCatalog={catalog.refresh}
          />
        </ErrorBoundary>
      </div>
      <FormatPreview
        ratio={chrome.previewRatio || chrome.generationAspectRatio}
        isVisible={
          !chrome.isModalOpen && (chrome.isInteractingWithToolbar || !!chrome.previewRatio)
        }
        isWorkspaceEmpty={allImages.length === 0}
      />
    </div>
  );
};
