type AssetUrlLoader = () => Promise<unknown>;

const styleCardThumbnailFiles = import.meta.glob(
  '../assets/recipes/styles/style-card-thumbnails/*.webp',
  {
    query: '?url',
    import: 'default',
  },
) as Record<string, AssetUrlLoader>;

const stylePreviewImageFiles = import.meta.glob('../assets/recipes/styles/previews/*.webp', {
  query: '?url',
  import: 'default',
}) as Record<string, AssetUrlLoader>;

function styleAssetKey(filePath: string) {
  return filePath
    .split('/')
    .pop()
    ?.replace(/\.[^.]+$/i, '');
}

function sourceRelativeUrl(filePath: string) {
  return new URL(filePath, import.meta.url).href;
}

function buildUrlCatalog(files: Record<string, AssetUrlLoader>) {
  const catalog: Record<string, string> = {};

  for (const filePath of Object.keys(files)) {
    const key = styleAssetKey(filePath);
    if (key) {
      catalog[key] = sourceRelativeUrl(filePath);
    }
  }

  return catalog;
}

function buildLoaderCatalog(files: Record<string, AssetUrlLoader>) {
  const catalog: Record<string, AssetUrlLoader> = {};
  for (const [filePath, loader] of Object.entries(files)) {
    const key = styleAssetKey(filePath);
    if (key) {
      catalog[key] = loader;
    }
  }
  return catalog;
}

const stylePreviewCatalog = buildUrlCatalog(stylePreviewImageFiles);
const styleCardThumbnailLoaders = buildLoaderCatalog(styleCardThumbnailFiles);
const loadedStyleCardThumbnailUrls = new Map<string, string>();

export const STYLE_CARD_THUMBNAILS = buildUrlCatalog(styleCardThumbnailFiles);
export const STYLE_CATEGORY_IMAGES = Object.fromEntries(
  Object.entries(STYLE_CARD_THUMBNAILS).filter(([key]) => key.startsWith('pack_')),
);

export function resolveStyleDefaultImageThumbnail(presetId: string) {
  return loadedStyleCardThumbnailUrls.get(presetId) ?? STYLE_CARD_THUMBNAILS[presetId];
}

export function resolveStyleDefaultImageVariantThumbnails(presetId: string) {
  const variants: string[] = [];
  for (let index = 1; index <= 12; index += 1) {
    const key = `${presetId}-${String(index).padStart(2, '0')}`;
    const src = loadedStyleCardThumbnailUrls.get(key) ?? STYLE_CARD_THUMBNAILS[key];
    if (!src) break;
    variants.push(src);
  }

  return variants;
}

export async function loadStyleCardThumbnailUrl(key: string) {
  const loadedUrl = loadedStyleCardThumbnailUrls.get(key);
  if (loadedUrl) return loadedUrl;

  const loader = styleCardThumbnailLoaders[key];
  if (!loader) return STYLE_CARD_THUMBNAILS[key];

  const loaded = await loader();
  if (typeof loaded !== 'string') return STYLE_CARD_THUMBNAILS[key];

  loadedStyleCardThumbnailUrls.set(key, loaded);
  STYLE_CARD_THUMBNAILS[key] = loaded;
  return loaded;
}

export const STYLE_CATEGORY_PREVIEWS: Record<string, string> = {
  '1. Portrait Styles': stylePreviewCatalog['pack_01_portrait_styles'] ?? '',
  '2. Film Stocks': stylePreviewCatalog['pack_01_film_stocks'] ?? '',
  '3. Camera Types': stylePreviewCatalog['pack_01_camera_types'] ?? '',
  '4. Lighting': stylePreviewCatalog['pack_01_lighting'] ?? '',
  '5. Genres': stylePreviewCatalog['pack_01_genres'] ?? '',
};
