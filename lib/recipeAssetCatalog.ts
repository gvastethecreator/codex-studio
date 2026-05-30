import type { RecipeId } from '../types';
import { buildPackFallbackCatalog } from './stylePresetVisuals';

type ImportMetaGlobFn = (
  pattern: string,
  options: { eager: true; query: '?url'; import: 'default' },
) => Record<string, unknown>;

function safeImportMetaGlob(pattern: string): Record<string, unknown> {
  const glob = (import.meta as ImportMeta & { glob?: ImportMetaGlobFn }).glob;
  if (typeof glob === 'function') {
    return glob(pattern, {
      eager: true,
      query: '?url',
      import: 'default',
    });
  }

  return {};
}

const recipeCardImageFiles = safeImportMetaGlob('../assets/recipes/cards/*.webp');

const styleCategoryImageFiles = safeImportMetaGlob(
  '../assets/recipes/styles/category-bases/*.webp',
);

const styleDefaultImageFiles = safeImportMetaGlob('../assets/recipes/styles/defaults/*.webp');

const stylePreviewImageFiles = safeImportMetaGlob('../assets/recipes/styles/previews/*.webp');

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

export const RECIPE_CARD_IMAGES = recipeCardCatalog as Partial<
  Record<Exclude<RecipeId, null>, string>
>;
export const STYLE_CATEGORY_IMAGES = buildUrlCatalog(styleCategoryImageFiles);
export const STYLE_DEFAULT_IMAGES = buildUrlCatalog(styleDefaultImageFiles);
export const STYLE_PACK_FALLBACK_IMAGES = buildPackFallbackCatalog(STYLE_DEFAULT_IMAGES);

export const STYLE_CATEGORY_PREVIEWS: Record<string, string> = {
  '1. Portrait Styles': stylePreviewCatalog['pack_01_portrait_styles'] ?? '',
  '2. Film Stocks': stylePreviewCatalog['pack_01_film_stocks'] ?? '',
  '3. Camera Types': stylePreviewCatalog['pack_01_camera_types'] ?? '',
  '4. Lighting': stylePreviewCatalog['pack_01_lighting'] ?? '',
  '5. Genres': stylePreviewCatalog['pack_01_genres'] ?? '',
};
