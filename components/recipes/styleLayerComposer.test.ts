import { describe, expect, it } from 'vite-plus/test';

import type { StyleRuntimePreset } from './styles/runtimeTypes';
import {
  createDefaultStyleLayerFieldControls,
  createSelectedStyleEmphasis,
  createSelectedStylesGenerationPlan,
  createSelectedStyleLayer,
  createSelectedStylesPrompt,
  joinSelectedStyleLayerValue,
  mergeSelectedStyleNegativePrompts,
  type SelectedStyleSlot,
} from './styleLayerComposer';

const PRESET: StyleRuntimePreset = {
  id: 'SP09-006',
  name: 'Polished Glass',
  category: '2. Man-Made Materials',
  negativePrompt: 'muddy reflections, text',
  style: {
    aesthetic: 'clean transparent studio material',
    subject_treatment: 'simple object silhouette',
    color_and_tone: 'cool mineral blues',
    lighting_and_shadow: 'softbox highlights',
    texture_and_material: 'polished glass caustics',
    camera_and_composition: 'centered product crop',
    atmosphere_and_mood: 'quiet inspection',
    rendering_and_quality: 'sharp commercial render',
    creative_brief: 'make the glass readable at thumbnail scale',
  },
};

function createSlot(overrides: Partial<SelectedStyleSlot> = {}): SelectedStyleSlot {
  return {
    preset: PRESET,
    packId: 'pack_09',
    packName: 'Texture & Materiality',
    strength: 0.75,
    enabled: true,
    fieldControls: createDefaultStyleLayerFieldControls(),
    avoidRulesMode: 'merge',
    ...overrides,
  };
}

describe('styleLayerComposer', () => {
  it('keeps simple selected styles fully enabled by default', () => {
    const layer = createSelectedStyleLayer(createSlot(), 0);

    expect(layer).toMatchObject({
      presetId: 'SP09-006',
      presetName: 'Polished Glass',
      strength: 0.75,
      aesthetic: 'clean transparent studio material',
      textureMaterial: 'polished glass caustics',
    });
    expect(joinSelectedStyleLayerValue([createSlot()], 'colorTone')).toBe(
      'Polished Glass (0.75): cool mineral blues',
    );
  });

  it('uses display names in UI layers while keeping source anchors in prompts', () => {
    const slot = createSlot({
      preset: {
        ...PRESET,
        displayName: 'Clean Glass Material',
        styleAnchors: ['Polished Glass', 'commercial glass render'],
      },
    });
    const layer = createSelectedStyleLayer(slot, 0);

    expect(layer.presetName).toBe('Clean Glass Material');
    expect(layer.presetSourceName).toBe('Polished Glass');
    expect(layer.styleAnchors).toEqual([
      'Clean Glass Material',
      'Polished Glass',
      'commercial glass render',
    ]);
    expect(createSelectedStylesPrompt([slot])).toBe(
      'Apply selected style layers: Clean Glass Material [style anchors: Polished Glass, commercial glass render]',
    );
    expect(joinSelectedStyleLayerValue([slot], 'colorTone')).toBe(
      'Clean Glass Material [style anchors: Polished Glass, commercial glass render] (0.75): cool mineral blues',
    );
  });

  it('omits disabled visual DNA fields and annotates field weights', () => {
    const slot = createSlot({
      fieldControls: {
        ...createDefaultStyleLayerFieldControls(),
        cameraComposition: { enabled: false, weight: 1 },
        textureMaterial: { enabled: true, weight: 0.4 },
      },
    });

    const layer = createSelectedStyleLayer(slot, 0);

    expect(layer.cameraComposition).toBe('');
    expect(layer.textureMaterial).toBe('polished glass caustics (field weight 0.40)');
    expect(joinSelectedStyleLayerValue([slot], 'cameraComposition')).toBe('');
  });

  it('respects layer disabled state and avoid-rules modes', () => {
    const disabled = createSlot({ enabled: false });
    const strict = createSlot({ avoidRulesMode: 'strict' });
    const ignored = createSlot({ avoidRulesMode: 'ignore' });

    expect(createSelectedStyleEmphasis([disabled], 'vary framing')).toContain(
      'Blend 0 selected style layers',
    );
    expect(
      mergeSelectedStyleNegativePrompts({ baseNegativePrompt: 'watermark', slots: [strict] }),
    ).toBe('watermark, strictly avoid: muddy reflections, text');
    expect(
      mergeSelectedStyleNegativePrompts({ baseNegativePrompt: 'watermark', slots: [ignored] }),
    ).toBe('watermark');
  });

  it('deduplicates repeated avoid rules while preserving strict intent', () => {
    const strict = createSlot({ avoidRulesMode: 'strict' });
    const mergedDuplicate = createSlot();

    expect(
      mergeSelectedStyleNegativePrompts({
        baseNegativePrompt: 'watermark',
        slots: [strict, mergedDuplicate],
      }),
    ).toBe('watermark, strictly avoid: muddy reflections, text');
  });

  it('registers selected style identity and compiled guidance for toolbar generation', () => {
    const plan = createSelectedStylesGenerationPlan({
      slots: [createSlot()],
      hasReferenceImages: false,
      baseNegativePrompt: 'watermark',
    });

    expect(plan).not.toBeNull();
    expect(plan?.recipeParams).toMatchObject({
      presetId: 'SP09-006',
      presetName: 'Polished Glass',
      mode: 'DIRECT_STYLE_SYNTHESIS',
      negativePrompt: 'watermark, muddy reflections, text',
    });
    expect(plan?.recipeParams.selectedStyles).toHaveLength(1);
    expect(plan?.recipeParams.styleEmphasis).toContain('Slot 1: Polished Glass');
  });

  it('switches to creative reimagining when reference images are present', () => {
    const plan = createSelectedStylesGenerationPlan({
      slots: [createSlot()],
      hasReferenceImages: true,
    });

    expect(plan?.recipeParams).toMatchObject({
      mode: 'CREATIVE_REIMAGINING',
      compositionRule:
        'Preserve only subject intent from the uploaded references; force substantial variation in pose, camera, composition, lighting, and scene staging.',
    });
    expect(plan?.recipeParams.roleInstruction).toContain(
      'Do not preserve pose, framing, camera angle, or original composition',
    );
  });
});
