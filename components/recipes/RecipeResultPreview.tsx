import type { UseCatalogResult } from '../../hooks/useCatalogPage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconCopy as Copy,
  IconDownload as Download,
  IconHeart as Heart,
  IconMinus as Minus,
  IconPlus as Plus,
  IconArrowsMaximize as OpenFull,
  IconPaperclip as Paperclip,
} from '@tabler/icons-react';

import { buildCarouselThumbnailWindow } from '../../lib/imageCarouselThumbnails';
import { useImagePanZoom } from '../../lib/imagePanZoom';
import { useHorizontalDragScroll } from '../../hooks/useHorizontalDragScroll';
import { useToastUi } from '../../contexts/GlobalContext';
import type { Attachment, GeneratedImageWithConfig } from '../../types';
import { copyImageToClipboard, downloadImage, generateSmartFilename } from '../../utils/fileUtils';
import Tooltip from '../Tooltip';

type StageBackground = 'dark' | 'light' | 'checkered';
type NavSide = 'prev' | 'next' | null;

function hasFineHoverPointer() {
  if (typeof window.matchMedia !== 'function') return true;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function RecipeResultPreview({
  images,
  reference,
  onOpen,
  onToggleFavorite,
  onUseAsReference,
  variant = 'default',
  emptyTitle = 'Your next result starts here',
  isGenerating = false,
  history,
  selectedId: externalSelectedId,
  onSelectId,
}: {
  images: GeneratedImageWithConfig[];
  reference?: Attachment;
  onOpen?: (image: GeneratedImageWithConfig) => void;
  onToggleFavorite?: (id: string) => void;
  onUseAsReference?: (image: GeneratedImageWithConfig) => void;
  variant?: 'default' | 'stage';
  emptyTitle?: string;
  isGenerating?: boolean;
  history?: UseCatalogResult;
  selectedId?: string | null;
  onSelectId?: (id: string) => void;
}) {
  const { addToast } = useToastUi();
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const selectedId = externalSelectedId === undefined ? localSelectedId : externalSelectedId;
  const setSelectedId = onSelectId ?? setLocalSelectedId;
  const previousIndex = useRef(0);
  const previousScope = useRef(history?.scopeKey);
  const [showReference, setShowReference] = useState(false);
  const [background, setBackground] = useState<StageBackground>('dark');
  const [navSide, setNavSide] = useState<NavSide>(null);
  const [canvasFocused, setCanvasFocused] = useState(false);
  const selected = images.find((image) => image.id === selectedId) ?? images[0];
  const selectedIndex = selected ? images.findIndex((image) => image.id === selected.id) : -1;
  useEffect(() => {
    if (previousScope.current !== history?.scopeKey) {
      previousIndex.current = 0;
      previousScope.current = history?.scopeKey;
    }
    if (!selectedId && images.length) setSelectedId(images[0].id);
    else if (selectedId && !images.some((image) => image.id === selectedId) && images.length) {
      setSelectedId(images[Math.min(previousIndex.current, images.length - 1)].id);
    } else if (selectedIndex >= 0) previousIndex.current = selectedIndex;
  }, [images, selectedId, selectedIndex, setSelectedId, history?.scopeKey]);
  useEffect(() => {
    if (
      history?.hasMore &&
      !history.isLoading &&
      !history.error &&
      selectedIndex >= images.length - 12
    )
      void history.loadMore();
  }, [history, images.length, selectedIndex]);
  const src = showReference || !selected ? reference?.dataUrl : selected?.src;
  const isStage = variant === 'stage';
  const canCompare = Boolean(isStage && reference && selected);
  const panZoom = useImagePanZoom(isStage && Boolean(src), src);
  const stripRef = useRef<HTMLDivElement>(null);
  const stripDrag = useHorizontalDragScroll(stripRef);
  const thumbnailWindow = useMemo(
    () => buildCarouselThumbnailWindow(images, Math.max(selectedIndex, 0)),
    [images, selectedIndex],
  );
  const fineHover = hasFineHoverPointer();
  const showPrevNav =
    isStage &&
    images.length > 1 &&
    selectedIndex > 0 &&
    (!fineHover || canvasFocused || navSide === 'prev');
  const showNextNav =
    isStage &&
    images.length > 1 &&
    selectedIndex >= 0 &&
    selectedIndex < images.length - 1 &&
    (!fineHover || canvasFocused || navSide === 'next');

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
    if (!src) return;
    downloadImage(
      src,
      selected
        ? generateSmartFilename(
            selected.config.prompt,
            selected.id,
            selected.config.model,
            selected.config.aspectRatio,
          )
        : 'reference.png',
    );
  };

  const handleCanvasPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width || event.currentTarget.clientWidth || 1;
    const x = event.clientX - rect.left;
    setNavSide(x < width / 2 ? 'prev' : 'next');
  }, []);

  return (
    <section
      className={isStage ? 'recipe-result recipe-result-stage' : 'recipe-result'}
      data-result-variant={variant}
      data-stage-background={isStage ? background : undefined}
      aria-label="Result preview"
      aria-busy={isGenerating}
    >
      {history && (
        <div className="carousel-history-status" role="status">
          <span>{history.isLoading ? 'Loading images…' : `${history.total} images`}</span>
          {history.error && (
            <button
              type="button"
              onClick={() =>
                void (history.hasMore ? history.loadMore() : history.refresh()).catch(
                  () => undefined,
                )
              }
            >
              Could not load images · Retry
            </button>
          )}
        </div>
      )}
      {isGenerating && (
        <div className="recipe-result-progress" role="status">
          Generating… Your result will appear here.
        </div>
      )}
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
      {isStage && src ? (
        <div className="recipe-result-toolbar">
          <div
            className="recipe-result-toolbar-row"
            role="toolbar"
            aria-label="Selected result actions"
          >
            <span
              className="result-context-label"
              data-tooltip={
                showReference || !selected
                  ? 'Source image'
                  : isGenerating
                    ? 'Previous result'
                    : reference?.dataUrl === selected.src
                      ? 'Result · used as source'
                      : 'Recent result · not attached as source'
              }
            >
              {showReference || !selected
                ? 'Source image'
                : isGenerating
                  ? 'Previous result'
                  : reference?.dataUrl === selected.src
                    ? 'Used as source'
                    : 'Not a source'}
            </span>
            {canCompare ? (
              <Tooltip content={showReference ? 'Show result' : 'Compare reference'}>
                <button
                  type="button"
                  aria-pressed={showReference}
                  aria-label={showReference ? 'Show result' : 'Compare reference'}
                  onClick={() => setShowReference((current) => !current)}
                >
                  {showReference ? 'Result' : 'Compare'}
                </button>
              </Tooltip>
            ) : null}
            <Tooltip content="Copy image">
              <button type="button" aria-label="Copy image" onClick={() => void handleCopy()}>
                <Copy size={14} />
              </button>
            </Tooltip>
            <Tooltip content="Download image">
              <button type="button" aria-label="Download image" onClick={handleDownload}>
                <Download size={14} />
              </button>
            </Tooltip>
            {onToggleFavorite ? (
              <Tooltip
                content={selected?.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <button
                  type="button"
                  aria-label={selected?.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-pressed={Boolean(selected?.isFavorite)}
                  onClick={() => selected && onToggleFavorite(selected.id)}
                >
                  <Heart size={14} />
                </button>
              </Tooltip>
            ) : null}
            {onUseAsReference && selected ? (
              <Tooltip content="Use as source">
                <button
                  type="button"
                  aria-label="Use as source"
                  onClick={() => onUseAsReference(selected)}
                >
                  <Paperclip size={14} />
                </button>
              </Tooltip>
            ) : null}
            {onOpen && selected ? (
              <Tooltip content="Open result">
                <button type="button" aria-label="Open result" onClick={() => onOpen(selected)}>
                  <OpenFull size={14} />
                </button>
              </Tooltip>
            ) : null}
            <div className="result-view-controls">
              <div className="recipe-result-background" role="group" aria-label="Canvas background">
                <Tooltip content="Dark background">
                  <button
                    type="button"
                    aria-pressed={background === 'dark'}
                    aria-label="Dark background"
                    onClick={() => setBackground('dark')}
                  />
                </Tooltip>
                <Tooltip content="Light background">
                  <button
                    type="button"
                    aria-pressed={background === 'light'}
                    aria-label="Light background"
                    onClick={() => setBackground('light')}
                  />
                </Tooltip>
                <Tooltip content="Checkered background">
                  <button
                    type="button"
                    aria-pressed={background === 'checkered'}
                    aria-label="Checkered background"
                    onClick={() => setBackground('checkered')}
                  />
                </Tooltip>
              </div>
              <div className="recipe-result-zoom" role="group" aria-label="Zoom controls">
                <Tooltip content="Zoom out">
                  <button type="button" aria-label="Zoom out" onClick={panZoom.zoomOut}>
                    <Minus size={14} />
                  </button>
                </Tooltip>
                <Tooltip content="Reset zoom to 100%">
                  <button
                    type="button"
                    className="recipe-result-scale"
                    aria-label="Reset zoom to 100%"
                    onClick={panZoom.reset}
                  >
                    {Math.round(panZoom.scale * 100)}%
                  </button>
                </Tooltip>
                <Tooltip content="Zoom in">
                  <button type="button" aria-label="Zoom in" onClick={panZoom.zoomIn}>
                    <Plus size={14} />
                  </button>
                </Tooltip>
              </div>
            </div>
            {selected?.config.prompt ? (
              <p className="recipe-result-prompt" data-tooltip={selected.config.prompt}>
                {selected.config.prompt}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      <div
        className={`recipe-result-image${isStage ? ` is-${background}` : ''}`}
        role={isStage ? 'group' : undefined}
        aria-label={isStage ? 'Image canvas' : undefined}
        aria-description={
          isStage
            ? 'Drag to pan. Scroll or press + and - to zoom. Press 0 to fit the image.'
            : undefined
        }
        tabIndex={isStage && src ? 0 : undefined}
        data-nav-side={isStage ? (navSide ?? undefined) : undefined}
        {...(isStage ? panZoom.viewportProps : {})}
        ref={isStage ? panZoom.viewportRef : undefined}
        onPointerMove={
          isStage
            ? (event) => {
                panZoom.viewportProps.onPointerMove(event);
                handleCanvasPointerMove(event);
              }
            : undefined
        }
        onPointerLeave={
          isStage
            ? () => {
                setNavSide(null);
              }
            : undefined
        }
        onFocusCapture={isStage ? () => setCanvasFocused(true) : undefined}
        onBlurCapture={
          isStage
            ? (event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setCanvasFocused(false);
                }
              }
            : undefined
        }
      >
        {src ? (
          <>
            {isStage && images.length > 1 ? (
              <>
                <button
                  type="button"
                  className="recipe-result-nav is-prev"
                  aria-label="Previous result"
                  hidden={!showPrevNav}
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
                  hidden={!showNextNav}
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
          </>
        ) : (
          <div>
            <h2>{emptyTitle}</h2>
            <p>Add a prompt or reference, choose your settings, then generate.</p>
          </div>
        )}
      </div>
      {images.length > 0 && (
        <div
          ref={stripRef}
          className="recipe-result-strip"
          aria-label={isStage ? 'Library results' : 'Recipe results'}
          {...stripDrag}
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
