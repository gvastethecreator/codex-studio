import { readFileSync } from 'node:fs';
import { CHARACTER_LAB_RECIPE_ALIASES } from './recipeAliases';
import { describe, expect, it } from 'vitest';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  activateCharacterLabView,
  createCharacterLabViewDraft,
  updateCharacterLabView,
} from './characterLabDraft';
import { buildCharacterLabPrompt } from './characterLabPrompt';
import { getRecipeModule } from './recipeModules';
import { buildRecipeProviderDirectives } from './recipeProviderDirectives';
import { CHARACTER_LAB_WORKFLOWS } from './characterLabWorkflows';
import { RECIPE_DISCOVERY_CATALOG } from './recipeCatalog';

import {
  characterLabActions,
  characterLabModes,
  getCharacterLabIconFrame,
  getFirstReadyCharacterLabAction,
  resolveInitialCharacterLabAction,
} from './characterLabView';

describe('characterLabView', () => {
  it('opens each focused workflow with explicit matching catalog and generation defaults', () => {
    for (const alias of CHARACTER_LAB_RECIPE_ALIASES) {
      const config = activateCharacterLabView(DEFAULT_GENERATION_CONFIG, alias.characterLabMode);
      const expected = CHARACTER_LAB_WORKFLOWS[alias.characterLabMode];
      const catalog = RECIPE_DISCOVERY_CATALOG.find((entry) => entry.id === alias.id)!;
      expect(config.recipeParams).toMatchObject({
        actionId: expected.actionId,
        mode: alias.characterLabMode,
        labAspectRatio: expected.aspectRatio,
      });
      expect(config.aspectRatio).toBe(expected.aspectRatio);
      expect(catalog.defaultParams).toMatchObject(config.recipeParams!);
    }
    expect(
      activateCharacterLabView(DEFAULT_GENERATION_CONFIG, 'spritesheets').recipeParams?.frames,
    ).toBe(4);
  });

  it.each(['scenes', 'effects', 'special'] as const)(
    'keeps %s controls consistent in prompt, context and provider directives',
    (mode) => {
      const config = updateCharacterLabView(
        DEFAULT_GENERATION_CONFIG,
        mode,
        {
          backgroundColor: '#FFFFFF',
          expression: 'Neutral',
          clothing: 'Fantasy Knight Armor',
          prompt: 'Keep the red scarf',
        },
        'A traveler',
      );
      const params = config.recipeParams!;
      const view = config.characterLabDraft!.views[mode]!;
      const action = characterLabActions.find((entry) => entry.id === params.actionId)!;
      const prompt = buildCharacterLabPrompt(action, {
        ...view,
        subject: 'A traveler',
        hasSource: true,
        referencesCount: 0,
        additionalPrompt: view.prompt,
      });
      const module = getRecipeModule('character-lab')!;
      const context = module.buildContext(params);
      const directives = JSON.stringify(buildRecipeProviderDirectives(module, params));
      for (const output of [prompt, context, directives]) {
        expect(output).toContain('Keep the red scarf');
        expect(output).toContain('selected action takes precedence');
        if (mode === 'special') expect(output).not.toContain('Fantasy Knight Armor');
        else {
          expect(output).not.toContain('#FFFFFF');
          expect(output).not.toContain('Neutral');
        }
      }
      const reset = updateCharacterLabView(config, mode, createCharacterLabViewDraft(mode));
      expect(reset.characterLabDraft?.subject).toBe('A traveler');
      expect(reset.prompt).toBe('');
      expect(reset.characterLabDraft?.views[mode]).toEqual(createCharacterLabViewDraft(mode));
    },
  );

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
    expect(source.includes("from '../../lib/characterLabView'")).toBe(true);
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
  it('opens the requested alias mode without replacing a saved action in that mode', () => {
    const front = getFirstReadyCharacterLabAction('poses');
    for (const alias of CHARACTER_LAB_RECIPE_ALIASES) {
      const action = resolveInitialCharacterLabAction(
        { mode: front.mode, actionId: front.id },
        alias.id,
      );
      expect(action.mode).toBe(alias.characterLabMode);
      const saved = characterLabActions
        .filter((candidate) => candidate.mode === alias.characterLabMode)
        .at(-1)!;
      expect(resolveInitialCharacterLabAction({ actionId: saved.id }, alias.id).id).toBe(saved.id);
    }
    expect(resolveInitialCharacterLabAction({ actionId: front.id }).id).toBe(front.id);
  });
});
