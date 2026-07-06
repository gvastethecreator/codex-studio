import { describe, expect, it } from 'vite-plus/test';

import { createMemoryUserStyleStore } from './userStyles';
import type { CreateUserStylePresetInput } from '../../../packages/shared/src';

const VISUAL_DNA: CreateUserStylePresetInput['visualDna'] = {
  aesthetic: 'Matte ceramic editorial still life',
  subject_treatment: 'Simple subject silhouette with careful handmade asymmetry',
  color_and_tone: 'Warm ivory, clay red, soot black, and muted blue accents',
  lighting_and_shadow: 'Soft north light with compressed contact shadows',
  texture_and_material: 'Unglazed ceramic pores, paper fiber, and dry pigment texture',
  camera_and_composition: 'Front-biased composition, table-height lens, wide quiet margins',
  atmosphere_and_mood: 'Quiet studio ritual with crafted restraint',
  rendering_and_quality: 'Sharp tactile detail, polished natural finish, no labels',
  creative_brief: 'A reusable matte ceramic editorial style for many subjects.',
};

function createStore() {
  return createMemoryUserStyleStore();
}

describe('user style store', () => {
  it('creates, updates, archives, and duplicates user styles', () => {
    const store = createStore();
    const created = store.createUserStyle({
      name: 'Matte Ceramic',
      category: 'Custom Materials',
      tags: ['ceramic'],
      supportedTasks: ['image_generate', 'texture_generate'],
      visualDna: VISUAL_DNA,
      avoidRules: ['watermark'],
      source: { kind: 'manual' },
    });

    expect(store.listUserStyles().map((style) => style.id)).toEqual([created.id]);
    expect(created.supportedTasks).toEqual(['image_generate', 'texture_generate']);

    const updated = store.updateUserStyle(created.id, {
      name: 'Matte Ceramic Study',
      visualDna: { color_and_tone: 'Ivory and iron black' },
    });
    expect(updated?.name).toBe('Matte Ceramic Study');
    expect(updated?.visualDna.color_and_tone).toBe('Ivory and iron black');
    expect(updated?.visualDna.aesthetic).toBe(VISUAL_DNA.aesthetic);

    const duplicate = store.duplicateUserStyle(created.id);
    expect(duplicate?.id).not.toBe(created.id);
    expect(duplicate?.source).toMatchObject({ kind: 'clone', presetId: created.id });

    store.archiveUserStyle(created.id);
    expect(store.listUserStyles().map((style) => style.id)).toEqual([duplicate?.id]);
    expect(store.listUserStyles({ includeArchived: true })).toHaveLength(2);
  });
});
