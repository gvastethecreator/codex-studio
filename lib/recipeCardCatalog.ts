const recipeCardImageFiles = import.meta.glob('../assets/recipes/cards/*.webp', {
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

export const RECIPE_CARD_IMAGES = Object.entries(recipeCardCatalog).reduce<Record<string, string>>(
  (acc, [key, value]) => {
    const normalizedKey = key.startsWith('recipe-') ? key.slice('recipe-'.length) : key;
    acc[normalizedKey] = value;
    return acc;
  },
  {},
);
