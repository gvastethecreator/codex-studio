import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconCopy as Copy,
  IconDownload as Download,
  IconHeart as Heart,
  IconMinus as Minus,
  IconPlus as Plus,
  IconRefresh as Reset,
  IconMaximize as Fit,
  IconArrowsMaximize as OpenFull,
  IconPaperclip as Paperclip,
} from '@tabler/icons-react';

import { buildCarouselThumbnailWindow } from '../../lib/imageCarouselThumbnails';
import { useImagePanZoom } from '../../lib/imagePanZoom';
import { useToastUi } from '../../contexts/GlobalContext';
import type { Attachment, GeneratedImageWithConfig } from '../../types';
import { RecipeWorkbenchContext } from './RecipeWorkbenchContext';

type StageBackground = 'dark' | 'light' | 'checkered';

export function RecipeResultPreview({
  images,
  reference,
  onOpen,
  onToggleFavorite,
  onUseAsReference,
  variant = 'default',
}: {
  images: GeneratedImageWithConfig[];
  reference?: Attachment;
  onOpen?: (image: GeneratedImageWithConfig) => void;
  onToggleFavorite?: (id: string) => void;
  onUseAsReference?: (image: GeneratedImageWithConfig) => void;
  variant?: 'default' | 'stage';
}) {
  const { addToast } = useToastUi();
  const { setCompare } = useContext(RecipeWorkbenchContext);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReference, setShowReference] = useState(false);
  const [background, setBackground] = useState<StageBackground>('dark');
  const selected = images.find((image) => image.id === selectedId) ?? images[0];
  const selectedIndex = selected ? images.findIndex((image) => image.id === selected.id) : -1;
  const src = showReference || !selected ? reference?.dataUrl : selected?.src;
  const isStage = variant === 'stage';
  const canCompare = Boolean(isStage && reference && selected);
  const toggleCompare = useCallback(() => {
    setShowReference((current) => !current);
  }, []);
  const panZoom = useImagePanZoom(isStage && Boolean(src) && !showReference);
  const thumbnailWindow = useMemo(
    () => buildCarouselThumbnailWindow(images, Math.max(selectedIndex, 0)),
    [images, selectedIndex],
  );

  useEffect(() => {
    if (!canCompare) {
      setCompare(null);
      return;
    }
    setCompare({ showReference, toggle: toggleCompare });
    return () => setCompare(null);
  }, [canCompare, setCompare, showReference, toggleCompare]);

  const selectIndex = (index: number) => {
    const image = images[index];
    if (!image) return;
    setSelectedId(image.id);
    setShowReference(false);
    panZoom.reset();
  };

  const handleCopy = async () => {
    if (!src) return;
    try {
      await copyImageToClipboard(src);
      addToast('Image copied to clipboard', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Could not copy image', 'error');
    }
  };

  const handleDownload = () => {
    if (!selected) return;
    downloadImage(
      selected.src,
      generateSmartFilename(
        selected.config.prompt,
        selected.id,
        selected.config.model,
        selected.config.aspectRatio,
      ),
    );
  };

  return (
    <section
      className={isStage ? 'recipe-result recipe-result-stage' : 'recipe-result'}
      data-result-variant={variant}
      data-stage-background={isStage ? background : undefined}
      aria-label="Result preview"
    >
      {!isStage ? (
        <div className="recipe-result-heading">
          <span>{showReference || !selected ? 'Reference preview' : 'Result'}</span>
          {reference && selected && (
            <button
              type="button"
              aria-pressed={showReference}
              onClick={() => setShowReference(!showReference)}
            >
              {showReference ? 'Show result' : 'Compare reference'}
            </button>
          )}
          {selected && !showReference && onOpen ? (
            <button type="button" onClick={() => onOpen(selected)}>
              Open result
            </button>
          ) : null}
        </div>
      ) : null}
      <div
        className={`recipe-result-image${isStage ? ` is-${background}` : ''}`}
        {...(isStage ? panZoom.viewportProps : {})}
        ref={isStage ? panZoom.viewportRef : undefined}
      >
        {src ? (
          <>
            {isStage && images.length > 1 ? (
              <>
                <button
                  type="button"
                  className="recipe-result-nav is-prev"
                  aria-label="Previous result"
                  disabled={selectedIndex <= 0}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => selectIndex(selectedIndex - 1)}
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className="recipe-result-nav is-next"
                  aria-label="Next result"
                  disabled={selectedIndex >= images.length - 1}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => selectIndex(selectedIndex + 1)}
                >
                  <ChevronRight size={22} />
                </button>
              </>
            ) : null}
            <img
              ref={isStage ? panZoom.contentRef : undefined}
              src={src}
              alt={showReference || !selected ? 'Reference image' : 'Generated result'}
              draggable={false}
            />
            {isStage ? (
              <>
                <div
                  className="recipe-result-actions"
                  role="toolbar"
                  aria-label="Selected result actions"
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <button type="button" aria-label="Copy image" onClick={() => void handleCopy()}>
                    <Copy size={15} />
                  </button>
                  <button type="button" aria-label="Download image" onClick={handleDownload}>
                    <Download size={15} />
                  </button>
                  {onToggleFavorite ? (
                    <button
                      type="button"
                      aria-label={
                        selected?.isFavorite ? 'Remove from favorites' : 'Add to favorites'
                      }
                      aria-pressed={Boolean(selected?.isFavorite)}
                      onClick={() => selected && onToggleFavorite(selected.id)}
                    >
                      <Heart size={15} />
                    </button>
                  ) : null}
                  {onUseAsReference && selected ? (
                    <button
                      type="button"
                      aria-label="Use as reference"
                      onClick={() => onUseAsReference(selected)}
                    >
                      <Paperclip size={15} />
                    </button>
                  ) : null}
                  {onOpen && selected ? (
                    <button type="button" aria-label="Open result" onClick={() => onOpen(selected)}>
                      <OpenFull size={15} />
                    </button>
                  ) : null}
                </div>
                <div
                  className="recipe-result-background"
                  role="group"
                  aria-label="Canvas background"
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-pressed={background === 'dark'}
                    aria-label="Dark background"
                    onClick={() => setBackground('dark')}
                  />
                  <button
                    type="button"
                    aria-pressed={background === 'light'}
                    aria-label="Light background"
                    onClick={() => setBackground('light')}
                  />
                  <button
                    type="button"
                    aria-pressed={background === 'checkered'}
                    aria-label="Checkered background"
                    onClick={() => setBackground('checkered')}
                  />
                </div>
                <div
                  className="recipe-result-zoom"
                  role="group"
                  aria-label="Zoom controls"
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <button type="button" aria-label="Zoom in" onClick={panZoom.zoomIn}>
                    <Plus size={14} />
                  </button>
                  <button type="button" aria-label="Zoom out" onClick={panZoom.zoomOut}>
                    <Minus size={14} />
                  </button>
                  <button type="button" aria-label="Fit image" onClick={panZoom.fit}>
                    <Fit size={14} />
                  </button>
                  <button type="button" aria-label="Reset zoom" onClick={panZoom.reset}>
                    <Reset size={14} />
                  </button>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div>
            <h2>Your next result starts here</h2>
            <p>Add a prompt or reference, choose your settings, then generate.</p>
          </div>
        )}
      </div>
      {images.length > 0 && (
        <div
          className="recipe-result-strip"
          aria-label={isStage ? 'Library results' : 'Recipe results'}
        >
          {(isStage ? thumbnailWindow.map((entry) => entry.item) : images.slice(0, 20)).map(
            (image, index) => {
              const resultIndex = isStage ? (thumbnailWindow[index]?.index ?? index) : index;
              return (
                <button
                  type="button"
                  key={image.id}
                  aria-label={`View result ${resultIndex + 1}`}
                  aria-pressed={selected?.id === image.id && !showReference}
                  onClick={() => selectIndex(resultIndex)}
                >
                  <img src={image.thumbnail || image.src} alt="" />
                </button>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}
