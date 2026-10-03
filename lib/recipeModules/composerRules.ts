// Recipe rules the composer needs on startup: output background and reference limits. This file
// stays light, so it must not import recipe modules, their catalogs, or their prompt builders.
import { createSpriteAtlasContract } from '../../packages/shared/src/spriteAtlasContracts';
import type { RegisteredRecipeId } from '../recipeIds';
import type { RecipeBackgroundBehavior, RecipeBehavior } from './types';

type RecipeReferenceRules = Pick<RecipeBehavior, 'maxReferences' | 'referenceStrength'>;

/** Sequence and identity workflows send at most four images. */
export const sequenceReferenceRules: RecipeReferenceRules = { maxReferences: 4 };

export const stylesReferenceRules: RecipeReferenceRules = {
  referenceStrength(params) {
    const styleMode = params.styleReferenceMode ?? params.intentionalMode;
    return styleMode === 'preserve' ? 0.85 : styleMode === 'reinterpret' ? 0.35 : 0.15;
  },
};

export const RECIPE_REFERENCE_RULES: Partial<Record<RegisteredRecipeId, RecipeReferenceRules>> = {
  'animation-sequence': sequenceReferenceRules,
  'character-lab': sequenceReferenceRules,
  timeline: sequenceReferenceRules,
  styles: stylesReferenceRules,
};

export const animationSequenceBackground: RecipeBackgroundBehavior = {
  native(config) {
    const params = config.recipeParams ?? {};
    if (params.background === 'solid') return 'opaque';
    if (!config.outputBackground && params.background === 'transparent') return 'transparent';
    return undefined;
  },
  project: (_config, params) => ({
    background: params.background === 'solid' ? 'solid' : 'preserve',
  }),
};

export const characterLabBackground: RecipeBackgroundBehavior = {
  /** A Lab sprite sheet keeps its chosen fill. A reference sets identity, not the backdrop. */
  usesSheetFill: (params) =>
    params.mode === 'spritesheets' &&
    typeof params.backgroundColor === 'string' &&
    params.backgroundColor.trim() !== '',
};

export const spriteAtlasBackground: RecipeBackgroundBehavior = {
  native(config) {
    if (config.outputBackground) return undefined;
    const params = config.recipeParams ?? {};
    if (!createSpriteAtlasContract(params).transparent) return 'auto';
    return params.backgroundRemoval === 'chroma' ? 'opaque' : 'transparent';
  },
  project: (config) =>
    config.outputBackground === 'workflow'
      ? { transparent: false, backgroundRemoval: 'alpha' }
      : {},
};

export const spritesheetBackground: RecipeBackgroundBehavior = { usesSheetFill: () => true };

export const RECIPE_BACKGROUNDS: Partial<Record<RegisteredRecipeId, RecipeBackgroundBehavior>> = {
  'animation-sequence': animationSequenceBackground,
  'character-lab': characterLabBackground,
  'sprite-atlas': spriteAtlasBackground,
  spritesheet: spritesheetBackground,
};
