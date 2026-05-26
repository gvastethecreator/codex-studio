import { describe, expect, it } from 'vite-plus/test';

import {
  createRecipeProviderDirectives,
  isRecipeProviderDirectives,
  serializeRecipeProviderDirectives,
} from './recipeProviderDirectives';

describe('recipeProviderDirectives', () => {
  it('normalizes compact provider-ready recipe directives', () => {
    const directives = createRecipeProviderDirectives({
      recipeId: 'styles',
      title: 'Styles',
      sections: [
        {
          title: 'Visual DNA',
          directives: [
            { label: 'Core Aesthetic', value: '  mineral   glass  ' },
            { label: 'Empty', value: ' ' },
          ],
        },
      ],
    });

    expect(isRecipeProviderDirectives(directives)).toBe(true);
    const serialized = serializeRecipeProviderDirectives(directives);

    expect(serialized).toContain('- Core Aesthetic: mineral glass');
    expect(serialized).not.toContain('Recipe Module');
    expect(serialized).not.toContain('Empty');
  });

  it('rejects malformed metadata before provider compilation', () => {
    expect(isRecipeProviderDirectives({ protocol: 'recipe-provider-directives/v1' })).toBe(false);
  });
});
