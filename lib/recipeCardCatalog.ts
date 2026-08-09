const recipeCardImageFiles = import.meta.glob('../assets/recipes/cards/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, unknown>;

const responsiveRecipeCardImageFiles = import.meta.glob(
  '../assets/recipes/cards/responsive/*/*.webp',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, unknown>;

export interface RecipeCardImageSource {
  src: string;
  srcSet: string;
}

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

function buildResponsiveCatalog(files: Record<string, unknown>) {
  const catalog = new Map<string, Array<{ width: number; url: string }>>();
  for (const [filePath, url] of Object.entries(files)) {
    const match = filePath.match(/\/responsive\/(\d+)\/([^/]+)\.webp$/i);
    if (!match || typeof url !== 'string') continue;

    const [, widthText, fileName] = match;
    const key = fileName.startsWith('recipe-') ? fileName.slice('recipe-'.length) : fileName;
    const sources = catalog.get(key) ?? [];
    sources.push({ width: Number(widthText), url });
    catalog.set(key, sources);
  }
  return catalog;
}

const responsiveRecipeCardCatalog = buildResponsiveCatalog(responsiveRecipeCardImageFiles);

export const RECIPE_CARD_IMAGES = Object.entries(recipeCardCatalog).reduce<
  Record<string, RecipeCardImageSource>
>((acc, [key, value]) => {
  const normalizedKey = key.startsWith('recipe-') ? key.slice('recipe-'.length) : key;
  const responsiveSources = responsiveRecipeCardCatalog.get(normalizedKey) ?? [];
  acc[normalizedKey] = {
    src: value,
    srcSet: [...responsiveSources, { width: 1024, url: value }]
      .sort((left, right) => left.width - right.width)
      .map(({ width, url }) => `${url} ${width}w`)
      .join(', '),
  };
  return acc;
}, {});
