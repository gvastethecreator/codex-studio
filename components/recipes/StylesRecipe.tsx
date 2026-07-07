import {
  IconArchive as Archive,
  IconArrowsSort as ArrowUpDown,
  IconBolt as Bolt,
  IconBook as BookOpen,
  IconBox as Box,
  IconBriefcase as Briefcase,
  IconBuilding as Building,
  IconCamera as Camera,
  IconCheck as Check,
  IconChevronDown as ChevronDown,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconMovie as Clapperboard,
  IconCopy as Copy,
  IconFilter as Filter,
  IconDeviceGamepad2 as Gamepad2,
  IconHeart as Heart,
  IconLayoutGrid as LayoutGrid,
  IconPhoto as ImageIcon,
  IconMoonStars as MoonStars,
  IconStack as Layers,
  IconPalette as Palette,
  IconPencil as PenTool,
  IconPlayerPlay as Play,
  IconPlus as Plus,
  IconPrinter as Printer,
  IconSearch as Search,
  IconShirt as Shirt,
  IconAdjustmentsHorizontal as SlidersHorizontal,
  IconMoodPlus as SmilePlus,
  IconSparkles as Sparkles,
  IconStar as Star,
  IconSword as Sword,
  IconDeviceTv as Tv,
  IconUpload as Upload,
  IconWand as Wand2,
  IconX as X,
} from '@tabler/icons-react';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  STYLE_CARD_THUMBNAILS,
  STYLE_CATEGORY_IMAGES,
  STYLE_CATEGORY_PREVIEWS,
  resolveStyleDefaultImageThumbnail,
  resolveStyleDefaultImageVariantThumbnails,
} from '../../lib/styleThumbnailCatalog';
import { styleCategoryImageKey } from '../../lib/recipeAssetKeys';
import { hasStylePresetIdentity } from '../../lib/recipeIdentity';
import { isStyleDefaultImageStale } from '../../lib/staleStyleDefaultImages.generated';
import { resolveStylePresetCardImages } from '../../lib/stylePresetVisuals';
import type { Attachment, GeneratedImageWithConfig, ImageGenerationConfig } from '../../types';
import Tooltip from '../Tooltip';
import { GsapDropdown } from '../ui/GsapDropdown';
import { LazySurfaceFallback } from '../ui/LazySurfaceFallback';
import { RecipeLayout } from './RecipeLayout';
import {
  STYLE_BROWSER_EAGER_SECTION_LIMIT,
  STYLE_BROWSER_FLAT_GROUP_KEY,
  collectStylePresetPreviewSources,
  createStyleBrowserProcessedData,
  createStyleBrowserRenderPlan,
  type StyleBrowserSortOrder,
  type StyleBrowserViewMode,
} from './styleBrowserRenderPlan';
import {
  STYLE_GRID_DEFAULT_VIEWPORT_HEIGHT_PX,
  createStyleGridVirtualWindow,
  estimateStyleGroupPlaceholderHeight,
  type StyleGridVirtualWindow,
} from './styleGridVirtualization';
import {
  clampStyleLayerFieldWeight,
  clampStyleStrength,
  createDefaultStyleLayerFieldControls,
  createSelectedStyleEmphasis,
  createSelectedStyleLayer,
  createSelectedStylesPrompt,
  DEFAULT_SELECTED_STYLE_STRENGTH,
  describeStyleValue,
  formatStyleStrength,
  joinSelectedStyleCreativeBrief,
  joinSelectedStyleLayerValue,
  mergeSelectedStyleNegativePrompts,
  type SelectedStyleSlot,
  type StyleLayerAvoidRulesMode,
  type StyleLayerFieldId,
} from './styleLayerComposer';
import type { StylePresetCatalogSearchResult } from './stylePresetManifests';
import {
  getStyleRuntimePresetDisplayName,
  getStyleRuntimePresetSearchNames,
  loadStyleRuntimePack,
  loadStyleRuntimePacks,
  STYLE_RUNTIME_PACK_SUMMARIES,
  type StyleRuntimePack,
  type StyleRuntimePreset,
} from './stylesData';
import type { StyleCollection } from './styles/collections';
import {
  getStyleCollectionIdFromTabId,
  getStyleCollectionTabId,
  getStyleTabHash as getStyleTabHashForRoute,
  readStyleTabIdFromHash as readStyleTabIdFromRouteHash,
  normalizeStyleTabId as normalizeStyleTabRouteId,
  STYLE_PACKS_TAB_ID,
  STYLE_RECIPE_HASH_PREFIX,
  type StyleTabId,
  type StyleTabRouteOptions,
} from './styleTabRouting';
import {
  USER_STYLE_PACK_DESCRIPTION,
  USER_STYLE_PACK_ID,
  USER_STYLE_PACK_NAME,
  createUserStyleRuntimePack,
} from './userStyleRuntimeAdapter';
import { listUserStylePresets } from '../../services/localStudioService';
import type {
  UserStylePreset,
  UserStylePresetDraft,
  UserStylePresetSource,
} from '../../packages/shared/src';
import type {
  StyleRecipeNavigationItem,
  StyleRecipeNavigationSection,
  StyleTheme,
} from './StyleRecipeNavigationPanel';
import type {
  StyleCardHoverPreview,
  StylePresetSourceProvenance,
  StylePresetVisualState,
} from './StylePresetCardSurface';

interface StylesRecipeProps {
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
    options?: { force?: boolean; preventModal?: boolean },
  ) => void;
  isGenerating: boolean;
  images?: GeneratedImageWithConfig[];
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
const PACK_THEMES: Record<string, StyleTheme> = {
  [USER_STYLE_PACK_ID]: {
    color: 'sky',
    bg: 'bg-sky-500',
    border: 'border-sky-500',
    text: 'text-sky-400',
  },
  [FAVORITES_PACK_ID]: {
    color: 'rose',
    bg: 'bg-rose-600',
    border: 'border-rose-600',
    text: 'text-rose-500',
  },
  pack_01: {
    color: 'cyan',
    bg: 'bg-cyan-500',
    border: 'border-cyan-500',
    text: 'text-cyan-400',
  }, // Photography & Realism
  pack_02: {
    color: 'indigo',
    bg: 'bg-indigo-500',
    border: 'border-indigo-500',
    text: 'text-indigo-400',
  }, // Cinematic & Media
  pack_03: {
    color: 'rose',
    bg: 'bg-rose-500',
    border: 'border-rose-500',
    text: 'text-rose-400',
  }, // 3D & CGI Rendering
  pack_04: {
    color: 'fuchsia',
    bg: 'bg-fuchsia-500',
    border: 'border-fuchsia-500',
    text: 'text-fuchsia-400',
  }, // Illustration & Graphic Novel
  pack_05: {
    color: 'red',
    bg: 'bg-red-600',
    border: 'border-red-600',
    text: 'text-red-500',
  }, // Anime & Manga Universes
  pack_06: {
    color: 'amber',
    bg: 'bg-amber-500',
    border: 'border-amber-500',
    text: 'text-amber-400',
  }, // Essential Art Styles
  pack_07: {
    color: 'emerald',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
  }, // Architecture & Interior
  pack_08: {
    color: 'violet',
    bg: 'bg-violet-500',
    border: 'border-violet-500',
    text: 'text-violet-400',
  }, // Fashion & Costume
  pack_09: {
    color: 'lime',
    bg: 'bg-lime-500',
    border: 'border-lime-500',
    text: 'text-lime-400',
  }, // Texture & Materiality
  pack_10: {
    color: 'blue',
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    text: 'text-blue-400',
  }, // Abstract & Experimental
  pack_11: {
    color: 'orange',
    bg: 'bg-orange-500',
    border: 'border-orange-500',
    text: 'text-orange-400',
  }, // Miscellaneous & Fun
  pack_12: {
    color: 'emerald',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
  }, // Video Game Originals Vault
  pack_13: {
    color: 'pink',
    bg: 'bg-pink-500',
    border: 'border-pink-500',
    text: 'text-pink-400',
  }, // Anime Character & Lifestyle
  pack_14: {
    color: 'violet',
    bg: 'bg-violet-500',
    border: 'border-violet-500',
    text: 'text-violet-400',
  }, // Mythic Noir Curated Vault
  pack_15: {
    color: 'teal',
    bg: 'bg-teal-500',
    border: 'border-teal-500',
    text: 'text-teal-400',
  }, // Punk Spectrum Vault
  pack_16: {
    color: 'rose',
    bg: 'bg-rose-500',
    border: 'border-rose-500',
    text: 'text-rose-400',
  }, // Anime Classics & Prestige
  pack_17: {
    color: 'green',
    bg: 'bg-green-500',
    border: 'border-green-500',
    text: 'text-green-400',
  }, // Medieval Fantasy & Dungeon Zine
};

const COLLECTION_FAMILY_THEMES: Record<string, StyleTheme> = {
  personal: PACK_THEMES[USER_STYLE_PACK_ID],
  capture_reality: PACK_THEMES.pack_01,
  screen_motion: PACK_THEMES.pack_02,
  illustration_art_media: PACK_THEMES.pack_04,
  design_assets_materials: PACK_THEMES.pack_09,
  worlds_genres: PACK_THEMES.pack_15,
  experimental_play: PACK_THEMES.pack_10,
};

interface CategoryVisualIdentity {
  icon: React.ReactNode;
  accentClassName: string;
  titleClassName: string;
}

function normalizeCategoryIdFromTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/^\d+\.\s*/, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getCategoryVisualIdentity(
  packId: string,
  categoryTitle: string,
): CategoryVisualIdentity | null {
  const size = 12;
  const categoryId = normalizeCategoryIdFromTitle(categoryTitle);

  if (packId === 'pack_12') {
    switch (categoryId) {
      case 'neon-urban-and-night-ops':
        return {
          icon: <Tv size={size} />,
          accentClassName: 'bg-cyan-500',
          titleClassName: 'text-cyan-300',
        };
      case 'arcane-temples-and-mythic-realms':
        return {
          icon: <Wand2 size={size} />,
          accentClassName: 'bg-violet-500',
          titleClassName: 'text-violet-300',
        };
      case 'sci-fi-frontiers-and-mech-zones':
        return {
          icon: <Box size={size} />,
          accentClassName: 'bg-blue-500',
          titleClassName: 'text-blue-300',
        };
      case 'sieges-warfronts-and-last-stands':
        return {
          icon: <Building size={size} />,
          accentClassName: 'bg-red-500',
          titleClassName: 'text-red-300',
        };
      case 'speed-sport-and-competitive-arenas':
        return {
          icon: <SlidersHorizontal size={size} />,
          accentClassName: 'bg-amber-500',
          titleClassName: 'text-amber-300',
        };
      case 'wilderness-hunts-and-harsh-frontiers':
        return {
          icon: <Archive size={size} />,
          accentClassName: 'bg-lime-500',
          titleClassName: 'text-lime-300',
        };
      case 'heists-horror-and-underworld-runs':
        return {
          icon: <Briefcase size={size} />,
          accentClassName: 'bg-rose-500',
          titleClassName: 'text-rose-300',
        };
      case 'puzzle-chambers-and-adventure-setpieces':
        return {
          icon: <Layers size={size} />,
          accentClassName: 'bg-indigo-500',
          titleClassName: 'text-indigo-300',
        };
      default:
        return null;
    }
  }

  return null;
}

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { startViewTransition } from '../../utils/transitionUtils';

function getStyleTabHash(tabId: StyleTabId) {
  return getStyleTabHashForRoute(tabId, STYLE_TAB_ROUTE_OPTIONS);
}

function writeStyleTabHash(tabId: StyleTabId, mode: 'push' | 'replace' = 'push') {
  const nextHash = `#${getStyleTabHash(tabId)}`;
  if (window.location.hash === nextHash) return;

  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
  if (mode === 'replace') {
    window.history.replaceState(null, '', nextUrl);
    return;
  }

  window.location.hash = nextHash.slice(1);
}

function createStylePresetVisualState({
  preset,
  presetPackId,
  presetPackName,
  images,
}: {
  preset: StyleRuntimePreset;
  presetPackId: string;
  presetPackName: string;
  images: GeneratedImageWithConfig[];
}): StylePresetVisualState {
  const resultImages = images
    .filter((img) => hasStylePresetIdentity(img.config, preset.id))
    .sort((a, b) => b.createdAt - a.createdAt);
  const defaultImageStale = isStyleDefaultImageStale(preset.id);
  const defaultImage = resolveStyleDefaultImageThumbnail(preset.id);
  const defaultImageVariants = resolveStyleDefaultImageVariantThumbnails(preset.id);
  const categoryImage = preset.category
    ? (STYLE_CARD_THUMBNAILS[styleCategoryImageKey(presetPackId, preset.category)] ??
      STYLE_CATEGORY_IMAGES[styleCategoryImageKey(presetPackId, preset.category)])
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
      defaultImageVariants[0] ||
      previewImage ||
      null,
  };
}

function resolveStylePresetPrimaryCardImage(visualState: StylePresetVisualState | undefined) {
  if (!visualState) return null;

  return (
    resolveStylePresetCardImages({
      resultImages: visualState.resultImages,
      defaultImage: visualState.defaultImage,
      defaultImageVariants: visualState.defaultImageVariants,
      defaultImageStale: visualState.defaultImageStale,
      previewImage: visualState.previewImage,
    })[0] ?? null
  );
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
          className="aspect-[3/4] rounded-[6px] border border-white/[0.055] bg-zinc-900/32 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
        >
          <div className="h-full rounded-[6px] bg-linear-to-b from-white/[0.035] via-transparent to-black/20" />
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

type StyleImageGsap = typeof import('../../lib/motionRuntime').default;

const STYLE_IMAGE_FADE_DURATION_SECONDS = 0.26;
const STYLE_IMAGE_FADE_SCALE = 1.01;
const STYLE_IMAGE_FADE_CLEAR_PROPS = 'opacity,visibility,transform';
const STYLE_IMAGE_FADE_GSAP_FALLBACK_MS = 700;

let styleImageGsapPromise: Promise<StyleImageGsap> | null = null;

function loadStyleImageGsap() {
  styleImageGsapPromise ??= import('../../lib/motionRuntime').then((module) => module.default);
  return styleImageGsapPromise;
}

function readStyleImageOpacity(node: HTMLImageElement) {
  if (typeof window === 'undefined') return 1;
  const opacity = Number.parseFloat(window.getComputedStyle(node).opacity);
  return Number.isFinite(opacity) ? opacity : 1;
}

function shouldReduceStyleImageMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function primeStyleImageFade(node: HTMLImageElement, fadeScale: number) {
  node.style.opacity = '0';
  node.style.visibility = 'hidden';
  node.style.transform = `scale(${fadeScale})`;
  node.style.transformOrigin = '50% 50%';
  node.style.willChange = 'transform, opacity';
}

function clearStyleImageFadeState(node: HTMLImageElement, runtime?: StyleImageGsap | null) {
  if (runtime) {
    runtime.set(node, {
      clearProps: STYLE_IMAGE_FADE_CLEAR_PROPS,
      willChange: 'auto',
    });
    return;
  }

  node.style.removeProperty('opacity');
  node.style.removeProperty('visibility');
  node.style.removeProperty('transform');
  node.style.willChange = 'auto';
}

const StyleFadeImage = React.memo(function StyleFadeImage({
  fadeDuration = STYLE_IMAGE_FADE_DURATION_SECONDS,
  fadeScale = STYLE_IMAGE_FADE_SCALE,
  src,
  ...imageProps
}: StyleFadeImageProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);

  useLayoutEffect(() => {
    const node = imageRef.current;
    if (!node) return undefined;

    if (shouldReduceStyleImageMotion()) {
      clearStyleImageFadeState(node);
      return undefined;
    }

    let disposed = false;
    let fallbackVisible = false;
    let runtime: StyleImageGsap | null = null;
    let context: { revert: () => void } | null = null;
    const targetOpacity = readStyleImageOpacity(node);

    const showWithoutMotion = () => {
      if (disposed || fallbackVisible || runtime) return;
      fallbackVisible = true;
      clearStyleImageFadeState(node);
    };
    let fallbackTimer = window.setTimeout(() => {
      if (node.complete) showWithoutMotion();
    }, STYLE_IMAGE_FADE_GSAP_FALLBACK_MS);
    const scheduleFallback = () => {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = window.setTimeout(() => {
        if (node.complete) showWithoutMotion();
      }, STYLE_IMAGE_FADE_GSAP_FALLBACK_MS);
    };

    const revealImage = () => {
      if (disposed || fallbackVisible) return;
      if (!runtime) return;
      if (node.naturalWidth <= 0) {
        clearStyleImageFadeState(node, runtime);
        return;
      }

      runtime.killTweensOf(node);
      runtime.fromTo(
        node,
        {
          autoAlpha: 0,
          scale: fadeScale,
        },
        {
          autoAlpha: targetOpacity,
          scale: 1,
          duration: fadeDuration,
          ease: 'power2.out',
          overwrite: 'auto',
          onStart: () => {
            runtime?.set(node, { willChange: 'transform, opacity' });
          },
          onComplete: () => clearStyleImageFadeState(node, runtime),
        },
      );
    };

    const handleLoad = () => {
      if (runtime) {
        revealImage();
        return;
      }
      scheduleFallback();
    };
    const handleError = () => {
      fallbackVisible = true;
      clearStyleImageFadeState(node, runtime);
    };

    primeStyleImageFade(node, fadeScale);

    if (!node.complete) {
      node.addEventListener('load', handleLoad, { once: true });
      node.addEventListener('error', handleError, { once: true });
    }

    void loadStyleImageGsap().then((loadedRuntime) => {
      if (disposed || fallbackVisible) return;
      runtime = loadedRuntime;
      context = loadedRuntime.context(() => {
        loadedRuntime.killTweensOf(node);
        loadedRuntime.set(node, {
          autoAlpha: 0,
          scale: fadeScale,
          transformOrigin: '50% 50%',
          willChange: 'transform, opacity',
        });
      }, node);

      if (node.complete) revealImage();
    });

    return () => {
      disposed = true;
      window.clearTimeout(fallbackTimer);
      node.removeEventListener('load', handleLoad);
      node.removeEventListener('error', handleError);
      runtime?.killTweensOf(node);
      context?.revert();
      clearStyleImageFadeState(node, runtime);
    };
  }, [fadeDuration, fadeScale, src]);

  return <img ref={imageRef} src={src} alt="" data-style-fade-image {...imageProps} />;
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

    useEffect(() => {
      setGridWindow(createInitialGridWindow());
    }, [createInitialGridWindow]);

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
          className={`sticky top-0 z-30 mb-2 flex items-center gap-2 border-y border-white/5 bg-zinc-950/92 px-2 py-2 shadow-[0_10px_18px_rgba(0,0,0,0.28)] ${headerClassName}`}
        >
          <div className={`h-4 w-1 rounded-[2px] ${accentClassName}`} />
          {icon ? <span className="text-zinc-400">{icon}</span> : null}
          <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${titleClassName}`}>
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
            className="relative overflow-hidden rounded-[6px] border border-white/5 bg-zinc-950/20 p-2"
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

function getPackIcon(id: string): React.ReactNode {
  const size = 18;
  switch (id) {
    case USER_STYLE_PACK_ID:
      return <Sparkles size={size} />;
    case FAVORITES_PACK_ID:
      return <Heart size={size} fill="currentColor" />;
    case 'pack_01':
      return <Camera size={size} />;
    case 'pack_02':
      return <Clapperboard size={size} />;
    case 'pack_03':
      return <Box size={size} />;
    case 'pack_04':
      return <PenTool size={size} />;
    case 'pack_05':
      return <Sword size={size} />;
    case 'pack_06':
      return <Palette size={size} />;
    case 'pack_07':
      return <Building size={size} />;
    case 'pack_08':
      return <Shirt size={size} />;
    case 'pack_09':
      return <Layers size={size} />;
    case 'pack_10':
      return <Wand2 size={size} />;
    case 'pack_11':
      return <SmilePlus size={size} />;
    case 'pack_12':
      return <Gamepad2 size={size} />;
    case 'pack_13':
      return <Heart size={size} />;
    case 'pack_14':
      return <MoonStars size={size} />;
    case 'pack_15':
      return <Bolt size={size} />;
    case 'pack_16':
      return <Star size={size} />;
    case 'pack_17':
      return <BookOpen size={size} />;
    default:
      return <Layers size={size} />;
  }
}

function getStyleCollectionIcon(icon: string, size = 18): React.ReactNode {
  switch (icon) {
    case 'sparkles':
      return <Sparkles size={size} />;
    case 'heart':
      return <Heart size={size} fill="currentColor" />;
    case 'clock':
      return <Star size={size} />;
    case 'camera':
      return <Camera size={size} />;
    case 'film':
    case 'clapperboard':
      return <Clapperboard size={size} />;
    case 'bolt':
    case 'zap':
      return <Bolt size={size} />;
    case 'scan':
      return <Search size={size} />;
    case 'tv':
      return <Tv size={size} />;
    case 'play':
      return <Play size={size} />;
    case 'book':
      return <BookOpen size={size} />;
    case 'palette':
    case 'brush':
      return <Palette size={size} />;
    case 'pen':
      return <PenTool size={size} />;
    case 'wand':
      return <Wand2 size={size} />;
    case 'box':
      return <Box size={size} />;
    case 'layers':
    case 'grid':
      return <Layers size={size} />;
    case 'shirt':
      return <Shirt size={size} />;
    case 'building':
      return <Building size={size} />;
    case 'gamepad':
      return <Gamepad2 size={size} />;
    case 'moon':
    case 'moon-stars':
      return <MoonStars size={size} />;
    case 'sword':
      return <Sword size={size} />;
    case 'sliders':
      return <SlidersHorizontal size={size} />;
    case 'smile':
      return <SmilePlus size={size} />;
    default:
      return <Layers size={size} />;
  }
}

function getStyleCollectionTheme(collection: StyleCollection): StyleTheme {
  return COLLECTION_FAMILY_THEMES[collection.familyId] ?? PACK_THEMES.pack_01;
}

interface UserStyleEditorSession {
  id: number;
  mode: 'create' | 'edit';
  draft: UserStylePresetDraft;
  source: UserStylePresetSource | null;
  editingStyleId?: string;
}

// react-doctor-disable-next-line react-doctor/no-giant-component
export const StylesRecipe: React.FC<StylesRecipeProps> = ({
  config,
  updateConfig,
  onFileSelect,
  onGenerate,
  isGenerating,
  images = EMPTY_IMAGES,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceImages = config.attachments.slice(0, MAX_STYLE_REFERENCE_IMAGES);
  const referenceSlotsRemaining = Math.max(0, MAX_STYLE_REFERENCE_IMAGES - referenceImages.length);

  const [currentPackId, setCurrentPackId] = useState(DEFAULT_STYLE_PACK_ID);
  const [isPackLandingOpen, setIsPackLandingOpen] = useState(true);
  const currentStyleTabRef = useRef<StyleTabId>(STYLE_PACKS_TAB_ID);
  const [loadedStylePacksById, setLoadedStylePacksById] = useState<
    Record<string, StyleRuntimePack>
  >({});
  const [selectedStyles, setSelectedStyles] = useState<SelectedStyleSlot[]>([]);
  const [isAdvancedStyleControlsOpen, setIsAdvancedStyleControlsOpen] = useState(false);
  const [userStylePresets, setUserStylePresets] = useState<UserStylePreset[]>([]);
  const [isLoadingUserStyles, setIsLoadingUserStyles] = useState(false);
  const [userStyleError, setUserStyleError] = useState<string | null>(null);
  const [userStyleEditorSession, setUserStyleEditorSession] =
    useState<UserStyleEditorSession | null>(null);
  const [styleCollectionsModule, setStyleCollectionsModule] =
    useState<StyleCollectionsModule | null>(null);
  const [interactionState, setInteractionState] = useState({
    activePresetId: null as string | null,
    copiedStyleId: null as string | null,
    hoveredPresetPreview: null as StyleCardHoverPreview | null,
  });
  const { copiedStyleId, hoveredPresetPreview } = interactionState;
  const selectedStyleIds = useMemo(
    () => new Set(selectedStyles.map((slot) => slot.preset.id)),
    [selectedStyles],
  );
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
  const [browserState, setBrowserState] = useState({
    searchQuery: '',
    sortOrder: 'source' as StyleBrowserSortOrder,
    viewMode: 'grouped' as StyleBrowserViewMode,
    showFavoritesOnly: false,
    isCatalogSearchOpen: false,
    styleScrollWidth: 0,
  });
  const {
    searchQuery,
    sortOrder,
    viewMode,
    showFavoritesOnly,
    isCatalogSearchOpen,
    styleScrollWidth,
  } = browserState;
  const normalizedStyleSearchQuery = searchQuery.trim();
  const isGlobalStyleSearchActive = normalizedStyleSearchQuery.length > 0;
  const activeSortOption =
    STYLE_BROWSER_SORT_OPTIONS.find((option) => option.value === sortOrder) ??
    STYLE_BROWSER_SORT_OPTIONS[0];
  const isAllStyleCategoriesTab = currentPackId === ALL_STYLE_CATEGORIES_TAB_ID;
  const isAllStyleCardsTab = currentPackId === ALL_STYLE_CARDS_TAB_ID;
  const isGlobalStyleBrowseTab = isAllStyleCategoriesTab || isAllStyleCardsTab;
  const activeStyleViewMode: StyleBrowserViewMode = isAllStyleCardsTab
    ? 'flat'
    : isAllStyleCategoriesTab
      ? 'grouped'
      : viewMode;
  const [favorites, setFavorites] = useLocalStorage<string[]>('style-favorites', []);
  const [gridColumns, setGridColumns] = useLocalStorage<number>('styles-grid-columns', 4);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [stylePanelVisibility, setStylePanelVisibility] = useLocalStorage<
    Partial<StylePanelVisibility>
  >('styles-panel-visibility', DEFAULT_STYLE_PANEL_VISIBILITY);
  const isReferencePanelOpen = stylePanelVisibility.references !== false;
  const isStyleNavigationPanelOpen = stylePanelVisibility.navigation !== false;
  const isStyleSlotsPanelOpen = stylePanelVisibility.slots !== false;
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

  const applyStyleTab = useCallback(
    (
      tabId: StyleTabId,
      options: {
        resetSearch?: boolean;
        browserStatePatch?: Partial<typeof browserState>;
      } = {},
    ) => {
      const normalizedTabId = normalizeStyleTabRouteId(tabId, STYLE_TAB_ROUTE_OPTIONS);
      const tabBrowserStatePatch =
        normalizedTabId === ALL_STYLE_CARDS_TAB_ID
          ? ({
              showFavoritesOnly: false,
              sortOrder: 'source',
              viewMode: 'flat',
            } satisfies Partial<typeof browserState>)
          : normalizedTabId === ALL_STYLE_CATEGORIES_TAB_ID
            ? ({
                showFavoritesOnly: false,
                sortOrder: 'source',
                viewMode: 'grouped',
              } satisfies Partial<typeof browserState>)
            : {};
      currentStyleTabRef.current = normalizedTabId;

      startViewTransition(
        () => {
          if (normalizedTabId === STYLE_PACKS_TAB_ID) {
            setIsPackLandingOpen(true);
          } else {
            setIsPackLandingOpen(false);
            setCurrentPackId(normalizedTabId);
          }

          if (
            options.resetSearch ||
            options.browserStatePatch ||
            Object.keys(tabBrowserStatePatch).length > 0
          ) {
            setBrowserState((prev) => ({
              ...prev,
              ...(options.resetSearch ? { searchQuery: '' } : {}),
              ...tabBrowserStatePatch,
              ...options.browserStatePatch,
            }));
          }
        },
        { useNative: true },
      );
    },
    [],
  );

  const navigateToStyleTab = useCallback(
    (tabId: StyleTabId) => {
      const normalizedTabId = normalizeStyleTabRouteId(tabId, STYLE_TAB_ROUTE_OPTIONS);
      applyStyleTab(normalizedTabId, { resetSearch: true });
      writeStyleTabHash(normalizedTabId);
    },
    [applyStyleTab],
  );

  useEffect(() => {
    const syncStyleTabFromHash = () => {
      const hashTabId = readStyleTabIdFromRouteHash(window.location.hash, STYLE_TAB_ROUTE_OPTIONS);
      if (!hashTabId) return;

      if (window.location.hash === `#${STYLE_RECIPE_HASH_PREFIX}`) {
        writeStyleTabHash(hashTabId, 'replace');
      }

      if (currentStyleTabRef.current === hashTabId) return;
      applyStyleTab(hashTabId, { resetSearch: true });
    };

    syncStyleTabFromHash();
    window.addEventListener('hashchange', syncStyleTabFromHash);
    return () => window.removeEventListener('hashchange', syncStyleTabFromHash);
  }, [applyStyleTab]);

  const cacheStylePack = useCallback((pack: StyleRuntimePack) => {
    setLoadedStylePacksById((current) =>
      current[pack.id] === pack ? current : { ...current, [pack.id]: pack },
    );
  }, []);

  const refreshUserStyles = useCallback(async () => {
    setIsLoadingUserStyles(true);
    setUserStyleError(null);
    try {
      const response = await listUserStylePresets();
      setUserStylePresets(response.styles);
    } catch (error) {
      setUserStyleError(error instanceof Error ? error.message : 'Could not load user styles.');
    } finally {
      setIsLoadingUserStyles(false);
    }
  }, []);

  useEffect(() => {
    void refreshUserStyles();
  }, [refreshUserStyles]);

  useEffect(() => {
    if (styleCollectionsModule) return;

    let cancelled = false;
    void import('./styles/collections').then((module) => {
      if (!cancelled) setStyleCollectionsModule(module);
    });
    return () => {
      cancelled = true;
    };
  }, [styleCollectionsModule]);

  useEffect(() => {
    if (
      getStyleCollectionIdFromTabId(currentPackId) ||
      isGlobalStyleBrowseTab ||
      currentPackId === FAVORITES_PACK_ID ||
      currentPackId === USER_STYLE_PACK_ID ||
      loadedStylePacksById[currentPackId]
    ) {
      return;
    }

    let cancelled = false;
    void loadStyleRuntimePack(currentPackId).then((pack) => {
      if (!cancelled && pack) cacheStylePack(pack);
    });
    return () => {
      cancelled = true;
    };
  }, [cacheStylePack, currentPackId, isGlobalStyleBrowseTab, loadedStylePacksById]);

  const activeStyleCollectionId = getStyleCollectionIdFromTabId(currentPackId);
  const activeStyleCollection = useMemo(() => {
    if (!activeStyleCollectionId || !styleCollectionsModule) return null;
    return (
      styleCollectionsModule.STYLE_COLLECTIONS.find(
        (collection) => collection.id === activeStyleCollectionId && collection.entries.length > 0,
      ) ?? null
    );
  }, [activeStyleCollectionId, styleCollectionsModule]);

  useEffect(() => {
    if (!activeStyleCollection) return;
    const missingPackIds = activeStyleCollection.sourcePackIds.filter(
      (packId) => STYLE_RUNTIME_PACK_IDS.includes(packId) && !loadedStylePacksById[packId],
    );
    if (missingPackIds.length === 0) return;

    let cancelled = false;
    void Promise.all(missingPackIds.map((packId) => loadStyleRuntimePack(packId))).then((packs) => {
      if (cancelled) return;
      setLoadedStylePacksById((current) => {
        const next = { ...current };
        for (const pack of packs) {
          if (pack) next[pack.id] = pack;
        }
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [activeStyleCollection, loadedStylePacksById]);

  useEffect(() => {
    if (!isGlobalStyleBrowseTab) return;
    if (STYLE_RUNTIME_PACK_IDS.every((packId) => loadedStylePacksById[packId])) return;

    let cancelled = false;
    void loadStyleRuntimePacks().then((packs) => {
      if (cancelled) return;
      setLoadedStylePacksById((current) => {
        const next = { ...current };
        for (const pack of packs) next[pack.id] = pack;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [isGlobalStyleBrowseTab, loadedStylePacksById]);

  useEffect(() => {
    if (currentPackId !== FAVORITES_PACK_ID || favorites.length === 0) return;

    let cancelled = false;
    void loadStyleRuntimePacks().then((packs) => {
      if (cancelled) return;
      setLoadedStylePacksById((current) => {
        const next = { ...current };
        for (const pack of packs) next[pack.id] = pack;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [currentPackId, favorites.length]);

  useEffect(() => {
    if (!isGlobalStyleSearchActive) return;
    if (activeStyleCollectionId) return;
    if (STYLE_RUNTIME_PACK_IDS.every((packId) => loadedStylePacksById[packId])) return;

    let cancelled = false;
    void loadStyleRuntimePacks().then((packs) => {
      if (cancelled) return;
      setLoadedStylePacksById((current) => {
        const next = { ...current };
        for (const pack of packs) next[pack.id] = pack;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [activeStyleCollectionId, isGlobalStyleSearchActive, loadedStylePacksById]);

  const toggleFavorite = React.useCallback(
    (presetId: string) => {
      setFavorites((prev) =>
        prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId],
      );
    },
    [setFavorites],
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

    const updateWidth = () =>
      setBrowserState((prev) => ({ ...prev, styleScrollWidth: node.clientWidth }));
    // react-doctor-disable-next-line react-doctor/no-initialize-state
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => updateConfig('recipeContext', '');
  }, [updateConfig]);

  useEffect(() => {
    return () => {
      updateConfig('recipeId', null);
      updateConfig('recipeParams', null);
      updateConfig('recipeContext', '');
    };
  }, [updateConfig]);

  const recipePresetId =
    config.recipeId === 'styles' &&
    config.recipeParams &&
    typeof config.recipeParams.presetId === 'string'
      ? config.recipeParams.presetId
      : null;
  const prevRecipePresetIdRef = useRef(recipePresetId);
  if (recipePresetId && recipePresetId !== prevRecipePresetIdRef.current) {
    prevRecipePresetIdRef.current = recipePresetId;
    setInteractionState((prev) => ({ ...prev, activePresetId: recipePresetId }));
  }

  const userStylePack = useMemo(
    () => createUserStyleRuntimePack(userStylePresets),
    [userStylePresets],
  );
  const userStylePresetById = useMemo(
    () => new Map(userStylePresets.map((style) => [style.id, style])),
    [userStylePresets],
  );
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
  const globalStylePresetCount = globalStylePacks.reduce(
    (total, pack) => total + pack.presets.length,
    0,
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
  const activePack = useMemo(() => {
    if (isGlobalStyleBrowseTab) {
      return {
        id: currentPackId,
        name: isAllStyleCardsTab ? 'All Style Cards' : 'All Style Categories',
        description: allRuntimeStylePacksLoaded
          ? isAllStyleCardsTab
            ? `${globalStylePresetCount} cards from every style pack.`
            : `${globalStyleCategoryCount} categories from every style pack.`
          : 'Loading the full style catalog.',
        presets: globalStylePacks.flatMap((pack) => pack.presets),
      } satisfies StyleRuntimePack;
    }

    if (activeStyleCollectionId) {
      if (!activeStyleCollection || !styleCollectionsModule) {
        return {
          id: getStyleCollectionTabId(activeStyleCollectionId),
          name: 'Style Collection',
          description: 'Loading style collection.',
          presets: [],
        } satisfies StyleRuntimePack;
      }

      const sourcePacks = activeStyleCollection.sourcePackIds.flatMap((packId) => {
        if (packId === USER_STYLE_PACK_ID) return [userStylePack];
        const pack = loadedStylePacksById[packId];
        return pack ? [pack] : [];
      });
      const missingSourcePack = activeStyleCollection.sourcePackIds.some(
        (packId) => STYLE_RUNTIME_PACK_IDS.includes(packId) && !loadedStylePacksById[packId],
      );

      if (missingSourcePack) {
        return {
          id: getStyleCollectionTabId(activeStyleCollection.id),
          name: activeStyleCollection.title,
          description: 'Loading source packs for this style collection.',
          presets: [],
        } satisfies StyleRuntimePack;
      }

      const resolved = styleCollectionsModule.resolveStyleCollection(
        activeStyleCollection,
        styleCollectionsModule.createStyleCollectionSourceIndex(sourcePacks),
      );
      return {
        id: getStyleCollectionTabId(activeStyleCollection.id),
        name: activeStyleCollection.title,
        description: activeStyleCollection.description,
        presets: resolved.presets.map((item) => item.preset),
      } satisfies StyleRuntimePack;
    }

    if (currentPackId === FAVORITES_PACK_ID) {
      return {
        id: FAVORITES_PACK_ID,
        name: 'Your Favorites',
        description: 'A curated collection of your most used styles.',
        presets: [], // Placeholder, populated in processedData
      } satisfies StyleRuntimePack;
    }
    if (currentPackId === USER_STYLE_PACK_ID) return userStylePack;
    const summary =
      STYLE_RUNTIME_PACK_SUMMARIES.find((pack) => pack.id === currentPackId) ??
      STYLE_RUNTIME_PACK_SUMMARIES[0];
    return (
      loadedStylePacksById[currentPackId] ??
      ({
        id: summary?.id ?? DEFAULT_STYLE_PACK_ID,
        name: summary?.name ?? 'Styles',
        description: summary?.description ?? 'Loading style presets.',
        presets: [],
      } satisfies StyleRuntimePack)
    );
  }, [
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
    styleCollectionsModule,
    userStylePack,
  ]);

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
  const resolvedHoveredPresetPreview = hoveredPresetPreview;
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

  const favoritePresets = useMemo(() => {
    const presetById = new Map<string, StyleRuntimePreset>();
    for (const pack of orderedLoadedStylePacks) {
      for (const preset of pack.presets) presetById.set(preset.id, preset);
    }
    return favorites.flatMap((presetId) => {
      const preset = presetById.get(presetId);
      return preset ? [preset] : [];
    });
  }, [favorites, orderedLoadedStylePacks]);

  const getPackIdForPreset = React.useCallback(
    (preset: StyleRuntimePreset) => {
      return (
        presetPackIdById.get(preset.id) ??
        (currentPackId !== FAVORITES_PACK_ID ? currentPackId : activePack.id)
      );
    },
    [activePack.id, currentPackId, presetPackIdById],
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

  const selectedStyleVisualStateById = useMemo(() => {
    const stateMap = new Map<string, StylePresetVisualState>();

    selectedStyles.forEach((slot) => {
      stateMap.set(
        slot.preset.id,
        createStylePresetVisualState({
          preset: slot.preset,
          presetPackId: slot.packId,
          presetPackName: slot.packName,
          images,
        }),
      );
    });

    return stateMap;
  }, [images, selectedStyles]);

  const filterKey = `${currentPackId}|${searchQuery}|${sortOrder}|${activeStyleViewMode}|${showFavoritesOnly}`;
  const prevFilterKeyRef = useRef(filterKey);
  if (prevFilterKeyRef.current !== filterKey) {
    prevFilterKeyRef.current = filterKey;
    setInteractionState((prev) => ({ ...prev, hoveredPresetPreview: null }));
  }

  const processedData = useMemo(
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

  const presetVisualStateById = useMemo(() => {
    const stateMap = new Map<string, StylePresetVisualState>();

    filteredStylePresets.forEach((preset) => {
      const presetPackId = getPackIdForPreset(preset);
      const presetPack =
        presetPackId === USER_STYLE_PACK_ID
          ? userStylePack
          : (loadedStylePacksById[presetPackId] ?? activePack);
      stateMap.set(
        preset.id,
        createStylePresetVisualState({
          preset,
          presetPackId,
          presetPackName: presetPack.name,
          images,
        }),
      );
    });

    return stateMap;
  }, [
    activePack,
    filteredStylePresets,
    getPackIdForPreset,
    images,
    loadedStylePacksById,
    userStylePack,
  ]);

  const stylePreviewPreloadSources = useMemo(
    () =>
      collectStylePresetPreviewSources({
        processedData,
        renderPlan: styleRenderPlan,
        visualStateByPresetId: presetVisualStateById,
        gridColumns,
        containerWidth: styleScrollWidth,
      }),
    [gridColumns, processedData, presetVisualStateById, styleRenderPlan, styleScrollWidth],
  );

  useEffect(() => {
    stylePreviewPreloadSources.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, [stylePreviewPreloadSources]);

  const handleSelectStyle = useCallback(
    (preset: StyleRuntimePreset, presetPackIdOverride?: string) => {
      const presetPackId = presetPackIdOverride ?? getPackIdForPreset(preset);
      const packName = getPackNameForId(presetPackId);

      setInteractionState((prev) => ({ ...prev, activePresetId: preset.id }));
      setSelectedStyles((current) => {
        if (current.some((slot) => slot.preset.id === preset.id)) {
          return current.filter((slot) => slot.preset.id !== preset.id);
        }
        if (current.length >= MAX_SELECTED_STYLE_SLOTS) {
          return current;
        }
        return [
          ...current,
          {
            preset,
            packId: presetPackId,
            packName,
            strength: DEFAULT_SELECTED_STYLE_STRENGTH,
            enabled: true,
            fieldControls: createDefaultStyleLayerFieldControls(),
            avoidRulesMode: 'merge',
          },
        ];
      });
    },
    [getPackIdForPreset, getPackNameForId],
  );

  const handleApplyStyleRef = useRef(handleSelectStyle);
  handleApplyStyleRef.current = handleSelectStyle;

  const selectedStyleLayers = useMemo(
    () => selectedStyles.map(createSelectedStyleLayer),
    [selectedStyles],
  );
  const activeSelectedStyleCount = selectedStyleLayers.filter((layer) => layer.enabled).length;
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

  const openUserStyleEditor = useCallback(
    (
      mode: UserStyleEditorSession['mode'],
      draft: UserStylePresetDraft,
      source: UserStylePresetSource | null,
      editingStyleId?: string,
    ) => {
      setUserStyleEditorSession({
        id: Date.now(),
        mode,
        draft,
        source,
        editingStyleId,
      });
    },
    [],
  );

  const handleCreateUserStyle = useCallback(() => {
    void import('./userStyleDraftBuilders').then(({ createEmptyUserStyleDraft }) => {
      openUserStyleEditor('create', createEmptyUserStyleDraft(), {
        kind: 'manual',
        note: 'Created manually in Style Editor.',
      });
    });
  }, [openUserStyleEditor]);

  const handleSaveSelectedStyleBlend = useCallback(() => {
    if (activeSelectedStyleCount === 0) return;
    void import('./userStyleDraftBuilders').then(({ createUserStyleDraftFromBlend }) => {
      openUserStyleEditor(
        'create',
        createUserStyleDraftFromBlend(selectedStyles, selectedStyleLayers),
        {
          kind: 'blend',
          note: 'Saved from selected style slots.',
          data: {
            styles: selectedStyleLayers
              .filter((layer) => layer.enabled)
              .map((layer) => ({
                presetId: layer.presetId,
                presetName: layer.presetName,
                packId: layer.packId,
                packName: layer.packName,
                strength: layer.strength,
              })),
          },
        },
      );
    });
  }, [activeSelectedStyleCount, openUserStyleEditor, selectedStyleLayers, selectedStyles]);

  const handleCloneActiveStyle = useCallback(() => {
    if (!activePreset || !activePresetPackId || activePresetPackId === USER_STYLE_PACK_ID) return;
    const packName = getPackNameForId(activePresetPackId);
    void import('./userStyleDraftBuilders').then(({ createUserStyleDraftFromRuntimePreset }) => {
      openUserStyleEditor(
        'create',
        createUserStyleDraftFromRuntimePreset(activePreset, activePresetPackId, packName),
        {
          kind: 'clone',
          presetId: activePreset.id,
          packId: activePresetPackId,
          note: `Cloned from ${packName}.`,
          data: { presetName: activePreset.name, packName },
        },
      );
    });
  }, [activePreset, activePresetPackId, getPackNameForId, openUserStyleEditor]);

  const handleEditActiveUserStyle = useCallback(() => {
    if (!activeUserStyle) return;
    void import('./userStyleDraftBuilders').then(({ createUserStyleDraftFromUserStyle }) => {
      openUserStyleEditor(
        'edit',
        createUserStyleDraftFromUserStyle(activeUserStyle),
        activeUserStyle.source,
        activeUserStyle.id,
      );
    });
  }, [activeUserStyle, openUserStyleEditor]);

  const handleUserStyleSaved = useCallback(
    (style: UserStylePreset) => {
      setUserStyleEditorSession(null);
      setInteractionState((prev) => ({ ...prev, activePresetId: style.id }));
      navigateToStyleTab(USER_STYLE_PACK_ID);
      void refreshUserStyles();
    },
    [navigateToStyleTab, refreshUserStyles],
  );

  const handleUserStyleArchived = useCallback(
    (style: UserStylePreset) => {
      setUserStyleEditorSession(null);
      setSelectedStyles((current) => current.filter((slot) => slot.preset.id !== style.id));
      setInteractionState((prev) => ({
        ...prev,
        activePresetId: prev.activePresetId === style.id ? null : prev.activePresetId,
      }));
      navigateToStyleTab(USER_STYLE_PACK_ID);
      void refreshUserStyles();
    },
    [navigateToStyleTab, refreshUserStyles],
  );

  const updateSelectedStyleStrength = useCallback((presetId: string, strength: number) => {
    setSelectedStyles((current) =>
      current.map((slot) =>
        slot.preset.id === presetId ? { ...slot, strength: clampStyleStrength(strength) } : slot,
      ),
    );
  }, []);

  const toggleSelectedStyleEnabled = useCallback((presetId: string) => {
    setSelectedStyles((current) =>
      current.map((slot) =>
        slot.preset.id === presetId ? { ...slot, enabled: !(slot.enabled ?? true) } : slot,
      ),
    );
  }, []);

  const toggleSelectedStyleField = useCallback((presetId: string, fieldId: StyleLayerFieldId) => {
    setSelectedStyles((current) =>
      current.map((slot) => {
        if (slot.preset.id !== presetId) return slot;
        const controls = {
          ...createDefaultStyleLayerFieldControls(),
          ...slot.fieldControls,
        };
        const currentField = controls[fieldId] ?? { enabled: true, weight: 1 };
        return {
          ...slot,
          fieldControls: {
            ...controls,
            [fieldId]: {
              ...currentField,
              enabled: !currentField.enabled,
            },
          },
        };
      }),
    );
  }, []);

  const updateSelectedStyleFieldWeight = useCallback(
    (presetId: string, fieldId: StyleLayerFieldId, weight: number) => {
      setSelectedStyles((current) =>
        current.map((slot) => {
          if (slot.preset.id !== presetId) return slot;
          const controls = {
            ...createDefaultStyleLayerFieldControls(),
            ...slot.fieldControls,
          };
          const currentField = controls[fieldId] ?? { enabled: true, weight: 1 };
          return {
            ...slot,
            fieldControls: {
              ...controls,
              [fieldId]: {
                ...currentField,
                weight: clampStyleLayerFieldWeight(weight),
              },
            },
          };
        }),
      );
    },
    [],
  );

  const setSelectedStyleAvoidRulesMode = useCallback(
    (presetId: string, avoidRulesMode: StyleLayerAvoidRulesMode) => {
      setSelectedStyles((current) =>
        current.map((slot) => (slot.preset.id === presetId ? { ...slot, avoidRulesMode } : slot)),
      );
    },
    [],
  );

  const removeSelectedStyle = useCallback((presetId: string) => {
    setSelectedStyles((current) => current.filter((slot) => slot.preset.id !== presetId));
  }, []);

  const handleGenerateSelectedStyles = useCallback(() => {
    if (selectedStyles.length === 0) return;

    const layers = selectedStyles.map(createSelectedStyleLayer).filter((layer) => layer.enabled);
    if (layers.length === 0) return;

    const hasReferenceImages = referenceImages.length > 0;
    const diversityPrompts = [
      'Introduce a noticeably different camera distance and framing from previous renders.',
      'Shift scene energy with a different gesture or action beat while preserving the subject intent.',
      'Use a clearly distinct lighting setup and color balance versus prior attempts.',
      'Vary background staging and spatial depth so this render is visibly unique.',
    ] as const;
    const diversityHint = diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)];
    const selectedNames = layers.map((layer) => layer.presetName).join(' + ');
    const roleInstruction = hasReferenceImages
      ? `
        Use the uploaded images as loose semantic references for subject intent.
        DO NOT preserve pose, framing, camera angle, or original composition unless the prompt explicitly asks.
        Re-stage the subject with clearly different gesture, perspective, and environment while applying the selected style layers.
        Make the result feel freshly generated, not a repaint of the input.
      `
      : `
        Synthesize the requested subject from the prompt and selected style layers.
        Make the selected style DNA the primary driver of the visual output.
        Focus on a coherent, high-quality image that exposes the combined aesthetic.
      `;
    const compositionRule = hasReferenceImages
      ? 'Preserve only subject intent from the uploaded references; force substantial variation in pose, camera, composition, lighting, and scene staging.'
      : 'Create a balanced composition from scratch using the selected style layers as the visual system.';
    const styleEmphasis = createSelectedStyleEmphasis(selectedStyles, diversityHint);
    const mergedNegativePrompt = mergeSelectedStyleNegativePrompts({
      baseNegativePrompt: config.negativePrompt,
      slots: selectedStyles,
    });

    onGenerate(
      config.prompt?.trim() || createSelectedStylesPrompt(selectedStyles),
      {
        recipeId: 'styles',
        recipeParams: {
          presetId: layers[0]?.presetId ?? '',
          presetName: selectedNames,
          selectedStyles: layers,
          mode: hasReferenceImages ? 'CREATIVE_REIMAGINING' : 'DIRECT_STYLE_SYNTHESIS',
          roleInstruction: roleInstruction.trim(),
          compositionRule,
          styleEmphasis,
          aesthetic: joinSelectedStyleLayerValue(selectedStyles, 'aesthetic'),
          subjectTreatment: joinSelectedStyleLayerValue(selectedStyles, 'subjectTreatment'),
          colorTone: joinSelectedStyleLayerValue(selectedStyles, 'colorTone'),
          lightingShadow: joinSelectedStyleLayerValue(selectedStyles, 'lightingShadow'),
          textureMaterial: joinSelectedStyleLayerValue(selectedStyles, 'textureMaterial'),
          cameraComposition: joinSelectedStyleLayerValue(selectedStyles, 'cameraComposition'),
          atmosphereMood: joinSelectedStyleLayerValue(selectedStyles, 'atmosphereMood'),
          renderingQuality: joinSelectedStyleLayerValue(selectedStyles, 'renderingQuality'),
          creativeBrief: joinSelectedStyleCreativeBrief(selectedStyles),
        },
        recipeContext: '',
        attachments: referenceImages.map((attachment) => ({
          ...attachment,
          strength: 0.15,
        })),
        model: config.model,
        imageSize: config.imageSize,
        batchCount: config.batchCount,
        aspectRatio: config.aspectRatio,
        executionModel: config.executionModel,
        executionReasoningEffort: config.executionReasoningEffort,
        executionSpeed: config.executionSpeed,
        negativePrompt: mergedNegativePrompt,
      },
      { preventModal: true },
    );
  }, [
    config.aspectRatio,
    config.batchCount,
    config.executionModel,
    config.executionReasoningEffort,
    config.executionSpeed,
    config.imageSize,
    config.model,
    config.negativePrompt,
    config.prompt,
    onGenerate,
    referenceImages,
    selectedStyles,
  ]);

  const handleCloseCatalogSearch = useCallback(
    () => setBrowserState((prev) => ({ ...prev, isCatalogSearchOpen: false })),
    [],
  );

  const handleSelectCatalogPreset = useCallback(
    (result: StylePresetCatalogSearchResult) => {
      applyStyleTab(result.packId, {
        browserStatePatch: {
          searchQuery: result.name,
        },
      });
      writeStyleTabHash(result.packId);
      setInteractionState((prev) => ({ ...prev, activePresetId: result.id }));
      setBrowserState((prev) => ({ ...prev, isCatalogSearchOpen: false }));
    },
    [applyStyleTab],
  );

  const handleApplyCatalogPreset = useCallback(
    async (result: StylePresetCatalogSearchResult) => {
      const loadedPack =
        loadedStylePacksById[result.packId] ?? (await loadStyleRuntimePack(result.packId));
      if (loadedPack) cacheStylePack(loadedPack);
      const preset = loadedPack?.presets.find((candidate) => candidate.id === result.id);
      if (!preset) return;

      applyStyleTab(result.packId, {
        browserStatePatch: {
          isCatalogSearchOpen: false,
        },
      });
      writeStyleTabHash(result.packId);
      setInteractionState((prev) => ({ ...prev, activePresetId: result.id }));
      handleApplyStyleRef.current(preset, result.packId);
    },
    [loadedStylePacksById, cacheStylePack, applyStyleTab],
  );

  const handleCopyStylePrompt = (e: React.MouseEvent, preset: StyleRuntimePreset) => {
    e.stopPropagation();
    const displayName = getStyleRuntimePresetDisplayName(preset);
    const styleAnchors = getStyleRuntimePresetSearchNames(preset).filter(
      (name) => name !== displayName,
    );
    const styleAnchorLine =
      styleAnchors.length > 0 ? `**Style Anchors:** ${styleAnchors.join(', ')}\n` : '';
    const promptText = `
**Style:** ${displayName}
${styleAnchorLine}
**Aesthetic:** ${preset.style.aesthetic}
**Subject:** ${describeStyleValue(preset.style.subject_treatment ?? preset.style.form_and_line)}
**Color:** ${describeStyleValue(preset.style.color_and_tone ?? preset.style.color_palette)}
**Lighting:** ${describeStyleValue(preset.style.lighting_and_shadow ?? preset.style.lighting_setup)}
**Texture:** ${describeStyleValue(preset.style.texture_and_material ?? preset.style.material_texture)}
**Camera:** ${describeStyleValue(preset.style.camera_and_composition ?? preset.style.spatial_distortion)}
**Mood:** ${describeStyleValue(preset.style.atmosphere_and_mood ?? preset.style.atmosphere)}
**Quality:** ${describeStyleValue(preset.style.rendering_and_quality ?? preset.style.render_quality)}
`.trim();
    void navigator.clipboard.writeText(promptText);
    setInteractionState((prev) => ({ ...prev, copiedStyleId: preset.id }));
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(
      () => setInteractionState((prev) => ({ ...prev, copiedStyleId: null })),
      2000,
    );
  };

  const handleCopyStylePromptRef = useRef(handleCopyStylePrompt);
  handleCopyStylePromptRef.current = handleCopyStylePrompt;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
    if (files.length > 0 && referenceSlotsRemaining > 0) {
      onFileSelect(files.slice(0, referenceSlotsRemaining));
    }
  };

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
      const presetTheme = PACK_THEMES[presetPackId] || activeTheme;
      return (
        <React.Suspense
          key={preset.id}
          fallback={
            <div
              data-style-preset-card-loading={preset.id}
              className="aspect-[3/4] overflow-hidden rounded-[6px] border border-white/[0.055] bg-zinc-950"
            >
              <div className="size-full bg-linear-to-b from-white/[0.04] via-zinc-900/30 to-black/35" />
            </div>
          }
        >
          <StylePresetCard
            preset={preset}
            packId={presetPackId}
            sourceProvenance={styleSourceByPresetId.get(preset.id)}
            visualState={presetVisualStateById.get(preset.id)}
            active={selectedStyleIds.has(preset.id)}
            copied={copiedStyleId === preset.id}
            favorite={favorites.includes(preset.id)}
            theme={presetTheme}
            FadeImageComponent={StyleFadeImage}
            onApply={(selectedPreset) => handleApplyStyleRef.current(selectedPreset, presetPackId)}
            onCopy={handleCopyStylePromptRef.current}
            onToggleFavorite={toggleFavorite}
            onHoverPreviewChange={handleHoverPreviewChange}
          />
        </React.Suspense>
      );
    },
    [
      selectedStyleIds,
      copiedStyleId,
      favorites,
      activeTheme,
      styleSourceByPresetId,
      getPackIdForPreset,
      toggleFavorite,
      presetVisualStateById,
      handleHoverPreviewChange,
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
        label: 'All Cards',
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
      { id: STYLE_PACKS_TAB_ID, label: 'Packs' },
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
    <RecipeLayout isGenerating={isGenerating} className="flex size-full bg-[#050505]">
      {/* LEFT: VISUAL CONTEXT PREVIEW */}
      {isReferencePanelOpen ? (
        <aside
          data-style-reference-panel
          className="relative z-10 hidden h-full w-[clamp(280px,18vw,420px)] shrink-0 flex-col overflow-hidden border-r border-white/5 bg-zinc-950/72 px-3 py-3 xl:flex 2xl:px-4"
        >
          <div className="flex min-h-0 w-full flex-1 flex-col gap-3">
            <div className="flex h-12 shrink-0 items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                  References
                </h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                  {referenceImages.length}/{MAX_STYLE_REFERENCE_IMAGES} Images
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleStylePanel('references')}
                data-style-reference-panel-toggle
                className="flex size-8 shrink-0 items-center justify-center rounded-[6px] border border-white/8 bg-white/[0.035] text-zinc-500 transition-colors hover:bg-white/8 hover:text-white"
                aria-label="Hide references panel"
                title="Hide references"
              >
                <ChevronLeft size={15} />
              </button>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="rounded-[6px] border border-white/8 bg-white/[0.025] p-1.5"
            >
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

              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: MAX_STYLE_REFERENCE_IMAGES }).map((_, index) => {
                  const image = referenceImages[index];
                  const isAddSlot =
                    !image && index === referenceImages.length && referenceSlotsRemaining > 0;

                  if (image) {
                    return (
                      <div
                        key={image.id}
                        data-style-reference-image={image.id}
                        className="group/reference relative h-12 overflow-hidden rounded-md border border-white/10 bg-zinc-950"
                      >
                        <StyleFadeImage
                          src={image.dataUrl}
                          alt=""
                          width={80}
                          height={48}
                          className="size-full object-contain p-0.5 opacity-95 transition-opacity group-hover/reference:opacity-100"
                        />
                        <div className="absolute left-1 top-1 rounded-sm border border-black/30 bg-black/70 px-1 py-0.5 text-[10px] font-black tabular-nums text-white/80">
                          {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateConfig(
                              'attachments',
                              config.attachments.filter((attachment) => attachment.id !== image.id),
                            )
                          }
                          className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-md border border-red-400/20 bg-red-500/15 text-red-200 opacity-0 transition-[opacity,background-color,color] hover:bg-red-500 hover:text-white group-hover/reference:opacity-100"
                          aria-label={`Remove reference image ${index + 1}`}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    );
                  }

                  if (isAddSlot) {
                    return (
                      <button
                        type="button"
                        key="add-reference"
                        data-style-reference-add
                        onClick={() => fileInputRef.current?.click()}
                        className="group/add flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border border-dashed border-white/12 bg-zinc-950/70 text-zinc-500 transition-[border-color,background-color,color] hover:border-white/24 hover:bg-white/6 hover:text-white"
                      >
                        <Upload size={14} />
                        <span className="max-w-full truncate px-1 text-[10px] font-black uppercase tracking-[0.14em]">
                          Add
                        </span>
                      </button>
                    );
                  }

                  return (
                    <div
                      key={`empty-reference-${index}`}
                      data-style-reference-empty={index}
                      className="flex h-12 items-center justify-center rounded-md border border-white/6 bg-zinc-950/40 text-zinc-700"
                      aria-hidden="true"
                    >
                      <ImageIcon size={13} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              data-style-preview-card
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative min-h-[360px] flex-1 overflow-hidden rounded-[6px] border border-white/14 bg-zinc-950 shadow-[0_24px_70px_rgba(0,0,0,0.48)] ring-1 ring-white/6"
            >
              {resolvedHoveredPresetPreview?.imageSrc ? (
                <StyleFadeImage
                  src={resolvedHoveredPresetPreview.imageSrc}
                  width={480}
                  height={640}
                  className="absolute inset-0 size-full object-cover"
                  alt={resolvedHoveredPresetPreview.name}
                />
              ) : referenceImages[0] ? (
                <StyleFadeImage
                  src={referenceImages[0].dataUrl}
                  width={480}
                  height={480}
                  className="absolute inset-0 size-full object-cover opacity-95"
                  alt=""
                />
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-3 flex items-center justify-center rounded-[6px] border border-dashed border-white/12 bg-white/[0.025] text-zinc-600 transition-[border-color,background-color,color] hover:border-white/22 hover:bg-white/[0.045] hover:text-zinc-300"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex size-14 items-center justify-center rounded-[6px] border border-white/10 bg-white/5">
                      <Upload size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.16em]">
                      Drop reference image
                    </span>
                  </div>
                </button>
              )}

              {resolvedHoveredPresetPreview && (
                <>
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-black/5" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="max-w-[94%] rounded-[6px] border border-white/12 bg-zinc-950/86 px-3 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.34)]">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/65">
                          {resolvedHoveredPresetPreview.packName}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300/80">
                          {resolvedHoveredPresetPreview.category}
                        </span>
                      </div>
                      <h3 className="mt-2 truncate text-xs font-black uppercase tracking-[0.02em] text-white">
                        {resolvedHoveredPresetPreview.name}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-zinc-200/78">
                        {resolvedHoveredPresetPreview.aesthetic}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      ) : (
        <aside
          data-style-reference-panel-rail
          className="hidden h-full w-10 shrink-0 items-start justify-center border-r border-white/5 bg-zinc-950/60 p-1.5 xl:flex"
        >
          <button
            type="button"
            onClick={() => toggleStylePanel('references')}
            data-style-reference-panel-toggle
            className="flex size-7 items-center justify-center rounded-[6px] text-zinc-500 transition-colors hover:bg-white/8 hover:text-white"
            aria-label="Show references panel"
            title="Show references"
          >
            <ChevronRight size={14} />
          </button>
        </aside>
      )}

      {/* CENTER: STYLE BROWSER */}
      <div
        data-style-browser-root
        className="vt-style-browser-surface relative flex h-full min-w-0 flex-1 flex-col bg-[#060606]"
      >
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" />

        <div className="xl:hidden border-b border-white/5 bg-zinc-950/72 px-3 py-2 backdrop-blur-md">
          <details className="group rounded-[6px] border border-white/8 bg-white/[0.025]">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2">
              <div className="min-w-0">
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  Style Setup
                </div>
                <div className="mt-0.5 truncate text-xs font-black uppercase tracking-tight text-white">
                  {selectedStyles.length} styles / {referenceImages.length} refs
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }}
                  disabled={referenceSlotsRemaining <= 0}
                  className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
                  aria-label="Add style reference"
                >
                  <Upload size={15} />
                </button>
                <span className="rounded-lg border border-white/8 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  Edit
                </span>
              </div>
            </summary>

            <div className="grid gap-3 border-t border-white/6 p-3">
              <div className="rounded-[6px] border border-white/6 bg-black/20 p-2">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    References
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                    {referenceImages.length}/{MAX_STYLE_REFERENCE_IMAGES}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: MAX_STYLE_REFERENCE_IMAGES }).map((_, index) => {
                    const image = referenceImages[index];
                    if (!image) {
                      return (
                        <button
                          type="button"
                          key={`mobile-reference-empty-${index}`}
                          onClick={() => fileInputRef.current?.click()}
                          disabled={
                            index !== referenceImages.length || referenceSlotsRemaining <= 0
                          }
                          className="flex h-12 items-center justify-center rounded-md border border-dashed border-white/10 bg-zinc-950/70 text-zinc-600 disabled:pointer-events-none disabled:opacity-45"
                          aria-label={`Add reference image ${index + 1}`}
                        >
                          {index === referenceImages.length && referenceSlotsRemaining > 0 ? (
                            <Upload size={13} />
                          ) : (
                            <ImageIcon size={13} />
                          )}
                        </button>
                      );
                    }
                    return (
                      <div
                        key={image.id}
                        className="group/reference-mobile relative h-12 overflow-hidden rounded-md border border-white/10 bg-zinc-950"
                      >
                        <StyleFadeImage
                          src={image.dataUrl}
                          alt=""
                          className="size-full object-contain p-0.5"
                          loading="lazy"
                          decoding="async"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateConfig(
                              'attachments',
                              config.attachments.filter((attachment) => attachment.id !== image.id),
                            )
                          }
                          className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-black/65 text-red-200 opacity-100"
                          aria-label={`Remove reference image ${index + 1}`}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[6px] border border-white/6 bg-black/20 p-2">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    Style Slots
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsAdvancedStyleControlsOpen((isOpen) => !isOpen)}
                      aria-pressed={isAdvancedStyleControlsOpen}
                      className={`flex h-7 items-center gap-1 rounded-lg border px-2 text-[8px] font-black uppercase tracking-widest ${
                        isAdvancedStyleControlsOpen
                          ? 'border-accent-400/25 bg-accent-500/15 text-accent-100'
                          : 'border-white/8 bg-white/5 text-zinc-400'
                      }`}
                    >
                      <SlidersHorizontal size={11} />
                      Advanced
                    </button>
                    {selectedStyles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedStyles([])}
                        className="rounded-lg border border-white/8 bg-white/5 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-400"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex max-h-44 flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                  {selectedStyles.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-white/8 bg-white/[0.02] px-3 py-4 text-center text-[9px] font-black uppercase tracking-widest text-zinc-600">
                      Pick styles from the browser
                    </div>
                  ) : (
                    selectedStyles.map((slot, index) => {
                      const slotCardImage = resolveStylePresetPrimaryCardImage(
                        selectedStyleVisualStateById.get(slot.preset.id),
                      );
                      const presetName = getStyleRuntimePresetDisplayName(slot.preset);
                      return (
                        <div
                          key={slot.preset.id}
                          className="rounded-[6px] border border-white/8 bg-zinc-950/80 p-2"
                        >
                          <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2rem] items-start gap-2">
                            <div className="relative aspect-[2/3] w-[2.75rem] overflow-hidden rounded-[6px] border border-white/10 bg-zinc-950">
                              {slotCardImage ? (
                                <StyleFadeImage
                                  src={slotCardImage.src}
                                  alt=""
                                  className="size-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <div
                                  className={`flex size-full items-center justify-center ${PACK_THEMES[slot.packId]?.text ?? 'text-zinc-300'}`}
                                >
                                  {getPackIcon(slot.packId)}
                                </div>
                              )}
                              <div className="absolute left-1 top-1 rounded-[4px] bg-black/55 px-1 text-[7px] font-black text-white/80">
                                {index + 1}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[8px] font-black uppercase tracking-widest text-zinc-500">
                                {slot.packName}
                              </div>
                              <div className="truncate text-[11px] font-black uppercase tracking-tight text-white">
                                {presetName}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSelectedStyle(slot.preset.id)}
                              className="flex size-8 shrink-0 items-center justify-center rounded-[6px] border border-white/10 bg-white/5 text-zinc-400"
                              aria-label={`Remove ${presetName}`}
                            >
                              <X size={13} />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Palette className="size-3 shrink-0 text-zinc-500" />
                            <input
                              type="range"
                              min={0.1}
                              max={1}
                              step={0.05}
                              value={slot.strength}
                              onChange={(event) =>
                                updateSelectedStyleStrength(
                                  slot.preset.id,
                                  Number(event.target.value),
                                )
                              }
                              className="h-1 min-w-0 flex-1 accent-white"
                              aria-label={`Style Strength ${presetName}`}
                            />
                            <span className="w-8 text-right text-[8px] font-black tabular-nums text-zinc-400">
                              {formatStyleStrength(slot.strength)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {isAdvancedStyleControlsOpen && (
                  <div className="mt-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    <React.Suspense
                      fallback={<LazySurfaceFallback label="Loading advanced controls" />}
                    >
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
                )}

                <button
                  type="button"
                  onClick={handleGenerateSelectedStyles}
                  disabled={activeSelectedStyleCount === 0}
                  data-style-generate-button
                  data-generate-active={isGenerating ? 'true' : 'false'}
                  className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[6px] border border-accent-400/20 bg-accent-500/18 px-4 text-[10px] font-black uppercase tracking-widest text-accent-100 transition-[background-color,border-color,opacity] disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-white/5 disabled:text-zinc-600"
                >
                  <Play size={15} />
                  {isGenerating ? 'Queue' : 'Generate'}
                </button>
              </div>
            </div>
          </details>
        </div>

        {/* Pack Tabs */}
        <div className="vt-recipe-tabs vt-style-tabs z-20 flex h-11 items-center gap-1.5 overflow-x-auto border-b border-white/5 bg-zinc-950/88 py-0 pl-3 pr-1 custom-scrollbar sm:h-12 sm:pl-6 sm:pr-2">
          <div className="mr-1 flex shrink-0 items-center gap-1 rounded-[6px] border border-white/5 bg-zinc-950/55 p-1">
            <button
              type="button"
              onClick={() => previousStyleTab && navigateToStyleTab(previousStyleTab.id)}
              disabled={!previousStyleTab}
              data-style-tab-previous
              aria-label="Previous style tab"
              title={previousStyleTab ? `Previous: ${previousStyleTab.label}` : 'No previous tab'}
              className="flex size-7 items-center justify-center rounded-[6px] text-zinc-400 transition-[background-color,color,opacity] hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => nextStyleTab && navigateToStyleTab(nextStyleTab.id)}
              disabled={!nextStyleTab}
              data-style-tab-next
              aria-label="Next style tab"
              title={nextStyleTab ? `Next: ${nextStyleTab.label}` : 'No next tab'}
              className="flex size-7 items-center justify-center rounded-[6px] text-zinc-400 transition-[background-color,color,opacity] hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigateToStyleTab(STYLE_PACKS_TAB_ID)}
            data-style-tab-url={`#${getStyleTabHash(STYLE_PACKS_TAB_ID)}`}
            aria-label="Show style packs"
            title="Style packs"
            className={`
                  group relative h-8 shrink-0 overflow-hidden rounded-[6px] px-2.5 transition-[background-color,border-color,color,box-shadow] duration-200 flex items-center gap-2
                    ${
                      isPackLandingOpen
                        ? 'bg-zinc-800 border border-white/10 text-white shadow-lg'
                        : 'bg-transparent hover:bg-white/5 text-zinc-500 hover:text-zinc-300'
                    }
                `}
          >
            <Layers size={16} />
            {isPackLandingOpen && (
              <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em]">
                Packs
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigateToStyleTab(ALL_STYLE_CATEGORIES_TAB_ID)}
            data-style-tab-url={`#${getStyleTabHash(ALL_STYLE_CATEGORIES_TAB_ID)}`}
            aria-label="Show all style categories"
            title="All categories"
            className={`
                  group relative h-8 shrink-0 overflow-hidden rounded-[6px] px-2.5 transition-[background-color,border-color,color,box-shadow] duration-200 flex items-center gap-2
                    ${
                      !isPackLandingOpen && currentPackId === ALL_STYLE_CATEGORIES_TAB_ID
                        ? 'bg-blue-950 border border-blue-500/50 text-blue-300 shadow-lg'
                        : 'bg-transparent hover:bg-white/5 text-zinc-500 hover:text-blue-300'
                    }
                `}
          >
            <Layers size={16} />
            {!isPackLandingOpen && currentPackId === ALL_STYLE_CATEGORIES_TAB_ID && (
              <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em]">
                Categories
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigateToStyleTab(ALL_STYLE_CARDS_TAB_ID)}
            data-style-tab-url={`#${getStyleTabHash(ALL_STYLE_CARDS_TAB_ID)}`}
            aria-label="Show all style cards"
            title="All cards"
            className={`
                  group relative h-8 shrink-0 overflow-hidden rounded-[6px] px-2.5 transition-[background-color,border-color,color,box-shadow] duration-200 flex items-center gap-2
                    ${
                      !isPackLandingOpen && currentPackId === ALL_STYLE_CARDS_TAB_ID
                        ? 'bg-amber-950 border border-amber-500/50 text-amber-300 shadow-lg'
                        : 'bg-transparent hover:bg-white/5 text-zinc-500 hover:text-amber-300'
                    }
                `}
          >
            <LayoutGrid size={16} />
            {!isPackLandingOpen && currentPackId === ALL_STYLE_CARDS_TAB_ID && (
              <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em]">
                Cards
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigateToStyleTab(USER_STYLE_PACK_ID)}
            data-style-pack-id={USER_STYLE_PACK_ID}
            data-style-pack-active={
              !isPackLandingOpen && currentPackId === USER_STYLE_PACK_ID ? 'true' : 'false'
            }
            data-style-tab-url={`#${getStyleTabHash(USER_STYLE_PACK_ID)}`}
            aria-label={`Show ${USER_STYLE_PACK_NAME}`}
            title={USER_STYLE_PACK_NAME}
            className={`
                  group relative h-8 shrink-0 overflow-hidden rounded-[6px] px-2.5 transition-[background-color,border-color,color,box-shadow] duration-200 flex items-center gap-2
                    ${
                      !isPackLandingOpen && currentPackId === USER_STYLE_PACK_ID
                        ? 'bg-sky-950 border border-sky-500/50 text-sky-300 shadow-lg'
                        : 'bg-transparent hover:bg-white/5 text-zinc-500 hover:text-sky-300'
                    }
                `}
          >
            <Sparkles size={16} />
            {!isPackLandingOpen && currentPackId === USER_STYLE_PACK_ID && (
              <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em]">
                {USER_STYLE_PACK_NAME}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigateToStyleTab(FAVORITES_PACK_ID)}
            data-style-tab-url={`#${getStyleTabHash(FAVORITES_PACK_ID)}`}
            aria-label="Show favorite styles"
            className={`
                  group sticky right-0 z-20 ml-auto h-8 shrink-0 overflow-hidden rounded-[6px] px-2.5 backdrop-blur-md transition-[background-color,border-color,color,box-shadow] duration-200 flex items-center gap-2
                    ${
                      !isPackLandingOpen && currentPackId === FAVORITES_PACK_ID
                        ? `bg-rose-950 border border-rose-500/50 text-rose-400 shadow-lg`
                        : 'bg-zinc-950/45 text-zinc-500 hover:bg-white/5 hover:text-rose-400'
                    }
                `}
            title="Favorite styles"
          >
            <Heart
              size={16}
              fill={
                !isPackLandingOpen && currentPackId === FAVORITES_PACK_ID ? 'currentColor' : 'none'
              }
            />
            <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em]">
              Favorites
            </span>
          </button>
        </div>

        {isPackLandingOpen ? (
          <React.Suspense
            fallback={
              <LazySurfaceFallback
                label="Loading style packs"
                className="flex flex-1 items-center justify-center bg-zinc-950/40 text-zinc-400"
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
              onToggleNavigationPanel={() => toggleStylePanel('navigation')}
            />
          </React.Suspense>
        ) : (
          <div data-style-folder={currentPackId} className="flex min-h-0 flex-1 flex-col">
            {/* Pack Header Info + Search Bar */}
            <div
              className={`grid h-12 min-w-0 gap-4 border-b border-white/5 px-4 py-1.5 sm:px-5 2xl:px-6 ${
                isStyleNavigationPanelOpen
                  ? 'lg:grid-cols-[216px_minmax(0,1fr)]'
                  : 'lg:grid-cols-[40px_minmax(0,1fr)]'
              }`}
            >
              <div className="hidden lg:block" aria-hidden="true" />
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2
                    className={`vt-style-pack-title truncate text-base font-black leading-none uppercase tracking-tighter transition-colors duration-300 sm:text-lg ${activeTheme.text}`}
                  >
                    {activePack.name}
                  </h2>
                  <p className="mt-1 line-clamp-1 text-[9px] font-medium leading-none text-zinc-500">
                    {activePack.description}
                  </p>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="vt-style-actionbar flex h-9 shrink-0 flex-nowrap items-center gap-1.5 rounded-[6px] border border-white/5 p-1">
                  <div className="flex h-7 min-w-0 w-40 items-center gap-2 rounded-[6px] border border-white/5 bg-zinc-950/40 px-3 2xl:w-48">
                    <Search size={14} className="text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search styles..."
                      value={searchQuery}
                      onChange={(e) =>
                        setBrowserState((prev) => ({ ...prev, searchQuery: e.target.value }))
                      }
                      aria-label="Search styles"
                      className="bg-transparent border-none outline-none text-[11px] text-white placeholder-zinc-600 w-full font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setBrowserState((prev) => ({ ...prev, searchQuery: '' }))}
                      >
                        <X size={12} className="text-zinc-500 hover:text-white" />
                      </button>
                    )}
                  </div>

                  <div className="h-6 w-px bg-white/5" />

                  <button
                    type="button"
                    onClick={() =>
                      setBrowserState((prev) => ({ ...prev, isCatalogSearchOpen: true }))
                    }
                    data-style-open-catalog
                    className="flex h-7 items-center gap-2 rounded-[6px] px-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
                    title="Open Style Catalog"
                  >
                    <BookOpen size={15} />
                    Catalog
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateUserStyle}
                    data-style-create-user-style
                    className="flex h-7 items-center gap-2 rounded-[6px] px-2.5 text-[9px] font-black uppercase tracking-widest text-sky-300 transition-colors hover:bg-sky-500/10 hover:text-sky-100"
                    title="Create Style"
                  >
                    <Plus size={15} />
                    <span className="hidden 2xl:inline">Create</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSelectedStyleBlend}
                    disabled={!canSaveStyleBlend}
                    data-style-save-blend
                    className="flex h-7 items-center gap-2 rounded-[6px] px-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    title="Save Blend"
                  >
                    <Layers size={15} />
                    <span className="hidden 2xl:inline">Blend</span>
                  </button>

                  <button
                    type="button"
                    onClick={
                      canEditActiveUserStyle ? handleEditActiveUserStyle : handleCloneActiveStyle
                    }
                    disabled={!canEditActiveUserStyle && !canCloneActiveStyle}
                    data-style-edit-or-clone
                    className="flex h-7 items-center gap-2 rounded-[6px] px-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    title={canEditActiveUserStyle ? 'Edit Style' : 'Clone Style'}
                  >
                    {canEditActiveUserStyle ? <PenTool size={15} /> : <Copy size={15} />}
                    <span className="hidden 2xl:inline">
                      {canEditActiveUserStyle ? 'Edit' : 'Clone'}
                    </span>
                  </button>

                  <div
                    data-style-view-mode={activeStyleViewMode}
                    className="flex h-7 items-center rounded-[6px] border border-white/5 bg-zinc-950/40 p-0.5"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        isGlobalStyleBrowseTab
                          ? navigateToStyleTab(ALL_STYLE_CATEGORIES_TAB_ID)
                          : setBrowserState((prev) => ({ ...prev, viewMode: 'grouped' }))
                      }
                      aria-label="Show grouped style categories"
                      aria-pressed={activeStyleViewMode === 'grouped'}
                      className={`flex size-6 items-center justify-center rounded-[5px] transition-colors ${
                        activeStyleViewMode === 'grouped'
                          ? 'bg-white/10 text-white'
                          : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                      }`}
                      title="Categories"
                    >
                      <Layers size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        isGlobalStyleBrowseTab
                          ? navigateToStyleTab(ALL_STYLE_CARDS_TAB_ID)
                          : setBrowserState((prev) => ({ ...prev, viewMode: 'flat' }))
                      }
                      aria-label="Show all style cards in one grid"
                      aria-pressed={activeStyleViewMode === 'flat'}
                      className={`flex size-6 items-center justify-center rounded-[5px] transition-colors ${
                        activeStyleViewMode === 'flat'
                          ? 'bg-white/10 text-white'
                          : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                      }`}
                      title="All cards"
                    >
                      <LayoutGrid size={14} />
                    </button>
                  </div>

                  <div ref={sortDropdownRef} className="relative" data-style-sort-dropdown>
                    <button
                      ref={sortButtonRef}
                      type="button"
                      onClick={() => setIsSortDropdownOpen((open) => !open)}
                      aria-label={`Sort style cards: ${activeSortOption.label}`}
                      aria-haspopup="listbox"
                      aria-expanded={isSortDropdownOpen}
                      aria-controls={sortMenuId}
                      className={`flex min-h-9 w-[9.75rem] touch-manipulation items-center gap-1.5 rounded-[6px] border px-2 text-left transition-[border-color,background-color,color,transform] ${
                        isSortDropdownOpen
                          ? 'border-white/15 bg-white/[0.075] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.035),0_10px_28px_rgba(0,0,0,0.28)]'
                          : 'border-white/5 bg-zinc-950/40 text-zinc-500 hover:border-white/10 hover:bg-white/[0.045] hover:text-white'
                      }`}
                      title="Sort styles"
                    >
                      <ArrowUpDown size={14} className="shrink-0" />
                      <span className="min-w-0 flex-1 truncate text-[9px] font-black uppercase tracking-widest text-zinc-300">
                        {activeSortOption.label}
                      </span>
                      <ChevronDown
                        size={13}
                        className={`shrink-0 transition-transform ${isSortDropdownOpen ? 'rotate-180 text-white' : 'text-zinc-600'}`}
                      />
                    </button>

                    <GsapDropdown
                      id={sortMenuId}
                      open={isSortDropdownOpen}
                      onOpenChange={setIsSortDropdownOpen}
                      triggerRef={sortButtonRef}
                      placement="bottom-right"
                      portal
                      role="listbox"
                      aria-label="Sort style cards"
                      className="absolute right-0 top-[calc(100%+0.45rem)] z-50 w-52 overflow-hidden rounded-[6px] p-1"
                    >
                      <div className="px-2 pb-1 pt-1 text-[8px] font-black uppercase tracking-[0.22em] text-zinc-600">
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
                                setBrowserState((prev) => ({
                                  ...prev,
                                  sortOrder: option.value,
                                }));
                                setIsSortDropdownOpen(false);
                              }}
                              className={`flex min-h-9 w-full items-center justify-between gap-3 rounded-[5px] px-2 text-left text-[9px] font-black uppercase tracking-widest transition-[background-color,color,transform] ${
                                selected
                                  ? 'bg-white/10 text-white'
                                  : 'text-zinc-500 hover:bg-white/[0.055] hover:text-zinc-200'
                              }`}
                            >
                              <span>{option.label}</span>
                              {selected ? <Check size={13} className="shrink-0" /> : null}
                            </button>
                          );
                        })}
                      </div>
                    </GsapDropdown>
                  </div>

                  {currentPackId !== FAVORITES_PACK_ID && (
                    <button
                      type="button"
                      onClick={() =>
                        setBrowserState((prev) => ({
                          ...prev,
                          showFavoritesOnly: !prev.showFavoritesOnly,
                        }))
                      }
                      className={`rounded-[6px] p-1.5 transition-colors ${showFavoritesOnly ? 'text-rose-400 bg-rose-500/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                      title="Filter Favorites in this Pack"
                    >
                      <Heart size={16} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
                    </button>
                  )}

                  <div className="h-6 w-px bg-white/5" />

                  <div className="hidden items-center gap-2 rounded-[6px] border border-white/5 bg-zinc-950/40 px-2 py-1 2xl:flex">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      Zoom
                    </span>
                    <input
                      type="range"
                      min={2}
                      max={7}
                      step={1}
                      value={gridColumns}
                      onChange={(e) => setGridColumns(Number(e.target.value))}
                      className="h-1.5 w-20 accent-white"
                      aria-label="Style grid zoom"
                      title="Style card columns"
                    />
                    <span className="w-4 text-[9px] font-black text-zinc-300 tabular-nums">
                      {gridColumns}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`grid min-h-0 min-w-0 flex-1 gap-4 px-4 py-3 sm:px-5 2xl:px-6 ${
                isStyleNavigationPanelOpen
                  ? 'lg:grid-cols-[216px_minmax(0,1fr)]'
                  : 'lg:grid-cols-[40px_minmax(0,1fr)]'
              }`}
            >
              {isStyleNavigationPanelOpen ? (
                <React.Suspense
                  fallback={
                    <aside data-style-detail-navigation className="hidden min-h-0 min-w-0 lg:block">
                      <div className="flex h-full min-h-0 items-center justify-center rounded-[6px] border border-white/8 bg-zinc-950/78 p-3">
                        <LazySurfaceFallback label="Loading style map" />
                      </div>
                    </aside>
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
                  className="hidden min-h-0 min-w-0 items-start justify-center rounded-[6px] border border-white/8 bg-zinc-950/70 p-1.5 lg:flex"
                >
                  <button
                    type="button"
                    onClick={() => toggleStylePanel('navigation')}
                    data-style-detail-navigation-toggle
                    className="flex size-7 items-center justify-center rounded-[6px] text-zinc-500 transition-colors hover:bg-white/8 hover:text-white"
                    aria-label="Show style map"
                    title="Show style map"
                  >
                    <ChevronRight size={14} />
                  </button>
                </aside>
              )}

              {/* The Grid */}
              <div
                ref={styleScrollRootRef}
                className="min-h-0 min-w-0 overflow-y-auto pb-12 custom-scrollbar"
              >
                <div className="w-full space-y-6 pb-20">
                  {/* FAVORITES SECTION (If any exist in current filter and not in favorites tab) */}
                  {processedData.favorites.length > 0 && currentPackId !== FAVORITES_PACK_ID && (
                    <StylePresetGroupSection
                      groupKey="favorites"
                      title="Pinned / Favorites"
                      presets={processedData.favorites}
                      gridColumns={gridColumns}
                      scrollRootRef={styleScrollRootRef}
                      scrollContainerWidth={styleScrollWidth}
                      initiallyVisible
                      headerClassName="opacity-100"
                      accentClassName="bg-rose-500"
                      titleClassName="text-rose-400"
                      dividerClassName="bg-linear-to-r from-rose-500/20 to-transparent"
                      renderPresetCard={renderPresetCard}
                    />
                  )}

                  {visibleStyleGroupEntries.map(([groupKey, presets], index) => {
                    const isFlatStyleGroup =
                      activeStyleViewMode === 'flat' && groupKey === STYLE_BROWSER_FLAT_GROUP_KEY;
                    const categoryIdentity = isFlatStyleGroup
                      ? null
                      : getCategoryVisualIdentity(currentPackId, groupKey);
                    return (
                      <StylePresetGroupSection
                        key={groupKey}
                        groupKey={groupKey}
                        title={isFlatStyleGroup ? 'All Styles' : groupKey}
                        icon={isFlatStyleGroup ? <LayoutGrid size={12} /> : categoryIdentity?.icon}
                        presets={presets}
                        gridColumns={gridColumns}
                        scrollRootRef={styleScrollRootRef}
                        scrollContainerWidth={styleScrollWidth}
                        initiallyVisible={index < styleCategoryEagerBudget}
                        headerClassName=""
                        accentClassName={categoryIdentity?.accentClassName ?? activeTheme.bg}
                        titleClassName={categoryIdentity?.titleClassName ?? 'text-zinc-300'}
                        dividerClassName="bg-white/10"
                        renderPresetCard={renderPresetCard}
                      />
                    );
                  })}

                  {filteredStylePresets.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center text-zinc-600 gap-4">
                      {currentPackId === USER_STYLE_PACK_ID && userStyleError ? (
                        <>
                          <Filter size={32} className="opacity-20" />
                          <span className="text-xs font-bold uppercase tracking-widest">
                            Could not load styles
                          </span>
                          <button
                            type="button"
                            onClick={() => void refreshUserStyles()}
                            className="flex h-9 items-center gap-2 rounded-[6px] border border-white/10 bg-white/5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Wand2 size={13} />
                            Retry
                          </button>
                        </>
                      ) : currentPackId === USER_STYLE_PACK_ID &&
                        !isLoadingUserStyles &&
                        normalizedStyleSearchQuery.length === 0 ? (
                        <>
                          <Sparkles size={32} className="opacity-30 text-sky-300" />
                          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                            No custom styles yet
                          </span>
                          <button
                            type="button"
                            onClick={handleCreateUserStyle}
                            className="flex h-9 items-center gap-2 rounded-[6px] border border-sky-400/20 bg-sky-500/10 px-3 text-[10px] font-black uppercase tracking-widest text-sky-100 transition-colors hover:bg-sky-500/16"
                          >
                            <Plus size={13} />
                            Create Style
                          </button>
                        </>
                      ) : (
                        <>
                          <Filter size={32} className="opacity-20" />
                          <span className="text-xs font-bold uppercase tracking-widest">
                            {isLoadingUserStyles
                              ? 'Loading styles'
                              : 'No styles found matching criteria'}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isCatalogSearchOpen && (
          <React.Suspense
            fallback={
              <LazySurfaceFallback
                label="Loading catalog"
                className="absolute inset-0 z-40 grid place-items-center bg-zinc-950/92 text-zinc-500"
              />
            }
          >
            <StylePresetCatalogSearchSurface
              onClose={handleCloseCatalogSearch}
              onSelectPreset={handleSelectCatalogPreset}
              onApplyPreset={handleApplyCatalogPreset}
            />
          </React.Suspense>
        )}
      </div>

      {isStyleSlotsPanelOpen ? (
        <aside
          data-style-slots-panel
          className="hidden h-full w-[clamp(280px,16vw,340px)] shrink-0 flex-col border-l border-white/5 bg-zinc-950/72 px-3 py-3 xl:flex 2xl:px-4"
        >
          <div className="mb-3 flex h-12 shrink-0 items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-white">
                Style Slots
              </h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                {selectedStyles.length}/{MAX_SELECTED_STYLE_SLOTS} Selected
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => toggleStylePanel('slots')}
                data-style-slots-panel-toggle
                className="flex size-8 items-center justify-center rounded-[6px] border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Hide style slots panel"
                title="Hide style slots"
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsAdvancedStyleControlsOpen((isOpen) => !isOpen)}
                aria-pressed={isAdvancedStyleControlsOpen}
                className={`flex size-8 items-center justify-center rounded-[6px] border transition-colors ${
                  isAdvancedStyleControlsOpen
                    ? 'border-accent-400/25 bg-accent-500/15 text-accent-100'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
                aria-label="Toggle advanced style controls"
              >
                <SlidersHorizontal size={14} />
              </button>
              {selectedStyles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedStyles([])}
                  className="flex size-8 items-center justify-center rounded-[6px] border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Clear selected styles"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div
            className={`grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar pr-1 ${
              isAdvancedStyleControlsOpen
                ? 'max-h-[26vh] shrink-0 content-start'
                : selectedStyles.length > 0
                  ? 'min-h-0 flex-1 content-start'
                  : 'max-h-[44vh] shrink-0 content-start'
            }`}
          >
            {Array.from({ length: MAX_SELECTED_STYLE_SLOTS }).map((_, index) => {
              const slot = selectedStyles[index];
              const layer = selectedStyleLayers[index];
              const slotCardImage = resolveStylePresetPrimaryCardImage(
                slot ? selectedStyleVisualStateById.get(slot.preset.id) : undefined,
              );
              if (!slot || !layer) {
                return (
                  <div
                    key={`empty-${index}`}
                    data-selected-style-empty-slot={index + 1}
                    className={`flex min-h-0 flex-col items-center justify-center rounded-[6px] border border-dashed border-white/8 bg-white/[0.02] text-center text-zinc-600 ${
                      isAdvancedStyleControlsOpen ? 'h-16 gap-1 p-2' : 'aspect-[2/3] gap-2 p-3'
                    }`}
                  >
                    <div
                      className={`flex shrink-0 items-center justify-center rounded-[6px] border border-white/8 bg-white/4 ${
                        isAdvancedStyleControlsOpen ? 'size-7' : 'size-10'
                      }`}
                    >
                      <Palette size={13} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Empty Slot {index + 1}
                    </span>
                  </div>
                );
              }
              const presetName = getStyleRuntimePresetDisplayName(slot.preset);

              return (
                <div
                  key={slot.preset.id}
                  data-selected-style-slot={slot.preset.id}
                  data-selected-style-card-image={slotCardImage?.kind ?? 'empty'}
                  className={`group/slot relative overflow-hidden rounded-[6px] border border-white/10 bg-zinc-950 shadow-[0_14px_30px_rgba(0,0,0,0.22)] ${
                    isAdvancedStyleControlsOpen ? 'h-24' : 'aspect-[2/3]'
                  }`}
                >
                  {slotCardImage ? (
                    <StyleFadeImage
                      src={slotCardImage.src}
                      alt=""
                      width={180}
                      height={270}
                      className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover/slot:scale-[1.025]"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 flex items-center justify-center ${PACK_THEMES[slot.packId]?.text ?? 'text-zinc-300'}`}
                    >
                      {getPackIcon(slot.packId)}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-black/92 via-black/18 to-black/18" />

                  <div className="absolute left-1.5 top-1.5 rounded-[4px] border border-black/30 bg-black/70 px-1 py-0.5 text-[10px] font-black text-white/80">
                    {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSelectedStyle(slot.preset.id)}
                    className="absolute right-1.5 top-1.5 flex size-7 shrink-0 items-center justify-center rounded-[6px] border border-white/10 bg-black/70 text-zinc-300 opacity-0 transition-[background-color,color,opacity] hover:bg-red-500/20 hover:text-red-100 group-hover/slot:opacity-100 group-focus-within/slot:opacity-100"
                    aria-label={`Remove ${presetName}`}
                  >
                    <X size={13} />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 p-2">
                    <div className="mb-1 flex items-center gap-1 text-[7px] font-black uppercase tracking-[0.16em] text-zinc-300/75">
                      <span
                        className={`flex size-4 items-center justify-center rounded-[4px] border border-white/10 bg-black/42 ${PACK_THEMES[slot.packId]?.text ?? 'text-zinc-300'} backdrop-blur`}
                      >
                        {getPackIcon(slot.packId)}
                      </span>
                      <span className="truncate">
                        Slot {index + 1} - {slot.packName}
                      </span>
                    </div>
                    <h3 className="truncate text-[10px] font-black uppercase leading-tight tracking-tight text-white">
                      {presetName}
                    </h3>
                    {!isAdvancedStyleControlsOpen && (
                      <p className="mt-1 line-clamp-2 text-[8px] leading-relaxed text-zinc-300/82">
                        {layer.aesthetic}
                      </p>
                    )}

                    <div
                      className={`${isAdvancedStyleControlsOpen ? 'mt-1' : 'mt-2'} flex items-center gap-1.5`}
                    >
                      <Palette className="size-3 shrink-0 text-zinc-400" />
                      <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.05}
                        value={slot.strength}
                        onChange={(event) =>
                          updateSelectedStyleStrength(slot.preset.id, Number(event.target.value))
                        }
                        className="h-1 min-w-0 flex-1 accent-white"
                        aria-label={`Style Strength ${presetName}`}
                        data-selected-style-strength={slot.preset.id}
                      />
                      <span className="w-7 text-right text-[8px] font-black tabular-nums text-zinc-300">
                        {formatStyleStrength(slot.strength)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {isAdvancedStyleControlsOpen && (
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
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
          )}

          <button
            type="button"
            onClick={handleGenerateSelectedStyles}
            disabled={activeSelectedStyleCount === 0}
            data-style-generate-button
            data-generate-active={isGenerating ? 'true' : 'false'}
            className="mt-3 flex h-11 items-center justify-center gap-2 rounded-[6px] border border-accent-400/20 bg-accent-500/18 px-4 text-[10px] font-black uppercase tracking-widest text-accent-100 transition-[background-color,border-color,opacity] hover:border-accent-300/35 hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-white/5 disabled:text-zinc-600"
          >
            <Play size={16} />
            {isGenerating ? 'Queue' : 'Generate'}
          </button>
        </aside>
      ) : (
        <aside
          data-style-slots-panel-rail
          className="hidden h-full w-10 shrink-0 items-start justify-center border-l border-white/5 bg-zinc-950/60 p-1.5 xl:flex"
        >
          <button
            type="button"
            onClick={() => toggleStylePanel('slots')}
            data-style-slots-panel-toggle
            className="flex size-7 items-center justify-center rounded-[6px] text-zinc-500 transition-colors hover:bg-white/8 hover:text-white"
            aria-label="Show style slots panel"
            title="Show style slots"
          >
            <ChevronLeft size={14} />
          </button>
        </aside>
      )}

      {userStyleEditorSession && (
        <React.Suspense
          fallback={
            <LazySurfaceFallback
              label="Loading style editor"
              className="absolute inset-0 z-50 grid place-items-center bg-zinc-950/86 text-zinc-500 backdrop-blur-xl"
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
            onClose={() => setUserStyleEditorSession(null)}
            onSaved={handleUserStyleSaved}
            onArchived={handleUserStyleArchived}
          />
        </React.Suspense>
      )}
    </RecipeLayout>
  );
};
