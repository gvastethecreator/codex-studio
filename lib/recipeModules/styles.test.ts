import { describe, expect, it } from 'vitest';

import { serializeRecipeProviderDirectives } from '../../packages/shared/src';
import { buildRecipeProviderDirectives, getRecipeModule } from './index';

describe('styles recipe', () => {
  it('builds compact provider directives for style preset params', () => {
    const styles = getRecipeModule('styles');
    expect(styles).toBeTruthy();

    const directives =
      styles &&
      buildRecipeProviderDirectives(styles, {
        presetId: 'SP09-006',
        presetName: 'Glass Owl',
        mode: 'DIRECT_STYLE_SYNTHESIS',
        aesthetic: 'polished glass object study',
        colorTone: 'cool mineral blues',
      });

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'styles',
      title: 'Styles',
    });
    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(serialized).toContain('- Target Style: Glass Owl');
    expect(serialized).toContain('- Core Aesthetic: polished glass object study');
    expect(serialized).not.toContain('Recipe Module');
    expect(serialized).not.toContain('Preset ID');
    expect(serialized).not.toContain('SP09-006');
  });

  it('makes an intentional illustration medium a separate whole-image directive', () => {
    const styles = getRecipeModule('styles');
    const directives =
      styles &&
      buildRecipeProviderDirectives(styles, {
        compilerVersion: 'intentional-styles/1.0.1',
        styleRequestHash: 'a-reviewed-request',
        effectivePrompt:
          'STYLE APPLICATION CONTRACT\nOutput medium: illustration. Render the whole image in this medium, not just its surface details.\nUSER PROMPT one stool',
      });
    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';
    expect(serialized).toContain(
      '- Required Output Medium: Illustration across the entire subject and setting',
    );
    expect(serialized).toContain('Avoid a photographic, live-action or glossy CGI finish.');
    expect(serialized).toContain('STYLE APPLICATION CONTRACT\nOutput medium: illustration.');
  });

  it('includes selected style slots and strengths in style directives', () => {
    const styles = getRecipeModule('styles');
    const directives =
      styles &&
      buildRecipeProviderDirectives(styles, {
        presetId: 'SP01-001',
        presetName: 'Studio Headshot + Film Noir',
        selectedStyles: [
          {
            presetName: 'Studio Headshot',
            packName: 'Photography & Realism',
            strength: 0.7,
            aesthetic: 'clean studio portrait',
          },
          {
            presetName: 'Film Noir',
            packName: 'Cinematic & Media',
            strength: 0.4,
            aesthetic: 'hard shadow crime drama',
          },
        ],
      });

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(serialized).toContain(
      '- Style Slot 1: Studio Headshot; pack Photography & Realism; strength 0.70; avoid rules merge; aesthetic clean studio portrait',
    );
    expect(serialized).toContain(
      '- Style Slot 2: Film Noir; pack Cinematic & Media; strength 0.40; avoid rules merge; aesthetic hard shadow crime drama',
    );
  });

  it('serializes advanced style fields without preset ids', () => {
    const styles = getRecipeModule('styles');
    const directives =
      styles &&
      buildRecipeProviderDirectives(styles, {
        presetId: 'SP09-006',
        presetName: 'Polished Glass',
        selectedStyles: [
          {
            presetId: 'SP09-006',
            presetName: 'Polished Glass',
            packName: 'Texture & Materiality',
            strength: 0.75,
            avoidRulesMode: 'strict',
            fields: {
              colorTone: { label: 'Color', enabled: true, weight: 1 },
              cameraComposition: { label: 'Camera', enabled: false, weight: 1 },
              textureMaterial: { label: 'Texture', enabled: true, weight: 0.4 },
            },
          },
        ],
        colorTone: 'Polished Glass (0.75): cool mineral blues',
        textureMaterial: 'Polished Glass (0.75): glass caustics (field weight 0.40)',
      });

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(serialized).toContain(
      '- Style Slot 1: Polished Glass; pack Texture & Materiality; strength 0.75; active fields Color, Texture 0.40; avoid rules strict',
    );
    expect(serialized).toContain('- Color And Tone: Polished Glass (0.75): cool mineral blues');
    expect(serialized).not.toContain('SP09-006');
    expect(serialized).not.toContain('Camera');
  });
});
