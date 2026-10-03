import { describe, expect, it } from 'vitest';

import { serializeRecipeProviderDirectives } from '../../packages/shared/src';
import { getCharacterLayoutInstruction, getCharacterStyleInstruction } from './character';
import { buildRecipeProviderDirectives, getRecipeModule } from './index';

describe('character recipe', () => {
  it('resolves Character prompt fragments from stable layout and style terms', () => {
    expect(getCharacterLayoutInstruction('Expression Sheet')).toContain('2x3 grid');
    expect(getCharacterLayoutInstruction('unknown')).toContain('turnaround reference sheet');
    expect(getCharacterStyleInstruction('Preserve Source Style', true)).toContain(
      "reference image's art style",
    );
    expect(getCharacterStyleInstruction('Preserve Source Style', false)).not.toContain('reference');
    expect(getCharacterStyleInstruction('Cyberpunk Neon', true)).toContain('CYBERPUNK NEON');
  });

  it('builds compact provider directives for character params', () => {
    const character = getRecipeModule('character');
    expect(character).toBeTruthy();

    const directives =
      character &&
      buildRecipeProviderDirectives(character, {
        layout: 'Dynamic Sheet',
        style: 'Concept Art (Digital)',
        shot: 'Full Body',
        focus: 'Weapons/Gear',
        hasReference: false,
      });

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'character',
      title: 'Character Sheet',
    });
    expect(serialized).toContain('- Layout: Dynamic Sheet');
    expect(serialized).toContain('main, full-body dynamic action pose');
    expect(serialized).toContain('- Style: Concept Art (Digital)');
    expect(serialized).toContain('No text, labels, captions, arrows, or watermarks.');
    expect(serialized).toContain('- Design Focus: Give extra detail to Weapons/Gear.');
  });

  it('returns empty but valid directives when a registered recipe has only defaults', () => {
    const character = getRecipeModule('character');
    const directives = character && buildRecipeProviderDirectives(character, {});

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'character',
    });
  });
});
