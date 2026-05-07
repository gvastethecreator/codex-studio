import type { RecipeId } from '../types';

const recipeCardImageFiles = import.meta.glob('../assets/recipes/cards/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

const styleCategoryImageFiles = import.meta.glob('../assets/recipes/styles/category-bases/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

const styleDefaultImageFiles = import.meta.glob('../assets/recipes/styles/defaults/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

const stylePreviewImageFiles = import.meta.glob('../assets/recipes/styles/previews/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

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

export const STYLE_CATEGORY_PREVIEWS: Record<string, string> = {
  '1. Portrait Styles': stylePreviewCatalog['pack_01_portrait_styles'] ?? '',
  '2. Film Stocks': stylePreviewCatalog['pack_01_film_stocks'] ?? '',
  '3. Camera Types': stylePreviewCatalog['pack_01_camera_types'] ?? '',
  '4. Lighting': stylePreviewCatalog['pack_01_lighting'] ?? '',
  '5. Genres': stylePreviewCatalog['pack_01_genres'] ?? '',
};
