import React, { useRef, useState, useMemo, useSyncExternalStore } from 'react';
import type { GeneratedImageWithConfig, ImageGenerationConfig } from '../types';
import {
  Download,
  PlusCircle,
  RefreshCw,
  Trash2,
  Check,
  ClipboardList,
  History,
  Heart,
  ArrowUpDown,
  CheckSquare,
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
  isWorkspaceGenerating: boolean;
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
    isWorkspaceGenerating,
    transitionName,
  }) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    React.useEffect(() => {
      const timeout = timeoutRef.current;
      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }, []);

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
        className={`masonry-item mb-4 relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-700 ease-out-expo appearance-none border-none p-0 m-0 bg-transparent text-left
        ${isSelected ? 'ring-2 ring-accent-500 ring-offset-2 ring-offset-black z-10' : 'shadow-lg'}
        animate-in fade-in-0 zoom-in-95
      `}
      >
        <button
          type="button"
          onClick={handleImageClick}
          aria-label="Open image preview"
          className="block w-full appearance-none border-none bg-transparent p-0 text-left"
        >
          <img
            src={image.thumbnail || image.src}
            alt=""
            loading="lazy"
            decoding="async"
            className={`w-full h-auto block bg-zinc-900 rounded-xl transition-all duration-700 ${isWorkspaceGenerating ? 'opacity-60 grayscale-[0.2]' : ''}`}
            style={{ viewTransitionName: transitionName }}
          />

          <div
            className={`absolute inset-0 transition-all duration-300 ${isSelected ? 'bg-accent-500/10' : 'bg-linear-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100'}`}
          ></div>
        </button>

        <div className="absolute top-2 right-2 z-20 flex gap-2">
          <Tooltip
            content={image.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
            position="bottom"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(image.id);
              }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border shadow-lg backdrop-blur-md
                      ${image.isFavorite
                  ? 'bg-accent-500 border-accent-400 text-white scale-110'
                  : 'bg-black/40 border-white/10 text-transparent hover:border-white/30 hover:bg-black/60 group-hover:text-white/30'
                }`}
            >
              <Heart size={14} fill={image.isFavorite ? 'currentColor' : 'none'} strokeWidth={3} />
            </button>
          </Tooltip>
          <Tooltip content={isSelected ? 'Deselect' : 'Select'} position="bottom">
            <button
              type="button"
              onClick={handleSelectClick}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border shadow-lg backdrop-blur-md
                      ${isSelected
                  ? 'bg-accent-600 border-accent-400 text-white scale-110'
                  : 'bg-black/40 border-white/10 text-transparent hover:border-white/30 hover:bg-black/60 group-hover:text-white/30'
                }`}
            >
              <Check size={14} strokeWidth={3} />
            </button>
          </Tooltip>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-20">
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

interface ImageGridProps {
  images: GeneratedImageWithConfig[];
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
    isGenerating,
    transitioningImageId,
    activeModalImageId,
    onSelectAll,
    onDeselectAll,
    onDownloadSelected,
    onDownloadAll,
    onDeleteSelected,
    onClearWorkspace,
  }) => {
    const [sortOrder, setSortOrder] = useState<SortOption>('desc');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const viewportWidth = useSyncExternalStore(
      subscribeViewportWidth,
      getViewportWidthSnapshot,
      () => 1280,
    );

    const imageCount = images.length;
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

    const columnCount = useMemo(() => {
      const resolved = resolveColumnCount(viewportWidth);
      return Math.max(1, Math.min(resolved, Math.max(1, sortedImages.length)));
    }, [viewportWidth, sortedImages.length]);

    const columnBuckets = useMemo(() => {
      const safeColumnCount = Math.max(1, columnCount);
      const buckets: GeneratedImageWithConfig[][] = Array.from(
        { length: safeColumnCount },
        () => [],
      );

      sortedImages.forEach((image, index) => {
        buckets[index % safeColumnCount].push(image);
      });

      return buckets;
    }, [sortedImages, columnCount]);

    if (images.length === 0) return <div className="w-full h-full" />;

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
              {selectedImageCount === 0 && imageCount > 0 && (
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
              const columnKey = bucket[0]?.id
                ? `column-${bucket[0].id}-${bucket.length}`
                : `column-empty-${columnIndex}`;
              return (
                <div key={columnKey} className="flex min-w-0 flex-col gap-0">
                  {bucket.map((image) => (
                    <div
                      key={image.id}
                      className={activeModalImageId === image.id ? 'opacity-0' : 'opacity-100'}
                    >
                      <ImageItem
                        image={image}
                        isSelected={selectedImageIds.includes(image.id)}
                        onImageClick={onImageClick}
                        onSelectionChange={onSelectionChange}
                        onRegenerate={onRegenerate}
                        onAddToContext={onAddToContext}
                        onLoadConfig={onLoadConfig}
                        onDelete={onDelete}
                        onToggleFavorite={onToggleFavorite}
                        isWorkspaceGenerating={isGenerating}
                        transitionName={
                          transitioningImageId === image.id ? 'master-canvas' : undefined
                        }
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);
