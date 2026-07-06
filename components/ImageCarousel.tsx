import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconX as X,
  IconDownload as Download,
  IconCirclePlus as PlusCircle,
  IconRefresh as RefreshCw,
  IconTrash as Trash2,
  IconMaximize as Maximize2,
  IconMinimize as Minimize2,
  IconClipboardList as ClipboardList,
  IconHistory as History,
  IconCheck as Check,
  IconHeart as Heart,
  IconLayoutBoardSplit as SplitSquareHorizontal,
} from '@tabler/icons-react';
import { AnimatePresence, MotionDiv, type Variants } from '../lib/gsapMotion';
import type { GeneratedImageWithConfig, ImageGenerationConfig } from '../types';
import ActionButton from './ui/ActionButton';
import Logo from './Logo';
import { downloadImage, generateSmartFilename } from '../utils/fileUtils';
import { finishCarouselSlideState } from '../lib/imageCarouselState';
import {
  buildCarouselThumbnailWindow,
  type CarouselThumbnailWindowItem,
} from '../lib/imageCarouselThumbnails';

import { TopToolbar } from './ui/TopToolbar';
import { BottomToolbar } from './ui/BottomToolbar';
import { resolveStudioCarouselDisplaySrc } from '../lib/studioCarouselImage';

interface ImageCarouselProps {
  activeImage: GeneratedImageWithConfig | null;
  allImages: GeneratedImageWithConfig[];
  activeGenerationConfig: ImageGenerationConfig | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRegenerate: (config: ImageGenerationConfig) => void;
  onAddToContext: (image: GeneratedImageWithConfig) => void;
  onLoadConfig: (config: ImageGenerationConfig) => void;
  onToggleFavorite: (id: string) => void;
  onActiveImageChange: (id: string) => void;
  transitionName?: string;
}

const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

function resolveCarouselImageDimensions(image: GeneratedImageWithConfig) {
  if (image.width && image.height) {
    return { width: image.width, height: image.height };
  }

  const [ratioWidth, ratioHeight] = image.config.aspectRatio
    ? image.config.aspectRatio.split(':').map((part) => Number(part))
    : [1, 1];
  if (ratioWidth > 0 && ratioHeight > 0) {
    const base = 1024;
    return {
      width: Math.round(base * (ratioWidth / Math.max(ratioWidth, ratioHeight))),
      height: Math.round(base * (ratioHeight / Math.max(ratioWidth, ratioHeight))),
    };
  }

  return { width: 1024, height: 1024 };
}

const CarouselImageItem: React.FC<{
  image: GeneratedImageWithConfig;
  transitionName?: string;
  isActive: boolean;
  isSliding: boolean;
  isComparing: boolean;
}> = React.memo(({ image, transitionName, isActive, isSliding, isComparing }) => {
  const [uiScale, setUiScale] = useState(1);

  const imgRef = useRef<HTMLImageElement>(null);
  const target = useRef({ x: 0, y: 0, scale: 1 });
  const current = useRef({ x: 0, y: 0, scale: 1 });
  const dragStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const rafId = useRef<number | null>(null);

  const displaySrc = resolveStudioCarouselDisplaySrc({ image, isComparing });
  const imageDimensions = resolveCarouselImageDimensions(image);

  // Calculate aspect ratio for the style to ensure the image has a size before loading
  const aspectRatioStyle = image.config.aspectRatio
    ? image.config.aspectRatio.replace(':', '/')
    : '1/1';

  const animate = useCallback(() => {
    if (!isActive) return;
    const LERP_FACTOR = 0.32;

    current.current.scale = lerp(current.current.scale, target.current.scale, LERP_FACTOR);
    current.current.x = lerp(current.current.x, target.current.x, LERP_FACTOR);
    current.current.y = lerp(current.current.y, target.current.y, LERP_FACTOR);

    if (imgRef.current) {
      imgRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) scale(${current.current.scale})`;
    }

    const isStillMoving =
      Math.abs(target.current.scale - current.current.scale) > 0.0005 ||
      Math.abs(target.current.x - current.current.x) > 0.05 ||
      Math.abs(target.current.y - current.current.y) > 0.05;

    if (isStillMoving) {
      rafId.current = requestAnimationFrame(animate);
    } else {
      rafId.current = null;
    }

    if (Math.abs(current.current.scale - 1) > 0.02) setUiScale(current.current.scale);
    else setUiScale(1);
  }, [isActive]);

  const startAnimation = useCallback(() => {
    if (!rafId.current && isActive) rafId.current = requestAnimationFrame(animate);
  }, [animate, isActive]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!isActive || isSliding) return;
    const newScale = Math.min(
      Math.max(target.current.scale + (e.deltaY < 0 ? 1 : -1) * 0.25 * target.current.scale, 1),
      15,
    );
    target.current.scale = newScale;
    if (newScale === 1) {
      target.current.x = 0;
      target.current.y = 0;
    }
    startAnimation();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isActive || isSliding || target.current.scale <= 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - target.current.x, y: e.clientY - target.current.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isActive || isSliding || !isDragging.current) return;
    target.current.x = e.clientX - dragStart.current.x;
    target.current.y = e.clientY - dragStart.current.y;
    startAnimation();
  };

  const updateZoom = (nextScale: number) => {
    const clampedScale = Math.min(Math.max(nextScale, 1), 15);
    target.current.scale = clampedScale;
    if (clampedScale === 1) {
      target.current.x = 0;
      target.current.y = 0;
    }
    startAnimation();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isActive || isSliding) return;

    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      updateZoom(target.current.scale * 1.25);
      return;
    }

    if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      updateZoom(target.current.scale / 1.25);
      return;
    }

    if (event.key === '0' || event.key === 'Escape') {
      event.preventDefault();
      target.current = { x: 0, y: 0, scale: 1 };
      startAnimation();
      return;
    }

    if (target.current.scale <= 1) return;
    const panStep = event.shiftKey ? 80 : 32;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      target.current.x += panStep;
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      target.current.x -= panStep;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      target.current.y += panStep;
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      target.current.y -= panStep;
    } else {
      return;
    }
    startAnimation();
  };

  return (
    <div
      className="size-full flex items-center justify-center relative overflow-hidden touch-none select-none"
      role="group"
      tabIndex={isActive ? 0 : -1}
      aria-label="Image pan and zoom area. Use plus and minus to zoom, arrows to pan, zero to reset."
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => (isDragging.current = false)}
      onKeyDown={handleKeyDown}
      onDoubleClick={() => {
        if (isSliding) return;
        target.current =
          target.current.scale > 1.1 ? { x: 0, y: 0, scale: 1 } : { x: 0, y: 0, scale: 3.5 };
        startAnimation();
      }}
    >
      <img
        ref={imgRef}
        src={displaySrc}
        alt=""
        width={imageDimensions.width}
        height={imageDimensions.height}
        draggable={false}
        className={`max-w-[94%] max-h-[90%] object-contain shadow-[0_0_120px_rgba(0,0,0,1)]`}
        style={{
          // Only apply view transition if NOT sliding and NOT comparing, to avoid glitches
          viewTransitionName:
            !isSliding && isActive && !isComparing ? transitionName || 'master-canvas' : 'none',
          aspectRatio: aspectRatioStyle,
        }}
      />

      {isComparing && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-accent-500 text-black rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl animate-in fade-in zoom-in-95 z-30">
          Original Reference
        </div>
      )}

      {isActive && uiScale > 1.01 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-black/90 backdrop-blur-3xl rounded-full text-[10px] font-black text-accent-400 tracking-[0.25em] uppercase shadow-2xl z-20 pointer-events-none animate-in fade-in zoom-in-95">
          ZOOM: {Math.round(uiScale * 100)}%
        </div>
      )}
    </div>
  );
});

// Optimized Slide Transition
const variants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
    zIndex: 1,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1,
    transition: {
      x: { type: 'tween', ease: [0.19, 1, 0.22, 1], duration: 0.35 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.35, ease: [0.19, 1, 0.22, 1] },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
    zIndex: 0,
    transition: {
      x: { type: 'tween', ease: [0.19, 1, 0.22, 1], duration: 0.35 },
      opacity: { duration: 0.2 },
    },
  }),
};

interface CarouselBottomBarProps {
  currentImage: GeneratedImageWithConfig;
  hasReference: boolean;
  copiedPrompt: boolean;
  isComparing: boolean;
  onCompareStart: () => void;
  onCompareEnd: () => void;
  onCopyPrompt: () => void;
  onDownload: () => void;
  onToggleFavorite: (id: string) => void;
  onLoadConfig: (config: ImageGenerationConfig) => void;
  onAddToContext: (img: GeneratedImageWithConfig) => void;
  onRegenerate: (config: ImageGenerationConfig) => void;
  onDelete: (id: string) => void;
}

function CarouselBottomBar({
  currentImage,
  hasReference,
  copiedPrompt,
  isComparing,
  onCompareStart,
  onCompareEnd,
  onCopyPrompt,
  onDownload,
  onToggleFavorite,
  onLoadConfig,
  onAddToContext,
  onRegenerate,
  onDelete,
}: CarouselBottomBarProps) {
  return (
    <BottomToolbar className="absolute bottom-0 left-0 right-0 z-50 flex w-full min-h-17 items-center border-t border-white/5 bg-black/80 px-6 py-3 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-480 flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex-1 min-w-0 w-full">
          <p className="text-[12px] font-bold text-zinc-400 truncate tracking-tight leading-relaxed">
            {currentImage.config.prompt || 'Generated image'}
          </p>
          <div className="flex gap-4 mt-2">
            <span className="text-[9px] font-black text-accent-500/70 uppercase tracking-widest">
              {currentImage.config.model.split('-').slice(0, 2).join(' ').toUpperCase()}
            </span>
            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">
              {currentImage.config.aspectRatio} OUTPUT
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {hasReference && (
            <div className="flex items-center gap-1.5 rounded-xl bg-white/3 p-1">
              <button
                type="button"
                onPointerDown={onCompareStart}
                onPointerUp={onCompareEnd}
                onPointerLeave={onCompareEnd}
                className={`relative flex items-center justify-center rounded-lg p-2 outline-none transition-[background-color,color,box-shadow,transform] duration-300 group active:scale-95 cursor-pointer ${isComparing ? 'bg-accent-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                title="Hold to Compare with Original"
              >
                <SplitSquareHorizontal size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest ml-2 hidden lg:inline">
                  Compare
                </span>
              </button>
            </div>
          )}

          <div className="flex shrink-0 items-center gap-1 rounded-xl bg-white/3 p-1">
            <ActionButton
              onClick={() => onToggleFavorite(currentImage.id)}
              icon={<Heart size={16} fill={currentImage?.isFavorite ? 'currentColor' : 'none'} />}
              label={currentImage?.isFavorite ? 'Unpin from top' : 'Pin to top'}
              isActive={currentImage?.isFavorite}
            />
            <ActionButton
              onClick={onCopyPrompt}
              icon={
                copiedPrompt ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <ClipboardList size={16} />
                )
              }
              label="Copy Prompt"
            />
            <ActionButton
              onClick={() => onLoadConfig(currentImage.config)}
              icon={<History size={16} />}
              label="Load Recipe"
            />
          </div>

          <div className="relative flex shrink-0 items-center gap-1 rounded-xl bg-white/3 p-1">
            <ActionButton
              onClick={() => onAddToContext(currentImage)}
              icon={<PlusCircle size={16} />}
              label="To Context"
            />
            <div className="relative">
              <ActionButton onClick={onDownload} icon={<Download size={16} />} label="Save Local" />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-xl bg-white/3 p-1">
            <ActionButton
              onClick={() => onRegenerate(currentImage.config)}
              icon={<RefreshCw size={16} />}
              label="Re-Synthesize"
              variant="primary"
            />
            <ActionButton
              onClick={() => onDelete(currentImage.id)}
              icon={<Trash2 size={16} />}
              label="Purge"
              variant="danger"
            />
          </div>
        </div>
      </div>
    </BottomToolbar>
  );
}

interface CarouselTopBarProps {
  activeIndex: number;
  isFullscreen: boolean;
  navScrollRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onJumpTo: (index: number) => void;
  onToggleFullscreen: () => void;
  thumbnailWindow: CarouselThumbnailWindowItem<GeneratedImageWithConfig>[];
}

function CarouselTopBar({
  activeIndex,
  isFullscreen,
  navScrollRef,
  onClose,
  onJumpTo,
  onToggleFullscreen,
  thumbnailWindow,
}: CarouselTopBarProps) {
  return (
    <TopToolbar className="absolute top-0 left-0 right-0 w-full h-14 bg-black/80 backdrop-blur-sm flex items-center px-6 z-50 border-b border-white/5">
      <div className="mx-auto flex w-full max-w-480 items-center justify-between gap-4">
        <Logo />
        <div
          ref={navScrollRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto custom-scrollbar p-1 snap-x justify-center"
        >
          {thumbnailWindow.map(({ item: img, index: idx }) => (
            <button
              type="button"
              key={img.id}
              data-carousel-index={idx}
              aria-label={`Open image ${idx + 1} of ${thumbnailWindow.length}`}
              onClick={() => onJumpTo(idx)}
              className={`relative size-10 shrink-0 rounded-xl overflow-hidden border snap-center cursor-pointer transition-[border-color,box-shadow,opacity,transform] duration-300
                            ${
                              idx === activeIndex
                                ? 'scale-110 shadow-[0_0_20px_rgba(var(--accent-500),0.4)] border-accent-500 opacity-100'
                                : 'opacity-30 hover:opacity-80 border-transparent hover:scale-105'
                            }
                        `}
            >
              <img
                src={img.thumbnail || img.src}
                alt=""
                width={40}
                height={40}
                className="size-full object-cover"
                loading="lazy"
                decoding="async"
              />
              {img.isFavorite && (
                <div className="absolute top-1 right-1">
                  <Heart size={8} className="text-accent-400 fill-accent-400" />
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="min-h-10 min-w-10 rounded-xl bg-white/5 p-2 text-zinc-500 transition-[background-color,color,transform] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close image carousel"
            className="min-h-10 min-w-10 rounded-xl bg-zinc-900/60 p-2 text-white shadow-xl transition-[background-color,color,transform] hover:bg-red-500/20 hover:text-red-500 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </TopToolbar>
  );
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  activeImage,
  allImages,
  activeGenerationConfig,
  onClose,
  onDelete,
  onRegenerate,
  onAddToContext,
  onLoadConfig,
  onToggleFavorite,
  onActiveImageChange,
  transitionName,
}) => {
  const activeIndex = useMemo(() => {
    if (!activeImage || allImages.length === 0) return 0;
    const idx = allImages.findIndex((img) => img.id === activeImage.id);
    return idx !== -1 ? idx : 0;
  }, [activeImage, allImages]);

  const prevActiveImageIdRef = useRef(activeImage?.id);
  const lastSetIndexRef = useRef(activeIndex);

  if (prevActiveImageIdRef.current !== activeImage?.id) {
    prevActiveImageIdRef.current = activeImage?.id;
    lastSetIndexRef.current = activeIndex;
  }

  const [carouselState, setCarouselState] = useState({
    direction: 0,
    isSliding: false,
    isFullscreen: false,
    copiedPrompt: false,
    isComparing: false,
  });
  const { direction, isSliding, isFullscreen, copiedPrompt, isComparing } = carouselState;
  const timeoutRef = useRef<number | null>(null);

  React.useEffect(() => {
    const timeout = timeoutRef.current;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);
  const isProcessingDownloadRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);

  if (activeIndex >= allImages.length && allImages.length > 0) {
    const clampedIndex = allImages.length - 1;
    lastSetIndexRef.current = clampedIndex;
    onActiveImageChange(allImages[clampedIndex].id);
  }

  const handleJumpTo = useCallback(
    (index: number) => {
      if (index === lastSetIndexRef.current || isSliding || index < 0 || index >= allImages.length)
        return;
      setCarouselState((prev) => ({
        ...prev,
        direction: index > lastSetIndexRef.current ? 1 : -1,
        isSliding: true,
        isComparing: false,
      }));
      lastSetIndexRef.current = index;
      onActiveImageChange(allImages[index].id);

      if (navScrollRef.current) {
        const btn = navScrollRef.current.querySelector(
          `[data-carousel-index="${index}"]`,
        ) as HTMLElement | null;
        if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    },
    [isSliding, allImages, onActiveImageChange],
  );

  const handleNext = useCallback(() => {
    if (allImages.length === 0) return;
    const nextIndex = (lastSetIndexRef.current + 1) % allImages.length;
    handleJumpTo(nextIndex);
  }, [allImages.length, handleJumpTo]);

  const handlePrev = useCallback(() => {
    if (allImages.length === 0) return;
    const prevIndex = (lastSetIndexRef.current - 1 + allImages.length) % allImages.length;
    handleJumpTo(prevIndex);
  }, [allImages.length, handleJumpTo]);

  const handleSlideAnimationComplete = useCallback(() => {
    setCarouselState(finishCarouselSlideState);
  }, []);

  const handleNextRef = useRef(handleNext);
  handleNextRef.current = handleNext;
  const handlePrevRef = useRef(handlePrev);
  handlePrevRef.current = handlePrev;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const isFullscreenRef = useRef(isFullscreen);
  isFullscreenRef.current = isFullscreen;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNextRef.current();
      if (e.key === 'ArrowLeft') handlePrevRef.current();
      if (e.key === 'Escape' && !isFullscreenRef.current) onCloseRef.current();
      if (e.code === 'Space' && !e.repeat)
        setCarouselState((prev) => ({ ...prev, isComparing: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setCarouselState((prev) => ({ ...prev, isComparing: false }));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const currentImage =
    activeIndex >= 0 && activeIndex < allImages.length ? allImages[activeIndex] : activeImage;
  const thumbnailWindow = useMemo(
    () => buildCarouselThumbnailWindow(allImages, activeIndex),
    [activeIndex, allImages],
  );

  const executeDownload = async () => {
    if (!currentImage || isProcessingDownloadRef.current) return;
    isProcessingDownloadRef.current = true;

    try {
      const promptSlug = currentImage.config.prompt ? currentImage.config.prompt : 'image';
      const smartName = generateSmartFilename(
        promptSlug,
        currentImage.id,
        currentImage.config.model,
        currentImage.config.aspectRatio,
      );
      downloadImage(currentImage.src, smartName);
    } catch (e) {
      // Download failed
    } finally {
      isProcessingDownloadRef.current = false;
    }
  };

  const handleDownloadClick = () => {
    void executeDownload();
  };

  const handleCopyPrompt = () => {
    if (!currentImage || copiedPrompt) return;
    void navigator.clipboard.writeText(currentImage.config.prompt || '');
    setCarouselState((prev) => ({ ...prev, copiedPrompt: true }));
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(
      () => setCarouselState((prev) => ({ ...prev, copiedPrompt: false })),
      2000,
    );
  };

  const hasReference =
    currentImage?.config.attachments && currentImage.config.attachments.length > 0;

  if (!currentImage) return null;

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) void containerRef.current?.requestFullscreen();
    else void document.exitFullscreen();
    setCarouselState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-100 flex flex-col bg-black/90 overflow-hidden pt-12 pb-12"
      style={{ viewTransitionName: 'modal-backdrop' }}
    >
      <CarouselTopBar
        activeIndex={activeIndex}
        isFullscreen={isFullscreen}
        navScrollRef={navScrollRef}
        onClose={onClose}
        onJumpTo={handleJumpTo}
        onToggleFullscreen={handleToggleFullscreen}
        thumbnailWindow={thumbnailWindow}
      />

      <section className="flex-1 relative overflow-hidden flex items-center justify-center">
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              disabled={isSliding}
              aria-label="Previous image"
              className="absolute left-8 z-50 rounded-full bg-black/50 p-6 text-white/10 backdrop-blur-3xl transition-[background-color,color,opacity,transform] hover:bg-white/5 hover:text-white disabled:opacity-0 active:scale-90 group cursor-pointer"
            >
              <ChevronLeft size={40} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              disabled={isSliding}
              aria-label="Next image"
              className="absolute right-8 z-50 rounded-full bg-black/50 p-6 text-white/10 backdrop-blur-3xl transition-[background-color,color,opacity,transform] hover:bg-white/5 hover:text-white disabled:opacity-0 active:scale-90 group cursor-pointer"
            >
              <ChevronRight size={40} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </>
        )}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* initial={false} ensures the first render doesn't slide, allowing view transition to work */}
          <AnimatePresence initial={false} custom={direction}>
            <MotionDiv
              key={currentImage.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              onAnimationComplete={handleSlideAnimationComplete}
              className="absolute inset-0 size-full flex items-center justify-center will-change-transform pointer-events-auto"
            >
              <CarouselImageItem
                image={currentImage}
                transitionName={transitionName}
                isActive={true}
                isSliding={isSliding}
                isComparing={isComparing}
              />
            </MotionDiv>
          </AnimatePresence>
        </div>
      </section>

      <CarouselBottomBar
        currentImage={currentImage}
        hasReference={!!hasReference}
        copiedPrompt={copiedPrompt}
        isComparing={isComparing}
        onCompareStart={() => setCarouselState((prev) => ({ ...prev, isComparing: true }))}
        onCompareEnd={() => setCarouselState((prev) => ({ ...prev, isComparing: false }))}
        onCopyPrompt={handleCopyPrompt}
        onDownload={handleDownloadClick}
        onToggleFavorite={onToggleFavorite}
        onLoadConfig={onLoadConfig}
        onAddToContext={onAddToContext}
        onRegenerate={onRegenerate}
        onDelete={onDelete}
      />
    </div>
  );
};

export default ImageCarousel;
