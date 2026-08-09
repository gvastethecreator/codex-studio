import { loadGeneratedStyleThumbnailPack } from './styleThumbnailPacks.generated';
import type { StylePresetImageVariant } from './stylePresetVisuals';

const stylePreviewImageFiles = import.meta.glob('../assets/recipes/styles/previews/*.webp', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function styleAssetKey(filePath: string) {
  return filePath
    .split('/')
    .pop()
    ?.replace(/\.[^.]+$/i, '');
}

function sourceRelativeUrl(filePath: string) {
  return new URL(filePath, import.meta.url).href;
}

function buildUrlCatalog(files: Record<string, string>) {
  const catalog: Record<string, string> = {};

  for (const filePath of Object.keys(files)) {
    const key = styleAssetKey(filePath);
    if (key) {
      catalog[key] = files[filePath] ?? sourceRelativeUrl(filePath);
    }
  }

  return catalog;
}

const stylePreviewCatalog = buildUrlCatalog(stylePreviewImageFiles);

export const STYLE_CARD_THUMBNAILS: Record<string, string> = {};
export const STYLE_CATEGORY_IMAGES: Record<string, string> = {};

export async function loadStyleThumbnailPack(packId: string) {
  const projection = await loadGeneratedStyleThumbnailPack(packId);
  Object.assign(STYLE_CARD_THUMBNAILS, projection);
  Object.assign(
    STYLE_CATEGORY_IMAGES,
    Object.fromEntries(Object.entries(projection).filter(([key]) => key.startsWith('pack_'))),
  );
  return projection;
}

export function resolveStyleDefaultImageThumbnail(presetId: string) {
  return STYLE_CARD_THUMBNAILS[presetId];
}

export function resolveStyleDefaultImageVariantThumbnails(presetId: string) {
  const variants: StylePresetImageVariant[] = [];
  for (let index = 1; index <= 12; index += 1) {
    const key = `${presetId}-${String(index).padStart(2, '0')}`;
    const src = STYLE_CARD_THUMBNAILS[key];
    if (!src) break;
    variants.push({ src, label: `Variant ${index}` });
  }

  const grokSrc = STYLE_CARD_THUMBNAILS[`${presetId}-grok`];
  if (grokSrc) variants.push({ src: grokSrc, label: 'Grok' });

  return variants;
}

export const STYLE_CATEGORY_PREVIEWS: Record<string, string> = {
  '1. Portrait Styles': stylePreviewCatalog['pack_01_portrait_styles'] ?? '',
  '2. Film Stocks': stylePreviewCatalog['pack_01_film_stocks'] ?? '',
  '3. Camera Types': stylePreviewCatalog['pack_01_camera_types'] ?? '',
  '4. Lighting': stylePreviewCatalog['pack_01_lighting'] ?? '',
  '5. Genres': stylePreviewCatalog['pack_01_genres'] ?? '',
};
