import type { RecipePolicy } from './types';

export const timelinePolicy: RecipePolicy = {
  requirement: (input) =>
    (input.recipeParams ?? {}).nextIndex === null
      ? {
          field: 'source',
          message: 'Wait for the selected frame to load, or pick a frame in the film strip.',
        }
      : null,
};
