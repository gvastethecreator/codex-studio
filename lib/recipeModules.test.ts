import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  buildGenerationTaskSpecFromRecipe,
  createRecipeDefaultParams,
  getRecipeModule,
  getRecipeParameterOptions,
  isRecipeProviderSupported,
  isRecipeTaskSupported,
  listRecipeModules,
  validateRecipeParams,
} from './recipeModules';

describe('recipeModules', () => {
  it('exposes declarative recipe modules with stable metadata', () => {
    const modules = listRecipeModules();
    const styles = getRecipeModule('styles');
    const spritesheet = getRecipeModule('spritesheet');

    expect(modules.map((module) => module.id)).toEqual([
      'styles',
      'remaster',
      'spritesheet',
      'cinematic',
      'character',
      'camera',
      'timeline',
    ]);
    expect(styles).toMatchObject({
      title: 'Styles',
      defaultTask: 'image_generate',
      supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
      supportedProviders: ['codex', 'dry_run'],
    });
    expect(styles?.parameters.map((parameter) => parameter.id)).toContain('presetId');
    expect(spritesheet?.defaultTask).toBe('sprite_sheet');
    expect(spritesheet && getRecipeParameterOptions(spritesheet, 'grid')).toContain('4x2');
  });

  it('exposes defaults, controls, and ranges as part of the Recipe Module interface', () => {
    const remaster = getRecipeModule('remaster');
    const camera = getRecipeModule('camera');

    expect(remaster && createRecipeDefaultParams(remaster)).toMatchObject({
      style: 'Realistic Reconstruction',
      fidelity: 35,
    });
    expect(camera?.parameters.find((parameter) => parameter.id === 'azimuth')).toMatchObject({
      control: 'slider',
      group: 'orbit',
      min: -180,
      max: 180,
    });
  });

  it('validates recipe params before building a Generation Task Spec', () => {
    const camera = getRecipeModule('camera');
    const spritesheet = getRecipeModule('spritesheet');
    const styles = getRecipeModule('styles');

    expect(camera && validateRecipeParams(camera, { azimuth: 400 }).errors).toEqual([
      'Recipe Module camera parameter azimuth is above maximum 180.',
    ]);
    expect(spritesheet && validateRecipeParams(spritesheet, { grid: '13x13' }).errors).toEqual([
      'Recipe Module spritesheet parameter grid has unsupported option: 13x13.',
    ]);
    expect(styles && validateRecipeParams(styles, { presetId: 'SP01-001' }).errors).toEqual([
      'Recipe Module styles requires parameter presetName.',
    ]);
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
        imageSize: '1024x1536',
        requiresCatalogEntry: true,
      },
    });
    expect(spec.metadata.recipeContext).toContain('recipe: camera');
    expect(spec.metadata.recipeProviderDirectives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'camera',
      title: 'Camera View',
    });
    expect(spec.metadata.recipeModule).toMatchObject({
      id: 'camera',
      defaultTask: 'image_generate',
      supportedProviders: ['codex', 'dry_run'],
    });
    expect(spec.quality).toMatchObject({
      qualityPresetId: 'image_general',
      subject: null,
      negative: [],
    });
  });

  it('adds compact provider directives for style preset specs without dropping legacy context', () => {
    const spec = buildGenerationTaskSpecFromRecipe({
      id: 'spec-style',
      providerId: 'codex',
      config: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: 'a glass owl on a plinth',
        recipeId: 'styles',
        recipeParams: {
          presetId: 'SP09-006',
          presetName: 'Glass Owl',
          mode: 'DIRECT_STYLE_SYNTHESIS',
          aesthetic: 'polished glass object study',
          colorTone: 'cool mineral blues',
        },
      },
      task: 'style_preset_card',
    });

    expect(spec.metadata.recipeContext).toContain('STYLE TRANSFER PROTOCOL');
    expect(spec.metadata.recipeProviderDirectives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'styles',
      title: 'Styles',
    });
    expect(spec.quality).toMatchObject({
      qualityPresetId: 'product_or_ui_asset',
      style: 'Glass Owl',
      color: 'cool mineral blues',
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
    expect(spec.quality?.qualityPresetId).toBe('sprite_sheet');
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
