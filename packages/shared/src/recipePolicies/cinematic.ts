import { countOutputCells, formatOutputFileCount, type RecipePolicy } from './types';

export const cinematicPolicy: RecipePolicy = {
  outputSummary(params, count) {
    const cells = countOutputCells(params);
    return `${count} ${count === 1 ? 'storyboard' : 'storyboards'}${cells ? ` · ${cells} scenes each` : ''} · ${formatOutputFileCount(count)}`;
  },
};
