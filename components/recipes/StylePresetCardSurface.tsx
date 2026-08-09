import {
  IconCheck as Check,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconCopy as Copy,
  IconHeart as Heart,
  IconPalette as Palette,
  IconPlus as Plus,
} from '@tabler/icons-react';
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { GeneratedImageWithConfig } from '../../types';
import {
  resolveStylePresetCardImages,
  type StylePresetCardImage,
} from '../../lib/stylePresetVisuals';
import { FloatingTooltip } from '../ui/FloatingTooltip';
import { getStyleRuntimePresetDisplayName, type StyleRuntimePreset } from './stylesData';
import type { StyleCollectionRuntimePreset } from './styles/collections';
import type { StyleTheme } from './StyleRecipeNavigationPanel';

const EMPTY_IMAGES: GeneratedImageWithConfig[] = [];

export interface StyleCardHoverPreview {
  id: string;
  name: string;
  category: string;
  packName: string;
  aesthetic: string;
  imageSrc: string | null;
}

export interface StylePresetVisualState {
  presetPackName: string;
  resultImages: GeneratedImageWithConfig[];
  defaultImage: string | undefined;
  defaultImageVariants: string[];
  defaultImageStale: boolean;
  previewImage: string | undefined;
  exampleImageSrc: string | null;
}

export interface StylePresetSourceProvenance {
  sourcePackId: string;
  sourcePackName: string;
  sourceCategory: string;
  collectionRole: StyleCollectionRuntimePreset['collectionRole'];
}

export type StylePresetFadeImageComponent = React.ComponentType<
  React.ImgHTMLAttributes<HTMLImageElement>
>;

export interface StylePresetCardProps {
  preset: StyleRuntimePreset;
  packId: string;
  sourceProvenance?: StylePresetSourceProvenance;
  visualState: StylePresetVisualState | undefined;
  active: boolean;
  selectionDisabled?: boolean;
  copied: boolean;
  favorite: boolean;
  theme: StyleTheme;
  FadeImageComponent: StylePresetFadeImageComponent;
  onApply: (preset: StyleRuntimePreset) => void;
  onCopy: (e: React.MouseEvent, preset: StyleRuntimePreset) => void;
  onToggleFavorite: (presetId: string) => void;
  onHoverPreviewChange: (preview: StyleCardHoverPreview | null) => void;
}

function describePreviewValue(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number') return String(value);
  return null;
}

function resolveStyleCardImageDiagnostics({
  activeCardImage,
}: {
  activeCardImage: StylePresetCardImage | null;
}) {
  return activeCardImage ?? ({ kind: 'empty', src: null } as const);
}

interface StylePresetResultButtonProps {
  activeCardImage: StylePresetCardImage | null;
  preset: StyleRuntimePreset;
  active: boolean;
  selectionDisabled: boolean;
  onCycle: (dir: number) => void;
  hasMultipleImages: boolean;
  theme: StyleTheme;
  FadeImageComponent: StylePresetFadeImageComponent;
  onApply: (preset: StyleRuntimePreset) => void;
}

const StylePresetResultButton: React.FC<StylePresetResultButtonProps> = ({
  activeCardImage,
  preset,
  active,
  selectionDisabled,
  onCycle,
  hasMultipleImages,
  theme,
  FadeImageComponent,
  onApply,
}) => {
  const presetDisplayName = getStyleRuntimePresetDisplayName(preset);

  const handleApplyFromKeyboard = (e: React.KeyboardEvent) => {
    if (selectionDisabled) return;
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
        <div className="absolute left-2 top-2 z-20 rounded-[6px] border border-amber-400/30 bg-amber-500/15 px-2 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-amber-200 shadow-lg backdrop-blur-md">
          Stale
        </div>
      ) : activeCardImage.kind === 'preview' ? (
        <div className="absolute left-2 top-2 z-20 rounded-[6px] border border-sky-400/30 bg-sky-500/15 px-2 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-sky-100 shadow-lg backdrop-blur-md">
          Preview
        </div>
      ) : null;

    return (
      <div className="absolute inset-0 group/image">
        <button
          type="button"
          aria-label={`${active ? 'Remove' : 'Select'} ${presetDisplayName}`}
          onClick={() => onApply(preset)}
          disabled={selectionDisabled}
          title={selectionDisabled ? 'Maximum 5 styles selected' : undefined}
          className="absolute inset-0 z-10 cursor-pointer disabled:cursor-not-allowed"
        >
          <FadeImageComponent
            src={activeCardImage.src}
            width={300}
            height={400}
            loading="lazy"
            decoding="async"
            className={`style-preset-thumbnail size-full object-cover transition-[opacity,filter] duration-300 ease-out group-hover/image:opacity-100 group-hover/image:brightness-[1.02] group-hover/image:saturate-[1.02] ${
              activeCardImage.kind === 'stale-default'
                ? 'opacity-[0.82] saturate-[0.86] brightness-[0.92]'
                : activeCardImage.kind === 'preview'
                  ? 'opacity-75 saturate-[0.9]'
                  : 'opacity-[0.96]'
            }`}
            alt={presetDisplayName}
          />
          {activeCardImage.kind === 'stale-default' ? (
            <div className="absolute inset-0 bg-zinc-950/18 transition-colors group-hover/image:bg-zinc-950/10" />
          ) : null}
          <div className="absolute inset-0 bg-zinc-950/35 opacity-0 transition-opacity group-hover/image:opacity-100" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/image:opacity-100">
            <div className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-zinc-950/55 text-white backdrop-blur-md">
              {active ? <Check size={18} /> : <Plus size={18} />}
            </div>
          </div>
        </button>

        {staleBadge}

        {hasMultipleImages && (
          <div className="pointer-events-none absolute inset-y-0 left-2 right-2 z-30 flex items-center justify-between opacity-0 transition-opacity group-hover/image:opacity-100 group-focus-within/image:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCycle(-1);
              }}
              onKeyDown={(e) => handleCycleFromKeyboard(e, -1)}
              className="pointer-events-auto flex size-8 items-center justify-center rounded-[6px] border border-white/15 bg-zinc-950/70 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-zinc-950/85"
              aria-label={`Previous image for ${presetDisplayName}`}
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
              className="pointer-events-auto flex size-8 items-center justify-center rounded-[6px] border border-white/15 bg-zinc-950/70 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-zinc-950/85"
              aria-label={`Next image for ${presetDisplayName}`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <div className="absolute left-2 top-2 z-20 flex gap-1 opacity-0 transition-opacity group-hover/image:opacity-100">
          <button
            type="button"
            aria-label={`${active ? 'Remove' : 'Select'} style ${presetDisplayName}`}
            onClick={(e) => {
              e.stopPropagation();
              onApply(preset);
            }}
            onKeyDown={handleApplyFromKeyboard}
            disabled={selectionDisabled}
            className="rounded-[6px] border border-white/10 bg-zinc-950/60 p-1.5 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-45"
            title={
              selectionDisabled
                ? 'Maximum 5 styles selected'
                : active
                  ? 'Remove style'
                  : 'Select style'
            }
          >
            {active ? <Check size={14} /> : <Plus size={14} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onApply(preset)}
      disabled={selectionDisabled}
      className="absolute inset-0 flex size-full cursor-pointer flex-col items-center justify-center gap-3 bg-zinc-900/50 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed"
      aria-pressed={active}
    >
      <div
        className={`flex size-14 items-center justify-center rounded-[6px] border border-white/10 bg-white/5 transition-colors duration-300 group-hover:bg-white/8 ${theme.text}`}
      >
        <Palette size={24} />
      </div>
      <span className="translate-y-2 text-[9px] font-black uppercase tracking-widest text-zinc-600 opacity-0 transition-[opacity,transform] group-hover:translate-y-0 group-hover:opacity-100">
        {active ? 'Selected' : 'Select'}
      </span>
    </button>
  );
};

export const StylePresetCard = React.memo(function StylePresetCard({
  preset,
  packId,
  sourceProvenance,
  visualState,
  active,
  selectionDisabled = false,
  copied,
  favorite,
  theme,
  FadeImageComponent,
  onApply,
  onCopy,
  onToggleFavorite,
  onHoverPreviewChange,
}: StylePresetCardProps) {
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
  const presetDisplayName = getStyleRuntimePresetDisplayName(preset);
  const imageDiagnostics = resolveStyleCardImageDiagnostics({
    activeCardImage,
  });

  useLayoutEffect(() => {
    setImageIndex(0);
  }, [cardImages.length]);

  const applyHoverPreview = useCallback(
    (imageSrc: string | null) => {
      onHoverPreviewChange({
        id: preset.id,
        name: presetDisplayName,
        category: preset.category || 'General',
        packName: visualState?.presetPackName ?? 'Styles',
        aesthetic: preset.style.aesthetic,
        imageSrc,
      });
    },
    [onHoverPreviewChange, preset, presetDisplayName, visualState?.presetPackName],
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
      const next = (imageIndex + delta + cardImages.length) % cardImages.length;
      setImageIndex(next);
      if (isHoveredRef.current) {
        queueMicrotask(() => syncHoverPreview(next));
      }
    },
    [cardImages.length, hasMultipleImages, imageIndex, syncHoverPreview],
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
        data-style-pack-id={packId}
        data-style-category={preset.category || 'General'}
        data-style-image-kind={imageDiagnostics.kind}
        data-style-image-src={imageDiagnostics.src ?? ''}
        data-style-default-stale={visualState?.defaultImageStale ? 'true' : 'false'}
        data-style-source-pack-id={sourceProvenance?.sourcePackId ?? ''}
        data-style-source-category={sourceProvenance?.sourceCategory ?? ''}
        data-style-collection-role={sourceProvenance?.collectionRole ?? ''}
        className={`group relative aspect-[3/4] overflow-hidden rounded-[6px] text-left transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 ${
          active
            ? `ring-2 ring-offset-4 ring-offset-black ${theme.border.replace('border', 'ring')} bg-zinc-950 shadow-[0_18px_40px_rgba(0,0,0,0.34)]`
            : 'border border-white/5 bg-zinc-950 hover:border-white/10 hover:bg-zinc-900/95 hover:shadow-[0_14px_30px_rgba(0,0,0,0.24)]'
        }`}
        style={
          {
            contentVisibility: 'auto',
            containIntrinsicSize: '280px 210px',
          } as React.CSSProperties
        }
      >
        <div className="absolute inset-0 overflow-hidden bg-zinc-950">
          <StylePresetResultButton
            activeCardImage={activeCardImage}
            preset={preset}
            active={active}
            selectionDisabled={selectionDisabled}
            onCycle={handleCycle}
            hasMultipleImages={hasMultipleImages}
            theme={theme}
            FadeImageComponent={FadeImageComponent}
            onApply={onApply}
          />
        </div>

        <div className="pointer-events-none absolute right-2 top-2 z-30 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
          <button
            type="button"
            aria-label={`${favorite ? 'Unpin' : 'Pin'} style ${presetDisplayName}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(preset.id);
            }}
            className={`rounded-[6px] border border-white/10 p-1.5 backdrop-blur-md transition-[background-color,color,border-color,transform] duration-150 ${favorite ? 'bg-zinc-950/60 text-rose-500' : 'bg-zinc-950/35 text-zinc-500 hover:bg-zinc-950/60 hover:text-rose-400'}`}
            title={favorite ? 'Unpin' : 'Pin to top'}
          >
            <Heart
              size={14}
              fill={favorite ? 'currentColor' : 'none'}
              strokeWidth={favorite ? 0 : 2}
            />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="relative w-full rounded-t-[6px] rounded-b-none border-t border-white/10 bg-zinc-950/58 px-3 py-2 text-left shadow-[0_-12px_28px_rgba(0,0,0,0.32)] backdrop-blur-md transition-transform duration-200 ease-out group-hover:-translate-y-1 group-focus-within:-translate-y-1">
            {sourceProvenance ? (
              <div
                data-style-source-provenance
                data-style-source-pack-id={sourceProvenance.sourcePackId}
                data-style-source-category={sourceProvenance.sourceCategory}
                data-style-collection-role={sourceProvenance.collectionRole}
                className="mb-1 flex min-w-0 items-center gap-1 text-[8px] font-black uppercase tracking-widest text-zinc-400"
                title={`${sourceProvenance.sourcePackName} / ${sourceProvenance.sourceCategory}`}
              >
                <span className="shrink-0 rounded-[4px] border border-white/10 bg-white/[0.045] px-1.5 py-0.5 text-zinc-300">
                  {sourceProvenance.sourcePackName}
                </span>
                <span className="min-w-0 truncate rounded-[4px] border border-white/8 bg-black/18 px-1.5 py-0.5 text-zinc-500">
                  {sourceProvenance.sourceCategory}
                </span>
                {sourceProvenance.collectionRole !== 'primary' ? (
                  <span className="shrink-0 rounded-[4px] border border-white/8 px-1 py-0.5 text-zinc-500">
                    {sourceProvenance.collectionRole.replace('_', ' ')}
                  </span>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => onApply(preset)}
              disabled={selectionDisabled}
              aria-pressed={active}
              title={selectionDisabled ? 'Maximum 5 styles selected' : undefined}
              className="flex cursor-pointer flex-col justify-center appearance-none border-none p-0 m-0 bg-transparent text-left w-full disabled:cursor-not-allowed"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span
                  className={`truncate pr-8 text-[9px] font-black uppercase tracking-tight transition-colors ${active ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}
                >
                  {presetDisplayName}
                </span>
                {activeCardImage?.kind === 'result' && (
                  <div className="size-1.5 shrink-0 rounded-full bg-accent-500 shadow-[0_0_5px_rgba(var(--accent-500),0.8)]" />
                )}
              </div>
              <span className="mt-1 block max-h-0 overflow-hidden pr-7 text-[8px] leading-relaxed text-zinc-300/80 opacity-0 transition-[max-height,opacity,transform,color] duration-200 ease-out group-hover:max-h-10 group-hover:translate-y-0 group-hover:opacity-100 group-hover:text-zinc-200/90 group-focus-within:max-h-10 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {preset.style.aesthetic}
              </span>
            </button>

            <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <button
                type="button"
                aria-label={`Copy style prompt for ${presetDisplayName}`}
                onClick={(e) => onCopy(e, preset)}
                className="rounded-[6px] p-1 text-zinc-400 transition-[background-color,color,transform] hover:bg-white/8 hover:text-white"
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
});
