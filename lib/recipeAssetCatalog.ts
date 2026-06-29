import {
  GENERATED_STYLE_DEFAULT_IMAGES,
  GENERATED_STYLE_DEFAULT_IMAGE_VARIANTS,
} from './styleDefaultImages.generated';
import { isStyleDefaultImageStale } from './staleStyleDefaultImages.generated';
import { buildPackFallbackCatalog } from './stylePresetVisuals';

const recipeCardImageFiles = import.meta.glob('../assets/recipes/cards/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, unknown>;

const styleCategoryImageFiles = import.meta.glob('../assets/recipes/styles/category-bases/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, unknown>;

const styleCardThumbnailFiles = import.meta.glob(
  '../assets/recipes/styles/style-card-thumbnails/*.webp',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, unknown>;

const stylePreviewImageFiles = import.meta.glob('../assets/recipes/styles/previews/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, unknown>;

function buildUrlCatalog(files: Record<string, unknown>) {
  const catalog: Record<string, string> = {};

  for (const [filePath, url] of Object.entries(files)) {
    const fileName = filePath.split('/').pop();
    const key = fileName?.replace(/\.[^.]+$/i, '');
    if (key && typeof url === 'string') {
      catalog[key] = url;
    }
  }

  return catalog;
}

const recipeCardCatalog = buildUrlCatalog(recipeCardImageFiles);
const stylePreviewCatalog = buildUrlCatalog(stylePreviewImageFiles);

const recipeCardCatalogByKey = Object.entries(recipeCardCatalog).reduce<Record<string, string>>(
  (acc, [key, value]) => {
    const normalizedKey = key.startsWith('recipe-') ? key.slice('recipe-'.length) : key;
    acc[normalizedKey] = value;
    return acc;
  },
  {},
);

export const RECIPE_CARD_IMAGES = recipeCardCatalogByKey;
export const STYLE_CATEGORY_IMAGES = buildUrlCatalog(styleCategoryImageFiles);
export const STYLE_CARD_THUMBNAILS = buildUrlCatalog(styleCardThumbnailFiles);
export const STYLE_DEFAULT_IMAGES = GENERATED_STYLE_DEFAULT_IMAGES;
const STYLE_DEFAULT_IMAGE_VARIANTS = GENERATED_STYLE_DEFAULT_IMAGE_VARIANTS;
export const STYLE_AVAILABLE_DEFAULT_IMAGES = Object.fromEntries(
  Object.entries(STYLE_DEFAULT_IMAGES).filter(([presetId]) => !isStyleDefaultImageStale(presetId)),
);
export const STYLE_PACK_FALLBACK_IMAGES = buildPackFallbackCatalog(STYLE_AVAILABLE_DEFAULT_IMAGES);

export function resolveStyleDefaultImage(presetId: string) {
  return STYLE_DEFAULT_IMAGES[presetId];
}

export function resolveStyleDefaultImageThumbnail(presetId: string) {
  return STYLE_CARD_THUMBNAILS[presetId] ?? STYLE_DEFAULT_IMAGES[presetId];
}

export function resolveStyleDefaultImageVariants(presetId: string) {
  return STYLE_DEFAULT_IMAGE_VARIANTS[presetId] ?? [];
}

export function resolveStyleDefaultImageVariantThumbnails(presetId: string) {
  return resolveStyleDefaultImageVariants(presetId).map((src, index) => {
    const variantKey = `${presetId}-${String(index + 1).padStart(2, '0')}`;
    return STYLE_CARD_THUMBNAILS[variantKey] ?? src;
  });
}

export const STYLE_CATEGORY_PREVIEWS: Record<string, string> = {
  '1. Portrait Styles': stylePreviewCatalog['pack_01_portrait_styles'] ?? '',
  '2. Film Stocks': stylePreviewCatalog['pack_01_film_stocks'] ?? '',
  '3. Camera Types': stylePreviewCatalog['pack_01_camera_types'] ?? '',
  '4. Lighting': stylePreviewCatalog['pack_01_lighting'] ?? '',
  '5. Genres': stylePreviewCatalog['pack_01_genres'] ?? '',
};
