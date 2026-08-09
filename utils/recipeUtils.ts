import { parseRecipeIdFromContext } from '../lib/recipeShellMetadata';

export const detectRecipeFromContext = (context: string = '') => {
  return parseRecipeIdFromContext(context);
};
