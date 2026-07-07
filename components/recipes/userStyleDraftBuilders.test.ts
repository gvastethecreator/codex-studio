import { describe, expect, it } from 'vitest';
import { createSelectedStyleLayer, type SelectedStyleSlot } from './styleLayerComposer';
import {
  createEmptyUserStyleDraft,
  createUserStyleDraftFromReferenceImages,
  createUserStyleDraftFromBlend,
  createUserStyleReferenceImageSummary,
  createUserStyleInputFromDraft,
  createUserStyleInputFromRuntimePreset,
  mergeUserStyleDraftWithDisabledFields,
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

  it('uses display names when cloning renamed runtime presets', () => {
    const input = createUserStyleInputFromRuntimePreset(
      { ...preset, displayName: 'Graphic Circuit System' },
      'pack_04',
      'Graphic Novel',
    );

    expect(input.name).toBe('Graphic Circuit System Remix');
    expect(input.source?.data).toEqual({
      presetName: 'Graphic Circuit System',
      packName: 'Graphic Novel',
    });
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

  it('summarizes reference images as transferable style evidence', () => {
    const summary = createUserStyleReferenceImageSummary([
      {
        id: 'ref-1',
        name: 'black_tarot_card.png',
        mimeType: 'image/png',
        notes: 'white micron lines over deep black negative space',
      },
    ]);

    expect(summary).toContain('black_tarot_card.png');
    expect(summary).toContain('transferable visual DNA');
    expect(summary).toContain('Do not preserve pose');
  });

  it('creates a reference-derived draft without locking the source image', () => {
    const draft = createUserStyleDraftFromReferenceImages([
      {
        id: 'ref-1',
        name: 'grim-bestiary-plate.webp',
      },
    ]);

    expect(draft.name).toBe('grim bestiary plate Style Study');
    expect(draft.category).toBe('Reference-Derived Styles');
    expect(draft.tags).toContain('reference-derived');
    expect(draft.avoidRules).toContain('source composition lock');
  });

  it('preserves disabled fields when applying an assisted draft', () => {
    const current = createEmptyUserStyleDraft();
    const incoming = {
      ...current,
      name: 'Incoming Codex Draft',
      tags: ['incoming'],
      visualDna: {
        ...current.visualDna,
        color_and_tone: 'acid green on black',
        creative_brief: 'Incoming brief.',
      },
      avoidRules: ['watermark', 'source pose lock'],
    };

    const merged = mergeUserStyleDraftWithDisabledFields(current, incoming, [
      'name',
      'color_and_tone',
      'avoidRules',
    ]);

    expect(merged.name).toBe('Custom Style');
    expect(merged.tags).toEqual(['incoming']);
    expect(merged.visualDna.color_and_tone).toBe(current.visualDna.color_and_tone);
    expect(merged.visualDna.creative_brief).toBe('Incoming brief.');
    expect(merged.avoidRules).toEqual(current.avoidRules);
  });
});
