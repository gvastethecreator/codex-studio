import { formatOutputFileCount, type RecipePolicy } from './types';

export const characterPolicy: RecipePolicy = {
  outputSummary: (_params, count) =>
    `${count} character ${count === 1 ? 'sheet' : 'sheets'} · ${formatOutputFileCount(count)}`,
};
