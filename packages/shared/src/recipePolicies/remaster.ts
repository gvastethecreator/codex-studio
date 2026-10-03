import { hasRecipeSource, type RecipePolicy } from './types';

export const remasterPolicy: RecipePolicy = {
  requirement: (input) =>
    hasRecipeSource(input) ? null : { field: 'source', message: 'Add a source image to restore.' },
};
