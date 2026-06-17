import {
  Archive,
  ArrowUpDown,
  BookOpen,
  Box,
  Briefcase,
  Building,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Copy,
  Filter,
  Gamepad2,
  Heart,
  Layers,
  Palette,
  PenTool,
  Printer,
  RefreshCw,
  Search,
  Shirt,
  SlidersHorizontal,
  SmilePlus,
  Sparkles,
  Star,
  Tv,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  STYLE_CATEGORY_IMAGES,
  STYLE_CATEGORY_PREVIEWS,
  STYLE_PACK_FALLBACK_IMAGES,
  resolveStyleDefaultImage,
  resolveStyleDefaultImageVariants,
} from '../../lib/recipeAssetCatalog';
import { styleCategoryImageKey } from '../../lib/recipeAssetKeys';
import { hasStylePresetIdentity } from '../../lib/recipeIdentity';
import { isStyleDefaultImageStale } from '../../lib/staleStyleDefaultImages.generated';
import {
  resolveStylePresetCardImages,
  type StylePresetCardImage,
} from '../../lib/stylePresetVisuals';
import type { Attachment, GeneratedImageWithConfig, ImageGenerationConfig } from '../../types';
import Tooltip from '../Tooltip';
import { FloatingTooltip } from '../ui/FloatingTooltip';
import Slider from '../ui/Slider';
import { RecipeLayout } from './RecipeLayout';
import {
  collectStylePresetPreviewSources,
  createStyleBrowserProcessedData,
  createStyleBrowserRenderPlan,
} from './styleBrowserRenderPlan';
import {
  estimateStyleGroupPlaceholderHeight,
  getVisibleStylePresets,
  STYLE_GROUP_INITIAL_RENDER_LIMIT,
} from './styleGridVirtualization';
import type { StylePresetCatalogSearchResult } from './stylePresetManifests';
import {
  loadStyleRuntimePack,
  loadStyleRuntimePacks,
  STYLE_RUNTIME_PACK_SUMMARIES,
  type StyleRuntimePack,
  type StyleRuntimePreset,
} from './stylesData';

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
const EMPTY_IMAGES: GeneratedImageWithConfig[] = [];
const DEFAULT_STYLE_PACK_ID = STYLE_RUNTIME_PACK_SUMMARIES[0]?.id ?? 'pack_01';
const STYLE_GROUP_VIEWPORT_ROOT_MARGIN = '900px 0px';

const StylePresetCatalogSearchSurface = React.lazy(() =>
  import('./StylePresetCatalogSearchSurface').then((module) => ({
    default: module.StylePresetCatalogSearchSurface,
  })),
);

// Color mapping for each pack to give them distinct identities
const PACK_THEMES: Record<string, { color: string; bg: string; border: string; text: string }> = {
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
  }, // Solarpunk Dreamscapes Vault
  pack_16: {
    color: 'rose',
    bg: 'bg-rose-500',
    border: 'border-rose-500',
    text: 'text-rose-400',
  }, // Anime Classics & Prestige
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

const previewDataUrlCache = new Map<string, string>();

interface StyleCardHoverPreview {
  id: string;
  name: string;
  category: string;
  packName: string;
  aesthetic: string;
  imageSrc: string | null;
}

interface StylePresetVisualState {
  presetPackName: string;
  resultImages: GeneratedImageWithConfig[];
  defaultImage: string | undefined;
  defaultImageVariants: string[];
  defaultImageStale: boolean;
  previewImage: string | undefined;
  exampleImageSrc: string | null;
}

interface StylePresetCardProps {
  preset: StyleRuntimePreset;
  visualState: StylePresetVisualState | undefined;
  active: boolean;
  copied: boolean;
  favorite: boolean;
  theme: { color: string; bg: string; border: string; text: string };
  onApply: (preset: StyleRuntimePreset) => void;
  onCopy: (e: React.MouseEvent, preset: StyleRuntimePreset) => void;
  onToggleFavorite: (presetId: string) => void;
  onHoverPreviewChange: (preview: StyleCardHoverPreview | null) => void;
}

function resolveStyleCardImageDiagnostics({
  activeCardImage,
}: {
  activeCardImage: StylePresetCardImage | null;
}) {
  return activeCardImage ?? ({ kind: 'empty', src: null } as const);
}

interface StylePresetGroupSectionProps {
  groupKey: string;
  title: string;
  icon?: React.ReactNode;
  presets: StyleRuntimePreset[];
  expanded: boolean;
  gridColumns: number;
  scrollRootRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerWidth: number;
  initiallyVisible: boolean;
  headerClassName: string;
  accentClassName: string;
  titleClassName: string;
  dividerClassName: string;
  showMoreClassName: string;
  renderPresetCard: (preset: StyleRuntimePreset) => React.ReactNode;
  onShowAll: (groupKey: string) => void;
}

interface StylePresetResultButtonProps {
  activeCardImage: StylePresetCardImage | null;
  preset: StyleRuntimePreset;
  onCycle: (dir: number) => void;
  hasMultipleImages: boolean;
  imageIndex: number;
  imageCount: number;
  theme: { color: string; bg: string; border: string; text: string };
  onApply: (preset: StyleRuntimePreset) => void;
}

const StylePresetResultButton: React.FC<StylePresetResultButtonProps> = ({
  activeCardImage,
  preset,
  onCycle,
  hasMultipleImages,
  imageIndex,
  imageCount,
  theme,
  onApply,
}) => {
  const handleApplyFromKeyboard = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.stopPropagation();
    onApply(preset);
  };

  const handleCycleFromKeyboard = (e: React.KeyboardEvent, direction: number) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.stopPropagation();
    onCycle(direction);
  };

  if (activeCardImage) {
    const staleBadge =
      activeCardImage.kind === 'stale-default' ? (
        <div className="absolute left-2 top-2 z-20 rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-amber-200 shadow-lg backdrop-blur-md">
          Stale
        </div>
      ) : activeCardImage.kind === 'variant' ? (
        <div className="absolute left-2 top-2 z-20 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-emerald-100 shadow-lg backdrop-blur-md">
          Variant
        </div>
      ) : activeCardImage.kind === 'preview' ? (
        <div className="absolute left-2 top-2 z-20 rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-sky-100 shadow-lg backdrop-blur-md">
          Preview
        </div>
      ) : null;

    return (
      <div className="absolute inset-0 group/image">
        <button
          type="button"
          aria-label={`Regenerate ${preset.name}`}
          onClick={() => onApply(preset)}
          className="absolute inset-0 z-10 cursor-pointer"
        >
          <img
            src={activeCardImage.src}
            className={`style-preset-thumbnail size-full object-cover transition-[opacity,filter] duration-300 ease-out group-hover/image:opacity-100 group-hover/image:brightness-[1.02] group-hover/image:saturate-[1.02] ${
              activeCardImage.kind === 'stale-default'
                ? 'opacity-[0.82] saturate-[0.86] brightness-[0.92]'
                : activeCardImage.kind === 'preview'
                  ? 'opacity-75 saturate-[0.9]'
                  : 'opacity-[0.96]'
            }`}
            alt={preset.name}
          />
          {activeCardImage.kind === 'stale-default' ? (
            <div className="absolute inset-0 bg-zinc-950/18 transition-colors group-hover/image:bg-zinc-950/10" />
          ) : null}
          <div className="absolute inset-0 bg-zinc-950/35 opacity-0 transition-opacity group-hover/image:opacity-100" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/image:opacity-100">
            <div className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-zinc-950/55 text-white backdrop-blur-md">
              <RefreshCw size={18} />
            </div>
          </div>
        </button>

        {staleBadge}

        {hasMultipleImages && (
          <div className="pointer-events-none absolute inset-y-0 left-2 right-2 z-30 flex items-center justify-between opacity-85 transition-opacity group-hover/image:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCycle(-1);
              }}
              onKeyDown={(e) => handleCycleFromKeyboard(e, -1)}
              className="pointer-events-auto flex size-8 items-center justify-center rounded-full border border-white/15 bg-zinc-950/70 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-zinc-950/85"
              aria-label={`Previous image for ${preset.name}`}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCycle(1);
              }}
              onKeyDown={(e) => handleCycleFromKeyboard(e, 1)}
              className="pointer-events-auto flex size-8 items-center justify-center rounded-full border border-white/15 bg-zinc-950/70 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-zinc-950/85"
              aria-label={`Next image for ${preset.name}`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {hasMultipleImages && (
          <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-zinc-950/60 px-2 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-white/70 backdrop-blur-md">
            {imageIndex + 1} / {imageCount}
          </div>
        )}

        <div className="absolute left-2 top-2 z-20 flex gap-1 opacity-0 transition-opacity group-hover/image:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onApply(preset);
            }}
            onKeyDown={handleApplyFromKeyboard}
            className="rounded-lg border border-white/10 bg-zinc-950/60 p-1.5 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-accent-600"
            title="Regenerate Style"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onApply(preset)}
      className="absolute inset-0 flex size-full cursor-pointer flex-col items-center justify-center gap-3 bg-zinc-900/50 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed"
    >
      <div
        className={`flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors duration-300 group-hover:bg-white/8 ${theme.text}`}
      >
        <Palette size={24} />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 translate-y-2">
        Apply
      </span>
    </button>
  );
};

const StylePresetCard = React.memo(
  ({
    preset,
    visualState,
    active,
    copied,
    favorite,
    theme,
    onApply,
    onCopy,
    onToggleFavorite,
    onHoverPreviewChange,
  }: StylePresetCardProps) => {
    const [imageIndex, setImageIndex] = useState(0);
    const isHoveredRef = useRef(false);

    const resultImages = visualState?.resultImages ?? EMPTY_IMAGES;
    const cardImages = useMemo(
      () =>
        resolveStylePresetCardImages({
          resultImages,
          defaultImage: visualState?.defaultImage,
          defaultImageVariants: visualState?.defaultImageVariants,
          defaultImageStale: visualState?.defaultImageStale ?? false,
          previewImage: visualState?.previewImage,
        }),
      [
        resultImages,
        visualState?.defaultImage,
        visualState?.defaultImageVariants,
        visualState?.defaultImageStale,
        visualState?.previewImage,
      ],
    );
    const hasMultipleImages = cardImages.length > 1;
    const activeCardImage = cardImages[imageIndex] ?? cardImages[0] ?? null;
    const imageDiagnostics = resolveStyleCardImageDiagnostics({
      activeCardImage,
    });

    const prevImageCountRef = useRef(cardImages.length);
    if (prevImageCountRef.current !== cardImages.length) {
      prevImageCountRef.current = cardImages.length;
      setImageIndex(0);
    }

    const applyHoverPreview = useCallback(
      (imageSrc: string | null) => {
        onHoverPreviewChange({
          id: preset.id,
          name: preset.name,
          category: preset.category || 'General',
          packName: visualState?.presetPackName ?? 'Styles',
          aesthetic: preset.style.aesthetic,
          imageSrc,
        });
      },
      [onHoverPreviewChange, preset, visualState?.presetPackName],
    );

    const syncHoverPreview = useCallback(
      (nextIndex: number) => {
        applyHoverPreview(cardImages[nextIndex]?.src || visualState?.exampleImageSrc || null);
      },
      [applyHoverPreview, cardImages, visualState?.exampleImageSrc],
    );

    const handleCycle = useCallback(
      (delta: number) => {
        if (!hasMultipleImages) return;
        setImageIndex((current) => {
          const next = (current + delta + cardImages.length) % cardImages.length;
          if (isHoveredRef.current) {
            queueMicrotask(() => syncHoverPreview(next));
          }
          return next;
        });
      },
      [cardImages.length, hasMultipleImages, syncHoverPreview],
    );

    return (
      <FloatingTooltip
        delay={200}
        content={
          <div className="flex w-64 flex-col gap-2 p-3 text-left">
            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Prompt Preview
            </div>
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto font-mono text-[10px] leading-relaxed text-zinc-300 custom-scrollbar">
              {Object.entries(preset.style).map(([key, value]) => {
                const previewValue = describePreviewValue(value);
                if (!previewValue) return null;
                return (
                  <div key={key}>
                    <span className="capitalize text-zinc-500">{key.replace(/_/g, ' ')}:</span>{' '}
                    {previewValue}
                  </div>
                );
              })}
            </div>
          </div>
        }
      >
        <div
          onPointerEnter={() => {
            isHoveredRef.current = true;
            syncHoverPreview(imageIndex);
          }}
          onPointerLeave={() => {
            isHoveredRef.current = false;
            onHoverPreviewChange(null);
          }}
          data-style-preset-card={preset.id}
          data-style-category={preset.category || 'General'}
          data-style-image-kind={imageDiagnostics.kind}
          data-style-image-src={imageDiagnostics.src ?? ''}
          data-style-default-stale={visualState?.defaultImageStale ? 'true' : 'false'}
          className={`group relative aspect-[3/4] overflow-hidden rounded-xl text-left transition-[border-color,background-color,box-shadow] duration-250 ${
            active
              ? `ring-2 ring-offset-4 ring-offset-black ${theme.border.replace('border', 'ring')} bg-zinc-950 shadow-[0_18px_40px_rgba(0,0,0,0.34)]`
              : 'border border-white/5 bg-zinc-950 hover:border-white/10 hover:bg-zinc-900/95 hover:shadow-[0_14px_30px_rgba(0,0,0,0.24)]'
          }`}
        >
          <div className="absolute inset-0 overflow-hidden bg-zinc-950">
            <StylePresetResultButton
              activeCardImage={activeCardImage}
              preset={preset}
              onCycle={handleCycle}
              hasMultipleImages={hasMultipleImages}
              imageIndex={imageIndex}
              imageCount={cardImages.length}
              theme={theme}
              onApply={onApply}
            />
          </div>

          <div className="absolute right-2 top-2 z-30">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(preset.id);
              }}
              className={`rounded-full border border-white/10 p-1.5 backdrop-blur-md transition-all duration-300 ${favorite ? 'bg-zinc-950/60 text-rose-500' : 'bg-zinc-950/35 text-zinc-500 hover:bg-zinc-950/60 hover:text-rose-400'}`}
              title={favorite ? 'Unpin' : 'Pin to top'}
            >
              <Heart
                size={14}
                fill={favorite ? 'currentColor' : 'none'}
                strokeWidth={favorite ? 0 : 2}
              />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 px-3 pt-4 pb-0">
            <div className="rounded-t-xl rounded-b-none border border-white/10 border-b-0 bg-zinc-950/34 px-3 py-2 text-left shadow-[0_-12px_28px_rgba(0,0,0,0.32)] backdrop-blur-md">
              <button
                type="button"
                onClick={() => onApply(preset)}
                className="flex cursor-pointer flex-col justify-center appearance-none border-none p-0 m-0 bg-transparent text-left w-full"
              >
                <div className="mb-1 flex w-full items-center justify-between gap-2">
                  <span
                    className={`truncate pr-2 text-[9px] font-black uppercase tracking-tight transition-colors ${active ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}
                  >
                    {preset.name}
                  </span>
                  {activeCardImage?.kind === 'result' && (
                    <div className="size-1.5 shrink-0 rounded-full bg-accent-500 shadow-[0_0_5px_rgba(var(--accent-500),0.8)]" />
                  )}
                </div>
                <span className="line-clamp-2 pr-7 text-[8px] leading-relaxed text-zinc-300/80 group-hover:text-zinc-200/90">
                  {preset.style.aesthetic}
                </span>
              </button>

              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                {hasMultipleImages && (
                  <span className="rounded-md border border-white/10 bg-zinc-950/50 px-1.5 py-1 text-[7px] font-black uppercase tracking-[0.18em] text-zinc-300/80">
                    {imageIndex + 1}/{cardImages.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => onCopy(e, preset)}
                  className="rounded-md p-1 text-zinc-400 transition-all hover:bg-white/8 hover:text-white"
                  title="Copy Style Prompt"
                >
                  {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                </button>
              </div>

              {active && (
                <div
                  className={`absolute top-0 right-0 h-0.5 w-full ${theme.bg} shadow-[0_0_10px_currentColor]`}
                />
              )}
            </div>
          </div>
        </div>
      </FloatingTooltip>
    );
  },
);

const StylePresetGroupSection = React.memo(
  ({
    groupKey,
    title,
    icon,
    presets,
    expanded,
    gridColumns,
    scrollRootRef,
    scrollContainerWidth,
    initiallyVisible,
    headerClassName,
    accentClassName,
    titleClassName,
    dividerClassName,
    showMoreClassName,
    renderPresetCard,
    onShowAll,
  }: StylePresetGroupSectionProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isNearViewport, setIsNearViewport] = useState(() => initiallyVisible);
    const visiblePresets = useMemo(
      () => getVisibleStylePresets(presets, expanded, STYLE_GROUP_INITIAL_RENDER_LIMIT),
      [expanded, presets],
    );
    const hiddenPresetCount = expanded ? 0 : presets.length - visiblePresets.length;
    const placeholderHeight = estimateStyleGroupPlaceholderHeight({
      renderedPresetCount: visiblePresets.length,
      gridColumns,
      containerWidth: scrollContainerWidth,
      hasShowMore: hiddenPresetCount > 0,
    });

    useEffect(() => {
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
    }, [scrollRootRef]);

    return (
      <div
        ref={sectionRef}
        data-style-group={groupKey}
        data-style-group-state={isNearViewport ? 'eager' : 'placeholder'}
        data-style-group-planned-cards={visiblePresets.length}
        data-style-group-hidden-cards={hiddenPresetCount}
        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        style={isNearViewport ? undefined : { minHeight: placeholderHeight }}
      >
        <div
          className={`flex items-center gap-3 mb-4 sticky top-0 backdrop-blur-xl py-2 z-10 ${headerClassName}`}
        >
          <div className={`w-1 h-4 rounded-full ${accentClassName}`} />
          {icon ? <span className="text-zinc-400">{icon}</span> : null}
          <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${titleClassName}`}>
            {title}
          </h3>
          <div className={`h-px flex-1 ${dividerClassName}`} />
        </div>

        {isNearViewport ? (
          <>
            <div
              data-style-group-grid={groupKey}
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
              }}
            >
              {visiblePresets.map(renderPresetCard)}
            </div>
            {hiddenPresetCount > 0 && (
              <button
                type="button"
                onClick={() => onShowAll(groupKey)}
                className={showMoreClassName}
              >
                <ChevronRight size={14} />
                Show {hiddenPresetCount} more
              </button>
            )}
          </>
        ) : (
          <div
            aria-hidden="true"
            className="rounded-2xl border border-white/5 bg-zinc-950/20"
            style={{ height: Math.max(120, placeholderHeight - 40) }}
          />
        )}
      </div>
    );
  },
);

function describeStyleValue(value: unknown, fallback = 'Standard'): string {
  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return `${value}`;
  }

  if (Array.isArray(value)) {
    const flattened = value
      .flatMap((entry) => {
        const described = describeStyleValue(entry, '');
        return described ? [described] : [];
      })
      .join(', ');

    return flattened || fallback;
  }

  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

function describePreviewValue(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return `${value}`;
  }

  return null;
}

async function loadPreviewAttachment(previewUrl: string, preset: StyleRuntimePreset) {
  let dataUrl = previewDataUrlCache.get(previewUrl);

  if (!dataUrl) {
    const response = await fetch(previewUrl);
    if (!response.ok) {
      throw new Error(`Unable to load style preview: ${response.status}`);
    }

    const blob = await response.blob();
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Unable to convert style preview into a data URL'));
          return;
        }

        resolve(reader.result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    previewDataUrlCache.set(previewUrl, dataUrl);
  }

  return {
    id: `style-preview-${preset.id}`,
    name: `${preset.category || 'Style Preview'} - reference.webp`,
    dataUrl,
    strength: 0.45,
  };
}

function getPackIcon(id: string): React.ReactNode {
  const size = 18;
  switch (id) {
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
      return <Sparkles size={size} />;
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
      return <Sparkles size={size} />;
    case 'pack_14':
      return <Archive size={size} />;
    case 'pack_15':
      return <Wand2 size={size} />;
    case 'pack_16':
      return <Star size={size} />;
    default:
      return <Layers size={size} />;
  }
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
  // react-doctor-disable-next-line react-doctor/no-event-handler
  const activeImage = config.attachments[0];

  const [currentPackId, setCurrentPackId] = useState(DEFAULT_STYLE_PACK_ID);
  const [loadedStylePacksById, setLoadedStylePacksById] = useState<
    Record<string, StyleRuntimePack>
  >({});
  const [interactionState, setInteractionState] = useState({
    activePresetId: null as string | null,
    copiedStyleId: null as string | null,
    hoveredPresetPreview: null as StyleCardHoverPreview | null,
    styleStrength: 0.8,
  });
  const { activePresetId, copiedStyleId, hoveredPresetPreview, styleStrength } = interactionState;
  const lastHoveredPresetPreviewRef = useRef<StyleCardHoverPreview | null>(null);
  if (hoveredPresetPreview) {
    lastHoveredPresetPreviewRef.current = hoveredPresetPreview;
  }
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const timeout = timeoutRef.current;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  // -- FILTERS & STATE --
  const [browserState, setBrowserState] = useState({
    searchQuery: '',
    sortOrder: 'az' as 'az' | 'za',
    showFavoritesOnly: false,
    isCatalogSearchOpen: false,
    expandedStyleGroups: new Set<string>(),
    showAllStyleCategories: true,
    styleScrollWidth: 0,
  });
  const {
    searchQuery,
    sortOrder,
    showFavoritesOnly,
    isCatalogSearchOpen,
    expandedStyleGroups,
    showAllStyleCategories,
    styleScrollWidth,
  } = browserState;
  const [favorites, setFavorites] = useLocalStorage<string[]>('style-favorites', []);
  const [gridColumns, setGridColumns] = useLocalStorage<number>('styles-grid-columns', 4);
  const styleScrollRootRef = useRef<HTMLDivElement>(null);

  const cacheStylePack = useCallback((pack: StyleRuntimePack) => {
    setLoadedStylePacksById((current) =>
      current[pack.id] === pack ? current : { ...current, [pack.id]: pack },
    );
  }, []);

  useEffect(() => {
    if (currentPackId === FAVORITES_PACK_ID || loadedStylePacksById[currentPackId]) return;

    let cancelled = false;
    void loadStyleRuntimePack(currentPackId).then((pack) => {
      if (!cancelled && pack) cacheStylePack(pack);
    });
    return () => {
      cancelled = true;
    };
  }, [cacheStylePack, currentPackId, loadedStylePacksById]);

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

  const toggleFavorite = React.useCallback(
    (presetId: string) => {
      setFavorites((prev) =>
        prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId],
      );
    },
    [setFavorites],
  );

  const showAllStylesInGroup = useCallback((groupKey: string) => {
    setBrowserState((current) => ({
      ...current,
      expandedStyleGroups: new Set(current.expandedStyleGroups).add(groupKey),
    }));
  }, []);

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

  const activePack = useMemo(() => {
    if (currentPackId === FAVORITES_PACK_ID) {
      return {
        id: FAVORITES_PACK_ID,
        name: 'Your Favorites',
        description: 'A curated collection of your most used styles.',
        presets: [], // Placeholder, populated in processedData
      } satisfies StyleRuntimePack;
    }
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
  }, [currentPackId, loadedStylePacksById]);

  const activeTheme = PACK_THEMES[currentPackId] || PACK_THEMES['pack_01'];
  const resolvedHoveredPresetPreview = hoveredPresetPreview ?? lastHoveredPresetPreviewRef.current;

  const favoritePresets = useMemo(() => {
    const presetById = new Map<string, StyleRuntimePreset>();
    for (const pack of Object.values(loadedStylePacksById)) {
      for (const preset of pack.presets) presetById.set(preset.id, preset);
    }
    return favorites.flatMap((presetId) => {
      const preset = presetById.get(presetId);
      return preset ? [preset] : [];
    });
  }, [favorites, loadedStylePacksById]);

  const getPackIdForPreset = React.useCallback(
    (preset: StyleRuntimePreset) => {
      if (currentPackId !== FAVORITES_PACK_ID) return currentPackId;
      return (
        Object.values(loadedStylePacksById).find((pack) =>
          pack.presets.some((candidate) => candidate.id === preset.id),
        )?.id || activePack.id
      );
    },
    [activePack.id, currentPackId, loadedStylePacksById],
  );

  const presetVisualStateById = useMemo(() => {
    const stateMap = new Map<string, StylePresetVisualState>();

    const visiblePresets =
      currentPackId === FAVORITES_PACK_ID ? favoritePresets : activePack.presets || [];

    visiblePresets.forEach((preset) => {
      const presetPackId = getPackIdForPreset(preset);
      const presetPack = loadedStylePacksById[presetPackId] ?? activePack;
      const resultImages = images
        .filter((img) => hasStylePresetIdentity(img.config, preset.id))
        .sort((a, b) => b.createdAt - a.createdAt);
      const defaultImageStale = isStyleDefaultImageStale(preset.id);
      const defaultImage = resolveStyleDefaultImage(preset.id);
      const defaultImageVariants = resolveStyleDefaultImageVariants(preset.id);
      const categoryImage = preset.category
        ? STYLE_CATEGORY_IMAGES[styleCategoryImageKey(presetPackId, preset.category)]
        : undefined;
      const previewImage =
        categoryImage || (preset.category ? STYLE_CATEGORY_PREVIEWS[preset.category] : undefined);

      stateMap.set(preset.id, {
        presetPackName: presetPack.name,
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
      });
    });

    return stateMap;
  }, [
    activePack,
    currentPackId,
    favoritePresets,
    getPackIdForPreset,
    images,
    loadedStylePacksById,
  ]);

  const filterKey = `${currentPackId}|${searchQuery}|${sortOrder}|${showFavoritesOnly}`;
  const prevFilterKeyRef = useRef(filterKey);
  if (prevFilterKeyRef.current !== filterKey) {
    prevFilterKeyRef.current = filterKey;
    setInteractionState((prev) => ({ ...prev, hoveredPresetPreview: null }));
    setBrowserState((prev) => ({
      ...prev,
      expandedStyleGroups: new Set(),
      showAllStyleCategories: true,
    }));
  }

  const processedData = useMemo(
    () =>
      createStyleBrowserProcessedData({
        activePack,
        currentPackId,
        favoritesPackId: FAVORITES_PACK_ID,
        favoritePresets,
        favoriteIds: favorites,
        searchQuery,
        sortOrder,
        showFavoritesOnly,
      }),
    [
      activePack,
      currentPackId,
      favoritePresets,
      searchQuery,
      sortOrder,
      favorites,
      showFavoritesOnly,
    ],
  );

  const styleRenderPlan = useMemo(
    () =>
      createStyleBrowserRenderPlan({
        processedData,
        showAllStyleCategories,
      }),
    [processedData, showAllStyleCategories],
  );
  const { visibleStyleGroupEntries, hiddenStyleGroupEntries, hiddenStylePresetCount } =
    styleRenderPlan;

  const stylePreviewPreloadSources = useMemo(
    () =>
      collectStylePresetPreviewSources({
        processedData,
        renderPlan: styleRenderPlan,
        visualStateByPresetId: presetVisualStateById,
      }),
    [processedData, presetVisualStateById, styleRenderPlan],
  );

  useEffect(() => {
    stylePreviewPreloadSources.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, [stylePreviewPreloadSources]);

  const handleApplyStyle = async (preset: StyleRuntimePreset, presetPackIdOverride?: string) => {
    setInteractionState((prev) => ({ ...prev, activePresetId: preset.id }));

    const presetPackId = presetPackIdOverride ?? getPackIdForPreset(preset);
    const categoryBaseUrl = preset.category
      ? STYLE_CATEGORY_IMAGES[styleCategoryImageKey(presetPackId, preset.category)]
      : undefined;
    const fallbackPreviewUrl =
      categoryBaseUrl ||
      (preset.category ? STYLE_CATEGORY_PREVIEWS[preset.category] : undefined) ||
      STYLE_PACK_FALLBACK_IMAGES[presetPackId];
    const fallbackAttachment =
      !activeImage && fallbackPreviewUrl
        ? await loadPreviewAttachment(fallbackPreviewUrl, preset)
        : null;
    const diversityPrompts = [
      'Introduce a noticeably different camera distance and framing from previous renders.',
      'Shift scene energy with a different gesture or action beat while preserving the subject intent.',
      'Use a clearly distinct lighting setup and color balance versus prior attempts.',
      'Vary background staging and spatial depth so this render is visibly unique.',
    ] as const;
    const diversityHint = diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)];
    const effectiveImage = activeImage || fallbackAttachment;
    const normalizedReference = effectiveImage
      ? {
          ...effectiveImage,
          strength: 0.15,
        }
      : null;
    const intensity = styleStrength;
    const isPhotoPackFallback = ['pack_09', 'pack_10', 'pack_11'].includes(presetPackId);
    const subjectTreatment = describeStyleValue(
      preset.style.subject_treatment ?? preset.style.form_and_line,
    );
    const colorTone = describeStyleValue(preset.style.color_and_tone ?? preset.style.color_palette);
    const lightingShadow = describeStyleValue(
      preset.style.lighting_and_shadow ?? preset.style.lighting_setup,
    );
    const textureMaterial = describeStyleValue(
      preset.style.texture_and_material ?? preset.style.material_texture,
    );
    const cameraComposition = describeStyleValue(
      preset.style.camera_and_composition ?? preset.style.spatial_distortion,
    );
    const atmosphereMood = describeStyleValue(
      preset.style.atmosphere_and_mood ?? preset.style.atmosphere,
    );
    const renderingQuality = describeStyleValue(
      preset.style.rendering_and_quality ?? preset.style.render_quality,
    );

    const presetNegative =
      preset.negativePrompt ||
      (isPhotoPackFallback
        ? 'illustration, drawing, painting, sketch, cartoon, anime, 2d, graphic, flat, vector, ink'
        : '');

    // --- SEMANTIC ABSTRACTION PROMPTING ---
    let roleInstruction = '';
    let compositionRule = '';

    if (!effectiveImage) {
      roleInstruction = `
        Synthesize the requested subject in the target style from scratch.
        Ensure the style's DNA is the primary driver of the visual output.
        Focus on creating a high-quality, coherent image that embodies the aesthetic.
      `;
      compositionRule = 'Create a balanced and aesthetically pleasing composition.';
    } else {
      roleInstruction = `
        Use the provided image only as a loose semantic reference for subject intent.
        DO NOT preserve pose, framing, camera angle, or original composition.
        Re-stage the subject with a clearly different gesture, perspective, and environment while applying the target style DNA.
        Make the result feel freshly generated, not a repaint of the input.
      `;
      compositionRule =
        'Preserve only subject intent; force substantial variation in pose, camera, composition, lighting, and scene staging.';
    }

    let styleEmphasis = '';
    if (intensity > 0.85) {
      styleEmphasis = `
        EXAGGERATE the style features. 
        If the style is rough, make it messy. 
        If the style is colorful, oversaturate it. 
        Push the aesthetic to its limit.
        `;
    }
    styleEmphasis = styleEmphasis ? `${styleEmphasis.trim()}\n${diversityHint}` : diversityHint;

    const styleRecipeParams = {
      presetId: preset.id,
      presetName: preset.name,
      mode: fallbackAttachment
        ? 'PACK_CATEGORY_BASE_STYLE_APPLICATION'
        : activeImage
          ? 'CREATIVE_REIMAGINING'
          : 'DIRECT_STYLE_SYNTHESIS',
      roleInstruction: roleInstruction.trim(),
      compositionRule: compositionRule.trim(),
      styleEmphasis: styleEmphasis.trim(),
      aesthetic: preset.style.aesthetic,
      subjectTreatment,
      colorTone,
      lightingShadow,
      textureMaterial,
      cameraComposition,
      atmosphereMood,
      renderingQuality,
      creativeBrief: preset.style.creative_brief ?? '',
    };

    onGenerate(
      undefined,
      {
        recipeId: 'styles',
        recipeParams: styleRecipeParams,
        recipeContext: '',
        attachments: normalizedReference ? [normalizedReference] : [],
        model: config.model,
        imageSize: config.imageSize,
        batchCount: config.batchCount,
        aspectRatio: config.aspectRatio,
        executionModel: config.executionModel,
        executionReasoningEffort: config.executionReasoningEffort,
        executionSpeed: config.executionSpeed,
        negativePrompt: config.negativePrompt
          ? `${config.negativePrompt}, ${presetNegative}`
          : presetNegative,
      },
      { preventModal: true },
    );
  };

  const handleApplyStyleRef = useRef(handleApplyStyle);
  handleApplyStyleRef.current = handleApplyStyle;

  const handleCloseCatalogSearch = useCallback(
    () => setBrowserState((prev) => ({ ...prev, isCatalogSearchOpen: false })),
    [],
  );

  const handleSelectCatalogPreset = useCallback((result: StylePresetCatalogSearchResult) => {
    startViewTransition(() => {
      setCurrentPackId(result.packId);
      setInteractionState((prev) => ({ ...prev, activePresetId: result.id }));
      setBrowserState((prev) => ({
        ...prev,
        searchQuery: result.name,
        showAllStyleCategories: true,
        expandedStyleGroups: new Set([result.categoryName]),
      }));
    });
    setBrowserState((prev) => ({ ...prev, isCatalogSearchOpen: false }));
  }, []);

  const handleApplyCatalogPreset = useCallback(
    async (result: StylePresetCatalogSearchResult) => {
      const loadedPack =
        loadedStylePacksById[result.packId] ?? (await loadStyleRuntimePack(result.packId));
      if (loadedPack) cacheStylePack(loadedPack);
      const preset = loadedPack?.presets.find((candidate) => candidate.id === result.id);
      if (!preset) return;

      setCurrentPackId(result.packId);
      setInteractionState((prev) => ({ ...prev, activePresetId: result.id }));
      setBrowserState((prev) => ({ ...prev, isCatalogSearchOpen: false }));
      void handleApplyStyleRef.current(preset, result.packId);
    },
    [loadedStylePacksById, cacheStylePack],
  );

  const handleCopyStylePrompt = (e: React.MouseEvent, preset: StyleRuntimePreset) => {
    e.stopPropagation();
    const promptText = `
**Style:** ${preset.name}
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
    if (files.length > 0) onFileSelect(files);
  };

  const handleHoverPreviewChange = useCallback((preview: StyleCardHoverPreview | null) => {
    setInteractionState((prev) => ({ ...prev, hoveredPresetPreview: preview }));
  }, []);

  const renderPresetCard = React.useCallback(
    (preset: StyleRuntimePreset) => {
      return (
        <StylePresetCard
          key={preset.id}
          preset={preset}
          visualState={presetVisualStateById.get(preset.id)}
          active={activePresetId === preset.id}
          copied={copiedStyleId === preset.id}
          favorite={favorites.includes(preset.id)}
          theme={activeTheme}
          onApply={handleApplyStyleRef.current}
          onCopy={handleCopyStylePromptRef.current}
          onToggleFavorite={toggleFavorite}
          onHoverPreviewChange={handleHoverPreviewChange}
        />
      );
    },
    [
      activePresetId,
      copiedStyleId,
      favorites,
      activeTheme,
      toggleFavorite,
      presetVisualStateById,
      handleHoverPreviewChange,
    ],
  );

  return (
    <RecipeLayout isGenerating={isGenerating} className="flex size-full">
      {/* LEFT: VISUAL CONTEXT PREVIEW */}
      <div className="w-[30%] 2xl:w-[25%] h-full flex flex-col p-6 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full min-h-full flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                Reference
              </h2>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                Input Source
              </p>
            </div>
          </div>

          <div className="group relative w-full min-h-96 flex-1 shrink-0">
            <div className="relative size-full overflow-hidden rounded-3xl">
              {activeImage ? (
                <div className="size-full relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/20">
                  <img
                    src={activeImage.dataUrl}
                    className="size-full object-contain p-2 opacity-90 group-hover:opacity-100 transition-opacity"
                    alt=""
                  />
                  <button
                    type="button"
                    onClick={() => updateConfig('attachments', [])}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex size-full cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border-2 border-dashed border-white/5 bg-white/1 transition-all hover:border-white/20 hover:bg-white/3 appearance-none p-0 m-0"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    aria-label="Upload reference image"
                    onChange={(e) => {
                      if (e.target.files) {
                        onFileSelect(Array.from(e.target.files));
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                    accept="image/*"
                  />
                  <div className="size-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-white/20 transition-all shadow-2xl">
                    <Upload
                      size={24}
                      className="text-zinc-600 group-hover:text-white transition-colors"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-base font-black text-zinc-500 group-hover:text-white uppercase tracking-tight transition-colors">
                      Upload or enter prompt
                    </h3>
                  </div>
                </button>
              )}

              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                <div
                  className="t-panel-slide relative size-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
                  data-open={hoveredPresetPreview ? 'true' : 'false'}
                  style={{ '--panel-translate-y': '48px' } as React.CSSProperties}
                >
                  {resolvedHoveredPresetPreview && (
                    <>
                      {resolvedHoveredPresetPreview.imageSrc ? (
                        <img
                          src={resolvedHoveredPresetPreview.imageSrc}
                          className="absolute inset-0 size-full object-cover"
                          alt={resolvedHoveredPresetPreview.name}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 text-zinc-500">
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                              <Palette size={28} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.24em]">
                              Style Preview
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-black/5" />

                      <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                        <div className="max-w-[76%] rounded-2xl border border-white/10 bg-zinc-950/35 px-3.5 py-3 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.34)]">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[7px] font-black uppercase tracking-[0.22em] text-white/65">
                              {resolvedHoveredPresetPreview.packName}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[7px] font-black uppercase tracking-[0.22em] text-zinc-300/80">
                              {resolvedHoveredPresetPreview.category}
                            </span>
                          </div>

                          <h3 className="mt-2.5 truncate text-xs font-black uppercase tracking-[0.02em] text-white">
                            {resolvedHoveredPresetPreview.name}
                          </h3>

                          <p className="mt-1.5 line-clamp-2 text-[9px] leading-relaxed text-zinc-200/78">
                            {resolvedHoveredPresetPreview.aesthetic}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CONTROL SLIDERS */}
          {activeImage && (
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
              <Slider
                icon={<Palette className="text-zinc-500 size-4" />}
                label="Style Strength"
                value={styleStrength}
                min={0.1}
                max={1}
                step={0.05}
                onChange={(value) =>
                  setInteractionState((prev) => ({ ...prev, styleStrength: value }))
                }
              />

              <div className="flex justify-between mt-2 text-[8px] font-black uppercase tracking-widest text-zinc-600">
                <span>Re-Imagine</span>
                <span>{styleStrength > 0.8 ? 'Exaggerated' : 'Balanced'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: STYLE BROWSER */}
      <div data-style-browser-root className="flex-1 h-full flex flex-col bg-[#060606] relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" />

        {/* Pack Tabs */}
        <div className="vt-recipe-tabs h-16 flex items-center px-6 border-b border-white/5 gap-2 overflow-x-auto custom-scrollbar bg-zinc-950/40 backdrop-blur-md z-20">
          {/* Favorites Tab */}
          <button
            type="button"
            onClick={() => {
              startViewTransition(() => {
                setCurrentPackId(FAVORITES_PACK_ID);
                setBrowserState((prev) => ({ ...prev, searchQuery: '' }));
              });
            }}
            className={`
                  group relative h-9 shrink-0 overflow-hidden rounded-lg px-3 transition-all duration-300 flex items-center gap-2
                    ${
                      currentPackId === FAVORITES_PACK_ID
                        ? `bg-rose-950 border border-rose-500/50 text-rose-400 shadow-lg`
                        : 'bg-transparent hover:bg-white/5 text-zinc-500 hover:text-rose-400'
                    }
                `}
          >
            <Heart size={16} fill={currentPackId === FAVORITES_PACK_ID ? 'currentColor' : 'none'} />
            {currentPackId === FAVORITES_PACK_ID && (
              <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                Favorites
              </span>
            )}
          </button>

          {/* Standard Packs */}
          {STYLE_RUNTIME_PACK_SUMMARIES.map((pack) => {
            const isActive = currentPackId === pack.id;
            const theme = PACK_THEMES[pack.id] || PACK_THEMES['pack_01'];

            return (
              <button
                type="button"
                key={pack.id}
                data-style-pack-id={pack.id}
                data-style-pack-active={isActive ? 'true' : 'false'}
                onClick={() => {
                  startViewTransition(() => {
                    setCurrentPackId(pack.id);
                    setBrowserState((prev) => ({ ...prev, searchQuery: '' }));
                  });
                }}
                className={`
                      group relative h-9 shrink-0 overflow-hidden rounded-lg px-3 transition-all duration-300 flex items-center gap-2
                            ${
                              isActive
                                ? `bg-zinc-800 border border-white/10 text-white shadow-lg`
                                : 'bg-transparent hover:bg-white/5 text-zinc-500 hover:text-zinc-300'
                            }
                        `}
              >
                <div className={`relative z-10 transition-colors ${isActive ? theme.text : ''}`}>
                  {getPackIcon(pack.id)}
                </div>

                {isActive && (
                  <span className="relative z-10 text-[9px] font-black uppercase tracking-widest whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                    {pack.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Pack Header Info + Search Bar */}
        <div className="px-8 pt-6 pb-2 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <h2
              className={`text-2xl font-black uppercase tracking-tighter mb-1 transition-colors duration-500 ${activeTheme.text}`}
            >
              {activePack.name}
            </h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              {activePack.description}
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex items-center gap-2 p-1 rounded-xl border border-white/5">
            <div className="flex min-w-50 flex-1 items-center gap-2 rounded-lg border border-white/5 bg-zinc-950/40 px-3 py-1.5">
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
              onClick={() => setBrowserState((prev) => ({ ...prev, isCatalogSearchOpen: true }))}
              data-style-open-catalog
              className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
              title="Open Style Catalog"
            >
              <BookOpen size={15} />
              Catalog
            </button>

            <button
              type="button"
              onClick={() =>
                setBrowserState((prev) => ({
                  ...prev,
                  sortOrder: prev.sortOrder === 'az' ? 'za' : 'az',
                }))
              }
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
              title={sortOrder === 'az' ? 'Sort A-Z' : 'Sort Z-A'}
            >
              <ArrowUpDown size={16} />
            </button>

            {currentPackId !== FAVORITES_PACK_ID && (
              <button
                type="button"
                onClick={() =>
                  setBrowserState((prev) => ({
                    ...prev,
                    showFavoritesOnly: !prev.showFavoritesOnly,
                  }))
                }
                className={`p-1.5 rounded-lg transition-colors ${showFavoritesOnly ? 'text-rose-400 bg-rose-500/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                title="Filter Favorites in this Pack"
              >
                <Heart size={16} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
              </button>
            )}

            <div className="h-6 w-px bg-white/5" />

            <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-zinc-950/40 px-2 py-1">
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

        {/* The Grid - Grouped by Category */}
        <div
          ref={styleScrollRootRef}
          className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-12 pt-4"
        >
          <div className="w-full pb-20 space-y-10">
            {/* FAVORITES SECTION (If any exist in current filter and not in favorites tab) */}
            {processedData.favorites.length > 0 && currentPackId !== FAVORITES_PACK_ID && (
              <StylePresetGroupSection
                groupKey="favorites"
                title="Pinned / Favorites"
                presets={processedData.favorites}
                expanded
                gridColumns={gridColumns}
                scrollRootRef={styleScrollRootRef}
                scrollContainerWidth={styleScrollWidth}
                initiallyVisible
                headerClassName="opacity-100"
                accentClassName="bg-rose-500"
                titleClassName="text-rose-400"
                dividerClassName="bg-linear-to-r from-rose-500/20 to-transparent"
                showMoreClassName="mt-4 flex h-9 items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 text-[10px] font-black uppercase tracking-widest text-rose-300 transition-colors hover:bg-rose-500/20"
                renderPresetCard={renderPresetCard}
                onShowAll={showAllStylesInGroup}
              />
            )}

            {/* OTHER CATEGORIES */}
            {visibleStyleGroupEntries.map(([category, presets], index) => {
              const categoryIdentity = getCategoryVisualIdentity(currentPackId, category);
              return (
                <StylePresetGroupSection
                  key={category}
                  groupKey={category}
                  title={category}
                  icon={categoryIdentity?.icon}
                  presets={presets}
                  expanded
                  gridColumns={gridColumns}
                  scrollRootRef={styleScrollRootRef}
                  scrollContainerWidth={styleScrollWidth}
                  initiallyVisible={index === 0 && processedData.favorites.length === 0}
                  headerClassName="opacity-60"
                  accentClassName={categoryIdentity?.accentClassName ?? activeTheme.bg}
                  titleClassName={categoryIdentity?.titleClassName ?? 'text-zinc-300'}
                  dividerClassName="bg-white/10"
                  showMoreClassName="mt-4 flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                  renderPresetCard={renderPresetCard}
                  onShowAll={showAllStylesInGroup}
                />
              );
            })}

            {hiddenStyleGroupEntries.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setBrowserState((prev) => ({ ...prev, showAllStyleCategories: true }))
                }
                data-style-show-all-categories
                data-style-hidden-groups={hiddenStyleGroupEntries.length}
                data-style-hidden-presets={hiddenStylePresetCount}
                className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronRight size={14} />
                Show {hiddenStyleGroupEntries.length} more categories ({hiddenStylePresetCount}{' '}
                styles)
              </button>
            )}

            {processedData.favorites.length === 0 &&
              Object.keys(processedData.groups).length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-600 gap-4">
                  <Filter size={32} className="opacity-20" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    No styles found matching criteria
                  </span>
                </div>
              )}
          </div>
        </div>

        {isCatalogSearchOpen && (
          <React.Suspense
            fallback={
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-zinc-950/86 text-[10px] font-black uppercase tracking-widest text-zinc-500 backdrop-blur-xl">
                Loading catalog
              </div>
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
    </RecipeLayout>
  );
};
