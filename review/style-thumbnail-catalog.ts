import type { StylePresetImageVariant } from '../lib/stylePresetVisuals';
import placeholder from '../assets/recipes/cards/recipe-styles.webp?url';

const catalog: Record<string, string> = {};
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeStyleThumbnailCatalog(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function loadStyleThumbnailPack(packId: string) {
  catalog[packId] = placeholder;
  notify();
  return { [packId]: placeholder };
}

export function getStyleThumbnail(_key: string) {
  return placeholder;
}

export function getStyleCategoryImage(_key: string) {
  return placeholder;
}

export function getStyleThumbnailCatalog(): Readonly<Record<string, string>> {
  return catalog;
}

export function resolveStyleDefaultImageThumbnail(_presetId: string) {
  return placeholder;
}

export function resolveStyleDefaultImageVariantThumbnails(
  _presetId: string,
): StylePresetImageVariant[] {
  return [];
}

export const STYLE_CATEGORY_PREVIEWS: Record<string, string> = {
  '1. Portrait Styles': placeholder,
  '2. Film Stocks': placeholder,
  '3. Camera Types': placeholder,
  '4. Lighting': placeholder,
  '5. Genres': placeholder,
};
