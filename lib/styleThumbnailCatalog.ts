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

const styleCardThumbnails: Record<string, string> = {};
const styleCategoryImages: Record<string, string> = {};

const styleThumbnailCatalogListeners = new Set<() => void>();

export function subscribeStyleThumbnailCatalog(listener: () => void) {
  styleThumbnailCatalogListeners.add(listener);
  return () => {
    styleThumbnailCatalogListeners.delete(listener);
  };
}

function notifyStyleThumbnailCatalog() {
  styleThumbnailCatalogListeners.forEach((listener) => listener());
}

function rememberThumbnailProjection(projection: Record<string, string>) {
  Object.assign(styleCardThumbnails, projection);
  Object.assign(
    styleCategoryImages,
    Object.fromEntries(Object.entries(projection).filter(([key]) => key.startsWith('pack_'))),
  );
}

export async function loadStyleThumbnailPack(packId: string) {
  const projection = await loadGeneratedStyleThumbnailPack(packId);
  rememberThumbnailProjection(projection);
  notifyStyleThumbnailCatalog();
  return projection;
}

export function getStyleThumbnail(key: string) {
  return styleCardThumbnails[key];
}

export function getStyleCategoryImage(key: string) {
  return styleCategoryImages[key];
}

export function getStyleThumbnailCatalog(): Readonly<Record<string, string>> {
  return styleCardThumbnails;
}

export function resolveStyleDefaultImageThumbnail(presetId: string) {
  return getStyleThumbnail(presetId);
}

export function resolveStyleDefaultImageVariantThumbnails(
  presetId: string,
  getThumbnail: (key: string) => string | undefined = getStyleThumbnail,
) {
  const variants: StylePresetImageVariant[] = [];
  for (let index = 1; index <= 12; index += 1) {
    const key = `${presetId}-${String(index).padStart(2, '0')}`;
    const src = getThumbnail(key);
    if (!src) break;
    variants.push({ src, label: `Variant ${index}` });
  }

  const grokSrc = getThumbnail(`${presetId}-grok`);
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
