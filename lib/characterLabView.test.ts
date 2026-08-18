import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vite-plus/test';

import {
  characterLabActions,
  characterLabModes,
  getCharacterLabIconFrame,
  getFirstReadyCharacterLabAction,
} from './characterLabView';

describe('characterLabView', () => {
  it('lists modes and a ready action without exposing generated table imports to the recipe', () => {
    expect(characterLabModes.length).toBeGreaterThan(0);
    expect(getFirstReadyCharacterLabAction().capability).toBe('ready');
    expect(characterLabActions.some((action) => action.mode === 'poses')).toBe(true);
    expect(getCharacterLabIconFrame('poses:front')).toMatchObject({ w: 128, h: 128 });
  });

  it('keeps the Character Lab recipe off the generated catalog tables', () => {
    const source = readFileSync(
      new URL('../components/recipes/CharacterLabRecipe.tsx', import.meta.url),
      'utf8',
    );
    expect(source.includes('characterLabCatalog.generated')).toBe(false);
    expect(source.includes('characterLabIconAtlas.generated')).toBe(false);
    expect(source.includes('characterLabOptionIconAtlas.generated')).toBe(false);
    expect(source.includes('from \'../../lib/characterLabView\'')).toBe(true);
    expect(source.includes('buildCharacterLabPrompt')).toBe(true);
  });

  it('keeps identity and other recipes off the Character Lab generated catalog', () => {
    const identity = readFileSync(new URL('./recipeIdentity.ts', import.meta.url), 'utf8');
    const stylesPage = readFileSync(
      new URL('../components/recipes/StylesRecipe.tsx', import.meta.url),
      'utf8',
    );
    expect(identity.includes('characterLabCatalog.generated')).toBe(false);
    expect(stylesPage.includes('characterLabCatalog.generated')).toBe(false);
  });
});
