import {
  IconCheck as Check,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconCopy as Copy,
  IconHeart as Heart,
  IconPalette as Palette,
  IconPlus as Plus,
  IconEye as Eye,
  IconX as X,
} from '@tabler/icons-react';
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { GeneratedImageWithConfig } from '../../types';
import {
  resolveStylePresetCardImages,
  type StylePresetCardImage,
  type StylePresetImageVariant,
} from '../../lib/stylePresetVisuals';
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
  defaultImageVariants: StylePresetImageVariant[];
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
  onPreview: () => void;
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
  onPreview,
  hasMultipleImages,
  theme,
  FadeImageComponent,
  onApply,
}) => {
  const presetDisplayName = getStyleRuntimePresetDisplayName(preset);

  const handleCycleFromKeyboard = (e: React.KeyboardEvent, direction: number) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.stopPropagation();
    onCycle(direction);
  };

  if (activeCardImage) {
    const variantBadge = hasMultipleImages ? (
      <div
        aria-live="polite"
        aria-atomic="true"
        data-style-active-image-label={activeCardImage.label}
        className="pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)]/65 px-2 py-1 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)] shadow-lg backdrop-blur-md"
      >
        {activeCardImage.label}
      </div>
    ) : null;

    const staleBadge =
      activeCardImage.kind === 'stale-default' ? (
        <div className="pointer-events-none absolute left-2 top-11 z-20 rounded-[var(--wb-radius)] border border-amber-400/2 bg-amber-500/15 px-2 py-1 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-warning)] shadow-lg backdrop-blur-md">
          Stale
        </div>
      ) : activeCardImage.kind === 'preview' ? (
        <div className="pointer-events-none absolute left-2 top-11 z-20 rounded-[var(--wb-radius)] border border-sky-400/2 bg-sky-500/15 px-2 py-1 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-info)] shadow-lg backdrop-blur-md">
          Preview
        </div>
      ) : null;

    return (
      <div className="absolute inset-0 group/image">
        <button
          type="button"
          aria-label={`Preview ${presetDisplayName}`}
          onClick={onPreview}
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
            <div className="absolute inset-0 bg-[color:var(--wb-panel)]/18 transition-colors group-hover/image:bg-[color:var(--wb-panel)]/10" />
          ) : null}
          <div className="absolute inset-0 bg-[color:var(--wb-panel)]/35 opacity-0 transition-opacity group-hover/image:opacity-100" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/image:opacity-100">
            <div className="flex size-10 items-center justify-center rounded-full border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)]/55 text-[color:var(--wb-ink)] backdrop-blur-md">
              <Eye size={18} />
            </div>
          </div>
        </button>

        {staleBadge}
        {variantBadge}

        {hasMultipleImages && (
          <div className="pointer-events-none absolute inset-y-0 left-2 right-2 z-30 flex items-center justify-between opacity-0 transition-opacity group-hover/image:opacity-100 group-focus-within/image:opacity-100 [@media(hover:none)]:opacity-100 [@media(pointer:coarse)]:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCycle(-1);
              }}
              onKeyDown={(e) => handleCycleFromKeyboard(e, -1)}
              className="studio-ghost-control style-image-control pointer-events-auto"
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
              className="studio-ghost-control style-image-control pointer-events-auto"
              aria-label={`Next image for ${presetDisplayName}`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <div className="style-card-select absolute right-2 top-2 z-30">
          <button
            type="button"
            aria-label={`${active ? 'Remove' : 'Select'} style ${presetDisplayName}`}
            onClick={(e) => {
              e.stopPropagation();
              onApply(preset);
            }}
            disabled={selectionDisabled}
            aria-pressed={active}
            className="studio-ghost-control style-image-control"
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
      onClick={onPreview}
      className="absolute inset-0 flex size-full cursor-pointer flex-col items-center justify-center gap-3 bg-[color:var(--wb-panel)] transition-colors hover:bg-[color:var(--wb-bar)] disabled:cursor-not-allowed"
      aria-label={`Preview ${presetDisplayName}`}
    >
      <div
        className={`flex size-14 items-center justify-center rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] ${theme.text}`}
      >
        <Palette size={24} />
      </div>
      <span className="translate-y-2 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)] opacity-0 transition-[opacity,transform] group-hover:translate-y-0 group-hover:opacity-100">
        Preview
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
  const previewDialogRef = useRef<HTMLDialogElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useLayoutEffect(() => {
    if (previewOpen) previewDialogRef.current?.showModal();
  }, [previewOpen]);

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
    <>
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
        data-style-image-label={'label' in imageDiagnostics ? imageDiagnostics.label : ''}
        data-style-default-stale={visualState?.defaultImageStale ? 'true' : 'false'}
        data-style-source-pack-id={sourceProvenance?.sourcePackId ?? ''}
        data-style-source-category={sourceProvenance?.sourceCategory ?? ''}
        data-style-collection-role={sourceProvenance?.collectionRole ?? ''}
        data-selected={active}
        className="style-preset-tile group relative aspect-[3/4] overflow-hidden rounded-[var(--wb-radius)] text-left"
        style={
          {
            contentVisibility: 'auto',
            containIntrinsicSize: '210px 280px',
          } as React.CSSProperties
        }
      >
        <div className="absolute inset-0 overflow-hidden bg-[color:var(--wb-panel)]">
          <StylePresetResultButton
            activeCardImage={activeCardImage}
            preset={preset}
            active={active}
            selectionDisabled={selectionDisabled}
            onCycle={handleCycle}
            onPreview={() => setPreviewOpen(true)}
            hasMultipleImages={hasMultipleImages}
            theme={theme}
            FadeImageComponent={FadeImageComponent}
            onApply={onApply}
          />
        </div>

        <div className="style-card-favorite absolute left-2 top-2 z-30">
          <button
            type="button"
            aria-label={`${favorite ? 'Unpin' : 'Pin'} style ${presetDisplayName}`}
            aria-pressed={favorite}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(preset.id);
            }}
            className="studio-ghost-control style-image-control"
            title={favorite ? 'Unpin' : 'Pin to top'}
          >
            <Heart
              size={14}
              fill={favorite ? 'currentColor' : 'none'}
              strokeWidth={favorite ? 0 : 2}
            />
          </button>
        </div>

        {!activeCardImage ? (
          <button
            type="button"
            className="studio-ghost-control style-card-select style-tile-action style-image-control"
            aria-label={`${active ? 'Remove' : 'Select'} style ${presetDisplayName}`}
            aria-pressed={active}
            disabled={selectionDisabled}
            onClick={() => onApply(preset)}
          >
            {active ? <Check size={14} /> : <Plus size={14} />}
          </button>
        ) : null}
        <button
          type="button"
          className="style-tile-caption"
          onClick={() => setPreviewOpen(true)}
          aria-label={`Details for ${presetDisplayName}`}
          title={presetDisplayName}
        >
          {presetDisplayName}
        </button>
      </div>
      {previewOpen ? (
        <dialog
          ref={previewDialogRef}
          className="style-detail-dialog"
          aria-label={`Preview ${presetDisplayName}`}
          onClose={() => setPreviewOpen(false)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') event.stopPropagation();
            if (event.key !== 'Tab') return;
            const controls = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), summary'),
            );
            const first = controls[0];
            const last = controls.at(-1);
            if (
              event.shiftKey ? document.activeElement === first : document.activeElement === last
            ) {
              event.preventDefault();
              (event.shiftKey ? last : first)?.focus();
            }
          }}
        >
          <header>
            <h2>{presetDisplayName}</h2>
            <button
              type="button"
              aria-label="Close style preview"
              onClick={() => previewDialogRef.current?.close()}
            >
              <X size={16} />
            </button>
          </header>
          {activeCardImage ? (
            <img className="style-detail-image" src={activeCardImage.src} alt={presetDisplayName} />
          ) : (
            <p>No preview available</p>
          )}
          <div className="style-detail-copy">
            <p>
              {sourceProvenance
                ? `${sourceProvenance.sourcePackName} / ${sourceProvenance.sourceCategory}`
                : `${visualState?.presetPackName ?? 'Styles'} / ${preset.category ?? 'General'}`}
            </p>
            <p>{preset.style.aesthetic}</p>
            <details>
              <summary>Style prompt</summary>
              <dl>
                {Object.entries(preset.style).map(([key, value]) => {
                  const description = describePreviewValue(value);
                  return description ? (
                    <div key={key}>
                      <dt>{key.replace(/_/g, ' ')}</dt>
                      <dd>{description}</dd>
                    </div>
                  ) : null;
                })}
              </dl>
            </details>
          </div>
          <footer>
            <button type="button" onClick={(event) => onCopy(event, preset)}>
              {copied ? <Check size={14} /> : <Copy size={14} />} Copy prompt
            </button>
            <button
              type="button"
              className="style-detail-apply"
              aria-pressed={active}
              disabled={selectionDisabled}
              onClick={() => onApply(preset)}
            >
              {active ? <Check size={14} /> : <Plus size={14} />}
              {active ? 'Remove from mix' : 'Add to mix'}
            </button>
          </footer>
        </dialog>
      ) : null}
    </>
  );
});
