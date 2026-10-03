import { hasRecipeSource, type RecipePolicy } from './types';

export const characterLabPolicy: RecipePolicy = {
  /** The Lab subject field stands in for an empty composer prompt. */
  effectivePrompt(input) {
    const subject = input.recipeParams?.subject;
    return typeof subject === 'string' ? subject.trim() : '';
  },
  requirement: (input) =>
    (input.recipeParams ?? {}).mode === 'effects' && !hasRecipeSource(input)
      ? { field: 'source', message: 'Add a source image to apply this transform.' }
      : null,
};
