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

const stylePreviewCatalog = buildUrlCatalog(stylePreviewImageFiles);

export const STYLE_CARD_THUMBNAILS = buildUrlCatalog(styleCardThumbnailFiles);
export const STYLE_CATEGORY_IMAGES = Object.fromEntries(
  Object.entries(STYLE_CARD_THUMBNAILS).filter(([key]) => key.startsWith('pack_')),
);

export function resolveStyleDefaultImageThumbnail(presetId: string) {
  return STYLE_CARD_THUMBNAILS[presetId];
}

export function resolveStyleDefaultImageVariantThumbnails(presetId: string) {
  const variants: string[] = [];
  for (let index = 1; index <= 12; index += 1) {
    const key = `${presetId}-${String(index).padStart(2, '0')}`;
    const src = STYLE_CARD_THUMBNAILS[key];
    if (!src) break;
    variants.push(src);
  }

  return variants;
}

export const STYLE_CATEGORY_PREVIEWS: Record<string, string> = {
  '1. Portrait Styles': stylePreviewCatalog['pack_01_portrait_styles'] ?? '',
  '2. Film Stocks': stylePreviewCatalog['pack_01_film_stocks'] ?? '',
  '3. Camera Types': stylePreviewCatalog['pack_01_camera_types'] ?? '',
  '4. Lighting': stylePreviewCatalog['pack_01_lighting'] ?? '',
  '5. Genres': stylePreviewCatalog['pack_01_genres'] ?? '',
};
