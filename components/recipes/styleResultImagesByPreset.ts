import { resolveRecipeIdentity } from '../../lib/recipeIdentity';
import type { GeneratedImageWithConfig } from '../../types';

export function groupStyleResultImagesByPreset(images: readonly GeneratedImageWithConfig[]) {
  const imagesByPresetId = new Map<string, GeneratedImageWithConfig[]>();
  for (const image of images) {
    const identity = resolveRecipeIdentity(image.config);
    if (identity?.recipeId !== 'styles') continue;
    const presetIds = new Set<string>();
    if (typeof identity.recipeParams.presetId === 'string') {
      presetIds.add(identity.recipeParams.presetId);
    }
    const selectedStyles = identity.recipeParams.selectedStyles;
    if (Array.isArray(selectedStyles)) {
      for (const entry of selectedStyles) {
        if (
          entry &&
          typeof entry === 'object' &&
          !Array.isArray(entry) &&
          typeof (entry as { presetId?: unknown }).presetId === 'string'
        ) {
          presetIds.add((entry as { presetId: string }).presetId);
        }
      }
    }
    for (const presetId of presetIds) {
      const current = imagesByPresetId.get(presetId);
      if (current) current.push(image);
      else imagesByPresetId.set(presetId, [image]);
    }
  }
  for (const presetImages of imagesByPresetId.values()) {
    presetImages.sort((first, second) => second.createdAt - first.createdAt);
  }
  return imagesByPresetId;
}
