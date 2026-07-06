import { describe, expect, it } from 'vitest';
import { createSelectedStyleLayer, type SelectedStyleSlot } from './styleLayerComposer';
import {
  createEmptyUserStyleDraft,
  createUserStyleDraftFromBlend,
  createUserStyleInputFromDraft,
  createUserStyleInputFromRuntimePreset,
} from './userStyleDraftBuilders';
import type { StyleRuntimePreset } from './styles/runtimeTypes';

const preset: StyleRuntimePreset = {
  id: 'preset-a',
  name: 'Ink Circuit',
  category: 'Graphic',
  negativePrompt: 'watermark, logo',
  style: {
    aesthetic: 'sharp inked circuitry',
    subject_treatment: 'angular silhouettes',
    color_and_tone: 'black, white, cyan',
    lighting_and_shadow: 'flat shadows',
    texture_and_material: 'screenprint grain',
    camera_and_composition: 'poster framing',
    atmosphere_and_mood: 'electric tension',
    rendering_and_quality: 'clean vector edges',
    creative_brief: 'Graphic ink style.',
  },
};

describe('userStyleDraftBuilders', () => {
  it('creates a complete manual input from an empty draft', () => {
    const draft = createEmptyUserStyleDraft();
    const input = createUserStyleInputFromDraft(draft, { kind: 'manual' });

    expect(input.name).toBe('Custom Style');
    expect(input.visualDna.aesthetic).toContain('Reusable custom');
    expect(input.supportedTasks).toContain('style_preset_card');
  });

  it('clones a runtime preset into a user style input', () => {
    const input = createUserStyleInputFromRuntimePreset(preset, 'pack_04', 'Graphic Novel');

    expect(input.name).toBe('Ink Circuit Remix');
    expect(input.source?.kind).toBe('clone');
    expect(input.visualDna.color_and_tone).toBe('black, white, cyan');
    expect(input.avoidRules).toEqual(['watermark', 'logo']);
  });

  it('turns selected style layers into a saved blend draft', () => {
    const slot: SelectedStyleSlot = {
      preset,
      packId: 'pack_04',
      packName: 'Graphic Novel',
      strength: 0.75,
      enabled: true,
    };
    const draft = createUserStyleDraftFromBlend([slot], [createSelectedStyleLayer(slot, 0)]);

    expect(draft.name).toContain('Ink Circuit');
    expect(draft.tags).toContain('blend');
    expect(draft.visualDna.aesthetic).toContain('Ink Circuit 0.75');
    expect(draft.avoidRules).toEqual(['watermark', 'logo']);
  });
});
