import type { RecipeBehavior } from './types';

/** Behavior for a request without a Recipe Module. */
export const defaultRecipe: RecipeBehavior = {
  policy: {},
  referenceInstruction: () => 'Use as visual reference according to the requested generation task.',
  directives: () => null,
};
