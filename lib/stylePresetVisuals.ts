import type { GeneratedImageWithConfig } from '../types';

export type StylePresetCardImageKind =
  | 'result'
  | 'default'
  | 'variant'
  | 'stale-default'
  | 'preview';

export interface StylePresetCardImage {
  kind: StylePresetCardImageKind;
  src: string;
  label: string;
}

export function packIdFromPresetId(presetId: string) {
  const match = presetId.match(/^SP(\d{2})-/i);
  if (!match) return null;
  return `pack_${match[1]}`;
}

export function buildPackFallbackCatalog(defaultImages: Record<string, string>) {
  const fallbackByPack: Record<string, string> = {};
  for (const presetId of Object.keys(defaultImages).sort()) {
    const packId = packIdFromPresetId(presetId);
    if (!packId || fallbackByPack[packId]) continue;
    fallbackByPack[packId] = defaultImages[presetId];
  }
  return fallbackByPack;
}

export function resolveStyleCatalogResultImage({
  presetId,
  packId,
  defaultImages,
  packFallbackImages,
}: {
  presetId: string;
  packId: string;
  defaultImages: Record<string, string>;
  packFallbackImages: Record<string, string>;
}) {
  return defaultImages[presetId] || packFallbackImages[packId];
}

export function resolveStylePreviewImage({
  categoryImage,
  categoryPreviewImage,
  packFallbackImage,
}: {
  categoryImage?: string;
  categoryPreviewImage?: string;
  packFallbackImage?: string;
}) {
  return categoryImage || categoryPreviewImage || packFallbackImage;
}

export function resolveStylePresetCardImages({
  resultImages,
  defaultImage,
  defaultImageVariants = [],
  defaultImageStale,
  previewImage,
}: {
  resultImages: GeneratedImageWithConfig[];
  defaultImage?: string;
  defaultImageVariants?: string[];
  defaultImageStale: boolean;
  previewImage?: string;
}): StylePresetCardImage[] {
  const seen = new Set<string>();
  const images: StylePresetCardImage[] = [];
  const add = (image: StylePresetCardImage) => {
    if (!image.src || seen.has(image.src)) return;
    seen.add(image.src);
    images.push(image);
  };

  for (const image of resultImages) {
    add({
      kind: 'result',
      src: image.thumbnail || image.preview || image.src,
      label: 'Generated',
    });
  }

  const addDefaultImage = () => {
    if (!defaultImage) return;
    add({
      kind: defaultImageStale ? 'stale-default' : 'default',
      src: defaultImage,
      label: defaultImageStale ? 'Stale' : 'Card',
    });
  };

  const addDefaultImageVariants = () => {
    defaultImageVariants.forEach((src, index) => {
      add({
        kind: 'variant',
        src,
        label: `Variant ${index + 1}`,
      });
    });
  };

  if (defaultImageStale) {
    addDefaultImageVariants();
    addDefaultImage();
  } else {
    addDefaultImage();
    addDefaultImageVariants();
  }

  if (images.length === 0 && previewImage) {
    add({ kind: 'preview', src: previewImage, label: 'Preview' });
  }

  return images;
}
