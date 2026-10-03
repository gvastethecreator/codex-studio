import {
  countOutputCells,
  formatOutputFileCount,
  hasRecipeSource,
  type RecipePolicy,
} from './types';

export const spritesheetPolicy: RecipePolicy = {
  requirement(input) {
    const params = input.recipeParams ?? {};
    if (
      !hasRecipeSource(input) &&
      ((params.view ?? 'Match Source') === 'Match Source' ||
        (params.style ?? 'Preserve Style') === 'Preserve Style')
    ) {
      return { field: 'source', message: 'Add a source image, or choose From prompt.' };
    }
    return null;
  },
  outputSummary(params, count) {
    const cells = countOutputCells(params);
    return `${count} ${count === 1 ? 'sheet' : 'sheets'}${cells ? ` · ${cells} cells each` : ''} · ${formatOutputFileCount(count)}`;
  },
};
