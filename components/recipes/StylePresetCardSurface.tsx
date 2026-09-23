import { CatalogCardBackdrop } from '../CatalogCardBackdrop';
import { AnimatePresence } from '../../lib/gsapMotion';
import {
  IconCheck as Check,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconCopy as Copy,
  IconHeart as Heart,
  IconPalette as Palette,
  IconPlus as Plus,
  IconInfoCircle as Eye,
  IconTextPlus as TextPlus,
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
  onUsePrompt?: (preset: StyleRuntimePreset) => void;
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
  FadeImageComponent: StylePresetFadeImageComponent;
  onApply: (preset: StyleRuntimePreset) => void;
}

function StylePresetResultButton({
  activeCardImage,
  preset,
  active,
  selectionDisabled,
  FadeImageComponent,
  onApply,
}: StylePresetResultButtonProps) {
  const name = getStyleRuntimePresetDisplayName(preset);
  return (
    <button
      type="button"
      className="style-card-image-hit"
      aria-label={`${active ? 'Remove' : 'Select'} style ${name}`}
      aria-pressed={active}
      disabled={selectionDisabled}
      onClick={() => onApply(preset)}
    >
      {activeCardImage ? (
        <FadeImageComponent
          src={activeCardImage.src}
          width={300}
          height={400}
          loading="lazy"
          decoding="async"
          className="style-preset-thumbnail size-full object-cover"
          alt={name}
        />
      ) : (
        <span className="flex flex-col items-center gap-2 text-xs text-[color:var(--wb-muted)]">
          <Palette size={24} aria-hidden="true" />
          <span>
            {preset.ui &&
            typeof preset.ui === 'object' &&
            'previewStatus' in preset.ui &&
            preset.ui.previewStatus === 'pending'
              ? 'Preview pending'
              : 'No preview'}
          </span>
        </span>
      )}
      {active && (
        <span className="style-card-selection-mark" aria-hidden="true">
          <Check size={14} />
        </span>
      )}
    </button>
  );
}

export const StylePresetCard = React.memo(function StylePresetCard({
  preset,
  packId,
  sourceProvenance,
  visualState,
  active,
  selectionDisabled = false,
  copied,
  favorite,
  FadeImageComponent,
  onApply,
  onCopy,
  onUsePrompt,
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
        className="style-preset-tile catalog-art-card group relative aspect-[3/4] overflow-hidden rounded-[var(--wb-radius)] text-left"
        style={
          {
            contentVisibility: 'auto',
            containIntrinsicSize: '210px 280px',
          } as React.CSSProperties
        }
      >
        <div className="style-card-media">
          <StylePresetResultButton
            activeCardImage={activeCardImage}
            preset={preset}
            active={active}
            selectionDisabled={selectionDisabled}
            FadeImageComponent={FadeImageComponent}
            onApply={onApply}
          />
        </div>

        <CatalogCardBackdrop
          label={presetDisplayName}
          title={
            <button
              type="button"
              className="style-tile-caption"
              onClick={() => onApply(preset)}
              disabled={selectionDisabled}
              aria-pressed={active}
              aria-label={`${active ? 'Remove' : 'Select'} style ${presetDisplayName}`}
              data-tooltip={presetDisplayName}
            >
              {presetDisplayName}
            </button>
          }
        >
          <div className="style-card-actions catalog-hover-actions">
            <button
              type="button"
              aria-label={`${favorite ? 'Unfavorite' : 'Favorite'} ${presetDisplayName}`}
              aria-pressed={favorite}
              onClick={() => onToggleFavorite(preset.id)}
            >
              <Heart size={14} fill={favorite ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              aria-label={`Information about ${presetDisplayName}`}
              onClick={(event) => {
                event.stopPropagation();
                setPreviewOpen(true);
              }}
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              aria-label={copied ? 'Prompt copied' : 'Copy prompt'}
              onClick={(event) => onCopy(event, preset)}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            {onUsePrompt && (
              <button
                type="button"
                aria-label="Use as prompt"
                onClick={(event) => {
                  event.stopPropagation();
                  onUsePrompt(preset);
                }}
              >
                <TextPlus size={16} />
              </button>
            )}
          </div>
        </CatalogCardBackdrop>
      </div>
      <AnimatePresence>
        {previewOpen ? (
          <dialog
            ref={previewDialogRef}
            className="style-detail-dialog"
            aria-label={`Information about ${presetDisplayName}`}
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
              <img
                className="style-detail-image"
                src={activeCardImage.src}
                alt={presetDisplayName}
              />
            ) : (
              <p>No preview available</p>
            )}
            {hasMultipleImages && (
              <div className="style-detail-variants">
                <button
                  type="button"
                  aria-label={`Previous image for ${presetDisplayName}`}
                  onClick={() => handleCycle(-1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span role="status" data-style-active-image-label={activeCardImage?.label}>
                  {activeCardImage?.label}
                </span>
                <button
                  type="button"
                  aria-label={`Next image for ${presetDisplayName}`}
                  onClick={() => handleCycle(1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
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
      </AnimatePresence>
    </>
  );
});
