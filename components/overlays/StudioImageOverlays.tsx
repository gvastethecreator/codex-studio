import React, { Suspense } from 'react';

import ImageCarousel from '../ImageCarousel';
import type { StudioImageOverlaysProps } from './types';

const ImageEditorModal = React.lazy(() =>
  import('../ImageEditorModal').then((m) => ({ default: m.ImageEditorModal })),
);

export const StudioImageOverlays: React.FC<StudioImageOverlaysProps> = ({
  modalImage,
  imagesWithConfig,
  activeGenerationConfig,
  closeModal,
  handleDelete,
  handleGenerate,
  handleAddToContext,
  handleLoadRecipe,
  handleToggleFavorite,
  setActiveCarouselId,
  isEditorOpen,
  closeEditor,
  imageToEdit,
  handleExecuteEdit,
  isEditingImage,
}) => {
  return (
    <>
      {modalImage && (
        <ImageCarousel
          activeImage={modalImage}
          allImages={imagesWithConfig}
          activeGenerationConfig={activeGenerationConfig}
          onClose={closeModal}
          onDelete={handleDelete}
          onRegenerate={(config) =>
            handleGenerate(config.prompt, config, {
              preventModal: true,
              useCurrentAttachments: true,
            })
          }
          onAddToContext={(image) => {
            handleAddToContext(image);
            closeModal();
          }}
          onLoadConfig={(config) => {
            handleLoadRecipe(config);
            closeModal();
          }}
          onToggleFavorite={handleToggleFavorite}
          onActiveImageChange={setActiveCarouselId}
          transitionName="master-canvas"
        />
      )}
      {isEditorOpen && (
        <Suspense fallback={null}>
          <ImageEditorModal
            isOpen={isEditorOpen}
            onClose={closeEditor}
            image={imageToEdit}
            onGenerate={handleExecuteEdit}
            isGenerating={isEditingImage}
          />
        </Suspense>
      )}
    </>
  );
};
