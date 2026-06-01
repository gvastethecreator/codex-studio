import type { RecipeId } from '../types';
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

const styleDefaultImageFiles = import.meta.glob('../assets/recipes/styles/defaults/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, unknown>;

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

const recipeCardCatalogByRecipeId = Object.entries(recipeCardCatalog).reduce<
  Partial<Record<Exclude<RecipeId, null>, string>>
>((acc, [key, value]) => {
  const normalizedKey = key.startsWith('recipe-') ? key.slice('recipe-'.length) : key;
  acc[normalizedKey as Exclude<RecipeId, null>] = value;
  return acc;
}, {});

export const RECIPE_CARD_IMAGES = recipeCardCatalogByRecipeId;
export const STYLE_CATEGORY_IMAGES = buildUrlCatalog(styleCategoryImageFiles);
export const STYLE_DEFAULT_IMAGES = buildUrlCatalog(styleDefaultImageFiles);
export const STYLE_AVAILABLE_DEFAULT_IMAGES = Object.fromEntries(
  Object.entries(STYLE_DEFAULT_IMAGES).filter(([presetId]) => !isStyleDefaultImageStale(presetId)),
);
export const STYLE_PACK_FALLBACK_IMAGES = buildPackFallbackCatalog(STYLE_AVAILABLE_DEFAULT_IMAGES);

export function resolveStyleDefaultImage(presetId: string) {
  return isStyleDefaultImageStale(presetId) ? undefined : STYLE_DEFAULT_IMAGES[presetId];
}

export const STYLE_CATEGORY_PREVIEWS: Record<string, string> = {
  '1. Portrait Styles': stylePreviewCatalog['pack_01_portrait_styles'] ?? '',
  '2. Film Stocks': stylePreviewCatalog['pack_01_film_stocks'] ?? '',
  '3. Camera Types': stylePreviewCatalog['pack_01_camera_types'] ?? '',
  '4. Lighting': stylePreviewCatalog['pack_01_lighting'] ?? '',
  '5. Genres': stylePreviewCatalog['pack_01_genres'] ?? '',
};
