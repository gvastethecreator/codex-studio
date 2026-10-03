import { describe, expect, it } from 'vitest';

import { serializeRecipeProviderDirectives } from '../../packages/shared/src';
import { buildRecipeProviderDirectives, getRecipeModule } from './index';

describe('remaster recipe', () => {
  it('builds compact provider directives for remaster params', () => {
    const remaster = getRecipeModule('remaster');
    expect(remaster).toBeTruthy();

    const directives =
      remaster &&
      buildRecipeProviderDirectives(remaster, {
        style: 'Oil Detail',
        lighting: 'Studio Lighting',
        camera: 'Texture Enhancement',
        anatomy: 'Fix Hands',
        text: 'Remove Text',
        color: 'Natural Colors',
        fidelity: 80,
      });

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'remaster',
      title: 'Remaster',
    });
    expect(serialized).toContain('- Goal: Restore and remaster the input image');
    expect(serialized).toContain('- Finish: Oil Detail');
    expect(serialized).toContain('- Text: Remove text and lettering');
    expect(serialized).toContain('- Fidelity: 80/100. Stay very close to the source');
  });
});
