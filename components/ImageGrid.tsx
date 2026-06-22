import React, { useRef, useState, useMemo, useSyncExternalStore } from 'react';
import type {
  GeneratedImageWithConfig,
  ImageGenerationConfig,
  StudioGenerationPlaceholder,
} from '../types';
import {
  Download,
  PlusCircle,
  RefreshCw,
  Trash2,
  Check,
  ClipboardList,
  History,
  Heart,
  ImageOff,
  ArrowUpDown,
  CheckSquare,
  Loader2,
  Square,
} from 'lucide-react';
import ActionButton from './ui/ActionButton';
import { downloadImage, generateSmartFilename } from '../utils/fileUtils';
import Tooltip from './Tooltip';

interface ImageItemProps {
  image: GeneratedImageWithConfig;
  isSelected: boolean;
  onImageClick: (image: GeneratedImageWithConfig, rect: DOMRect) => void;
  onSelectionChange: (id: string, selected: boolean) => void;
  onRegenerate: (config: ImageGenerationConfig) => void;
  onAddToContext: (image: GeneratedImageWithConfig) => void;
  onLoadConfig: (config: ImageGenerationConfig) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  transitionName?: string;
}

const ImageItem: React.FC<ImageItemProps> = React.memo(
  ({
    image,
    isSelected,
    onImageClick,
    onSelectionChange,
    onRegenerate,
    onAddToContext,
    onLoadConfig,
    onDelete,
    onToggleFavorite,
    transitionName,
  }) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const timeoutRef = useRef<number | null>(null);
    const primaryImageSrc = image.thumbnail || image.src;
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const imageSrc = primaryImageSrc;
    const imageLoadFailed = failedSrc === primaryImageSrc;

    React.useEffect(() => {
      const timeout = timeoutRef.current;
      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }, []);

    const handleImageError = () => {
      setFailedSrc(primaryImageSrc);
    };

    const handleSelectClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectionChange(image.id, !isSelected);
    };

    const handleImageClick = () => {
      if (itemRef.current) {
        onImageClick(image, itemRef.current.getBoundingClientRect());
      }
    };

    const handleDownload = () => {
      const smartName = generateSmartFilename(
        image.config.prompt,
        image.id,
        image.config.model,
        image.config.aspectRatio,
      );
      downloadImage(image.src, smartName);
    };

    const handleCopyPrompt = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (copiedPrompt) return;
      void navigator.clipboard.writeText(image.config.prompt || '');
      setCopiedPrompt(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopiedPrompt(false), 2000);
    };

    return (
      <div
        ref={itemRef}
        className={`masonry-item mb-4 relative group rounded-xl overflow-hidden cursor-pointer transition-[opacity,transform,box-shadow] duration-700 ease-out-expo appearance-none border-none p-0 m-0 bg-transparent text-left
        ${isSelected ? 'ring-2 ring-accent-500 ring-offset-2 ring-offset-black z-10' : 'shadow-lg'}
        animate-in fade-in-0 zoom-in-95
      `}
        style={{ contentVisibility: 'auto', containIntrinsicSize: '320px 420px' }}
      >
        <button
          type="button"
          onClick={handleImageClick}
          aria-label="Open image preview"
          className="block w-full cursor-pointer appearance-none border-none bg-transparent p-0 text-left"
        >
          {imageLoadFailed ? (
            <div
              className="flex aspect-[3/4] w-full items-center justify-center rounded-xl bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-600"
              style={{ viewTransitionName: transitionName }}
              aria-label="Image unavailable"
            >
              <ImageOff size={20} aria-hidden="true" />
            </div>
          ) : (
            <img
              src={imageSrc}
              alt=""
              loading="lazy"
              decoding="async"
              onError={handleImageError}
              className="block h-auto w-full cursor-pointer rounded-xl bg-zinc-900"
              style={{ viewTransitionName: transitionName }}
            />
          )}

          <div
            className={`absolute inset-0 transition-opacity duration-300 ${isSelected ? 'bg-accent-500/10' : 'bg-linear-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}
          ></div>
        </button>

        <div className="absolute top-2 right-2 z-20 flex gap-2">
          <Tooltip
            content={image.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
            position="bottom"
          >
            <button
              type="button"
              aria-label={image.isFavorite ? 'Remove favorite' : 'Add favorite'}
              aria-pressed={image.isFavorite}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(image.id);
              }}
              className={`flex size-10 items-center justify-center rounded-lg border shadow-lg backdrop-blur-md transition-[color,background-color,border-color,opacity,transform]
                      ${
                        image.isFavorite
                          ? 'bg-accent-500 border-accent-400 text-white scale-110'
                          : 'bg-black/45 border-white/15 text-white/60 hover:border-white/30 hover:bg-black/60 hover:text-white group-hover:text-white/80'
                      }`}
            >
              <Heart size={14} fill={image.isFavorite ? 'currentColor' : 'none'} strokeWidth={3} />
            </button>
          </Tooltip>
          <Tooltip content={isSelected ? 'Deselect' : 'Select'} position="bottom">
            <button
              type="button"
              aria-label={isSelected ? 'Deselect image' : 'Select image'}
              aria-pressed={isSelected}
              onClick={handleSelectClick}
              className={`flex size-10 items-center justify-center rounded-lg border shadow-lg backdrop-blur-md transition-[color,background-color,border-color,opacity,transform]
                      ${
                        isSelected
                          ? 'bg-accent-600 border-accent-400 text-white scale-110'
                          : 'bg-black/45 border-white/15 text-white/60 hover:border-white/30 hover:bg-black/60 hover:text-white group-hover:text-white/80'
                      }`}
            >
              <Check size={14} strokeWidth={3} />
            </button>
          </Tooltip>
        </div>

        <div className="absolute bottom-2 left-2 right-2 z-20 flex translate-y-0 flex-col gap-1 opacity-100 transition-[opacity,transform] sm:bottom-3 sm:left-3 sm:right-3 sm:flex-row sm:items-center sm:justify-between sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                onAddToContext(image);
              }}
              icon={<PlusCircle size={14} />}
              label="Use"
            />
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                onLoadConfig(image.config);
              }}
              icon={<History size={14} />}
              label="Recipe"
            />
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                onRegenerate(image.config);
              }}
              icon={<RefreshCw size={14} />}
              label="Regen"
            />
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              icon={<Download size={14} />}
              label="Save"
            />
            <ActionButton
              onClick={handleCopyPrompt}
              icon={
                copiedPrompt ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <ClipboardList size={14} />
                )
              }
              label="Copy Prompt"
            />
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image.id);
              }}
              icon={<Trash2 size={14} />}
              label="Delete"
              variant="danger"
            />
          </div>
        </div>
      </div>
    );
  },
);

const EMPTY_GENERATION_PLACEHOLDERS: StudioGenerationPlaceholder[] = [];

type GridItem =
  | { type: 'placeholder'; placeholder: StudioGenerationPlaceholder }
  | { type: 'image'; image: GeneratedImageWithConfig };

function toCssAspectRatio(aspectRatio: string) {
  return /^\d+:\d+$/.test(aspectRatio) ? aspectRatio.replace(':', ' / ') : '1 / 1';
}

const GenerationPlaceholderItem: React.FC<{
  placeholder: StudioGenerationPlaceholder;
}> = React.memo(({ placeholder }) => (
  <div className="masonry-item mb-4 overflow-hidden rounded-xl border border-accent-400/20 bg-zinc-950/80 shadow-lg animate-in fade-in-0 zoom-in-95">
    <output
      aria-label={`Generation job ${placeholder.status}`}
      className="relative block overflow-hidden rounded-xl bg-zinc-900"
      style={{ aspectRatio: toCssAspectRatio(placeholder.aspectRatio) }}
    >
      <div className="absolute inset-0 animate-pulse bg-linear-to-br from-white/10 via-zinc-800/70 to-zinc-950" />
      <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-accent-400/10 to-transparent" />
      <div className="absolute left-2 top-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-lg border border-white/10 bg-black/55 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-100 backdrop-blur-md">
        <Loader2 size={12} className={placeholder.status === 'running' ? 'animate-spin' : ''} />
        <span className="truncate">{placeholder.status}</span>
      </div>
      <div className="absolute inset-x-2 bottom-2 rounded-lg border border-white/10 bg-black/50 px-2 py-1.5 text-[10px] font-semibold text-zinc-300 backdrop-blur-md">
        <div className="truncate">{placeholder.prompt}</div>
      </div>
    </output>
  </div>
));

export interface ImageGridProps {
  images: GeneratedImageWithConfig[];
  generationPlaceholders?: StudioGenerationPlaceholder[];
  selectedImageIds: string[];
  onImageClick: (image: GeneratedImageWithConfig, rect: DOMRect) => void;
  onSelectionChange: (id: string, selected: boolean) => void;
  onRegenerate: (config: ImageGenerationConfig) => void;
  onAddToContext: (image: GeneratedImageWithConfig) => void;
  onLoadConfig: (config: ImageGenerationConfig) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isGenerating: boolean;
  transitioningImageId: string | null;
  activeModalImageId?: string | null;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDownloadSelected: () => void;
  onDownloadAll: () => void;
  onDeleteSelected: () => void;
  onClearWorkspace: () => void;
  catalogTotal?: number;
  hasMore?: boolean;
  isCatalogLoading?: boolean;
  catalogError?: string | null;
  onLoadMore?: () => void;
  onRetryCatalog?: () => void;
}

function subscribeViewportWidth(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener('resize', onStoreChange);
  return () => {
    window.removeEventListener('resize', onStoreChange);
  };
}

function getViewportWidthSnapshot() {
  if (typeof window === 'undefined') return 1280;
  return window.innerWidth;
}

type SortOption = 'desc' | 'asc' | 'prompt' | 'ratio';

function resolveColumnCount(width: number) {
  if (width >= 1280) return 6;
  if (width >= 1024) return 5;
  if (width >= 768) return 4;
  if (width >= 640) return 3;
  return 2;
}

export const ImageGrid: React.FC<ImageGridProps> = React.memo(
  ({
    images,
    selectedImageIds,
    onImageClick,
    onSelectionChange,
    onRegenerate,
    onAddToContext,
    onLoadConfig,
    onDelete,
    onToggleFavorite,
    transitioningImageId,
    activeModalImageId,
    onSelectAll,
    onDeselectAll,
    onDownloadSelected,
    onDownloadAll,
    onDeleteSelected,
    onClearWorkspace,
    catalogTotal,
    hasMore = false,
    isCatalogLoading = false,
    catalogError = null,
    onLoadMore,
    onRetryCatalog,
    generationPlaceholders = EMPTY_GENERATION_PLACEHOLDERS,
  }) => {
    const [sortOrder, setSortOrder] = useState<SortOption>('desc');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const viewportWidth = useSyncExternalStore(
      subscribeViewportWidth,
      getViewportWidthSnapshot,
      () => 1280,
    );

    const imageCount = images.length;
    const totalCount = catalogTotal ?? imageCount;
    const isPartialCatalog = hasMore || totalCount > imageCount;
    const selectedImageCount = selectedImageIds.length;
    const isAllSelected = imageCount > 0 && selectedImageCount === imageCount;

    const sortedImages = useMemo(() => {
      const imgs = [...images];
      return imgs.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1;
        }
        switch (sortOrder) {
          case 'asc':
            return a.createdAt - b.createdAt;
          case 'desc':
            return b.createdAt - a.createdAt;
          case 'prompt':
            return (a.config.prompt || '').localeCompare(b.config.prompt || '');
          case 'ratio':
            return a.config.aspectRatio.localeCompare(b.config.aspectRatio);
          default:
            return 0;
        }
      });
    }, [images, sortOrder]);

    const gridItems = useMemo<GridItem[]>(
      () => [
        ...generationPlaceholders.map((placeholder) => ({
          type: 'placeholder' as const,
          placeholder,
        })),
        ...sortedImages.map((image) => ({ type: 'image' as const, image })),
      ],
      [generationPlaceholders, sortedImages],
    );

    const columnCount = useMemo(() => {
      const resolved = resolveColumnCount(viewportWidth);
      return Math.max(1, Math.min(resolved, Math.max(1, gridItems.length)));
    }, [viewportWidth, gridItems.length]);

    const columnBuckets = useMemo(() => {
      const safeColumnCount = Math.max(1, columnCount);
      const buckets: GridItem[][] = Array.from({ length: safeColumnCount }, () => []);

      gridItems.forEach((item, index) => {
        buckets[index % safeColumnCount].push(item);
      });

      return buckets;
    }, [gridItems, columnCount]);

    if (images.length === 0 && generationPlaceholders.length === 0) {
      return (
        <div className="flex h-full w-full items-center justify-center px-6 text-center">
          {catalogError ? (
            <div className="max-w-md rounded-xl border border-rose-500/20 bg-rose-950/20 p-4 text-sm text-rose-100">
              <div className="font-semibold">Catalog failed to load</div>
              <div className="mt-1 text-rose-200/70">{catalogError}</div>
              {onRetryCatalog && (
                <button
                  type="button"
                  onClick={onRetryCatalog}
                  className="mt-3 rounded-lg border border-rose-300/20 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-rose-100 hover:bg-rose-300/10"
                >
                  Retry
                </button>
              )}
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="w-full h-full relative">
        <div className="absolute top-4 right-8 z-30 flex items-center gap-2">
          {imageCount > 0 && (
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-900/80 p-1 shadow-2xl backdrop-blur-md">
              {imageCount > 1 && (
                <ActionButton
                  onClick={isAllSelected ? onDeselectAll : onSelectAll}
                  icon={
                    isAllSelected ? (
                      <CheckSquare size={16} className="text-accent-400" />
                    ) : (
                      <Square size={16} />
                    )
                  }
                  label={isAllSelected ? 'Deselect' : 'Select All'}
                  isActive={isAllSelected}
                  tooltipPosition="bottom"
                />
              )}
              {selectedImageCount === 0 && imageCount > 0 && !isPartialCatalog && (
                <>
                  <ActionButton
                    onClick={onDownloadAll}
                    icon={<Download size={16} />}
                    label="Download All"
                    tooltipPosition="bottom"
                  />
                  <ActionButton
                    onClick={onClearWorkspace}
                    icon={<Trash2 size={16} />}
                    label="Clear Workspace"
                    variant="danger"
                    tooltipPosition="bottom"
                  />
                </>
              )}
              {selectedImageCount > 0 && (
                <>
                  <ActionButton
                    onClick={onDownloadSelected}
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    }
                    label="Download Selected"
                    tooltipPosition="bottom"
                  />
                  <ActionButton
                    onClick={onDeleteSelected}
                    icon={<Trash2 size={16} />}
                    label="Purge Selected"
                    variant="danger"
                    tooltipPosition="bottom"
                  />
                </>
              )}
            </div>
          )}
          <div className="relative">
            <Tooltip content="Sort Images" position="bottom">
              <button
                type="button"
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className="rounded-xl border border-white/10 bg-zinc-900/80 p-2 text-zinc-400 transition-colors backdrop-blur-md hover:bg-zinc-800 hover:text-white"
              >
                <ArrowUpDown size={16} />
              </button>
            </Tooltip>
            {isSortMenuOpen && (
              <div className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
                <div className="flex flex-col p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder('desc');
                      setIsSortMenuOpen(false);
                    }}
                    className={`px-3 py-2 text-left text-xs rounded-lg transition-colors ${sortOrder === 'desc' ? 'bg-accent-500/20 text-accent-300' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    Newest First (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder('asc');
                      setIsSortMenuOpen(false);
                    }}
                    className={`px-3 py-2 text-left text-xs rounded-lg transition-colors ${sortOrder === 'asc' ? 'bg-accent-500/20 text-accent-300' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    Oldest First
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder('prompt');
                      setIsSortMenuOpen(false);
                    }}
                    className={`px-3 py-2 text-left text-xs rounded-lg transition-colors ${sortOrder === 'prompt' ? 'bg-accent-500/20 text-accent-300' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    Prompt Similarity
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder('ratio');
                      setIsSortMenuOpen(false);
                    }}
                    className={`px-3 py-2 text-left text-xs rounded-lg transition-colors ${sortOrder === 'ratio' ? 'bg-accent-500/20 text-accent-300' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    Aspect Ratio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="custom-scrollbar h-full w-full overflow-y-auto px-4 pt-16 pb-8 sm:px-8">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${Math.max(1, columnCount)}, minmax(0, 1fr))` }}
          >
            {columnBuckets.map((bucket, columnIndex) => {
              const firstItem = bucket[0];
              const firstItemId =
                firstItem?.type === 'image' ? firstItem.image.id : firstItem?.placeholder.id;
              const columnKey = firstItemId
                ? `column-${firstItemId}-${bucket.length}`
                : `column-empty-${columnIndex}`;
              return (
                <div key={columnKey} className="flex min-w-0 flex-col gap-0">
                  {bucket.map((item) =>
                    item.type === 'placeholder' ? (
                      <GenerationPlaceholderItem
                        key={item.placeholder.id}
                        placeholder={item.placeholder}
                      />
                    ) : (
                      <div
                        key={item.image.id}
                        className={
                          activeModalImageId === item.image.id ? 'opacity-0' : 'opacity-100'
                        }
                      >
                        <ImageItem
                          image={item.image}
                          isSelected={selectedImageIds.includes(item.image.id)}
                          onImageClick={onImageClick}
                          onSelectionChange={onSelectionChange}
                          onRegenerate={onRegenerate}
                          onAddToContext={onAddToContext}
                          onLoadConfig={onLoadConfig}
                          onDelete={onDelete}
                          onToggleFavorite={onToggleFavorite}
                          transitionName={
                            transitioningImageId === item.image.id ? 'master-canvas' : undefined
                          }
                        />
                      </div>
                    ),
                  )}
                </div>
              );
            })}
          </div>
          {(hasMore || isCatalogLoading || catalogError || totalCount > imageCount) && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="text-[10px] font-black tabular-nums uppercase tracking-widest text-zinc-500">
                {imageCount} / {totalCount} loaded
              </div>
              {catalogError && <div className="max-w-lg text-xs text-rose-300">{catalogError}</div>}
              {hasMore && onLoadMore && (
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={isCatalogLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isCatalogLoading ? 'animate-spin' : ''} />
                  {isCatalogLoading ? 'Loading' : 'Load more'}
                </button>
              )}
              {!hasMore && catalogError && onRetryCatalog && (
                <button
                  type="button"
                  onClick={onRetryCatalog}
                  className="rounded-xl border border-rose-300/20 bg-rose-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-100 hover:bg-rose-500/20"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);
