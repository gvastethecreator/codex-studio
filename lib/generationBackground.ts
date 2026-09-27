import type { ImageGenerationConfig } from '../types';
import type { GenerationOutputContract } from '../packages/shared/src/generationContracts';

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
    if (params.transparent === false) return 'auto';
    return params.backgroundRemoval === 'chroma' ? 'opaque' : 'transparent';
  }
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
  const preserveSource = config.attachments.length > 0;
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
