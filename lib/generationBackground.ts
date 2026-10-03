import type { ImageGenerationConfig } from '../types';
import type { GenerationOutputContract } from '../packages/shared/src/generationContracts';
import { RECIPE_BACKGROUNDS } from './recipeModules/composerRules';

function getRecipeBackground(config: ImageGenerationConfig) {
  return config.recipeId ? RECIPE_BACKGROUNDS[config.recipeId] : undefined;
}

/** Sheet workflows use their chosen sheet fill. A reference sets identity, not the backdrop. */
function usesSheetFill(config: ImageGenerationConfig) {
  return getRecipeBackground(config)?.usesSheetFill?.(config.recipeParams ?? {}) ?? false;
}

export function resolveGenerationBackground(
  config: ImageGenerationConfig,
): GenerationOutputContract['background'] {
  if (config.outputBackground === 'transparent') return 'transparent';
  const recipeBackground = getRecipeBackground(config)?.native?.(config);
  if (recipeBackground) return recipeBackground;
  if (usesSheetFill(config)) return 'opaque';
  return 'auto';
}

/** Effective controls only. Saved workflow colors remain available for text-only generation. */
export function projectGenerationBackgroundParams(config: ImageGenerationConfig) {
  const params = config.recipeParams ?? {};
  if (resolveGenerationBackground(config) === 'transparent') {
    return {
      ...params,
      transparentBackground: true,
      background: 'transparent',
      backgroundColor: '',
      backgroundRemoval: 'alpha',
      transparent: true,
    };
  }
  const preserveSource = config.attachments.length > 0 && !usesSheetFill(config);
  return {
    ...params,
    preserveBackground: preserveSource,
    transparentBackground: false,
    ...(preserveSource ? { backgroundColor: '', background: 'preserve' } : {}),
    ...(getRecipeBackground(config)?.project?.(config, params) ?? {}),
  };
}
