import { CatalogCardBackdrop } from './CatalogCardBackdrop';
import React, { useRef, useState, useMemo, useSyncExternalStore } from 'react';
import type {
  GeneratedImageWithConfig,
  ImageGenerationConfig,
  StudioGenerationPlaceholder,
} from '../types';
import {
  IconDownload as Download,
  IconCirclePlus as PlusCircle,
  IconRefresh as RefreshCw,
  IconTrash as Trash2,
  IconCheck as Check,
  IconClipboardList as ClipboardList,
  IconHistory as History,
  IconHeart as Heart,
  IconPhotoOff as ImageOff,
  IconPhoto as Photo,
  IconArrowsSort as ArrowUpDown,
  IconLayoutCards as LayoutCards,
  IconLayoutCollage as LayoutCollage,
  IconLayoutGrid as LayoutGrid,
  IconLayoutList as LayoutList,
  IconSquareCheck as CheckSquare,
  IconLoader2 as Loader2,
  IconSquare as Square,
} from '@tabler/icons-react';
import { DemandMountedGsapDropdown } from './ui/DemandMountedGsapDropdown';
import { downloadImage, generateSmartFilename } from '../utils/fileUtils';
import Tooltip from './Tooltip';
import ActionButton from './ui/ActionButton';
import { getCatalogImageDetail } from '../services/studio-api/catalog';
import { buildGenerationConfigFromCatalogImage } from '../utils/catalogImageGenerationConfig';
import { useToastUi } from '../contexts/GlobalContext';
import { providerBrandChipLabel } from '../lib/providerBrand';
import {
  shouldAlwaysShowCatalogCardActions,
  shouldMountCatalogCardActions,
} from '../lib/catalogCardActionSurface';
import {
  DEFAULT_THUMBNAIL_SIZE,
  DEFAULT_IMAGE_GRID_VIEW_MODE,
  IMAGE_GRID_COLUMN_GAP,
  IMAGE_GRID_VIRTUAL_OVERSCAN_PX,
  MAX_THUMBNAIL_SIZE,
  MIN_THUMBNAIL_SIZE,
  THUMBNAIL_SIZE_STEP,
  estimateImageGridCardItemHeight,
  estimateImageGridItemHeight,
  estimateImageGridListItemHeight,
  filterImageGridImages,
  resolveImageGridColumnCount,
  resolveImageGridAspectRatio,
  resolveImageGridIntrinsicSize,
  resolveImageGridItemWidth,
  resolveImageGridTemplateColumns,
  resolveImageGridVirtualWindow,
  shouldPriorityLoadImageGridItem,
  sortImageGridImages,
  type ImageGridSortOption,
  type ImageGridViewMode,
} from '../lib/imageGridPresentation';

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
  alwaysShowActions?: boolean;
  priorityLoad?: boolean;
  viewMode: ImageGridViewMode;
  thumbnailSize: number;
}

interface CompactActionButtonProps {
  onClick: (event: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  variant?: 'default' | 'danger' | 'primary';
}

const CompactActionButton: React.FC<CompactActionButtonProps> = ({
  onClick,
  icon,
  label,
  isActive = false,
  variant = 'default',
}) => {
  const toneClass =
    variant === 'danger'
      ? 'text-[color:var(--wb-danger)] hover:bg-red-500/12 hover:text-[color:var(--wb-danger)] '
      : variant === 'primary' || isActive
        ? 'border-accent-500/2 bg-accent-500/12 text-accent-100 shadow-[0_0_14px_rgba(var(--accent-500),0.12)]'
        : 'text-[color:var(--wb-muted)] hover:bg-white/7 hover:text-[color:var(--wb-ink)]';

  return (
    <Tooltip content={label} position="bottom">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick(event);
        }}
        aria-label={label}
        aria-pressed={isActive}
        className={`relative flex min-h-8 min-w-8 touch-manipulation items-center justify-center rounded-[var(--wb-radius)] border border-transparent transition-[background-color,border-color,color,transform,box-shadow] active:scale-95 focus-visible:ring-2 focus-visible:ring-white/25 ${toneClass}`}
      >
        {icon}
        {isActive && variant !== 'primary' && (
          <span className="absolute right-1 top-1 size-1.5 rounded-full bg-accent-400 shadow-[0_0_8px_rgba(var(--accent-500),0.9)]" />
        )}
      </button>
    </Tooltip>
  );
};

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
    alwaysShowActions = false,
    priorityLoad = false,
    viewMode,
    thumbnailSize,
  }) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToastUi();
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [isActionSurfaceActive, setIsActionSurfaceActive] = useState(false);
    const [isActionSurfaceFocused, setIsActionSurfaceFocused] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [isActionPanelExpanded, setIsActionPanelExpanded] = useState(false);
    const timeoutRef = useRef<number | null>(null);
    const primaryImageSrc = image.thumbnail || image.src;
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const imageSrc = primaryImageSrc;
    const imageLoadFailed = failedSrc === primaryImageSrc;
    const imageAspectRatio = resolveImageGridAspectRatio(image);
    const imageIntrinsicSize = resolveImageGridIntrinsicSize(image);
    const shouldMountActions = shouldMountCatalogCardActions({
      alwaysShowActions,
      isActionSurfaceActive:
        isActionSurfaceActive ||
        isActionSurfaceFocused ||
        isActionMenuOpen ||
        isActionPanelExpanded,
      isSelected,
    });
    const isGridView = viewMode === 'grid';
    const isListView = viewMode === 'list';
    const isCardView = viewMode === 'cards';
    const frameAspectRatio = isGridView || isListView ? '1 / 1' : imageAspectRatio;
    const listThumbnailSize = Math.max(88, Math.min(136, Math.round(thumbnailSize * 0.66)));
    const promptText = image.config.prompt?.trim() || 'Untitled image';
    const dimensionsLabel =
      typeof image.width === 'number' &&
      Number.isFinite(image.width) &&
      image.width > 0 &&
      typeof image.height === 'number' &&
      Number.isFinite(image.height) &&
      image.height > 0
        ? `${image.width}x${image.height}`
        : null;
    const metaItems = [
      image.providerId ? providerBrandChipLabel(image.providerId) : null,
      dimensionsLabel || image.config.aspectRatio,
      image.mimeType?.split('/')[1]?.toUpperCase(),
    ].filter(Boolean);

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

    const handleFocusCapture = () => {
      setIsActionSurfaceFocused(true);
    };

    const handleBlurCapture = (event: React.FocusEvent<HTMLDivElement>) => {
      if (event.currentTarget.contains(event.relatedTarget)) {
        return;
      }

      setIsActionSurfaceFocused(false);
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

    const withFullConfig = async (
      action: (config: ImageGenerationConfig) => void | Promise<void>,
    ) => {
      try {
        const detail = await getCatalogImageDetail(image.id);
        await action(buildGenerationConfigFromCatalogImage(detail));
      } catch {
        addToast('Could not complete image action. Please try again.', 'error');
      }
    };

    const handleCopyPrompt = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (copiedPrompt) return;
      void withFullConfig(async (config) => {
        await navigator.clipboard.writeText(config.prompt || '');
        setCopiedPrompt(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setCopiedPrompt(false), 2000);
      });
    };

    const renderImageFrame = ({
      frameClassName,
      imageClassName = 'block h-full w-full cursor-pointer object-cover',
      style,
    }: {
      frameClassName: string;
      imageClassName?: string;
      style?: React.CSSProperties;
    }) => {
      const frameStyle = {
        aspectRatio: frameAspectRatio,
        viewTransitionName: transitionName,
        ...style,
      };

      return imageLoadFailed ? (
        <div
          className={`${frameClassName} flex items-center justify-center text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]`}
          style={frameStyle}
          aria-label="Image unavailable"
        >
          <ImageOff size={20} aria-hidden="true" />
        </div>
      ) : (
        <span className={frameClassName} style={frameStyle}>
          <img
            src={imageSrc}
            alt=""
            width={imageIntrinsicSize.width}
            height={imageIntrinsicSize.height}
            loading={priorityLoad ? 'eager' : 'lazy'}
            fetchPriority={priorityLoad ? 'high' : 'auto'}
            decoding="async"
            onError={handleImageError}
            className={imageClassName}
          />
        </span>
      );
    };

    const metadataLine = (
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
        {metaItems.map((item) => (
          <span key={String(item)} className="max-w-36 truncate">
            {item}
          </span>
        ))}
      </div>
    );

    const visibleActionGroup = (
      <div className="library-card-actions catalog-hover-actions">
        <CompactActionButton
          onClick={() => onAddToContext(image)}
          icon={<PlusCircle size={14} />}
          label="Use as reference"
          variant="primary"
        />
        <CompactActionButton
          onClick={handleCopyPrompt}
          icon={copiedPrompt ? <Check size={14} /> : <ClipboardList size={14} />}
          label={copiedPrompt ? 'Prompt copied' : 'Copy prompt'}
        />
        <CompactActionButton
          onClick={handleDownload}
          icon={<Download size={14} />}
          label="Download"
        />
        {
          <CompactActionButton
            onClick={() => onToggleFavorite(image.id)}
            icon={<Heart size={14} fill={image.isFavorite ? 'currentColor' : 'none'} />}
            label={image.isFavorite ? 'Remove favorite' : 'Add favorite'}
            isActive={image.isFavorite}
          />
        }
        {
          <CompactActionButton
            onClick={handleSelectClick}
            icon={<Check size={14} />}
            label={isSelected ? 'Deselect' : 'Select'}
            isActive={isSelected}
          />
        }
        <details
          className="library-card-menu"
          onToggle={(event) => setIsActionMenuOpen(event.currentTarget.open)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.currentTarget.open = false;
              event.currentTarget.querySelector('summary')?.focus();
            }
          }}
        >
          <summary aria-label="More image actions" data-tooltip="More image actions">
            •••
          </summary>
          <div>
            <button type="button" onClick={() => void withFullConfig(onLoadConfig)}>
              <History size={14} /> Load configuration
            </button>
            <button type="button" onClick={() => void withFullConfig(onRegenerate)}>
              <RefreshCw size={14} /> Regenerate
            </button>
            <button type="button" className="is-danger" onClick={() => onDelete(image.id)}>
              <Trash2 size={14} /> Move to trash
            </button>
          </div>
        </details>
      </div>
    );

    if (isListView) {
      return (
        <div
          ref={itemRef}
          onMouseEnter={() => setIsActionSurfaceActive(true)}
          onMouseLeave={() => setIsActionSurfaceActive(false)}
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
          className={`group flex min-w-0 flex-col gap-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-2 text-left shadow-lg shadow-black/25 transition-[border-color,background-color,opacity,transform,box-shadow] sm:flex-row sm:items-center
          ${isSelected ? 'ring-2 ring-accent-500 ring-offset-2 ring-offset-black' : 'hover:border-[color:var(--wb-border)] hover:bg-[color:var(--wb-panel)]/85'}
        `}
          style={{ contentVisibility: 'auto', containIntrinsicSize: '720px 120px' }}
        >
          <button
            type="button"
            onClick={handleImageClick}
            aria-label={`Open image preview: ${image.config.prompt?.slice(0, 80) || image.id}`}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 appearance-none border-none bg-transparent p-0 text-left"
          >
            {renderImageFrame({
              frameClassName:
                'block shrink-0 overflow-hidden rounded-[var(--wb-radius)] bg-[color:var(--wb-panel)] ring-1 ring-white/10',
              style: { width: listThumbnailSize, height: listThumbnailSize },
            })}
            <span className="min-w-0 flex-1">
              <span
                data-tooltip={promptText}
                className="line-clamp-2 text-sm font-semibold leading-5 text-[color:var(--wb-ink)]"
              >
                {promptText}
              </span>
              <span className="mt-2 block">{metadataLine}</span>
            </span>
          </button>
          <div className="flex shrink-0 justify-end sm:max-w-[17.25rem]">{visibleActionGroup}</div>
        </div>
      );
    }

    if (isCardView) {
      return (
        <div
          ref={itemRef}
          onMouseEnter={() => setIsActionSurfaceActive(true)}
          onMouseLeave={() => setIsActionSurfaceActive(false)}
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
          className={`catalog-art-card relative group min-w-0 overflow-hidden rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] text-left shadow-lg shadow-black/25 transition-[border-color,background-color,opacity,transform,box-shadow]
          ${isSelected ? 'ring-2 ring-accent-500 ring-offset-2 ring-offset-black' : 'hover:border-[color:var(--wb-border)] hover:bg-[color:var(--wb-panel)]/85'}
        `}
          style={{ contentVisibility: 'auto', containIntrinsicSize: '320px 460px' }}
        >
          <button
            type="button"
            onClick={handleImageClick}
            aria-label={`Open image preview: ${image.config.prompt?.slice(0, 80) || image.id}`}
            className="relative block w-full cursor-pointer appearance-none border-none bg-transparent p-0 text-left"
          >
            {renderImageFrame({
              frameClassName:
                'block w-full overflow-hidden rounded-t-xl bg-[color:var(--wb-panel)] ring-1 ring-inset ring-white/10',
            })}
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${isSelected ? 'bg-accent-500/10' : 'bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}
            />
          </button>
          <CatalogCardBackdrop
            label={promptText}
            title={<span>{promptText}</span>}
            onExpandedChange={setIsActionPanelExpanded}
          >
            {metadataLine}
            {visibleActionGroup}
          </CatalogCardBackdrop>
        </div>
      );
    }

    return (
      <div
        ref={itemRef}
        onMouseEnter={() => setIsActionSurfaceActive(true)}
        onMouseLeave={() => setIsActionSurfaceActive(false)}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
        className={`catalog-art-card masonry-item relative group overflow-hidden rounded-[var(--wb-radius)] cursor-pointer transition-[opacity,transform,box-shadow] duration-700 ease-out-expo appearance-none border-none p-0 m-0 bg-transparent text-left
        ${viewMode === 'mosaic' ? 'mb-4' : ''}
        ${isSelected ? 'ring-2 ring-accent-500 ring-offset-2 ring-offset-black z-10' : 'shadow-lg'}
        animate-in fade-in-0 zoom-in-95
      `}
        style={{ contentVisibility: 'auto', containIntrinsicSize: '320px 420px' }}
      >
        <button
          type="button"
          onClick={handleImageClick}
          aria-label={`Open image preview: ${image.config.prompt?.slice(0, 80) || image.id}`}
          className="block w-full cursor-pointer appearance-none border-none bg-transparent p-0 text-left"
        >
          {renderImageFrame({
            frameClassName:
              'block w-full overflow-hidden rounded-[var(--wb-radius)] bg-[color:var(--wb-panel)]',
          })}

          <div
            className={`absolute inset-0 transition-opacity duration-300 ${isSelected ? 'bg-accent-500/10' : 'bg-linear-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}
          ></div>
        </button>

        {isSelected ? (
          <span className="catalog-selected-mark" aria-label="Selected">
            <Check size={14} />
          </span>
        ) : null}
        <CatalogCardBackdrop
          label={promptText}
          title={<span>{promptText}</span>}
          onExpandedChange={setIsActionPanelExpanded}
        >
          {metadataLine}
          <div className="catalog-backdrop-action-slot">
            {shouldMountActions ? visibleActionGroup : null}
          </div>
        </CatalogCardBackdrop>
      </div>
    );
  },
);

const EMPTY_GENERATION_PLACEHOLDERS: StudioGenerationPlaceholder[] = [];
const IMAGE_GRID_SORT_OPTIONS = [
  {
    value: 'desc',
    label: 'Created newest',
    description: 'Recent generations first',
  },
  {
    value: 'asc',
    label: 'Created oldest',
    description: 'Oldest generations first',
  },
  {
    value: 'prompt',
    label: 'Prompt A-Z',
    description: 'Alphabetical prompt order',
  },
  {
    value: 'prompt_desc',
    label: 'Prompt Z-A',
    description: 'Reverse prompt order',
  },
  {
    value: 'ratio',
    label: 'Aspect ratio',
    description: 'Group by output format',
  },
  {
    value: 'id',
    label: 'Image ID',
    description: 'Stable file/id order',
  },
] satisfies Array<{ value: ImageGridSortOption; label: string; description: string }>;

const IMAGE_GRID_VIEW_OPTIONS = [
  {
    value: 'grid',
    label: 'Grid',
    description: 'Uniform thumbnails',
    Icon: LayoutGrid,
  },
  {
    value: 'mosaic',
    label: 'Mosaic',
    description: 'Real aspect ratios',
    Icon: LayoutCollage,
  },
  {
    value: 'list',
    label: 'List',
    description: 'Dense rows',
    Icon: LayoutList,
  },
  {
    value: 'cards',
    label: 'Cards',
    description: 'Image cards',
    Icon: LayoutCards,
  },
] satisfies Array<{
  value: ImageGridViewMode;
  label: string;
  description: string;
  Icon: React.ElementType<{ size?: number; className?: string }>;
}>;

type GridItem =
  | { type: 'placeholder'; placeholder: StudioGenerationPlaceholder }
  | { type: 'image'; image: GeneratedImageWithConfig };

type GridRow = {
  key: string;
  items: GridItem[];
  estimatedHeight: number;
};

function getGridItemKey(item: GridItem) {
  return item.type === 'image' ? item.image.id : item.placeholder.id;
}

function toCssAspectRatio(aspectRatio: string) {
  return /^\d+:\d+$/.test(aspectRatio) ? aspectRatio.replace(':', ' / ') : '1 / 1';
}

const GenerationPlaceholderItem: React.FC<{
  placeholder: StudioGenerationPlaceholder;
  viewMode: ImageGridViewMode;
}> = React.memo(({ placeholder, viewMode }) => (
  <div
    className={`masonry-item overflow-hidden rounded-[var(--wb-radius)] border border-accent-400/2 bg-[color:var(--wb-panel)] shadow-lg animate-in fade-in-0 zoom-in-95 ${viewMode === 'mosaic' ? 'mb-4' : ''}`}
  >
    <output
      aria-label={`Generation job ${placeholder.status}`}
      className="relative block overflow-hidden rounded-[var(--wb-radius)] bg-[color:var(--wb-panel)]"
      style={
        viewMode === 'list'
          ? { minHeight: 104 }
          : {
              aspectRatio:
                viewMode === 'grid' ? '1 / 1' : toCssAspectRatio(placeholder.aspectRatio),
            }
      }
    >
      <div className="absolute inset-0 animate-pulse bg-linear-to-br from-white/10 via-zinc-800/70 to-zinc-950" />
      <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-accent-400/10 to-transparent" />
      <div className="absolute left-2 top-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-black/55 px-2 py-1 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)] backdrop-blur-md">
        <Loader2 size={12} className={placeholder.status === 'running' ? 'animate-spin' : ''} />
        <span className="truncate">{placeholder.status}</span>
      </div>
      <div className="absolute inset-x-2 bottom-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-2 py-1.5 text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-ink)] backdrop-blur-md">
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
  onSelectAll: (images: GeneratedImageWithConfig[]) => void;
  onDeselectAll: () => void;
  onDownloadSelected: (images: GeneratedImageWithConfig[]) => void;
  onDownloadAll: (images: GeneratedImageWithConfig[]) => void;
  onDeleteSelected: (images: GeneratedImageWithConfig[]) => void;
  onClearWorkspace: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  onClearSearch?: () => void;
  onCreate?: () => void;
  catalogTotal?: number;
  hasMore?: boolean;
  isCatalogLoading?: boolean;
  catalogError?: string | null;
  onLoadMore?: () => void | Promise<void>;
  onRetryCatalog?: () => void;
}

function subscribeViewportSize(onStoreChange: () => void) {
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

function getViewportHeightSnapshot() {
  if (typeof window === 'undefined') return 900;
  return window.innerHeight;
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
    searchQuery = '',
    onSearchQueryChange,
    onClearSearch,
    onCreate,
    catalogTotal,
    hasMore = false,
    isCatalogLoading = false,
    catalogError = null,
    onLoadMore,
    onRetryCatalog,
    generationPlaceholders = EMPTY_GENERATION_PLACEHOLDERS,
  }) => {
    const [sortOrder, setSortOrder] = useState<ImageGridSortOption>('desc');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [thumbnailSize, setThumbnailSize] = useState(DEFAULT_THUMBNAIL_SIZE);
    const [viewMode, setViewMode] = useState<ImageGridViewMode>(DEFAULT_IMAGE_GRID_VIEW_MODE);
    const sortButtonRef = useRef<HTMLButtonElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const autoLoadSentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollRafRef = useRef<number | null>(null);
    const autoLoadPendingRef = useRef(false);
    const sortMenuId = React.useId();
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollViewportHeight, setScrollViewportHeight] = useState(getViewportHeightSnapshot);
    const viewportWidth = useSyncExternalStore(
      subscribeViewportSize,
      getViewportWidthSnapshot,
      () => 1280,
    );
    const viewportHeight = useSyncExternalStore(
      subscribeViewportSize,
      getViewportHeightSnapshot,
      () => 900,
    );
    const gridMeasureRef = useRef<HTMLDivElement>(null);
    const [gridMeasuredWidth, setGridMeasuredWidth] = useState(0);

    const sourceImageCount = images.length;
    const favoriteCount = useMemo(
      () => images.reduce((count, image) => count + (image.isFavorite ? 1 : 0), 0),
      [images],
    );
    const visibleImages = useMemo(
      () => filterImageGridImages(images, showFavoritesOnly),
      [images, showFavoritesOnly],
    );
    const imageCount = visibleImages.length;
    const alwaysShowCardActions = shouldAlwaysShowCatalogCardActions(viewportWidth);
    const totalCount = catalogTotal ?? sourceImageCount;
    const isPartialCatalog = hasMore || totalCount > sourceImageCount;
    const visibleImageIds = useMemo(
      () => new Set(visibleImages.map((image) => image.id)),
      [visibleImages],
    );
    const selectedImageCount = selectedImageIds.filter((id) => visibleImageIds.has(id)).length;
    const isAllSelected = imageCount > 0 && selectedImageCount === imageCount;
    const activeSortOption =
      IMAGE_GRID_SORT_OPTIONS.find((option) => option.value === sortOrder) ??
      IMAGE_GRID_SORT_OPTIONS[0];
    const activeViewOption =
      IMAGE_GRID_VIEW_OPTIONS.find((option) => option.value === viewMode) ??
      IMAGE_GRID_VIEW_OPTIONS[0];

    const sortedImages = useMemo(() => {
      return sortImageGridImages(visibleImages, sortOrder);
    }, [visibleImages, sortOrder]);

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

    React.useEffect(() => {
      const element = gridMeasureRef.current;
      if (!element) {
        setGridMeasuredWidth(0);
        return;
      }

      const updateGridWidth = () => {
        setGridMeasuredWidth(element.clientWidth);
      };

      updateGridWidth();

      if (typeof ResizeObserver === 'undefined') {
        window.addEventListener('resize', updateGridWidth);
        return () => window.removeEventListener('resize', updateGridWidth);
      }

      const resizeObserver = new ResizeObserver(updateGridWidth);
      resizeObserver.observe(element);
      return () => resizeObserver.disconnect();
    }, [gridItems.length, viewportWidth]);

    React.useEffect(() => {
      const element = scrollContainerRef.current;
      if (!element) {
        setScrollTop(0);
        setScrollViewportHeight(viewportHeight);
        return;
      }

      const updateScrollViewport = () => {
        setScrollTop(element.scrollTop);
        setScrollViewportHeight(element.clientHeight || viewportHeight);
      };

      updateScrollViewport();

      if (typeof ResizeObserver === 'undefined') {
        window.addEventListener('resize', updateScrollViewport);
        return () => window.removeEventListener('resize', updateScrollViewport);
      }

      const resizeObserver = new ResizeObserver(updateScrollViewport);
      resizeObserver.observe(element);
      return () => resizeObserver.disconnect();
    }, [viewportHeight]);

    React.useEffect(() => {
      return () => {
        if (scrollRafRef.current !== null) {
          cancelAnimationFrame(scrollRafRef.current);
        }
      };
    }, []);

    const columnCount = useMemo(() => {
      const measuredGridWidth = gridMeasuredWidth || viewportWidth;
      return resolveImageGridColumnCount({
        viewportWidth: measuredGridWidth,
        thumbnailSize,
        itemCount: gridItems.length,
        horizontalPadding: gridMeasuredWidth > 0 ? 0 : undefined,
        viewMode,
      });
    }, [gridMeasuredWidth, viewportWidth, thumbnailSize, gridItems.length, viewMode]);

    const columnBuckets = useMemo(() => {
      const safeColumnCount = Math.max(1, columnCount);
      const buckets: GridItem[][] = Array.from({ length: safeColumnCount }, () => []);

      gridItems.forEach((item, index) => {
        buckets[index % safeColumnCount].push(item);
      });

      return buckets;
    }, [gridItems, columnCount]);

    const gridItemWidth = useMemo(
      () =>
        resolveImageGridItemWidth({
          containerWidth: gridMeasuredWidth || viewportWidth,
          columnCount,
          thumbnailSize,
        }),
      [columnCount, gridMeasuredWidth, thumbnailSize, viewportWidth],
    );

    const estimateGridItemRenderHeight = React.useCallback(
      (item: GridItem) => {
        if (viewMode === 'list') {
          return estimateImageGridListItemHeight({ thumbnailSize, viewportWidth });
        }

        if (item.type === 'placeholder') {
          return viewMode === 'grid' ? gridItemWidth : gridItemWidth + 112;
        }

        return estimateImageGridCardItemHeight({
          image: item.image,
          itemWidth: gridItemWidth,
          viewMode,
        });
      },
      [gridItemWidth, thumbnailSize, viewportWidth, viewMode],
    );

    const gridRows = useMemo<GridRow[]>(() => {
      if (viewMode === 'mosaic') return [];

      const safeColumnCount = Math.max(1, columnCount);
      const rows: GridRow[] = [];
      for (let index = 0; index < gridItems.length; index += safeColumnCount) {
        const items = gridItems.slice(index, index + safeColumnCount);
        rows.push({
          key: items.map(getGridItemKey).join(':'),
          items,
          estimatedHeight:
            Math.max(...items.map(estimateGridItemRenderHeight), MIN_THUMBNAIL_SIZE) +
            IMAGE_GRID_COLUMN_GAP,
        });
      }
      return rows;
    }, [columnCount, estimateGridItemRenderHeight, gridItems, viewMode]);

    const virtualGridWindow = useMemo(
      () =>
        resolveImageGridVirtualWindow({
          itemSizes: gridRows.map((row) => row.estimatedHeight),
          scrollTop,
          viewportHeight: scrollViewportHeight,
          overscanPx: IMAGE_GRID_VIRTUAL_OVERSCAN_PX,
        }),
      [gridRows, scrollTop, scrollViewportHeight],
    );

    const virtualColumnBuckets = useMemo(() => {
      if (viewMode !== 'mosaic') return [];

      return columnBuckets.map((bucket) => {
        const itemSizes = bucket.map((item) => {
          if (item.type === 'placeholder') return gridItemWidth + IMAGE_GRID_COLUMN_GAP;
          return (
            estimateImageGridItemHeight({ image: item.image, thumbnailSize: gridItemWidth }) +
            IMAGE_GRID_COLUMN_GAP
          );
        });
        const window = resolveImageGridVirtualWindow({
          itemSizes,
          scrollTop,
          viewportHeight: scrollViewportHeight,
          overscanPx: IMAGE_GRID_VIRTUAL_OVERSCAN_PX,
        });

        return {
          window,
          visibleItems: bucket.slice(window.startIndex, window.endIndex),
        };
      });
    }, [columnBuckets, scrollTop, scrollViewportHeight, gridItemWidth, viewMode]);

    const priorityImageIds = useMemo(() => {
      const ids = new Set<string>();

      if (viewMode !== 'mosaic') {
        const safeColumnCount = Math.max(1, columnCount);
        const estimatedItemHeight =
          viewMode === 'list' ? Math.max(104, thumbnailSize * 0.72) : thumbnailSize;
        const priorityRows = Math.ceil(
          (viewportHeight + IMAGE_GRID_COLUMN_GAP * 2) /
            Math.max(MIN_THUMBNAIL_SIZE, estimatedItemHeight),
        );
        const priorityItemLimit = Math.max(safeColumnCount, safeColumnCount * priorityRows);

        gridItems.slice(0, priorityItemLimit).forEach((item) => {
          if (item.type === 'image') {
            ids.add(item.image.id);
          }
        });

        return ids;
      }

      for (const bucket of columnBuckets) {
        let estimatedTop = 0;

        for (const item of bucket) {
          if (item.type === 'image') {
            if (shouldPriorityLoadImageGridItem({ estimatedTop, viewportHeight })) {
              ids.add(item.image.id);
            }

            estimatedTop +=
              estimateImageGridItemHeight({ image: item.image, thumbnailSize: gridItemWidth }) +
              IMAGE_GRID_COLUMN_GAP;
            continue;
          }

          estimatedTop += gridItemWidth + IMAGE_GRID_COLUMN_GAP;
        }
      }

      return ids;
    }, [
      columnBuckets,
      columnCount,
      gridItems,
      thumbnailSize,
      gridItemWidth,
      viewportHeight,
      viewMode,
    ]);

    const requestAutoLoadMore = React.useCallback(() => {
      if (!hasMore || isCatalogLoading || !onLoadMore || autoLoadPendingRef.current) return;

      autoLoadPendingRef.current = true;
      const result = onLoadMore();
      if (result && typeof result === 'object' && 'finally' in result) {
        void result.finally(() => {
          autoLoadPendingRef.current = false;
        });
        return;
      }

      window.setTimeout(() => {
        autoLoadPendingRef.current = false;
      }, 350);
    }, [hasMore, isCatalogLoading, onLoadMore]);

    const handleViewModeChange = React.useCallback((nextViewMode: ImageGridViewMode) => {
      setViewMode(nextViewMode);
      setScrollTop(0);
      scrollContainerRef.current?.scrollTo({ top: 0 });
    }, []);

    const handleScroll = React.useCallback(
      (event: React.UIEvent<HTMLDivElement>) => {
        const element = event.currentTarget;
        if (scrollRafRef.current !== null) return;

        scrollRafRef.current = requestAnimationFrame(() => {
          scrollRafRef.current = null;
          setScrollTop(element.scrollTop);

          const distanceToEnd = element.scrollHeight - element.scrollTop - element.clientHeight;
          if (distanceToEnd < IMAGE_GRID_VIRTUAL_OVERSCAN_PX * 1.4) {
            requestAutoLoadMore();
          }
        });
      },
      [requestAutoLoadMore],
    );

    React.useEffect(() => {
      const root = scrollContainerRef.current;
      const target = autoLoadSentinelRef.current;
      if (!root || !target || !hasMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            requestAutoLoadMore();
          }
        },
        { root, rootMargin: `${IMAGE_GRID_VIRTUAL_OVERSCAN_PX}px 0px` },
      );

      observer.observe(target);
      return () => observer.disconnect();
    }, [hasMore, requestAutoLoadMore, gridItems.length, viewMode]);

    const renderGridItem = (item: GridItem) =>
      item.type === 'placeholder' ? (
        <GenerationPlaceholderItem
          key={item.placeholder.id}
          placeholder={item.placeholder}
          viewMode={viewMode}
        />
      ) : (
        <div
          key={item.image.id}
          className={activeModalImageId === item.image.id ? 'opacity-0' : 'opacity-100'}
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
            transitionName={transitioningImageId === item.image.id ? 'master-canvas' : undefined}
            alwaysShowActions={alwaysShowCardActions}
            priorityLoad={priorityImageIds.has(item.image.id)}
            viewMode={viewMode}
            thumbnailSize={thumbnailSize}
          />
        </div>
      );

    const emptyContent =
      imageCount === 0 && generationPlaceholders.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center px-6 text-center">
          {catalogError ? (
            <div className="max-w-md rounded-[var(--wb-radius)] border border-rose-500/2 bg-rose-950/20 p-4 text-sm text-[color:var(--wb-danger)] ">
              <div className="font-semibold">Catalog failed to load</div>
              <div className="mt-1 text-[color:var(--wb-danger)] ">{catalogError}</div>
              {onRetryCatalog && (
                <button
                  type="button"
                  onClick={onRetryCatalog}
                  className="mt-3 rounded-[var(--wb-radius)] border border-rose-300/2 px-3 py-1.5 text-xs font-bold tracking-normal text-[color:var(--wb-danger)]  hover:bg-rose-300/10"
                >
                  Retry
                </button>
              )}
            </div>
          ) : isCatalogLoading ? (
            <p role="status">Loading images…</p>
          ) : (
            <div className="max-w-md space-y-3">
              <h2 className="text-lg font-semibold">
                {searchQuery || showFavoritesOnly
                  ? 'No matching images'
                  : 'Your library starts here'}
              </h2>
              <p className="text-sm text-[color:var(--wb-muted)]">
                {searchQuery
                  ? `No results for “${searchQuery}” in this workspace.`
                  : showFavoritesOnly
                    ? 'No favorite images in this view.'
                    : 'Create an image to add your first result to this workspace.'}
              </p>
              {searchQuery || showFavoritesOnly ? (
                <button
                  type="button"
                  className="studio-ghost-control px-4 py-2"
                  onClick={() => {
                    onClearSearch?.();
                    setShowFavoritesOnly(false);
                  }}
                >
                  Clear filters
                </button>
              ) : (
                <button type="button" className="studio-ghost-control px-4 py-2" onClick={onCreate}>
                  Create an image
                </button>
              )}
            </div>
          )}
        </div>
      ) : null;

    return (
      <div className="w-full h-full relative flex min-h-0 flex-col">
        <p
          className="absolute bottom-2 left-3 z-30 rounded bg-[color:var(--wb-panel)] px-2 py-1 text-xs"
          role="status"
        >
          {selectedImageCount} selected · {imageCount} loaded · {totalCount} results
        </p>
        <div className="library-toolbar studio-bar" aria-label="Library controls">
          <label className="library-search">
            <span className="sr-only">Search library</span>
            <input
              type="search"
              aria-label="Search library"
              placeholder="Search all images in this workspace"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange?.(event.target.value)}
              className="studio-well"
            />
          </label>
          <div className="library-toolbar-actions" role="toolbar" aria-label="Library actions">
            {sourceImageCount > 0 && (
              <div className="flex items-center gap-1 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-1 shadow-2xl backdrop-blur-md">
                {imageCount > 1 && (
                  <ActionButton
                    onClick={isAllSelected ? onDeselectAll : () => onSelectAll(sortedImages)}
                    icon={
                      isAllSelected ? (
                        <CheckSquare size={16} className="text-accent-400" />
                      ) : (
                        <Square size={16} />
                      )
                    }
                    label={isAllSelected ? 'Deselect' : `Select loaded images (${imageCount})`}
                    isActive={isAllSelected}
                    tooltipPosition="bottom"
                  />
                )}
                <ActionButton
                  onClick={() => setShowFavoritesOnly((current) => !current)}
                  icon={
                    <Heart
                      size={16}
                      fill={showFavoritesOnly ? 'currentColor' : 'none'}
                      strokeWidth={2.5}
                    />
                  }
                  label={
                    showFavoritesOnly ? `All (${sourceImageCount})` : `Favorites (${favoriteCount})`
                  }
                  isActive={showFavoritesOnly}
                  tooltipPosition="bottom"
                />
                {selectedImageCount === 0 && imageCount > 0 && !isPartialCatalog && (
                  <>
                    <ActionButton
                      onClick={() => onDownloadAll(sortedImages)}
                      icon={<Download size={16} />}
                      label={`Download ${imageCount} images`}
                      tooltipPosition="bottom"
                    />
                    <ActionButton
                      onClick={onClearWorkspace}
                      icon={<Trash2 size={16} />}
                      label="Archive workspace images"
                      variant="danger"
                      tooltipPosition="bottom"
                    />
                  </>
                )}
                {selectedImageCount > 0 && (
                  <>
                    <ActionButton
                      onClick={() => onDownloadSelected(sortedImages)}
                      icon={<Download size={16} />}
                      label={`Download selected (${selectedImageCount})`}
                      tooltipPosition="bottom"
                    />
                    <ActionButton
                      onClick={() => onDeleteSelected(sortedImages)}
                      icon={<Trash2 size={16} />}
                      label={`Archive selected (${selectedImageCount})`}
                      variant="danger"
                      tooltipPosition="bottom"
                    />
                  </>
                )}
              </div>
            )}
            <div
              role="group"
              aria-label={`Image view: ${activeViewOption.label}`}
              className="flex h-10 items-center gap-1 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-1 shadow-2xl backdrop-blur-md"
            >
              {IMAGE_GRID_VIEW_OPTIONS.map(({ value, label, description, Icon }) => {
                const selected = value === viewMode;

                return (
                  <Tooltip key={value} content={`${label}: ${description}`} position="bottom">
                    <button
                      type="button"
                      onClick={() => handleViewModeChange(value)}
                      aria-label={`${label} view`}
                      aria-pressed={selected}
                      className={`flex min-h-8 min-w-8 touch-manipulation items-center justify-center rounded-[var(--wb-radius)] transition-[background-color,color,transform,box-shadow] focus-visible:ring-2 focus-visible:ring-white/25 ${
                        selected
                          ? 'bg-accent-600 text-[color:var(--wb-ink)] shadow-[0_0_18px_rgba(var(--accent-500),0.18)]'
                          : 'text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]'
                      }`}
                    >
                      <Icon size={16} className="pointer-events-none" />
                    </button>
                  </Tooltip>
                );
              })}
            </div>
            <Tooltip content="Thumbnail size" position="bottom">
              <label className="flex h-10 items-center gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] px-2 text-[color:var(--wb-muted)] shadow-2xl backdrop-blur-md sm:flex">
                <Photo size={15} />
                <input
                  type="range"
                  aria-label="Thumbnail size"
                  min={MIN_THUMBNAIL_SIZE}
                  max={MAX_THUMBNAIL_SIZE}
                  step={THUMBNAIL_SIZE_STEP}
                  value={thumbnailSize}
                  onChange={(event) => setThumbnailSize(Number(event.target.value))}
                  className="h-1 w-24 cursor-pointer accent-accent-500 sm:w-28"
                />
              </label>
            </Tooltip>
            <div className="relative">
              <Tooltip content="Sort Images" position="bottom">
                <button
                  ref={sortButtonRef}
                  type="button"
                  onClick={() => setIsSortMenuOpen((open) => !open)}
                  aria-label={`Sort images: ${activeSortOption.label}`}
                  aria-haspopup="menu"
                  aria-expanded={isSortMenuOpen}
                  aria-controls={sortMenuId}
                  className={`flex min-h-10 min-w-10 touch-manipulation items-center justify-center gap-2 rounded-[var(--wb-radius)] border px-2.5 text-[color:var(--wb-ink)] shadow-2xl backdrop-blur-md transition-[background-color,border-color,color,transform] focus-visible:ring-2 focus-visible:ring-white/25 ${
                    isSortMenuOpen
                      ? 'border-[color:var(--wb-line)] bg-[color:var(--wb-bar)]/95 text-[color:var(--wb-ink)]'
                      : 'border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] hover:border-[color:var(--wb-border)] hover:bg-[color:var(--wb-bar)] hover:text-[color:var(--wb-ink)]'
                  }`}
                >
                  <ArrowUpDown size={16} />
                  <span className="hidden max-w-28 truncate text-[length:var(--wbp-label)] font-semibold tracking-normal lg:inline">
                    {activeSortOption.label}
                  </span>
                </button>
              </Tooltip>
              <DemandMountedGsapDropdown
                id={sortMenuId}
                open={isSortMenuOpen}
                onOpenChange={setIsSortMenuOpen}
                triggerRef={sortButtonRef}
                placement="bottom-right"
                className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden p-1.5"
              >
                <div className="px-2 pb-1 pt-1 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
                  Sort images
                </div>
                <div className="grid gap-1">
                  {IMAGE_GRID_SORT_OPTIONS.map((option) => {
                    const selected = option.value === sortOrder;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={selected}
                        data-dropdown-item
                        onClick={() => {
                          setSortOrder(option.value);
                          setIsSortMenuOpen(false);
                        }}
                        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-[var(--wb-radius)] px-2.5 text-left transition-[background-color,color,transform] ${
                          selected
                            ? 'bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] text-[color:var(--wb-ink)]'
                            : 'text-[color:var(--wb-muted)] hover:bg-white/[0.055] hover:text-[color:var(--wb-ink)]'
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[length:var(--wbp-label)] font-semibold tracking-normal">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block truncate text-[length:var(--wbp-label)] font-semibold normal-case tracking-normal text-[color:var(--wb-dim)]">
                            {option.description}
                          </span>
                        </span>
                        {selected ? <Check size={14} className="shrink-0 text-accent-200" /> : null}
                      </button>
                    );
                  })}
                </div>
              </DemandMountedGsapDropdown>
            </div>
          </div>
        </div>
        {emptyContent || (
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="custom-scrollbar relative min-h-0 flex-1 overflow-y-auto px-3 pt-3 pb-8 sm:px-8"
          >
            {showFavoritesOnly && imageCount === 0 && generationPlaceholders.length === 0 && (
              <div className="flex min-h-[45vh] items-center justify-center text-center">
                <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_3%,transparent)] px-4 py-3 text-xs font-semibold text-[color:var(--wb-muted)]">
                  No favorite images in this workspace.
                </div>
              </div>
            )}
            <div
              ref={gridMeasureRef}
              className="grid gap-4"
              style={{
                gridTemplateColumns: resolveImageGridTemplateColumns(columnCount, viewMode),
                alignItems: viewMode === 'mosaic' ? 'start' : 'stretch',
              }}
            >
              {viewMode === 'mosaic' ? (
                virtualColumnBuckets.map(({ window, visibleItems }, columnIndex) => {
                  const bucket = columnBuckets[columnIndex] ?? [];
                  const firstItem = bucket[0];
                  const firstItemId = firstItem ? getGridItemKey(firstItem) : null;
                  const columnKey = firstItemId
                    ? `column-${firstItemId}-${bucket.length}`
                    : `column-empty-${columnIndex}`;

                  return (
                    <div key={columnKey} className="flex min-w-0 flex-col gap-0">
                      {window.beforeHeight > 0 && (
                        <div style={{ height: window.beforeHeight }} aria-hidden="true" />
                      )}
                      {visibleItems.map(renderGridItem)}
                      {window.afterHeight > 0 && (
                        <div style={{ height: window.afterHeight }} aria-hidden="true" />
                      )}
                    </div>
                  );
                })
              ) : (
                <>
                  {virtualGridWindow.beforeHeight > 0 && (
                    <div
                      style={{
                        gridColumn: '1 / -1',
                        height: virtualGridWindow.beforeHeight,
                      }}
                      aria-hidden="true"
                    />
                  )}
                  {gridRows
                    .slice(virtualGridWindow.startIndex, virtualGridWindow.endIndex)
                    .flatMap((row) => row.items.map(renderGridItem))}
                  {virtualGridWindow.afterHeight > 0 && (
                    <div
                      style={{
                        gridColumn: '1 / -1',
                        height: virtualGridWindow.afterHeight,
                      }}
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </div>
            <div ref={autoLoadSentinelRef} className="h-px w-full" aria-hidden="true" />
            {(hasMore || isCatalogLoading || catalogError || totalCount > sourceImageCount) && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="text-[length:var(--wbp-label)] font-semibold tabular-nums tracking-normal text-[color:var(--wb-muted)]">
                  {sourceImageCount} / {totalCount} loaded
                </div>
                {catalogError && (
                  <div className="max-w-lg text-xs text-[color:var(--wb-danger)] ">
                    {catalogError}
                  </div>
                )}
                {hasMore && onLoadMore && (
                  <button
                    type="button"
                    onClick={onLoadMore}
                    disabled={isCatalogLoading}
                    className="inline-flex items-center gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-4 py-2 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isCatalogLoading ? 'animate-spin' : ''} />
                    {isCatalogLoading ? 'Loading' : 'Load more'}
                  </button>
                )}
                {!hasMore && catalogError && onRetryCatalog && (
                  <button
                    type="button"
                    onClick={onRetryCatalog}
                    className="rounded-[var(--wb-radius)] border border-rose-300/2 bg-rose-500/10 px-4 py-2 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-danger)]  hover:bg-rose-500/20"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
