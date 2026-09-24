import { describe, expect, it } from 'vitest';

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

  it('keeps compiled instruction boundaries while normalizing spaces within lines', () => {
    const directives = createRecipeProviderDirectives({
      recipeId: 'styles',
      title: 'Styles',
      sections: [
        {
          title: 'Intentional Style Plan',
          directives: [
            {
              label: 'Compiled Instructions',
              value:
                'STYLE APPLICATION CONTRACT\nOutput  medium: illustration\nUSER PROMPT  one stool',
            },
          ],
        },
      ],
    });
    expect(serializeRecipeProviderDirectives(directives)).toContain(
      'STYLE APPLICATION CONTRACT\nOutput medium: illustration\nUSER PROMPT one stool',
    );
  });
});
