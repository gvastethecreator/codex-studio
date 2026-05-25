import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  buildGenerationTaskSpecFromRecipe,
  getRecipeModule,
  isRecipeProviderSupported,
  isRecipeTaskSupported,
  listRecipeModules,
} from './recipeModules';

describe('recipeModules', () => {
  it('exposes declarative recipe modules with stable metadata', () => {
    const modules = listRecipeModules();
    const styles = getRecipeModule('styles');
    const spritesheet = getRecipeModule('spritesheet');

    expect(modules.map((module) => module.id)).toEqual([
      'remaster',
      'spritesheet',
      'cinematic',
      'character',
      'styles',
      'camera',
      'timeline',
    ]);
    expect(styles).toMatchObject({
      title: 'Style Preset',
      defaultTask: 'image_generate',
      supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
      supportedProviders: ['codex', 'dry_run'],
    });
    expect(styles?.parameters.map((parameter) => parameter.id)).toContain('presetId');
    expect(spritesheet?.defaultTask).toBe('sprite_sheet');
  });

  it('checks task and provider compatibility at the module seam', () => {
    const styles = getRecipeModule('styles');
    expect(styles).toBeTruthy();
    expect(styles && isRecipeTaskSupported(styles, 'style_preset_card')).toBe(true);
    expect(styles && isRecipeProviderSupported(styles, 'codex')).toBe(true);
    expect(styles && isRecipeProviderSupported(styles, 'fal')).toBe(false);
  });

  it('builds a provider-independent Generation Task Spec from recipe params', () => {
    const spec = buildGenerationTaskSpecFromRecipe({
      id: 'spec-1',
      providerId: 'codex',
      config: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: 'a careful camera study of a ceramic bird',
        recipeId: 'camera',
        recipeParams: {
          azimuth: 45,
          elevation: 15,
          distance: 120,
        },
        negativePrompt: 'text, watermark',
        aspectRatio: '2:3',
        imageSize: '1K',
      },
    });

    expect(spec).toMatchObject({
      id: 'spec-1',
      task: 'image_generate',
      providerId: 'codex',
      prompt: 'a careful camera study of a ceramic bird',
      negativePrompt: 'text, watermark',
      recipeId: 'camera',
      recipeParams: {
        azimuth: 45,
        elevation: 15,
        distance: 120,
      },
      output: {
        aspectRatio: '2:3',
        imageSize: '1K',
        requiresCatalogEntry: true,
      },
    });
    expect(spec.metadata.recipeContext).toContain('recipe: camera');
    expect(spec.metadata.recipeModule).toMatchObject({
      id: 'camera',
      defaultTask: 'image_generate',
      supportedProviders: ['codex', 'dry_run'],
    });
  });

  it('uses recipe-specific default tasks without encoding providers into task names', () => {
    const spec = buildGenerationTaskSpecFromRecipe({
      id: 'spec-sprite',
      providerId: 'codex',
      config: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: 'a tiny side-view hero run cycle',
        recipeId: 'spritesheet',
        recipeParams: {
          grid: '4x2',
        },
      },
    });

    expect(spec.task).toBe('sprite_sheet');
    expect(spec.providerId).toBe('codex');
  });

  it('rejects unsupported provider pairings before provider compilation', () => {
    expect(() =>
      buildGenerationTaskSpecFromRecipe({
        id: 'spec-fal-style',
        providerId: 'fal',
        config: {
          ...DEFAULT_GENERATION_CONFIG,
          prompt: 'a precise mineral study',
          recipeId: 'styles',
          recipeParams: {
            presetId: 'SP01-001',
            presetName: 'Studio Headshot',
          },
        },
      }),
    ).toThrow('Recipe Module styles does not support provider fal.');
  });
});
