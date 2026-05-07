import { parseRecipeIdFromContext } from '../lib/recipeContext';

export const detectRecipeFromContext = (context: string = '') => {
  return parseRecipeIdFromContext(context);
};
