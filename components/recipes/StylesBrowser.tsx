import { getStyleCategoryDisplayName } from './styles/collections/categoryDisplayNames';
import { PagedStyleCatalog } from './PagedStyleCatalog';
import { runtimeLogger } from '../../utils/runtimeLogger';
import { AnimatePresence } from '../../lib/gsapMotion';
import { useWorkspaceState } from '../../contexts/GlobalContext';
import {
  IconArchive as Archive,
  IconArrowsSort as ArrowUpDown,
  IconBox as Box,
  IconBriefcase as Briefcase,
  IconCheck as Check,
  IconChevronDown as ChevronDown,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconCopy as Copy,
  IconFilter as Filter,
  IconFolders as Folders,
  IconHeart as Heart,
  IconLayoutGrid as LayoutGrid,
  IconMaximize as Maximize,
  IconMinimize as Minimize,
  IconStack as Layers,
  IconPencil as PenTool,
  IconPlayerPlay as Play,
  IconPlus as Plus,
  IconSearch as Search,
  IconAdjustmentsHorizontal as SlidersHorizontal,
  IconSparkles as Sparkles,
  IconWand as Wand2,
  IconX as X,
} from '@tabler/icons-react';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLatestRef } from '../../hooks/useLatestRef';
import {
  getStyleCategoryImage,
  getStyleThumbnail,
  STYLE_CATEGORY_PREVIEWS,
  resolveStyleDefaultImageThumbnail,
  resolveStyleDefaultImageVariantThumbnails,
} from '../../lib/styleThumbnailCatalog';
import { styleCategoryImageKey } from '../../lib/recipeAssetKeys';
import { hasStylePresetIdentity } from '../../lib/recipeIdentity';
import { isStyleDefaultImageStale } from '../../lib/staleStyleDefaultImages.generated';
import { StyleCategoryGlyph } from './StyleCategoryGlyph';
import { resolveStyleCategoryIdentity } from './styleCategoryIdentity';
import type { Attachment, GeneratedImageWithConfig, ImageGenerationConfig } from '../../types';
import type { GenerationProviderId } from '../../packages/shared/src';
import { resolveGrokImagineGenerateBlock } from '../../lib/grokImagineUiPolicy';
import { useStyleRuntimePacks } from '../../hooks/useStyleRuntimePacks';
import { DemandMountedGsapDropdown } from '../ui/DemandMountedGsapDropdown';
import { LazySurfaceFallback } from '../ui/LazySurfaceFallback';
import {
  RecipeControls,
  RecipeOverlay,
  RecipeSidePanel,
  RecipeResults,
} from './RecipeWorkbenchContext';
import { RecipeLayout } from './RecipeLayout';
import {
  STYLE_BROWSER_EAGER_SECTION_LIMIT,
  STYLE_BROWSER_FLAT_GROUP_KEY,
  collectStylePresetPreviewSources,
  createStyleBrowserProcessedData,
  createStyleBrowserRenderPlan,
  type StyleBrowserSortOrder,
} from './styleBrowserRenderPlan';
import {
  STYLE_GRID_DEFAULT_VIEWPORT_HEIGHT_PX,
  createStyleGridVirtualWindow,
  fitStyleGridColumns,
  resolveStyleGridColumns,
  estimateStyleGroupPlaceholderHeight,
  type StyleGridVirtualWindow,
} from './styleGridVirtualization';
import { buildStylePromptText } from './stylePromptText';
import {
  createStylePresetCatalogSearchIndexFromRuntimePacks,
  type StylePresetCatalogSearchResult,
} from './stylePresetManifests';
import {
  getStyleRuntimePresetDisplayName,
  STYLE_RUNTIME_PACK_SUMMARIES,
  type StyleRuntimePack,
  type StyleRuntimePreset,
} from './stylesData';
import type { ArchivedStylePresetEntry } from './archivedStylePresets';
import { resolveStyleRuntimePackLoadRequest } from './styleRuntimePackRequirements';
import {
  getStyleCollectionIdFromTabId,
  getStyleCollectionTabId,
  getStyleTabHash as getStyleTabHashForRoute,
  normalizeStyleTabId as normalizeStyleTabRouteId,
  readStyleTabIdFromHash as readStyleTabIdFromRouteHash,
  STYLE_PACKS_TAB_ID,
  STYLE_RECIPE_HASH_PREFIX,
  type StyleTabId,
  type StyleTabRouteOptions,
} from './styleTabRouting';
import {
  USER_STYLE_PACK_DESCRIPTION,
  USER_STYLE_PACK_ID,
  USER_STYLE_PACK_NAME,
  userStylePresetToRuntimePreset,
} from './userStyleRuntimeAdapter';
import { useUserStyleLibrary } from './useUserStyleLibrary';
import { useStyleComposition } from './useStyleComposition';
import { useStyleBrowserNavigation } from './useStyleBrowserNavigation';
import { projectActiveStylePack } from './styleActivePackProjection';
import { groupStyleResultImagesByPreset } from './styleResultImagesByPreset';
import {
  PACK_THEMES,
  getPackIcon,
  getStyleCollectionIcon,
  getStyleCollectionTheme,
} from './styleNavigationPresentation';
import type {
  StyleRecipeNavigationItem,
  StyleRecipeNavigationSection,
} from './StyleRecipeNavigationPanel';
import type {
  StyleCardHoverPreview,
  StylePresetSourceProvenance,
  StylePresetVisualState,
} from './StylePresetCardSurface';

const TcgComponentStudio = React.lazy(() =>
  import('./styles/TcgComponentStudio').then((module) => ({ default: module.TcgComponentStudio })),
);

export interface StylesBrowserProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
  onFileSelect: (files: File[]) => void;
  onGenerate: (
    prompt?: string,
    configOverrides?: Partial<ImageGenerationConfig>,
    options?: { preventModal?: boolean },
  ) => void;
  isGenerating: boolean;
  images?: GeneratedImageWithConfig[];
  onSelectImage?: (image: GeneratedImageWithConfig) => void;
  activeProviderId?: GenerationProviderId;
  grokCanExecute?: boolean;
  intentionalStylesV1?: boolean;
}

const FAVORITES_PACK_ID = 'favorites';
const ALL_STYLE_CATEGORIES_TAB_ID = 'all_categories';
const ALL_STYLE_CARDS_TAB_ID = 'all_cards';
const EMPTY_IMAGES: GeneratedImageWithConfig[] = [];
const DEFAULT_STYLE_PACK_ID = STYLE_RUNTIME_PACK_SUMMARIES[0]?.id ?? 'pack_01';
const STYLE_RUNTIME_PACK_IDS = STYLE_RUNTIME_PACK_SUMMARIES.map((pack) => pack.id);
const STYLE_TAB_ROUTE_OPTIONS = {
  favoritesPackId: FAVORITES_PACK_ID,
  runtimePackIds: STYLE_RUNTIME_PACK_IDS,
  specialTabIds: [ALL_STYLE_CATEGORIES_TAB_ID, ALL_STYLE_CARDS_TAB_ID],
  userStylePackId: USER_STYLE_PACK_ID,
} satisfies StyleTabRouteOptions;
const USER_STYLE_PACK_SUMMARY = {
  id: USER_STYLE_PACK_ID,
  name: USER_STYLE_PACK_NAME,
  description: USER_STYLE_PACK_DESCRIPTION,
  presetCount: 0,
};
const STYLE_BROWSER_SORT_OPTIONS = [
  { value: 'source', label: 'Source' },
  { value: 'az', label: 'Name A-Z' },
  { value: 'za', label: 'Name Z-A' },
  { value: 'created_desc', label: 'Created New' },
  { value: 'created_asc', label: 'Created Old' },
  { value: 'updated_desc', label: 'Updated New' },
  { value: 'updated_asc', label: 'Updated Old' },
] satisfies Array<{ value: StyleBrowserSortOrder; label: string }>;
const STYLE_GROUP_VIEWPORT_ROOT_MARGIN = '220px 0px';
const STYLE_HOVER_PREVIEW_EXIT_DELAY_MS = 280;
const MAX_STYLE_REFERENCE_IMAGES = 5;
const MAX_SELECTED_STYLE_SLOTS = 5;
type StyleCollectionsModule = typeof import('./styles/collections');

interface StylePanelVisibility {
  references: boolean;
  navigation: boolean;
  slots: boolean;
}

const DEFAULT_STYLE_PANEL_VISIBILITY: StylePanelVisibility = {
  references: true,
  navigation: true,
  slots: true,
};

const CompactStyleSelector = React.lazy(() =>
  import('./CompactStyleSelector').then((module) => ({
    default: module.CompactStyleSelector,
  })),
);

const StylePresetCatalogSearchSurface = React.lazy(() =>
  import('./StylePresetCatalogSearchSurface').then((module) => ({
    default: module.StylePresetCatalogSearchSurface,
  })),
);

const StyleAdvancedControlsPanel = React.lazy(() =>
  import('./StyleAdvancedControlsPanel').then((module) => ({
    default: module.StyleAdvancedControlsPanel,
  })),
);

const UserStyleEditorSurface = React.lazy(() =>
  import('./UserStyleEditorSurface').then((module) => ({
    default: module.UserStyleEditorSurface,
  })),
);

const StyleCollectionsLandingSurface = React.lazy(() =>
  import('./StyleCollectionsLandingSurface').then((module) => ({
    default: module.StyleCollectionsLandingSurface,
  })),
);

const StyleRecipeNavigationPanel = React.lazy(() =>
  import('./StyleRecipeNavigationPanel').then((module) => ({
    default: module.StyleRecipeNavigationPanel,
  })),
);

const StylePresetCard = React.lazy(() =>
  import('./StylePresetCardSurface').then((module) => ({
    default: module.StylePresetCard,
  })),
);

// Color mapping for each pack to give them distinct identities

import { useLocalStorage } from '../../hooks/useLocalStorage';

function getStyleTabHash(tabId: StyleTabId) {
  return getStyleTabHashForRoute(tabId, STYLE_TAB_ROUTE_OPTIONS);
}

function styleCatalogTabClass(active: boolean) {
  return `styles-catalog-tab${active ? ' is-active' : ''}`;
}

function compactStyleRecipeHash() {
  return `#${STYLE_RECIPE_HASH_PREFIX}`;
}

function createStylePresetVisualState({
  preset,
  presetPackId,
  presetPackName,
  images,
  archived = false,
}: {
  preset: StyleRuntimePreset;
  presetPackId: string;
  presetPackName: string;
  images: GeneratedImageWithConfig[];
  archived?: boolean;
}): StylePresetVisualState {
  const resultImages = images
    .filter((img) => hasStylePresetIdentity(img.config, preset.id))
    .sort((a, b) => b.createdAt - a.createdAt);
  const defaultImageStale = archived ? false : isStyleDefaultImageStale(preset.id);
  const defaultImage = archived
    ? `/assets/recipes/styles/defaults/${preset.id}.webp`
    : resolveStyleDefaultImageThumbnail(preset.id);
  const defaultImageVariants = archived ? [] : resolveStyleDefaultImageVariantThumbnails(preset.id);
  const categoryImage = preset.category
    ? (getStyleThumbnail(styleCategoryImageKey(presetPackId, preset.category)) ??
      getStyleCategoryImage(styleCategoryImageKey(presetPackId, preset.category)))
    : undefined;
  const previewImage =
    categoryImage || (preset.category ? STYLE_CATEGORY_PREVIEWS[preset.category] : undefined);

  return {
    presetPackName,
    resultImages,
    defaultImage,
    defaultImageVariants,
    defaultImageStale,
    previewImage,
    exampleImageSrc:
      resultImages[0]?.thumbnail ||
      resultImages[0]?.preview ||
      resultImages[0]?.src ||
      defaultImage ||
      defaultImageVariants[0]?.src ||
      previewImage ||
      null,
  };
}

interface StylePresetGroupSectionProps {
  groupKey: string;
  title: string;
  icon?: React.ReactNode;
  presets: StyleRuntimePreset[];
  gridColumns: number;
  scrollRootRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerWidth: number;
  initiallyVisible: boolean;
  headerClassName: string;
  accentClassName: string;
  titleClassName: string;
  dividerClassName: string;
  renderPresetCard: (preset: StyleRuntimePreset) => React.ReactNode;
}

function areStyleGridVirtualWindowsEqual(
  first: StyleGridVirtualWindow,
  second: StyleGridVirtualWindow,
) {
  return (
    first.startIndex === second.startIndex &&
    first.endIndex === second.endIndex &&
    first.topSpacerHeight === second.topSpacerHeight &&
    first.bottomSpacerHeight === second.bottomSpacerHeight &&
    first.totalHeight === second.totalHeight
  );
}

function StyleGridPlaceholderCells({
  gridColumns,
  presetCount,
}: {
  gridColumns: number;
  presetCount: number;
}) {
  const placeholderCount = Math.min(Math.max(0, presetCount), Math.max(gridColumns * 3, 3));

  if (placeholderCount <= 0) return null;

  return (
    <div
      data-style-grid-placeholder
      className="grid gap-2.5"
      style={{
        gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: placeholderCount }, (_, index) => (
        <div
          key={index}
          data-style-grid-placeholder-card
          className="aspect-[3/4] rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)]/32 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
        >
          <div className="h-full rounded-[var(--wb-radius)] bg-linear-to-b from-white/[0.035] via-transparent to-black/20" />
        </div>
      ))}
    </div>
  );
}

function StyleGridVirtualSpacer({
  align,
  gridColumns,
  height,
  presetCount,
}: {
  align: 'start' | 'end';
  gridColumns: number;
  height: number;
  presetCount: number;
}) {
  if (height <= 0) return null;

  return (
    <div
      aria-hidden="true"
      data-style-grid-virtual-spacer={align}
      className="relative overflow-hidden"
      style={{ height }}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 ${
          align === 'end' ? 'bottom-0' : 'top-0'
        } opacity-55`}
      >
        <StyleGridPlaceholderCells gridColumns={gridColumns} presetCount={presetCount} />
      </div>
    </div>
  );
}

type StyleFadeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fadeDuration?: number;
  fadeScale?: number;
};

function shouldReduceStyleImageMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const StyleFadeImage = React.memo(function StyleFadeImage({
  src,
  style,
  ...imageProps
}: StyleFadeImageProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isVisible, setIsVisible] = useState(() => shouldReduceStyleImageMotion());

  useLayoutEffect(() => {
    const node = imageRef.current;
    if (!node) return;
    if (shouldReduceStyleImageMotion() || node.complete) {
      setIsVisible(true);
      return;
    }
    setIsVisible(false);
  }, [src]);

  return (
    <img
      ref={imageRef}
      src={src}
      alt=""
      data-style-fade-image
      {...imageProps}
      style={{
        ...style,
        opacity: isVisible ? (style?.opacity ?? 1) : 0,
        transition: shouldReduceStyleImageMotion() ? undefined : 'opacity 180ms ease',
      }}
      onLoad={() => setIsVisible(true)}
      onError={() => setIsVisible(true)}
    />
  );
});

const StylePresetGroupSection = React.memo(
  ({
    groupKey,
    title,
    icon,
    presets,
    gridColumns,
    scrollRootRef,
    scrollContainerWidth,
    initiallyVisible,
    headerClassName,
    accentClassName,
    titleClassName,
    dividerClassName,
    renderPresetCard,
  }: StylePresetGroupSectionProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [isNearViewport, setIsNearViewport] = useState(() => initiallyVisible);
    const createInitialGridWindow = useCallback(
      () =>
        createStyleGridVirtualWindow({
          presetCount: presets.length,
          gridColumns,
          containerWidth: scrollContainerWidth,
          viewportTop: 0,
          viewportBottom: STYLE_GRID_DEFAULT_VIEWPORT_HEIGHT_PX,
        }),
      [gridColumns, presets.length, scrollContainerWidth],
    );
    const [gridWindow, setGridWindow] = useState(createInitialGridWindow);
    const placeholderHeight = estimateStyleGroupPlaceholderHeight({
      renderedPresetCount: presets.length,
      gridColumns,
      containerWidth: scrollContainerWidth,
      hasShowMore: false,
    });
    const visiblePresets = useMemo(
      () => presets.slice(gridWindow.startIndex, gridWindow.endIndex),
      [gridWindow.endIndex, gridWindow.startIndex, presets],
    );

    useLayoutEffect(() => {
      if (initiallyVisible || isNearViewport) return;
      const node = sectionRef.current;
      const root = scrollRootRef.current;
      if (!node) return;
      const rootRect = root?.getBoundingClientRect() ?? {
        top: 0,
        bottom: typeof window === 'undefined' ? 0 : window.innerHeight,
      };
      const rect = node.getBoundingClientRect();
      if (rect.bottom >= rootRect.top - 220 && rect.top <= rootRect.bottom + 220) {
        setIsNearViewport(true);
      }
    }, [initiallyVisible, isNearViewport, scrollRootRef]);

    useEffect(() => {
      if (initiallyVisible) {
        setIsNearViewport(true);
        return;
      }

      const node = sectionRef.current;
      const root = scrollRootRef.current;
      if (!node || typeof IntersectionObserver === 'undefined') {
        setIsNearViewport(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsNearViewport(Boolean(entry?.isIntersecting));
        },
        {
          root,
          rootMargin: STYLE_GROUP_VIEWPORT_ROOT_MARGIN,
        },
      );

      observer.observe(node);
      return () => observer.disconnect();
    }, [initiallyVisible, scrollRootRef]);

    useEffect(() => {
      if (!isNearViewport) return;

      const root = scrollRootRef.current;
      const grid = gridRef.current;
      if (!root || !grid) {
        setGridWindow(createInitialGridWindow());
        return;
      }

      let animationFrame = 0;
      const updateGridWindow = () => {
        animationFrame = 0;
        const rootRect = root.getBoundingClientRect();
        const gridRect = grid.getBoundingClientRect();
        const nextWindow = createStyleGridVirtualWindow({
          presetCount: presets.length,
          gridColumns,
          containerWidth: scrollContainerWidth,
          viewportTop: rootRect.top - gridRect.top,
          viewportBottom: rootRect.bottom - gridRect.top,
        });

        setGridWindow((currentWindow) =>
          areStyleGridVirtualWindowsEqual(currentWindow, nextWindow) ? currentWindow : nextWindow,
        );
      };
      const scheduleGridWindowUpdate = () => {
        if (animationFrame !== 0) return;
        animationFrame = window.requestAnimationFrame(updateGridWindow);
      };

      updateGridWindow();
      root.addEventListener('scroll', scheduleGridWindowUpdate, { passive: true });
      window.addEventListener('resize', scheduleGridWindowUpdate);

      return () => {
        root.removeEventListener('scroll', scheduleGridWindowUpdate);
        window.removeEventListener('resize', scheduleGridWindowUpdate);
        if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
      };
    }, [
      createInitialGridWindow,
      gridColumns,
      isNearViewport,
      presets.length,
      scrollContainerWidth,
      scrollRootRef,
    ]);

    return (
      <div
        ref={sectionRef}
        data-style-group={groupKey}
        data-style-group-state={isNearViewport ? 'eager' : 'placeholder'}
        data-style-group-planned-cards={presets.length}
        data-style-group-mounted-cards={isNearViewport ? gridWindow.renderedPresetCount : 0}
        data-style-group-hidden-cards={0}
        className="relative"
        style={isNearViewport ? undefined : { minHeight: placeholderHeight }}
      >
        <div
          className={`sticky top-0 z-30 mb-2 flex items-center gap-2 border-y border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] px-2 py-2 shadow-[0_10px_18px_rgba(0,0,0,0.28)] ${headerClassName}`}
        >
          <div className={`h-4 w-1 rounded-[var(--wb-radius)] ${accentClassName}`} />
          {icon ? <span className="text-[color:var(--wb-muted)]">{icon}</span> : null}
          <h3
            className={`text-[length:var(--wbp-label)] font-semibold tracking-normal ${titleClassName}`}
          >
            {title}
          </h3>
          <div className={`h-px flex-1 ${dividerClassName}`} />
        </div>

        {isNearViewport ? (
          <>
            <div
              ref={gridRef}
              data-style-group-grid={groupKey}
              data-style-grid-window={`${gridWindow.startIndex}:${gridWindow.endIndex}`}
              data-style-grid-total-cards={presets.length}
              data-style-grid-mounted-cards={gridWindow.renderedPresetCount}
            >
              <StyleGridVirtualSpacer
                align="end"
                gridColumns={gridColumns}
                height={gridWindow.topSpacerHeight}
                presetCount={presets.length}
              />
              <div
                className="grid gap-2.5"
                style={{
                  gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                }}
              >
                {visiblePresets.map(renderPresetCard)}
              </div>
              <StyleGridVirtualSpacer
                align="start"
                gridColumns={gridColumns}
                height={gridWindow.bottomSpacerHeight}
                presetCount={presets.length}
              />
            </div>
          </>
        ) : (
          <div
            aria-hidden="true"
            data-style-group-placeholder
            className="relative overflow-hidden rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)]/20 p-2"
            style={{ height: Math.max(120, placeholderHeight - 40) }}
          >
            <StyleGridPlaceholderCells gridColumns={gridColumns} presetCount={presets.length} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-zinc-950/90 to-transparent" />
          </div>
        )}
      </div>
    );
  },
);

function getStylePackSummary(packId: string) {
  if (packId === USER_STYLE_PACK_ID) return USER_STYLE_PACK_SUMMARY;
  return STYLE_RUNTIME_PACK_SUMMARIES.find((pack) => pack.id === packId) ?? null;
}

// react-doctor-disable-next-line react-doctor/no-giant-component
export const StylesBrowser: React.FC<StylesBrowserProps> = ({
  config,
  updateConfig,
  onFileSelect,
  onGenerate,
  isGenerating,
  images = EMPTY_IMAGES,
  activeProviderId = 'codex',
  grokCanExecute = false,
  intentionalStylesV1 = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tcgCatalogView, setTcgCatalogView] = useState<'visual' | 'components'>('visual');
  const generateTcgRecipeArt = (artPrompt: string) => {
    onGenerate(
      artPrompt,
      {
        recipeId: null,
        recipeParams: null,
        recipeContext: '',
        attachments: [],
        aspectRatio: '3:4',
        batchCount: 1,
      },
      { preventModal: true },
    );
  };
  const referenceImages = config.attachments.slice(0, MAX_STYLE_REFERENCE_IMAGES);
  const referenceSlotsRemaining = Math.max(0, MAX_STYLE_REFERENCE_IMAGES - referenceImages.length);
  const grokGenerateBlock = resolveGrokImagineGenerateBlock({
    providerId: activeProviderId,
    recipeId: 'styles',
    aspectRatio: config.aspectRatio,
    attachments: referenceImages,
    canExecute: grokCanExecute,
  });

  const composition = useStyleComposition({
    config,
    updateConfig,
    onGenerate,
    referenceImages,
    generationBlocked: Boolean(grokGenerateBlock),
    maxSlots: MAX_SELECTED_STYLE_SLOTS,
    intentionalStylesV1,
  });
  const {
    selectedStyles,
    selectedStyleIds,
    selectedStyleLayers,
    activeSelectedStyleCount,
    toggleStyle,
    updateSelectedStyleStrength,
    toggleSelectedStyleEnabled,
    toggleSelectedStyleField,
    updateSelectedStyleFieldWeight,
    setSelectedStyleAvoidRulesMode,
    removeSelectedStyle,
    moveSelectedStyle,
    handleGenerateSelectedStyles,
    compileIssues,
    intentionalMode,
    setIntentionalMode,
  } = composition;
  const [styleCollectionsModule, setStyleCollectionsModule] =
    useState<StyleCollectionsModule | null>(null);
  const [styleCollectionsLoadError, setStyleCollectionsLoadError] = useState<string | null>(null);
  const [interactionState, setInteractionState] = useState({
    activePresetId: null as string | null,
    copiedStyleId: null as string | null,
    hoveredPresetPreview: null as StyleCardHoverPreview | null,
  });
  const { copiedStyleId } = interactionState;
  const timeoutRef = useRef<number | null>(null);
  const hoverPreviewClearTimeoutRef = useRef<number | null>(null);

  const clearPendingHoverPreview = useCallback(() => {
    if (hoverPreviewClearTimeoutRef.current === null) return;
    window.clearTimeout(hoverPreviewClearTimeoutRef.current);
    hoverPreviewClearTimeoutRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      if (hoverPreviewClearTimeoutRef.current !== null) {
        window.clearTimeout(hoverPreviewClearTimeoutRef.current);
      }
    };
  }, []);

  // -- FILTERS & STATE --
  const { activeWorkspaceId } = useWorkspaceState();
  const navigation = useStyleBrowserNavigation({
    scopeKey: activeWorkspaceId,
    routeOptions: STYLE_TAB_ROUTE_OPTIONS,
    defaultPackId: DEFAULT_STYLE_PACK_ID,
    allCategoriesTabId: ALL_STYLE_CATEGORIES_TAB_ID,
    allCardsTabId: ALL_STYLE_CARDS_TAB_ID,
  });
  const {
    currentPackId,
    isPackLandingOpen,
    searchQuery,
    sortOrder,
    showFavoritesOnly,
    isCatalogSearchOpen,
    isAllStyleCategoriesTab,
    isAllStyleCardsTab,
    isGlobalStyleBrowseTab,
    activeStyleViewMode,
    favorites,
    applyStyleTab,
    navigateToStyleTab,
    writeStyleTabHash,
    toggleFavorite,
    updateFilters,
    setCatalogOpen,
    toggleFavoritesOnly,
  } = navigation;
  const [styleScrollWidth, setStyleScrollWidth] = useState(0);
  const normalizedStyleSearchQuery = searchQuery.trim();
  const isGlobalStyleSearchActive = normalizedStyleSearchQuery.length > 0;
  const activeSortOption =
    STYLE_BROWSER_SORT_OPTIONS.find((option) => option.value === sortOrder) ??
    STYLE_BROWSER_SORT_OPTIONS[0];
  const [gridColumnPref, setGridColumnPref] = useLocalStorage<number | 'auto'>(
    'styles-grid-columns-v2',
    'auto',
  );
  const [catalogExpanded, setCatalogExpanded] = useState(false);
  const [explorerColumnPref, setExplorerColumnPref] = useLocalStorage<number | 'auto'>(
    'styles-explorer-columns-v1',
    'auto',
  );
  const fitColumns = fitStyleGridColumns(styleScrollWidth, catalogExpanded ? 240 : undefined);
  const gridColumns = resolveStyleGridColumns(
    catalogExpanded ? explorerColumnPref : gridColumnPref,
    fitColumns,
  );
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isManageStylesOpen, setIsManageStylesOpen] = useState(false);
  const manageStylesButtonRef = useRef<HTMLButtonElement>(null);
  const [stylePanelVisibility, setStylePanelVisibility] = useLocalStorage<
    Partial<StylePanelVisibility>
  >('styles-panel-visibility', DEFAULT_STYLE_PANEL_VISIBILITY);
  const [explorerOpen, setExplorerOpen] = useState(
    () => readStyleTabIdFromRouteHash(window.location.hash, STYLE_TAB_ROUTE_OPTIONS) !== null,
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const advancedPanelRef = useRef<HTMLDivElement>(null);
  const catalogRootRef = useRef<HTMLDivElement>(null);
  const closeStyleCatalog = useCallback(() => {
    setCatalogExpanded(false);
    setExplorerOpen(false);
    const compactHash = compactStyleRecipeHash();
    if (window.location.hash !== compactHash) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}${compactHash}`,
      );
    }
    window.setTimeout(() => {
      const focusTarget =
        document.querySelector<HTMLElement>('#style-advanced-panel button') ??
        document.querySelector<HTMLElement>('[data-open-style-catalog]');
      focusTarget?.focus();
    }, 0);
  }, []);
  const openStyleCatalog = useCallback(() => {
    setExplorerOpen(true);
    writeStyleTabHash(isPackLandingOpen ? STYLE_PACKS_TAB_ID : currentPackId);
  }, [currentPackId, isPackLandingOpen, writeStyleTabHash]);
  const isStyleNavigationPanelOpen = Boolean(
    stylePanelVisibility.navigation ?? DEFAULT_STYLE_PANEL_VISIBILITY.navigation,
  );
  const toggleStylePanel = useCallback(
    (panel: keyof StylePanelVisibility) => {
      setStylePanelVisibility((current) => {
        const normalized = { ...DEFAULT_STYLE_PANEL_VISIBILITY, ...current };
        return {
          ...normalized,
          [panel]: !normalized[panel],
        };
      });
    },
    [setStylePanelVisibility],
  );
  const styleScrollRootRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const sortMenuId = React.useId();

  const userStyles = useUserStyleLibrary({
    onReconciled: (style, archived) => {
      if (archived) {
        removeSelectedStyle(style.id);
        setInteractionState((prev) => ({
          ...prev,
          activePresetId: prev.activePresetId === style.id ? null : prev.activePresetId,
        }));
      } else composition.replacePreset(userStylePresetToRuntimePreset(style));
    },
    onSaved: (style) => {
      setInteractionState((prev) => ({ ...prev, activePresetId: style.id }));
      navigateToStyleTab(USER_STYLE_PACK_ID);
    },
    onArchived: () => {
      navigateToStyleTab(USER_STYLE_PACK_ID);
    },
  });
  const {
    presets: userStylePresets,
    loading: isLoadingUserStyles,
    error: userStyleError,
    session: userStyleEditorSession,
    runtimePack: userStylePack,
    byId: userStylePresetById,
    refresh: refreshUserStyles,
  } = userStyles;
  const userSearchIndex = useMemo(
    () =>
      userStylePack.presets.length > 0
        ? createStylePresetCatalogSearchIndexFromRuntimePacks([userStylePack], {
            resolveDefaultImage: resolveStyleDefaultImageThumbnail,
          })
        : null,
    [userStylePack],
  );

  useEffect(() => {
    const syncExplorerFromHash = () => {
      const tab = readStyleTabIdFromRouteHash(window.location.hash, STYLE_TAB_ROUTE_OPTIONS);
      setExplorerOpen(tab !== null);
      if (tab === null) setCatalogExpanded(false);
    };
    syncExplorerFromHash();
    window.addEventListener('hashchange', syncExplorerFromHash);
    return () => window.removeEventListener('hashchange', syncExplorerFromHash);
  }, []);

  useEffect(() => {
    if (!advancedOpen) return;
    const root = advancedPanelRef.current;
    root
      ?.querySelector<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')
      ?.focus({
        preventScroll: true,
      });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      setAdvancedOpen(false);
      document.querySelector<HTMLElement>('[data-style-advanced-toggle]')?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [advancedOpen]);

  useEffect(() => {
    if (!explorerOpen) return;
    catalogRootRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (userStyleEditorSession) return;
      event.preventDefault();
      closeStyleCatalog();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [closeStyleCatalog, explorerOpen, userStyleEditorSession]);

  useEffect(() => {
    if (styleCollectionsModule) return;

    let cancelled = false;
    setStyleCollectionsLoadError(null);
    void import('./styles/collections')
      .then((module) => {
        if (!cancelled) setStyleCollectionsModule(module);
      })
      .catch(() => {
        if (!cancelled) setStyleCollectionsLoadError('Could not load style collections.');
      });
    return () => {
      cancelled = true;
    };
  }, [styleCollectionsModule]);

  const activeStyleCollectionId = getStyleCollectionIdFromTabId(currentPackId);
  const activeStyleCollection = useMemo(() => {
    if (!activeStyleCollectionId || !styleCollectionsModule) return null;
    return (
      styleCollectionsModule.STYLE_COLLECTIONS.find(
        (collection) => collection.id === activeStyleCollectionId && collection.entries.length > 0,
      ) ?? null
    );
  }, [activeStyleCollectionId, styleCollectionsModule]);

  const styleRuntimePackLoadRequest = useMemo(
    () =>
      resolveStyleRuntimePackLoadRequest({
        isPackLandingOpen,
        currentPackId,
        activeStyleCollectionId,
        activeCollectionSourcePackIds: activeStyleCollection?.sourcePackIds ?? [],
        isGlobalStyleBrowseTab,
        favoritesCount: favorites.length,
        isGlobalStyleSearchActive,
        runtimePackIds: STYLE_RUNTIME_PACK_IDS,
        favoritesPackId: FAVORITES_PACK_ID,
      }),
    [
      activeStyleCollection,
      activeStyleCollectionId,
      currentPackId,
      favorites.length,
      isGlobalStyleBrowseTab,
      isGlobalStyleSearchActive,
      isPackLandingOpen,
    ],
  );
  const {
    loadedStylePacksById,
    loadStyleRuntimePacks,
    isLoadingStylePacks,
    styleRuntimeError,
    retryStylePacks,
  } = useStyleRuntimePacks({
    requiredPackIds:
      explorerOpen && !styleRuntimePackLoadRequest.loadAll
        ? styleRuntimePackLoadRequest.requiredPackIds
        : [],
    loadAll: false,
  });

  const prefetchStyleTab = useCallback(
    (tabId: StyleTabId) => {
      const normalizedTabId = normalizeStyleTabRouteId(tabId, STYLE_TAB_ROUTE_OPTIONS);
      if (normalizedTabId === STYLE_PACKS_TAB_ID) return;
      if (
        normalizedTabId === ALL_STYLE_CATEGORIES_TAB_ID ||
        normalizedTabId === ALL_STYLE_CARDS_TAB_ID
      ) {
        void loadStyleRuntimePacks(STYLE_RUNTIME_PACK_IDS.slice(0, 3));
        return;
      }
      const collectionId = getStyleCollectionIdFromTabId(normalizedTabId);
      if (collectionId) {
        const collection = styleCollectionsModule?.STYLE_COLLECTIONS.find(
          (item) => item.id === collectionId,
        );
        const packIds = (collection?.sourcePackIds ?? []).filter((packId) =>
          STYLE_RUNTIME_PACK_IDS.includes(packId),
        );
        if (packIds.length > 0) void loadStyleRuntimePacks(packIds);
        return;
      }
      if (STYLE_RUNTIME_PACK_IDS.includes(normalizedTabId)) {
        void loadStyleRuntimePacks([normalizedTabId]);
      }
    },
    [loadStyleRuntimePacks, styleCollectionsModule],
  );

  useEffect(() => {
    if (!isSortDropdownOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!sortDropdownRef.current?.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSortDropdownOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSortDropdownOpen]);

  // react-doctor-disable-next-line react-doctor/no-initialize-state
  useEffect(() => {
    const node = styleScrollRootRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const updateWidth = () => setStyleScrollWidth(node.clientWidth);
    // react-doctor-disable-next-line react-doctor/no-initialize-state
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, [currentPackId, isPackLandingOpen, explorerOpen]);

  const recipePresetId =
    config.recipeId === 'styles' &&
    config.recipeParams &&
    typeof config.recipeParams.presetId === 'string'
      ? config.recipeParams.presetId
      : null;
  useEffect(() => {
    if (!recipePresetId) return;
    setInteractionState((prev) => ({ ...prev, activePresetId: recipePresetId }));
  }, [recipePresetId]);

  const loadedRuntimeStylePacks = useMemo(
    () =>
      STYLE_RUNTIME_PACK_IDS.flatMap((packId) => {
        const pack = loadedStylePacksById[packId];
        return pack ? [pack] : [];
      }),
    [loadedStylePacksById],
  );
  const globalStylePacks = useMemo(
    () => [userStylePack, ...loadedRuntimeStylePacks],
    [loadedRuntimeStylePacks, userStylePack],
  );
  const allRuntimeStylePacksLoaded = STYLE_RUNTIME_PACK_IDS.every((packId) =>
    Boolean(loadedStylePacksById[packId]),
  );
  const globalStylePresetCount = STYLE_RUNTIME_PACK_SUMMARIES.reduce(
    (total, pack) => total + pack.presetCount,
    userStylePack.presets.length,
  );
  const globalStyleCategoryCount = useMemo(() => {
    const keys = new Set<string>();
    for (const pack of globalStylePacks) {
      for (const preset of pack.presets) {
        keys.add(`${pack.id}:${preset.category || 'General'}`);
      }
    }
    return keys.size;
  }, [globalStylePacks]);
  const activePack = useMemo(
    () =>
      projectActiveStylePack({
        currentPackId,
        isGlobalStyleBrowseTab,
        isAllStyleCardsTab,
        activeStyleCollectionId,
        activeStyleCollection,
        collectionProjection: styleCollectionsModule,
        collectionLoadError: styleCollectionsLoadError,
        allRuntimeStylePacksLoaded,
        globalStylePresetCount,
        globalStyleCategoryCount,
        globalStylePacks,
        userStylePack,
        loadedStylePacksById,
        runtimePackIds: STYLE_RUNTIME_PACK_IDS,
        summaries: STYLE_RUNTIME_PACK_SUMMARIES,
        favoritesPackId: FAVORITES_PACK_ID,
      }),
    [
      activeStyleCollection,
      activeStyleCollectionId,
      allRuntimeStylePacksLoaded,
      currentPackId,
      globalStyleCategoryCount,
      globalStylePacks,
      globalStylePresetCount,
      isAllStyleCardsTab,
      isGlobalStyleBrowseTab,
      loadedStylePacksById,
      styleCollectionsLoadError,
      styleCollectionsModule,
      userStylePack,
    ],
  );

  const activeStyleCollectionSourceByPresetId = useMemo(() => {
    const sourceByPresetId = new Map<string, StylePresetSourceProvenance>();
    if (!activeStyleCollection || !styleCollectionsModule) return sourceByPresetId;

    const sourcePacks = activeStyleCollection.sourcePackIds.flatMap((packId) => {
      if (packId === USER_STYLE_PACK_ID) return [userStylePack];
      const pack = loadedStylePacksById[packId];
      return pack ? [pack] : [];
    });
    const missingSourcePack = activeStyleCollection.sourcePackIds.some(
      (packId) => STYLE_RUNTIME_PACK_IDS.includes(packId) && !loadedStylePacksById[packId],
    );
    if (missingSourcePack) return sourceByPresetId;

    const packNameById = new Map(sourcePacks.map((pack) => [pack.id, pack.name]));
    const resolved = styleCollectionsModule.resolveStyleCollection(
      activeStyleCollection,
      styleCollectionsModule.createStyleCollectionSourceIndex(sourcePacks),
    );
    for (const item of resolved.presets) {
      sourceByPresetId.set(item.presetId, {
        sourcePackId: item.sourcePackId,
        sourcePackName: packNameById.get(item.sourcePackId) ?? item.sourcePackId,
        sourceCategory: item.sourceCategory,
        collectionRole: item.collectionRole,
      });
    }

    return sourceByPresetId;
  }, [activeStyleCollection, loadedStylePacksById, styleCollectionsModule, userStylePack]);

  const globalStyleSourceByPresetId = useMemo(() => {
    const sourceByPresetId = new Map<string, StylePresetSourceProvenance>();
    if (!isGlobalStyleBrowseTab) return sourceByPresetId;

    for (const pack of globalStylePacks) {
      for (const preset of pack.presets) {
        sourceByPresetId.set(preset.id, {
          sourcePackId: pack.id,
          sourcePackName: pack.name,
          sourceCategory: preset.category ?? 'General',
          collectionRole: 'primary',
        });
      }
    }

    return sourceByPresetId;
  }, [globalStylePacks, isGlobalStyleBrowseTab]);

  const styleSourceByPresetId = isGlobalStyleBrowseTab
    ? globalStyleSourceByPresetId
    : activeStyleCollectionSourceByPresetId;

  const activeTheme = activeStyleCollection
    ? getStyleCollectionTheme(activeStyleCollection)
    : isAllStyleCardsTab
      ? PACK_THEMES.pack_06
      : isAllStyleCategoriesTab
        ? PACK_THEMES.pack_10
        : PACK_THEMES[currentPackId] || PACK_THEMES['pack_01'];
  const orderedLoadedStylePacks = useMemo(() => globalStylePacks, [globalStylePacks]);
  const searchableStylePresets = useMemo(
    () => orderedLoadedStylePacks.flatMap((pack) => pack.presets),
    [orderedLoadedStylePacks],
  );
  const presetPackIdById = useMemo(() => {
    const packIdByPresetId = new Map<string, string>();
    for (const pack of orderedLoadedStylePacks) {
      for (const preset of pack.presets) packIdByPresetId.set(preset.id, pack.id);
    }
    return packIdByPresetId;
  }, [orderedLoadedStylePacks]);

  const retiredFavoriteIds = useMemo(() => {
    if (currentPackId !== FAVORITES_PACK_ID || normalizedStyleSearchQuery) return [];
    return favorites.filter(
      (presetId) => !presetPackIdById.has(presetId) && /^SP(?:14|15)-\d{3}$/.test(presetId),
    );
  }, [currentPackId, favorites, normalizedStyleSearchQuery, presetPackIdById]);
  const [archivedFavoriteEntries, setArchivedFavoriteEntries] = useState<
    ArchivedStylePresetEntry[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    if (retiredFavoriteIds.length === 0) {
      setArchivedFavoriteEntries([]);
      return;
    }

    void import('./archivedStylePresets')
      .then(({ loadArchivedStylePresetsByIds }) =>
        loadArchivedStylePresetsByIds(retiredFavoriteIds),
      )
      .then((entries) => {
        if (!cancelled) setArchivedFavoriteEntries(entries);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        runtimeLogger.error('Could not load archived style favorites.', error);
        setArchivedFavoriteEntries([]);
      });

    return () => {
      cancelled = true;
    };
  }, [retiredFavoriteIds]);

  const archivedFavoriteById = useMemo(
    () => new Map(archivedFavoriteEntries.map((entry) => [entry.preset.id, entry])),
    [archivedFavoriteEntries],
  );
  const unsearchedFavoritesRoute =
    currentPackId === FAVORITES_PACK_ID && normalizedStyleSearchQuery.length === 0;
  const archivedFavoritePresets = useMemo(() => {
    if (!unsearchedFavoritesRoute) return [];
    const favoriteIds = new Set(favorites);
    return archivedFavoriteEntries
      .filter((entry) => favoriteIds.has(entry.preset.id))
      .map((entry) => entry.preset);
  }, [archivedFavoriteEntries, favorites, unsearchedFavoritesRoute]);
  const onlyArchivedFavoritesSelected =
    unsearchedFavoritesRoute &&
    favorites.length > 0 &&
    favorites.every((presetId) => archivedFavoriteById.has(presetId));

  const favoritePresets = useMemo(() => {
    const presetById = new Map<string, StyleRuntimePreset>();
    for (const pack of orderedLoadedStylePacks) {
      for (const preset of pack.presets) presetById.set(preset.id, preset);
    }
    return favorites.flatMap((presetId) => {
      const preset =
        presetById.get(presetId) ??
        (currentPackId === FAVORITES_PACK_ID
          ? archivedFavoriteById.get(presetId)?.preset
          : undefined);
      return preset ? [preset] : [];
    });
  }, [archivedFavoriteById, currentPackId, favorites, orderedLoadedStylePacks]);

  const getPackIdForPreset = React.useCallback(
    (preset: StyleRuntimePreset) => {
      return (
        presetPackIdById.get(preset.id) ??
        archivedFavoriteById.get(preset.id)?.packId ??
        (currentPackId !== FAVORITES_PACK_ID ? currentPackId : activePack.id)
      );
    },
    [activePack.id, archivedFavoriteById, currentPackId, presetPackIdById],
  );

  const getPackNameForId = useCallback(
    (packId: string) =>
      packId === USER_STYLE_PACK_ID
        ? USER_STYLE_PACK_NAME
        : (loadedStylePacksById[packId]?.name ?? getStylePackSummary(packId)?.name ?? 'Styles'),
    [loadedStylePacksById],
  );
  const getGlobalStyleCategoryKeyForPreset = useCallback(
    (preset: StyleRuntimePreset) => {
      const presetPackId = getPackIdForPreset(preset);
      return `${getPackNameForId(presetPackId)} / ${preset.category || 'General'}`;
    },
    [getPackIdForPreset, getPackNameForId],
  );

  const filterKey = `${currentPackId}|${searchQuery}|${sortOrder}|${activeStyleViewMode}|${showFavoritesOnly}`;
  useEffect(() => {
    setInteractionState((prev) => ({ ...prev, hoveredPresetPreview: null }));
  }, [filterKey]);

  const fullProcessedData = useMemo(
    () =>
      createStyleBrowserProcessedData({
        activePack,
        currentPackId,
        favoritesPackId: FAVORITES_PACK_ID,
        favoritePresets,
        searchPresets:
          isGlobalStyleSearchActive && !activeStyleCollectionId
            ? searchableStylePresets
            : undefined,
        favoriteIds: favorites,
        categoryLabelForPreset: (preset) =>
          getStyleCategoryDisplayName(getPackIdForPreset(preset), preset.category || 'General'),
        categoryKeyForPreset: isAllStyleCategoriesTab
          ? getGlobalStyleCategoryKeyForPreset
          : undefined,
        pinFavorites: !isGlobalStyleBrowseTab,
        searchQuery,
        sortOrder,
        showFavoritesOnly,
        viewMode: activeStyleViewMode,
      }),
    [
      activePack,
      activeStyleViewMode,
      activeStyleCollectionId,
      currentPackId,
      favoritePresets,
      getGlobalStyleCategoryKeyForPreset,
      getPackIdForPreset,
      isGlobalStyleSearchActive,
      isGlobalStyleBrowseTab,
      isAllStyleCategoriesTab,
      searchQuery,
      searchableStylePresets,
      sortOrder,
      favorites,
      showFavoritesOnly,
    ],
  );

  const processedData = fullProcessedData;

  const styleRenderPlan = useMemo(
    () =>
      createStyleBrowserRenderPlan({
        groupOrder: isAllStyleCategoriesTab && sortOrder === 'source' ? 'source' : 'natural',
        processedData,
        viewMode: activeStyleViewMode,
      }),
    [activeStyleViewMode, isAllStyleCategoriesTab, processedData, sortOrder],
  );
  const { visibleStyleGroupEntries } = styleRenderPlan;
  const styleCategoryEagerBudget = Math.max(
    0,
    STYLE_BROWSER_EAGER_SECTION_LIMIT - (processedData.favorites.length > 0 ? 1 : 0),
  );

  const filteredStylePresets = useMemo(() => {
    const presetById = new Map<string, StyleRuntimePreset>();
    for (const preset of processedData.flatPresets) presetById.set(preset.id, preset);
    return [...presetById.values()];
  }, [processedData]);

  const resultImagesByPresetId = useMemo(() => groupStyleResultImagesByPreset(images), [images]);

  const getPresetVisualState = useCallback(
    (preset: StyleRuntimePreset) => {
      const presetPackId = getPackIdForPreset(preset);
      const archivedEntry = archivedFavoriteById.get(preset.id);
      const presetPack =
        presetPackId === USER_STYLE_PACK_ID
          ? userStylePack
          : (loadedStylePacksById[presetPackId] ?? activePack);
      return createStylePresetVisualState({
        preset,
        presetPackId,
        presetPackName: archivedEntry ? `Archived · ${archivedEntry.packName}` : presetPack.name,
        images: resultImagesByPresetId.get(preset.id) ?? EMPTY_IMAGES,
        archived: Boolean(archivedEntry),
      });
    },
    [
      activePack,
      archivedFavoriteById,
      getPackIdForPreset,
      loadedStylePacksById,
      resultImagesByPresetId,
      userStylePack,
    ],
  );

  const eagerPresetVisualStateById = useMemo(() => {
    const stateMap = new Map<string, StylePresetVisualState>();
    const addPresets = (presets: StyleRuntimePreset[]) => {
      for (const preset of presets) {
        if (!stateMap.has(preset.id)) stateMap.set(preset.id, getPresetVisualState(preset));
      }
    };
    if (processedData.favorites.length > 0) addPresets(processedData.favorites);
    for (const [, presets] of styleRenderPlan.visibleStyleGroupEntries.slice(
      0,
      styleCategoryEagerBudget,
    )) {
      addPresets(presets);
    }
    return stateMap;
  }, [
    getPresetVisualState,
    processedData.favorites,
    styleCategoryEagerBudget,
    styleRenderPlan.visibleStyleGroupEntries,
  ]);

  const stylePreviewPreloadSources = useMemo(
    () =>
      collectStylePresetPreviewSources({
        processedData,
        renderPlan: styleRenderPlan,
        visualStateByPresetId: eagerPresetVisualStateById,
        gridColumns,
        containerWidth: styleScrollWidth,
      }),
    [eagerPresetVisualStateById, gridColumns, processedData, styleRenderPlan, styleScrollWidth],
  );

  useEffect(() => {
    stylePreviewPreloadSources.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, [stylePreviewPreloadSources]);

  const handleSelectStyle = useCallback(
    (
      preset: StyleRuntimePreset,
      presetPackIdOverride?: string,
      presetPackNameOverride?: string,
    ) => {
      const packId = presetPackIdOverride ?? getPackIdForPreset(preset);
      setInteractionState((prev) => ({ ...prev, activePresetId: preset.id }));
      toggleStyle(preset, packId, presetPackNameOverride ?? getPackNameForId(packId));
    },
    [getPackIdForPreset, getPackNameForId, toggleStyle],
  );

  const handleApplyStyleRef = useLatestRef(handleSelectStyle);

  const activePreset = useMemo(
    () =>
      searchableStylePresets.find((preset) => preset.id === interactionState.activePresetId) ??
      null,
    [interactionState.activePresetId, searchableStylePresets],
  );
  const activePresetPackId = activePreset ? getPackIdForPreset(activePreset) : null;
  const activeUserStyle = interactionState.activePresetId
    ? (userStylePresetById.get(interactionState.activePresetId) ?? null)
    : null;
  const canSaveStyleBlend = activeSelectedStyleCount > 0;
  const canCloneActiveStyle = Boolean(activePreset && activePresetPackId !== USER_STYLE_PACK_ID);
  const canEditActiveUserStyle = Boolean(activeUserStyle);

  const handleCreateUserStyle = () => {
    void userStyles.open({ kind: 'create' });
  };
  const handleSaveSelectedStyleBlend = () => {
    if (canSaveStyleBlend)
      void userStyles.open({ kind: 'blend', slots: selectedStyles, layers: selectedStyleLayers });
  };
  const handleCloneActiveStyle = () => {
    if (activePreset && activePresetPackId && canCloneActiveStyle)
      void userStyles.open({
        kind: 'clone',
        preset: activePreset,
        packId: activePresetPackId,
        packName: getPackNameForId(activePresetPackId),
      });
  };
  const handleEditActiveUserStyle = () => {
    if (activeUserStyle) void userStyles.open({ kind: 'edit', styleId: activeUserStyle.id });
  };
  const handleCloseCatalogSearch = useCallback(() => setCatalogOpen(false), [setCatalogOpen]);

  const handleSelectCatalogPreset = useCallback(
    (result: StylePresetCatalogSearchResult) => {
      applyStyleTab(result.packId, {
        browserStatePatch: {
          searchQuery: result.name,
        },
      });
      writeStyleTabHash(result.packId);
      setInteractionState((prev) => ({ ...prev, activePresetId: result.id }));
      setCatalogOpen(false);
    },
    [applyStyleTab, setCatalogOpen, writeStyleTabHash],
  );

  const handleChooseCompactStyle = useCallback(
    async (result: StylePresetCatalogSearchResult) => {
      if (selectedStyleIds.has(result.id)) {
        removeSelectedStyle(result.id);
        return;
      }
      if (selectedStyles.length >= MAX_SELECTED_STYLE_SLOTS) return;
      if (result.packId === USER_STYLE_PACK_ID) {
        const preset = userStylePack.presets.find((candidate) => candidate.id === result.id);
        if (preset) handleApplyStyleRef.current(preset, result.packId);
        return;
      }
      let loadedPack = loadedStylePacksById[result.packId];
      if (!loadedPack) {
        try {
          [loadedPack] = await loadStyleRuntimePacks([result.packId]);
        } catch {
          return;
        }
      }
      const preset = loadedPack?.presets.find((candidate) => candidate.id === result.id);
      if (preset) handleApplyStyleRef.current(preset, result.packId);
    },
    [
      handleApplyStyleRef,
      loadStyleRuntimePacks,
      loadedStylePacksById,
      removeSelectedStyle,
      selectedStyleIds,
      selectedStyles.length,
      userStylePack.presets,
    ],
  );

  const [previousPrompt, setPreviousPrompt] = useState<string | null>(null);
  const [promptNotice, setPromptNotice] = useState('');
  const handleUseStylePrompt = useCallback(
    (preset: StyleRuntimePreset) => {
      setPreviousPrompt(config.prompt ?? '');
      updateConfig('prompt', buildStylePromptText(preset));
      setPromptNotice('Style added as prompt.');
      if (catalogExpanded) closeStyleCatalog();
    },
    [catalogExpanded, closeStyleCatalog, config.prompt, updateConfig],
  );
  const handleCatalogPrompt = async (
    result: StylePresetCatalogSearchResult,
    action: 'copy' | 'use',
  ) => {
    try {
      const pack =
        result.packId === USER_STYLE_PACK_ID
          ? userStylePack
          : (loadedStylePacksById[result.packId] ??
            (await loadStyleRuntimePacks([result.packId]))[0]);
      const preset = pack?.presets.find((candidate) => candidate.id === result.id);
      if (!preset) throw new Error('Style unavailable');
      if (action === 'use') handleUseStylePrompt(preset);
      else {
        await navigator.clipboard.writeText(buildStylePromptText(preset));
        setPromptNotice('Prompt copied.');
      }
    } catch {
      setPromptNotice('Could not load or copy this style. Please try again.');
    }
  };

  const handleCopyStylePrompt = useCallback(
    async (e: React.MouseEvent, preset: StyleRuntimePreset) => {
      e.stopPropagation();
      const promptText = buildStylePromptText(preset);
      try {
        await navigator.clipboard.writeText(promptText);
      } catch {
        setPromptNotice('Could not copy prompt. Please try again.');
        return;
      }
      setInteractionState((prev) => ({ ...prev, copiedStyleId: preset.id }));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(
        () => setInteractionState((prev) => ({ ...prev, copiedStyleId: null })),
        2000,
      );
    },
    [],
  );

  const handleHoverPreviewChange = useCallback(
    (preview: StyleCardHoverPreview | null) => {
      clearPendingHoverPreview();

      if (preview) {
        setInteractionState((prev) => ({ ...prev, hoveredPresetPreview: preview }));
        return;
      }

      hoverPreviewClearTimeoutRef.current = window.setTimeout(() => {
        hoverPreviewClearTimeoutRef.current = null;
        setInteractionState((prev) =>
          prev.hoveredPresetPreview === null ? prev : { ...prev, hoveredPresetPreview: null },
        );
      }, STYLE_HOVER_PREVIEW_EXIT_DELAY_MS);
    },
    [clearPendingHoverPreview],
  );

  const renderPresetCard = React.useCallback(
    (preset: StyleRuntimePreset) => {
      const presetPackId = getPackIdForPreset(preset);
      const archivedEntry = archivedFavoriteById.get(preset.id);
      const displayedPreset = archivedEntry
        ? {
            ...preset,
            displayName: `Archived · ${getStyleRuntimePresetDisplayName(preset)}`,
          }
        : preset;
      const presetTheme = PACK_THEMES[presetPackId] || activeTheme;
      return (
        <StylePresetCard
          key={preset.id}
          preset={displayedPreset}
          packId={presetPackId}
          sourceProvenance={styleSourceByPresetId.get(preset.id)}
          visualState={eagerPresetVisualStateById.get(preset.id) ?? getPresetVisualState(preset)}
          active={selectedStyleIds.has(preset.id)}
          previewOnClick={catalogExpanded}
          selectionDisabled={
            selectedStyles.length >= MAX_SELECTED_STYLE_SLOTS && !selectedStyleIds.has(preset.id)
          }
          copied={copiedStyleId === preset.id}
          favorite={favorites.includes(preset.id)}
          theme={presetTheme}
          FadeImageComponent={StyleFadeImage}
          onApply={() => handleApplyStyleRef.current(preset, presetPackId, archivedEntry?.packName)}
          onCopy={(event) => handleCopyStylePrompt(event, preset)}
          onUsePrompt={() => handleUseStylePrompt(preset)}
          onToggleFavorite={toggleFavorite}
          onHoverPreviewChange={handleHoverPreviewChange}
        />
      );
    },
    [
      catalogExpanded,
      selectedStyleIds,
      selectedStyles.length,
      copiedStyleId,
      favorites,
      activeTheme,
      styleSourceByPresetId,
      archivedFavoriteById,
      getPackIdForPreset,
      toggleFavorite,
      eagerPresetVisualStateById,
      getPresetVisualState,
      handleHoverPreviewChange,
      handleCopyStylePrompt,
      handleUseStylePrompt,
      handleApplyStyleRef,
    ],
  );

  const currentStyleTabId = isPackLandingOpen ? STYLE_PACKS_TAB_ID : currentPackId;
  const styleRecipeNavigationSections = useMemo<StyleRecipeNavigationSection[]>(() => {
    const browseItems: StyleRecipeNavigationItem[] = [
      {
        id: 'browse:all_categories',
        label: 'All Categories',
        caption: 'Global',
        countLabel: `${globalStyleCategoryCount}`,
        tabId: ALL_STYLE_CATEGORIES_TAB_ID,
        theme: PACK_THEMES.pack_10,
        icon: <Layers size={14} />,
      },
      {
        id: 'browse:all_cards',
        label: 'All styles',
        caption: 'Global',
        countLabel: `${globalStylePresetCount}`,
        tabId: ALL_STYLE_CARDS_TAB_ID,
        theme: PACK_THEMES.pack_06,
        icon: <LayoutGrid size={14} />,
      },
    ];
    const personalItems: StyleRecipeNavigationItem[] = [
      {
        id: 'personal:my_styles',
        label: USER_STYLE_PACK_NAME,
        caption: 'Personal',
        countLabel: `${userStylePresets.length}`,
        tabId: USER_STYLE_PACK_ID,
        theme: PACK_THEMES[USER_STYLE_PACK_ID],
        icon: <Sparkles size={14} />,
      },
      {
        id: 'personal:favorites',
        label: 'Favorites',
        caption: 'Personal',
        countLabel: `${favorites.length}`,
        tabId: FAVORITES_PACK_ID,
        theme: PACK_THEMES[FAVORITES_PACK_ID],
        icon: <Heart size={14} fill="currentColor" />,
      },
    ];

    const collectionSections =
      styleCollectionsModule?.STYLE_COLLECTION_FAMILIES.map((family) => {
        const collections = styleCollectionsModule.STYLE_COLLECTIONS.filter(
          (collection) =>
            collection.familyId === family.id &&
            collection.entries.length > 0 &&
            collection.id !== 'my_styles' &&
            collection.id !== 'favorites',
        );
        return {
          id: family.id,
          title: family.title,
          items: collections.map((collection) => ({
            id: `collection:${collection.id}`,
            label: collection.title,
            caption: family.title,
            countLabel: `${collection.sourcePackIds.length}`,
            tabId: getStyleCollectionTabId(collection.id),
            theme: getStyleCollectionTheme(collection),
            icon: getStyleCollectionIcon(collection.icon, 14),
          })),
        } satisfies StyleRecipeNavigationSection;
      }).filter((section) => section.items.length > 0) ?? [];

    return [
      { id: 'browse', title: 'Browse', items: browseItems },
      { id: 'personal', title: 'Personal', items: personalItems },
      ...collectionSections,
      {
        id: 'source',
        title: 'Source',
        items: STYLE_RUNTIME_PACK_SUMMARIES.map((pack) => {
          const theme = PACK_THEMES[pack.id] ?? PACK_THEMES.pack_01;
          return {
            id: `source:${pack.id}`,
            label: pack.name,
            caption: 'Source pack',
            countLabel: `${pack.presetCount}`,
            tabId: pack.id,
            theme,
            icon: getPackIcon(pack.id),
          } satisfies StyleRecipeNavigationItem;
        }),
      },
    ];
  }, [
    favorites.length,
    globalStyleCategoryCount,
    globalStylePresetCount,
    styleCollectionsModule,
    userStylePresets.length,
  ]);
  const styleTabNavigationItems = useMemo(
    () => [
      { id: STYLE_PACKS_TAB_ID, label: 'Collections' },
      ...styleRecipeNavigationSections.flatMap((section) =>
        section.items.map((item) => ({ id: item.tabId, label: item.label })),
      ),
    ],
    [styleRecipeNavigationSections],
  );
  const currentStyleTabIndex = Math.max(
    0,
    styleTabNavigationItems.findIndex((item) => item.id === currentStyleTabId),
  );
  const previousStyleTab = styleTabNavigationItems[currentStyleTabIndex - 1] ?? null;
  const nextStyleTab = styleTabNavigationItems[currentStyleTabIndex + 1] ?? null;

  return (
    <RecipeLayout isGenerating={isGenerating} className="styles-workbench flex size-full">
      <RecipeResults />
      <input
        type="file"
        ref={fileInputRef}
        aria-label="Upload reference images"
        onChange={(e) => {
          if (e.target.files) {
            onFileSelect(Array.from(e.target.files).slice(0, referenceSlotsRemaining));
            e.target.value = '';
          }
        }}
        className="hidden"
        accept="image/*"
        multiple
      />
      <RecipeSidePanel>
        <AnimatePresence>
          {explorerOpen ? (
            <div
              className="studio-surface create-side-panel-dialog styles-catalog-panel"
              data-workspace-expanded={catalogExpanded}
            >
              <div
                ref={catalogRootRef}
                data-style-browser-root
                role="dialog"
                aria-modal="false"
                aria-label="Style catalog"
                tabIndex={-1}
                onKeyDown={(event) => {
                  if (event.key === 'Escape' && !event.defaultPrevented) {
                    event.preventDefault();
                    event.stopPropagation();
                    closeStyleCatalog();
                  }
                }}
                className="vt-style-browser-surface studio-surface relative flex h-full min-w-0 flex-1 flex-col bg-[color:var(--wb-bg)] outline-none"
              >
                <div className="styles-catalog-chrome">
                  <div className="styles-catalog-header">
                    <h2 className="styles-catalog-title">
                      {catalogExpanded ? 'Style explorer' : 'Styles'}
                    </h2>
                    <label className="styles-catalog-search">
                      <Search size={16} aria-hidden="true" />
                      <input
                        type="search"
                        aria-label="Search styles"
                        placeholder="Search styles…"
                        value={searchQuery}
                        onChange={(event) => {
                          const nextQuery = event.target.value;
                          if (isPackLandingOpen) {
                            applyStyleTab(ALL_STYLE_CARDS_TAB_ID, {
                              browserStatePatch: { searchQuery: nextQuery },
                            });
                            writeStyleTabHash(ALL_STYLE_CARDS_TAB_ID);
                          } else updateFilters({ searchQuery: nextQuery });
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="styles-catalog-expand"
                      aria-label={
                        catalogExpanded ? 'Use compact style catalog' : 'Expand style catalog'
                      }
                      aria-pressed={catalogExpanded}
                      onClick={() => setCatalogExpanded((expanded) => !expanded)}
                    >
                      {catalogExpanded ? <Minimize size={16} /> : <Maximize size={16} />}
                      <span>{catalogExpanded ? 'Compact view' : 'Explore'}</span>
                    </button>
                    {catalogExpanded && (
                      <button
                        type="button"
                        className="styles-explorer-done"
                        onClick={closeStyleCatalog}
                      >
                        {selectedStyles.length > 0
                          ? `Use ${selectedStyles.length} selected`
                          : 'Back to create'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="styles-catalog-close"
                      data-close-style-catalog
                      aria-label="Close style catalog"
                      onClick={closeStyleCatalog}
                    >
                      <X size={14} />
                      Close
                    </button>
                    <div className="styles-catalog-tabs vt-recipe-tabs vt-style-tabs">
                      <div className="styles-catalog-tab-stepper">
                        <button
                          type="button"
                          onClick={() =>
                            previousStyleTab && navigateToStyleTab(previousStyleTab.id)
                          }
                          disabled={!previousStyleTab}
                          data-style-tab-previous
                          aria-label="Previous category"
                          data-tooltip={
                            previousStyleTab
                              ? `Previous: ${previousStyleTab.label}`
                              : 'No previous category'
                          }
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => nextStyleTab && navigateToStyleTab(nextStyleTab.id)}
                          disabled={!nextStyleTab}
                          data-style-tab-next
                          aria-label="Next category"
                          data-tooltip={
                            nextStyleTab ? `Next: ${nextStyleTab.label}` : 'No next category'
                          }
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>
                      <div className="styles-catalog-tab-group">
                        <button
                          type="button"
                          onClick={() => navigateToStyleTab(ALL_STYLE_CARDS_TAB_ID)}
                          data-style-tab-url={`#${getStyleTabHash(ALL_STYLE_CARDS_TAB_ID)}`}
                          aria-label="Show all styles"
                          aria-pressed={
                            !isPackLandingOpen && currentPackId === ALL_STYLE_CARDS_TAB_ID
                          }
                          className={styleCatalogTabClass(
                            !isPackLandingOpen && currentPackId === ALL_STYLE_CARDS_TAB_ID,
                          )}
                        >
                          <LayoutGrid size={15} />
                          All styles
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateToStyleTab(STYLE_PACKS_TAB_ID)}
                          data-style-tab-url={`#${getStyleTabHash(STYLE_PACKS_TAB_ID)}`}
                          aria-label="Show collections"
                          aria-pressed={isPackLandingOpen}
                          className={styleCatalogTabClass(isPackLandingOpen)}
                        >
                          <Layers size={15} />
                          Collections
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateToStyleTab(USER_STYLE_PACK_ID)}
                          data-style-pack-id={USER_STYLE_PACK_ID}
                          data-style-pack-active={
                            !isPackLandingOpen && currentPackId === USER_STYLE_PACK_ID
                              ? 'true'
                              : 'false'
                          }
                          data-style-tab-url={`#${getStyleTabHash(USER_STYLE_PACK_ID)}`}
                          aria-label={`Show ${USER_STYLE_PACK_NAME}`}
                          aria-pressed={!isPackLandingOpen && currentPackId === USER_STYLE_PACK_ID}
                          className={styleCatalogTabClass(
                            !isPackLandingOpen && currentPackId === USER_STYLE_PACK_ID,
                          )}
                        >
                          <Sparkles size={15} />
                          {USER_STYLE_PACK_NAME}
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateToStyleTab(FAVORITES_PACK_ID)}
                          data-style-tab-url={`#${getStyleTabHash(FAVORITES_PACK_ID)}`}
                          aria-label="Show favorite styles"
                          aria-pressed={!isPackLandingOpen && currentPackId === FAVORITES_PACK_ID}
                          className={styleCatalogTabClass(
                            !isPackLandingOpen && currentPackId === FAVORITES_PACK_ID,
                          )}
                        >
                          <Heart
                            size={15}
                            fill={
                              !isPackLandingOpen && currentPackId === FAVORITES_PACK_ID
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                          Favorites
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {isPackLandingOpen ? (
                  <React.Suspense
                    fallback={
                      <LazySurfaceFallback
                        label="Loading collections"
                        className="flex flex-1 items-center justify-center bg-[color:var(--wb-panel)]/40 text-[color:var(--wb-muted)]"
                      />
                    }
                  >
                    <StyleCollectionsLandingSurface
                      favoritesCount={favorites.length}
                      userStyleCount={userStylePresets.length}
                      isNavigationPanelOpen={isStyleNavigationPanelOpen}
                      getCollectionTabId={getStyleCollectionTabId}
                      getStyleTabHash={getStyleTabHash}
                      onNavigateToStyleTab={navigateToStyleTab}
                      onPrefetchStyleTab={prefetchStyleTab}
                      onToggleNavigationPanel={() => toggleStylePanel('navigation')}
                    />
                  </React.Suspense>
                ) : (
                  <div data-style-folder={currentPackId} className="flex min-h-0 flex-1 flex-col">
                    {currentPackId === USER_STYLE_PACK_ID &&
                    userStyleError &&
                    userStylePresets.length > 0 ? (
                      <div
                        role="alert"
                        className="flex items-center justify-between gap-2 p-3 text-xs text-[color:var(--wb-warning)] "
                      >
                        <span>{userStyleError} The list may be incomplete.</span>
                        <button type="button" onClick={() => void refreshUserStyles()}>
                          Retry
                        </button>
                      </div>
                    ) : null}
                    {/* Pack Header Info + Search Bar */}
                    <div
                      className={`style-folder-heading grid min-h-12 min-w-0 items-center gap-4 border-b border-[color:var(--wb-line)] px-4 py-2.5 sm:px-5 2xl:px-6 ${
                        isStyleNavigationPanelOpen
                          ? 'lg:grid-cols-[260px_minmax(0,1fr)]'
                          : 'lg:grid-cols-[40px_minmax(0,1fr)]'
                      }`}
                    >
                      <div className="hidden lg:block" aria-hidden="true" />
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <label className="styles-catalog-map-select">
                          <select
                            aria-label="Browse collections and categories"
                            value={currentStyleTabId}
                            onChange={(event) => navigateToStyleTab(event.target.value)}
                          >
                            {styleTabNavigationItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        {/* Search & Filter Toolbar */}
                        <div className="vt-style-actionbar flex min-h-9 shrink-0 flex-wrap items-center gap-1.5 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] p-1">
                          <div className="relative">
                            <button
                              ref={manageStylesButtonRef}
                              type="button"
                              aria-haspopup="menu"
                              aria-label="Manage styles"
                              aria-expanded={isManageStylesOpen}
                              onClick={() => setIsManageStylesOpen((open) => !open)}
                              className="studio-ghost-control style-catalog-control"
                            >
                              Manage
                              <ChevronDown size={12} aria-hidden="true" />
                            </button>
                            <DemandMountedGsapDropdown
                              open={isManageStylesOpen}
                              onOpenChange={setIsManageStylesOpen}
                              triggerRef={manageStylesButtonRef}
                              placement="bottom-left"
                              portal
                              role="menu"
                              aria-label="Manage styles"
                              className="grid w-44 gap-1 p-2"
                            >
                              <button
                                type="button"
                                role="menuitem"
                                data-dropdown-item
                                onClick={() => {
                                  setIsManageStylesOpen(false);
                                  handleCreateUserStyle();
                                }}
                                data-style-create-user-style
                                className="studio-ghost-control style-catalog-control style-catalog-menu-action"
                                data-tooltip="Create Style"
                              >
                                <Plus size={15} />
                                <span className="inline">Create</span>
                              </button>

                              <button
                                type="button"
                                role="menuitem"
                                data-dropdown-item
                                onClick={() => {
                                  setIsManageStylesOpen(false);
                                  handleSaveSelectedStyleBlend();
                                }}
                                disabled={!canSaveStyleBlend}
                                data-style-save-blend
                                className="studio-ghost-control style-catalog-control style-catalog-menu-action"
                                data-tooltip="Save Blend"
                              >
                                <Layers size={15} />
                                <span className="inline">Blend</span>
                              </button>

                              <button
                                type="button"
                                role="menuitem"
                                data-dropdown-item
                                onClick={() => {
                                  setIsManageStylesOpen(false);
                                  if (canEditActiveUserStyle) handleEditActiveUserStyle();
                                  else handleCloneActiveStyle();
                                }}
                                disabled={!canEditActiveUserStyle && !canCloneActiveStyle}
                                data-style-edit-or-clone
                                className="studio-ghost-control style-catalog-control style-catalog-menu-action"
                                data-tooltip={canEditActiveUserStyle ? 'Edit Style' : 'Clone Style'}
                              >
                                {canEditActiveUserStyle ? (
                                  <PenTool size={15} />
                                ) : (
                                  <Copy size={15} />
                                )}
                                <span className="inline">
                                  {canEditActiveUserStyle ? 'Edit' : 'Clone'}
                                </span>
                              </button>
                            </DemandMountedGsapDropdown>
                          </div>
                          {isGlobalStyleBrowseTab ? null : (
                            <div
                              data-style-view-mode={activeStyleViewMode}
                              className="flex items-center gap-1"
                            >
                              <button
                                type="button"
                                onClick={() => updateFilters({ viewMode: 'grouped' })}
                                aria-label="Show grouped style categories"
                                aria-pressed={activeStyleViewMode === 'grouped'}
                                className="studio-ghost-control style-catalog-control style-catalog-icon"
                                data-tooltip="Categories"
                              >
                                <Layers size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateFilters({ viewMode: 'flat' })}
                                aria-label="Show all style cards in one grid"
                                aria-pressed={activeStyleViewMode === 'flat'}
                                className="studio-ghost-control style-catalog-control style-catalog-icon"
                                data-tooltip="All cards"
                              >
                                <LayoutGrid size={14} />
                              </button>
                            </div>
                          )}

                          <div ref={sortDropdownRef} className="relative" data-style-sort-dropdown>
                            <button
                              ref={sortButtonRef}
                              type="button"
                              onClick={() => setIsSortDropdownOpen((open) => !open)}
                              aria-label={`Sort style cards: ${activeSortOption.label}`}
                              aria-haspopup="listbox"
                              aria-expanded={isSortDropdownOpen}
                              aria-controls={sortMenuId}
                              className="studio-ghost-control style-catalog-control style-catalog-sort"
                              data-tooltip="Sort styles"
                            >
                              <ArrowUpDown size={14} className="shrink-0" />
                              <span className="min-w-0 flex-1 truncate text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
                                {activeSortOption.label}
                              </span>
                              <ChevronDown
                                size={13}
                                className={`shrink-0 transition-transform ${isSortDropdownOpen ? 'rotate-180 text-[color:var(--wb-ink)]' : 'text-[color:var(--wb-dim)]'}`}
                              />
                            </button>

                            <DemandMountedGsapDropdown
                              id={sortMenuId}
                              open={isSortDropdownOpen}
                              onOpenChange={setIsSortDropdownOpen}
                              triggerRef={sortButtonRef}
                              placement="bottom-right"
                              portal
                              role="listbox"
                              aria-label="Sort style cards"
                              className="absolute right-0 top-[calc(100%+0.45rem)] z-50 w-52 overflow-hidden rounded-[var(--wb-radius)] p-1"
                            >
                              <div className="px-2 pb-1 pt-1 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
                                Sort
                              </div>
                              <div className="space-y-0.5">
                                {STYLE_BROWSER_SORT_OPTIONS.map((option) => {
                                  const selected = option.value === sortOrder;

                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      role="option"
                                      aria-selected={selected}
                                      data-dropdown-item
                                      onClick={() => {
                                        updateFilters({ sortOrder: option.value });
                                        setIsSortDropdownOpen(false);
                                      }}
                                      className={`flex min-h-9 w-full items-center justify-between gap-3 rounded-[var(--wb-radius)] px-2 text-left text-[length:var(--wbp-label)] font-semibold tracking-normal transition-[background-color,color,transform] ${
                                        selected
                                          ? 'bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] text-[color:var(--wb-ink)]'
                                          : 'text-[color:var(--wb-muted)] hover:bg-white/[0.055] hover:text-[color:var(--wb-ink)]'
                                      }`}
                                    >
                                      <span>{option.label}</span>
                                      {selected ? <Check size={13} className="shrink-0" /> : null}
                                    </button>
                                  );
                                })}
                              </div>
                            </DemandMountedGsapDropdown>
                          </div>

                          {currentPackId !== FAVORITES_PACK_ID && (
                            <button
                              type="button"
                              aria-label="Filter favorite styles"
                              onClick={() => toggleFavoritesOnly()}
                              aria-pressed={showFavoritesOnly}
                              className="studio-ghost-control style-catalog-control style-catalog-icon"
                              data-tooltip="Filter Favorites in this Pack"
                            >
                              <Heart size={16} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
                            </button>
                          )}

                          <div className="h-6 w-px bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)]" />

                          <div className="hidden items-center gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)]/40 px-2 py-1 md:flex">
                            <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
                              Zoom
                            </span>
                            <input
                              type="range"
                              min={1}
                              max={Math.max(1, fitColumns)}
                              step={1}
                              value={gridColumns}
                              onChange={(e) =>
                                (catalogExpanded ? setExplorerColumnPref : setGridColumnPref)(
                                  Number(e.target.value),
                                )
                              }
                              className="h-1.5 w-20 accent-white"
                              aria-label="Style grid zoom"
                              data-tooltip="Style card columns"
                            />
                            <span className="w-4 text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-ink)] tabular-nums">
                              {gridColumns}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {styleRuntimePackLoadRequest.loadAll && !onlyArchivedFavoritesSelected ? (
                      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        {unsearchedFavoritesRoute && archivedFavoritePresets.length > 0 ? (
                          <div
                            ref={styleScrollRootRef}
                            data-style-archived-favorites
                            className="max-h-[38vh] min-h-0 shrink-0 overflow-y-auto px-4 pb-3"
                          >
                            <StylePresetGroupSection
                              groupKey="archived-favorites"
                              title="Archived favorites"
                              presets={archivedFavoritePresets}
                              gridColumns={gridColumns}
                              scrollRootRef={styleScrollRootRef}
                              scrollContainerWidth={styleScrollWidth}
                              initiallyVisible
                              headerClassName=""
                              accentClassName="bg-amber-500"
                              titleClassName="text-[color:var(--wb-muted)]"
                              dividerClassName="bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)]"
                              renderPresetCard={renderPresetCard}
                            />
                          </div>
                        ) : null}
                        <PagedStyleCatalog
                          query={searchQuery}
                          sortOrder={sortOrder}
                          favorites={favorites}
                          favoritesOnly={showFavoritesOnly || currentPackId === FAVORITES_PACK_ID}
                          extraIndex={userSearchIndex}
                          loadedPacks={{
                            ...loadedStylePacksById,
                            [USER_STYLE_PACK_ID]: userStylePack,
                          }}
                          loadPacks={loadStyleRuntimePacks}
                          renderCard={renderPresetCard}
                          columns={gridColumns}
                          onWidthChange={setStyleScrollWidth}
                          grouped={activeStyleViewMode === 'grouped'}
                        />
                      </div>
                    ) : (
                      <div
                        className={`style-folder-layout grid min-h-0 min-w-0 flex-1 gap-4 px-4 py-3 sm:px-5 2xl:px-6 ${
                          isStyleNavigationPanelOpen
                            ? 'lg:grid-cols-[260px_minmax(0,1fr)]'
                            : 'lg:grid-cols-[40px_minmax(0,1fr)]'
                        }`}
                      >
                        {isStyleNavigationPanelOpen ? (
                          <React.Suspense
                            fallback={
                              <LazySurfaceFallback
                                label="Loading style map"
                                className="hidden min-h-0 lg:flex"
                              />
                            }
                          >
                            <StyleRecipeNavigationPanel
                              sections={styleRecipeNavigationSections}
                              activeTabId={currentStyleTabId}
                              onOpen={navigateToStyleTab}
                              onClose={() => toggleStylePanel('navigation')}
                            />
                          </React.Suspense>
                        ) : (
                          <aside
                            data-style-detail-navigation-rail
                            className="hidden min-h-0 min-w-0 items-start justify-center rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)]/70 p-1.5 lg:flex"
                          >
                            <button
                              type="button"
                              onClick={() => toggleStylePanel('navigation')}
                              data-style-detail-navigation-toggle
                              className="flex size-7 items-center justify-center rounded-[var(--wb-radius)] text-[color:var(--wb-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
                              aria-label="Show style map"
                              data-tooltip="Show style map"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </aside>
                        )}
                        <div
                          ref={styleScrollRootRef}
                          className="min-h-0 min-w-0 overflow-y-auto pb-12 custom-scrollbar"
                        >
                          <React.Suspense
                            fallback={
                              <LazySurfaceFallback
                                label="Loading style cards"
                                className="flex min-h-64 items-center justify-center text-[color:var(--wb-muted)]"
                              />
                            }
                          >
                            <div className="w-full space-y-6 pb-20">
                              {currentPackId === 'pack_22' ? (
                                <div
                                  className="flex w-fit flex-wrap gap-1 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-1"
                                  role="group"
                                  aria-label="Trading card atlas sections"
                                >
                                  <button
                                    type="button"
                                    onClick={() => setTcgCatalogView('visual')}
                                    aria-pressed={tcgCatalogView === 'visual'}
                                    className="rounded-[var(--wb-radius)] px-3 py-1.5 text-xs font-semibold text-[color:var(--wb-ink)] transition-colors aria-pressed:bg-[color-mix(in_srgb,var(--wb-ink)_12%,transparent)]"
                                  >
                                    Visual styles
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setTcgCatalogView('components')}
                                    aria-pressed={tcgCatalogView === 'components'}
                                    className="rounded-[var(--wb-radius)] px-3 py-1.5 text-xs font-semibold text-[color:var(--wb-ink)] transition-colors aria-pressed:bg-[color-mix(in_srgb,var(--wb-ink)_12%,transparent)]"
                                  >
                                    Components · 42
                                  </button>
                                </div>
                              ) : null}
                              {currentPackId === 'pack_22' && tcgCatalogView === 'components' ? (
                                <TcgComponentStudio
                                  query={searchQuery}
                                  images={images}
                                  onGenerateArtwork={generateTcgRecipeArt}
                                  isGenerating={isGenerating}
                                />
                              ) : (
                                <>
                                  {/* FAVORITES SECTION (If any exist in current filter and not in favorites tab) */}
                                  {processedData.favorites.length > 0 &&
                                    currentPackId !== FAVORITES_PACK_ID && (
                                      <StylePresetGroupSection
                                        key={`favorites:${gridColumns}:${styleScrollWidth}:${processedData.favorites.length}`}
                                        groupKey="favorites"
                                        title="Pinned / Favorites"
                                        presets={processedData.favorites}
                                        gridColumns={gridColumns}
                                        scrollRootRef={styleScrollRootRef}
                                        scrollContainerWidth={styleScrollWidth}
                                        initiallyVisible
                                        headerClassName="opacity-100"
                                        accentClassName="bg-rose-500"
                                        titleClassName="text-[color:var(--wb-danger)]"
                                        dividerClassName="bg-linear-to-r from-rose-500/20 to-transparent"
                                        renderPresetCard={renderPresetCard}
                                      />
                                    )}

                                  {visibleStyleGroupEntries.map(([groupKey, presets], index) => {
                                    const isFlatStyleGroup =
                                      activeStyleViewMode === 'flat' &&
                                      groupKey === STYLE_BROWSER_FLAT_GROUP_KEY;
                                    const categoryIdentity = isFlatStyleGroup
                                      ? null
                                      : resolveStyleCategoryIdentity(currentPackId, groupKey);
                                    return (
                                      <StylePresetGroupSection
                                        key={`${groupKey}:${gridColumns}:${styleScrollWidth}:${presets.length}`}
                                        groupKey={groupKey}
                                        title={
                                          isFlatStyleGroup
                                            ? 'All Styles'
                                            : presets[0]
                                              ? `${groupKey.includes(' / ') ? `${getPackNameForId(getPackIdForPreset(presets[0]))} / ` : ''}${getStyleCategoryDisplayName(getPackIdForPreset(presets[0]), presets[0].category || 'General')}`
                                              : groupKey
                                        }
                                        icon={
                                          isFlatStyleGroup || !categoryIdentity ? (
                                            <LayoutGrid size={12} />
                                          ) : (
                                            <StyleCategoryGlyph
                                              iconId={categoryIdentity.iconId}
                                              size={12}
                                            />
                                          )
                                        }
                                        presets={presets}
                                        gridColumns={gridColumns}
                                        scrollRootRef={styleScrollRootRef}
                                        scrollContainerWidth={styleScrollWidth}
                                        initiallyVisible={index < styleCategoryEagerBudget}
                                        headerClassName=""
                                        accentClassName={
                                          categoryIdentity?.accentClassName ?? activeTheme.bg
                                        }
                                        titleClassName={
                                          categoryIdentity?.titleClassName ??
                                          'text-[color:var(--wb-ink)]'
                                        }
                                        dividerClassName="bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)]"
                                        renderPresetCard={renderPresetCard}
                                      />
                                    );
                                  })}

                                  {filteredStylePresets.length === 0 && (
                                    <div className="h-64 flex flex-col items-center justify-center text-[color:var(--wb-dim)] gap-4">
                                      {currentPackId !== USER_STYLE_PACK_ID && styleRuntimeError ? (
                                        <>
                                          <Filter size={32} className="opacity-20" />
                                          <span className="text-xs font-bold tracking-normal">
                                            Could not load this style pack
                                          </span>
                                          <button
                                            type="button"
                                            onClick={retryStylePacks}
                                            className="flex h-9 items-center gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
                                          >
                                            <Wand2 size={13} />
                                            Retry
                                          </button>
                                        </>
                                      ) : currentPackId === USER_STYLE_PACK_ID && userStyleError ? (
                                        <>
                                          <Filter size={32} className="opacity-20" />
                                          <span className="text-xs font-bold tracking-normal">
                                            Could not load styles
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => void refreshUserStyles()}
                                            className="flex h-9 items-center gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
                                          >
                                            <Wand2 size={13} />
                                            Retry
                                          </button>
                                        </>
                                      ) : currentPackId === USER_STYLE_PACK_ID &&
                                        !isLoadingUserStyles &&
                                        normalizedStyleSearchQuery.length === 0 ? (
                                        <>
                                          <Sparkles
                                            size={32}
                                            className="opacity-30 text-[color:var(--wb-info)] "
                                          />
                                          <span className="text-xs font-bold tracking-normal text-[color:var(--wb-muted)]">
                                            No custom styles yet
                                          </span>
                                          <button
                                            type="button"
                                            onClick={handleCreateUserStyle}
                                            className="flex h-9 items-center gap-2 rounded-[var(--wb-radius)] border border-sky-400/2 bg-sky-500/10 px-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-info)]  transition-colors hover:bg-sky-500/16"
                                          >
                                            <Plus size={13} />
                                            Create Style
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <Filter size={32} className="opacity-20" />
                                          <span className="text-xs font-bold tracking-normal">
                                            {isLoadingUserStyles || isLoadingStylePacks
                                              ? 'Loading styles'
                                              : 'No styles found matching criteria'}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </React.Suspense>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isCatalogSearchOpen && (
                  <React.Suspense
                    fallback={
                      <LazySurfaceFallback
                        label="Loading catalog"
                        className="absolute inset-0 z-40 grid place-items-center bg-[color:var(--wb-panel)] text-[color:var(--wb-muted)]"
                      />
                    }
                  >
                    <StylePresetCatalogSearchSurface
                      onClose={handleCloseCatalogSearch}
                      onSelectPreset={handleSelectCatalogPreset}
                      onApplyPreset={handleChooseCompactStyle}
                      selectedIds={selectedStyleIds}
                      favorites={favorites}
                      onToggleFavorite={toggleFavorite}
                      onCopyPrompt={(result) => void handleCatalogPrompt(result, 'copy')}
                      onUsePrompt={(result) => void handleCatalogPrompt(result, 'use')}
                    />
                  </React.Suspense>
                )}
              </div>
            </div>
          ) : null}
        </AnimatePresence>
      </RecipeSidePanel>

      <RecipeControls>
        {promptNotice && (
          <div className="style-prompt-notice" role="status">
            {promptNotice}
            {previousPrompt !== null && (
              <button
                type="button"
                onClick={() => {
                  updateConfig('prompt', previousPrompt);
                  setPreviousPrompt(null);
                  setPromptNotice('Previous prompt restored.');
                }}
              >
                Undo
              </button>
            )}
          </div>
        )}
        <React.Suspense fallback={<LazySurfaceFallback label="Loading styles" />}>
          <CompactStyleSelector
            catalogOpen={explorerOpen}
            selectedStyles={selectedStyles}
            maxSlots={MAX_SELECTED_STYLE_SLOTS}
            favorites={favorites}
            extraIndex={userSearchIndex}
            onToggleFavorite={toggleFavorite}
            onChooseStyle={handleChooseCompactStyle}
            onCopyPrompt={(result) => void handleCatalogPrompt(result, 'copy')}
            onUsePrompt={(result) => void handleCatalogPrompt(result, 'use')}
            onRemove={removeSelectedStyle}
            onSetStrength={updateSelectedStyleStrength}
            onToggleEnabled={toggleSelectedStyleEnabled}
            onMove={moveSelectedStyle}
            onBrowseCatalog={openStyleCatalog}
          />
        </React.Suspense>
        {selectedStyles.length > 0 ? (
          <button
            type="button"
            className="cs-advanced-toggle"
            data-style-advanced-toggle
            aria-expanded={advancedOpen}
            aria-controls="style-advanced-panel"
            onClick={() => {
              setAdvancedOpen((open) => !open);
            }}
          >
            <span>Advanced layers</span>
            <SlidersHorizontal size={13} />
          </button>
        ) : null}
        {advancedOpen && selectedStyles.length > 0 ? (
          <div
            ref={advancedPanelRef}
            id="style-advanced-panel"
            className="studio-surface style-advanced-rail"
            role="region"
            aria-label="Advanced layers"
          >
            <div className="create-side-panel-head">
              <strong>Advanced layers</strong>
              <span className="create-side-panel-count">{selectedStyles.length} active</span>
              <button
                type="button"
                aria-label="Close advanced layers"
                onClick={() => {
                  setAdvancedOpen(false);
                  document.querySelector<HTMLElement>('[data-style-advanced-toggle]')?.focus();
                }}
              >
                <X size={14} />
              </button>
            </div>
            <div className="create-side-panel-body custom-scrollbar">
              <React.Suspense fallback={<LazySurfaceFallback label="Loading advanced controls" />}>
                <StyleAdvancedControlsPanel
                  selectedStyles={selectedStyles}
                  selectedStyleLayers={selectedStyleLayers}
                  onToggleStyleEnabled={toggleSelectedStyleEnabled}
                  onToggleField={toggleSelectedStyleField}
                  onUpdateFieldWeight={updateSelectedStyleFieldWeight}
                  onSetAvoidRulesMode={setSelectedStyleAvoidRulesMode}
                />
              </React.Suspense>
            </div>
          </div>
        ) : null}
        {intentionalStylesV1 || referenceImages.length > 0 ? (
          <div className="mt-3 space-y-2">
            <div role="group" aria-label="Style application mode" className="flex gap-1">
              {(intentionalStylesV1
                ? (['generate', 'preserve', 'reinterpret'] as const)
                : (['preserve', 'reinterpret'] as const)
              ).map((mode) => {
                const isActive = intentionalMode === mode;

                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setIntentionalMode(mode)}
                    className={`${
                      isActive ? 'studio-primary-control' : 'studio-ghost-control'
                    } min-h-8 flex-1 gap-1.5 px-2 text-xs font-semibold capitalize transition-[background-color,border-color,color,box-shadow]`}
                  >
                    <Check
                      size={14}
                      strokeWidth={3}
                      aria-hidden="true"
                      className={isActive ? 'opacity-100' : 'opacity-0'}
                    />
                    <span>{mode}</span>
                  </button>
                );
              })}
            </div>
            {intentionalStylesV1 && compileIssues.length > 0 ? (
              <ul className="space-y-1 text-xs text-[color:var(--wb-warning)]">
                {compileIssues.map((issue) => (
                  <li key={`${issue.code}:${issue.message}`}>{issue.message}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleGenerateSelectedStyles}
          disabled={activeSelectedStyleCount === 0 || Boolean(grokGenerateBlock)}
          data-tooltip={grokGenerateBlock?.message}
          hidden
          data-style-generate-button
          data-generate-active={isGenerating ? 'true' : 'false'}
          className="mt-3 flex h-11 items-center justify-center gap-2 rounded-[var(--wb-radius)] border border-accent-400/2 bg-accent-500/18 px-4 text-[length:var(--wbp-label)] font-semibold tracking-normal text-accent-100 transition-[background-color,border-color,opacity] hover:border-accent-300/2 hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:border-[color:var(--wb-line)] disabled:bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] disabled:text-[color:var(--wb-dim)]"
        >
          <Play size={16} />
          {isGenerating ? 'Queue' : 'Generate'}
        </button>
      </RecipeControls>
      <RecipeOverlay>
        <AnimatePresence>
          {userStyleEditorSession && (
            <React.Suspense
              fallback={
                <LazySurfaceFallback
                  label="Loading style editor"
                  className="absolute inset-0 z-50 grid place-items-center bg-[color:var(--wb-panel)]/86 text-[color:var(--wb-muted)] backdrop-blur-xl"
                />
              }
            >
              <UserStyleEditorSurface
                sessionId={userStyleEditorSession.id}
                mode={userStyleEditorSession.mode}
                initialDraft={userStyleEditorSession.draft}
                initialSource={userStyleEditorSession.source}
                editingStyleId={userStyleEditorSession.editingStyleId}
                selectedStyleLayers={selectedStyleLayers}
                onClose={userStyles.close}
                onSaved={(style) => userStyles.reconcile(userStyleEditorSession.id, style, false)}
                onArchived={(style) => userStyles.reconcile(userStyleEditorSession.id, style, true)}
              />
            </React.Suspense>
          )}
        </AnimatePresence>
      </RecipeOverlay>
    </RecipeLayout>
  );
};
