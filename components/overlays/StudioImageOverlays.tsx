import React, { Suspense } from 'react';

import { ErrorBoundary } from '../ErrorBoundary';
import ImageCarousel from '../ImageCarousel';
import { LazySurfaceFallback } from '../ui/LazySurfaceFallback';
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
        <ErrorBoundary fallbackMessage="Could not load the image editor.">
          <Suspense
            fallback={
              <LazySurfaceFallback
                label="Loading editor"
                className="fixed inset-0 z-50 grid place-items-center bg-black/60 text-zinc-400"
              />
            }
          >
            <ImageEditorModal
              isOpen={isEditorOpen}
              onClose={closeEditor}
              image={imageToEdit}
              onGenerate={handleExecuteEdit}
              isGenerating={isEditingImage}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
};
