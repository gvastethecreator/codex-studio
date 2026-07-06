import { describe, expect, it } from 'vite-plus/test';

import {
  sanitizeCodexStyleDraft,
  sanitizeCreateUserStylePresetInput,
  sanitizeUpdateUserStylePresetInput,
  type UserStyleVisualDna,
} from './userStyles';

const VISUAL_DNA: UserStyleVisualDna = {
  aesthetic: 'Soft editorial watercolor over clean ink lines',
  subject_treatment: 'Gentle silhouette simplification with expressive gesture',
  color_and_tone: 'Warm muted coral, sage, bone, and low contrast shadows',
  lighting_and_shadow: 'Diffuse window light with transparent wash shadows',
  texture_and_material: 'Tooth paper grain, feathered pigment, dry brush edges',
  camera_and_composition: 'Three-quarter view, calm negative space, balanced margins',
  atmosphere_and_mood: 'Quiet handmade warmth with intimate sketchbook presence',
  rendering_and_quality: 'Polished illustration, crisp focal edges, no muddy washes',
  creative_brief: 'Portable gentle watercolor editorial language for varied subjects',
};

describe('user style contracts', () => {
  it('sanitizes a complete create payload', () => {
    const result = sanitizeCreateUserStylePresetInput({
      name: '  Gentle Wash  ',
      category: ' Custom Blends ',
      tags: ['watercolor', 'watercolor', ' editorial '],
      supportedTasks: ['image_generate', 'bad_task', 'image_edit'],
      visualDna: VISUAL_DNA,
      avoidRules: ['watermark', ' text '],
      source: { kind: 'blend', packId: 'pack_04' },
    });

    expect(result.ok).toBe(true);
    expect(result.value).toMatchObject({
      name: 'Gentle Wash',
      category: 'Custom Blends',
      tags: ['watercolor', 'editorial'],
      supportedTasks: ['image_generate', 'image_edit'],
      avoidRules: ['watermark', 'text'],
      source: { kind: 'blend', packId: 'pack_04' },
    });
  });

  it('rejects missing required visual DNA fields', () => {
    const result = sanitizeCreateUserStylePresetInput({
      name: 'Broken Style',
      visualDna: {
        aesthetic: 'Only one field',
      },
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContain('visualDna.subject_treatment is required.');
  });

  it('allows partial update payloads', () => {
    const result = sanitizeUpdateUserStylePresetInput({
      name: 'Updated',
      visualDna: {
        color_and_tone: 'New color logic',
      },
      isArchived: true,
    });

    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      name: 'Updated',
      visualDna: {
        color_and_tone: 'New color logic',
      },
      isArchived: true,
    });
  });

  it('validates Codex draft JSON before applying it', () => {
    const result = sanitizeCodexStyleDraft({
      name: 'Codex Draft',
      category: 'Assisted',
      tags: ['codex', 'draft'],
      supportedTasks: ['image_generate', 'texture_generate'],
      visualDna: VISUAL_DNA,
      avoidRules: ['watermark'],
      warnings: ['Review material specificity.'],
    });

    expect(result.ok).toBe(true);
    expect(result.value?.warnings).toEqual(['Review material specificity.']);
  });
});
