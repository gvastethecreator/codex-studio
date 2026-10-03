import { hasRecipeSource, type RecipePolicy } from './types';

function hasEnabledSelectedStyle(selectedStyles: unknown) {
  return (
    Array.isArray(selectedStyles) &&
    selectedStyles.some(
      (style) =>
        style &&
        typeof style === 'object' &&
        typeof style.presetId === 'string' &&
        style.presetId.trim() &&
        style.enabled !== false,
    )
  );
}

export const stylesPolicy: RecipePolicy = {
  promptOptional: true,
  requirement(input) {
    const params = input.recipeParams ?? {};
    if (
      input.task !== 'style_preset_card' &&
      !input.stylePresetId &&
      !(typeof params.presetId === 'string' && params.presetId.trim()) &&
      !hasEnabledSelectedStyle(params.selectedStyles)
    ) {
      return { field: 'styles', message: 'Choose a style before generating.' };
    }
    if (
      typeof params.intentionalCompileError === 'string' &&
      params.intentionalCompileError.trim()
    ) {
      return { field: 'styles', message: params.intentionalCompileError };
    }
    const styleMode = params.styleReferenceMode ?? params.intentionalMode;
    if (
      input.task !== 'style_preset_card' &&
      styleMode === 'preserve' &&
      params.mode !== 'DIRECT_STYLE_SYNTHESIS' &&
      !hasRecipeSource(input)
    ) {
      return { field: 'source', message: 'Add an image to preserve.' };
    }
    return null;
  },
};
