import type { RecipePolicy } from './types';

export const animationSequencePolicy: RecipePolicy = {
  requirement: (_input, prompt) =>
    prompt ? null : { field: 'prompt', message: 'Add a motion prompt.' },
};
