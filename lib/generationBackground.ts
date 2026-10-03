import type { ImageGenerationConfig } from '../types';
import type { GenerationOutputContract } from '../packages/shared/src/generationContracts';
import { createSpriteAtlasContract } from '../packages/shared/src/spriteAtlasContracts';

/** Sprite sheets use their chosen sheet fill. A reference sets identity, not the backdrop. */
function usesSheetFill(config: ImageGenerationConfig) {
  if (config.recipeId === 'spritesheet') return true;
  const params = config.recipeParams ?? {};
  return (
    config.recipeId === 'character-lab' &&
    params.mode === 'spritesheets' &&
    typeof params.backgroundColor === 'string' &&
    params.backgroundColor.trim() !== ''
  );
}

export function resolveGenerationBackground(
  config: ImageGenerationConfig,
): GenerationOutputContract['background'] {
  if (config.outputBackground === 'transparent') return 'transparent';
  const params = config.recipeParams ?? {};
  if (config.recipeId === 'animation-sequence') {
    if (params.background === 'solid') return 'opaque';
    if (!config.outputBackground && params.background === 'transparent') return 'transparent';
  }
  if (config.recipeId === 'sprite-atlas' && !config.outputBackground) {
    if (!createSpriteAtlasContract(params).transparent) return 'auto';
    return params.backgroundRemoval === 'chroma' ? 'opaque' : 'transparent';
  }
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
    ...(config.recipeId === 'sprite-atlas' && config.outputBackground === 'workflow'
      ? { transparent: false, backgroundRemoval: 'alpha' }
      : {}),
    ...(config.recipeId === 'animation-sequence'
      ? { background: params.background === 'solid' ? 'solid' : 'preserve' }
      : {}),
  };
}
