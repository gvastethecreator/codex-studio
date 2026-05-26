import React, { useCallback } from 'react';

import type { AspectRatio, GeneratedImage, GeneratedImageWithConfig } from '../../types';
import { downloadMultipleImagesAsZip } from '../../utils/fileUtils';
import { ErrorBoundary } from '../ErrorBoundary';
import { FormatPreview } from '../FormatPreview';
import { ImageGrid } from '../ImageGrid';

export interface StudioGridSurfaceProps {
  isModalOpen: boolean;
  activeWorkspaceId: string;
  allImages: GeneratedImage[];
  imagesWithConfig: GeneratedImageWithConfig[];
  selectedImageIds: string[];
  openModal: (image: GeneratedImageWithConfig) => void;
  handleSelectionChange: (id: string, selected: boolean) => void;
  handleGenerate: (
    promptOverride?: string,
    configOverrides?: Partial<GeneratedImageWithConfig['config']>,
    options?: { force?: boolean; preventModal?: boolean },
  ) => void;
  handleAddToContext: (image: GeneratedImageWithConfig) => void;
  handleLoadRecipe: (config: GeneratedImageWithConfig['config']) => void;
  handleDelete: (imageId: string) => void;
  handleToggleFavorite: (imageId: string) => void;
  isGenerating: boolean;
  hasProcessingJobs: boolean;
  transitioningImageId: string | null;
  activeModalImageId: string | null;
  handleSelectAll: (images: GeneratedImage[]) => void;
  handleDeselectAll: () => void;
  handleDeleteSelected: () => void;
  handleClearWorkspace: (workspaceId: string) => void;
  previewRatio: AspectRatio | null;
  generationAspectRatio: AspectRatio;
  isInteractingWithToolbar: boolean;
}

export const StudioGridSurface: React.FC<StudioGridSurfaceProps> = ({
  isModalOpen,
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
  isGenerating,
  hasProcessingJobs,
  transitioningImageId,
  activeModalImageId,
  handleSelectAll,
  handleDeselectAll,
  handleDeleteSelected,
  handleClearWorkspace,
  previewRatio,
  generationAspectRatio,
  isInteractingWithToolbar,
}) => {
  const handleGridRegenerate = useCallback(
    (config: GeneratedImageWithConfig['config']) => {
      handleGenerate(config.prompt, config, { preventModal: true });
    },
    [handleGenerate],
  );

  const handleGridSelectAll = useCallback(() => {
    handleSelectAll(allImages);
  }, [allImages, handleSelectAll]);

  const handleGridDownloadSelected = useCallback(() => {
    const selectedImages = imagesWithConfig.filter((image) => selectedImageIds.includes(image.id));
    if (selectedImages.length > 0) {
      void downloadMultipleImagesAsZip(selectedImages, `assets-${Date.now()}.zip`);
    }
  }, [imagesWithConfig, selectedImageIds]);

  const handleGridDownloadAll = useCallback(() => {
    if (imagesWithConfig.length > 0) {
      void downloadMultipleImagesAsZip(imagesWithConfig, `assets-${Date.now()}.zip`);
    }
  }, [imagesWithConfig]);

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
            isGenerating={isGenerating || hasProcessingJobs}
            transitioningImageId={transitioningImageId}
            activeModalImageId={activeModalImageId}
            onSelectAll={handleGridSelectAll}
            onDeselectAll={handleDeselectAll}
            onDownloadSelected={handleGridDownloadSelected}
            onDownloadAll={handleGridDownloadAll}
            onDeleteSelected={handleDeleteSelected}
            onClearWorkspace={handleGridClearWorkspace}
          />
        </ErrorBoundary>
      </div>
      <FormatPreview
        ratio={previewRatio || generationAspectRatio}
        isVisible={!isModalOpen && (isInteractingWithToolbar || !!previewRatio)}
        isWorkspaceEmpty={allImages.length === 0}
      />
    </div>
  );
};
