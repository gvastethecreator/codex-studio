import { describe, expect, it } from 'vite-plus/test';

import type { StylePack } from './styles/types';
import {
  composeStylePacksFromManifests,
  createStylePackManifests,
  createStylePresetManifests,
  validateStyleManifestGraph,
} from './stylePresetManifests';
import {
  LEGACY_STYLE_PACKS,
  STYLE_MANIFEST_GRAPH,
  STYLE_PACK_MANIFESTS,
  STYLE_PACKS,
  STYLE_PRESET_MANIFESTS,
} from './stylesData';

describe('stylePresetManifests', () => {
  it('normalizes legacy style packs into granular preset manifests and lightweight pack manifests', () => {
    const packs: StylePack[] = [
      {
        id: 'pack-a',
        name: 'Pack A',
        description: 'First pack',
        presets: [
          {
            id: 'preset-a',
            name: 'Preset A',
            category: 'Cinematic',
            negativePrompt: 'text',
            style: {
              aesthetic: 'noir',
              subject_treatment: 'sculptural',
              color_and_tone: 'cool',
              lighting_and_shadow: 'hard',
              texture_and_material: 'glass',
              camera_and_composition: 'centered',
              atmosphere_and_mood: 'quiet',
              rendering_and_quality: 'high',
            },
          },
        ],
      },
    ];

    const packManifests = createStylePackManifests(packs);
    const presetManifests = createStylePresetManifests(packs);

    expect(packManifests).toEqual([
      {
        schemaVersion: 1,
        id: 'pack-a',
        name: 'Pack A',
        description: 'First pack',
        categories: [
          {
            id: 'cinematic',
            name: 'Cinematic',
            presetRefs: ['pack-a/preset-a.yaml'],
          },
        ],
        presetRefs: ['pack-a/preset-a.yaml'],
      },
    ]);
    expect(presetManifests).toEqual([
      expect.objectContaining({
        schemaVersion: 1,
        id: 'preset-a',
        packId: 'pack-a',
        category: 'Cinematic',
        supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
        visualDna: packs[0].presets[0].style,
        avoidRules: ['text'],
      }),
    ]);
  });

  it('composes compatibility packs from granular manifests', () => {
    const legacyPacks: StylePack[] = [
      {
        id: 'pack-a',
        name: 'Pack A',
        description: 'First pack',
        presets: [
          {
            id: 'preset-a',
            name: 'Preset A',
            category: 'Cinematic',
            negativePrompt: 'text, watermark',
            style: {
              aesthetic: 'noir',
              subject_treatment: 'sculptural',
              color_and_tone: 'cool',
              lighting_and_shadow: 'hard',
              texture_and_material: 'glass',
              camera_and_composition: 'centered',
              atmosphere_and_mood: 'quiet',
              rendering_and_quality: 'high',
            },
          },
        ],
      },
    ];

    const packManifests = createStylePackManifests(legacyPacks);
    const presetManifests = createStylePresetManifests(legacyPacks);

    expect(composeStylePacksFromManifests(packManifests, presetManifests)).toEqual(legacyPacks);
  });

  it('reports missing preset refs and orphan manifests', () => {
    const validation = validateStyleManifestGraph(
      [
        {
          schemaVersion: 1,
          id: 'pack-a',
          name: 'Pack A',
          description: 'First pack',
          categories: [],
          presetRefs: ['pack-a/missing.yaml'],
        },
      ],
      [
        {
          schemaVersion: 1,
          id: 'orphan',
          packId: 'pack-a',
          name: 'Orphan',
          category: 'General',
          version: 1,
          supportedTasks: ['image_generate'],
          tags: [],
          visualDna: {
            aesthetic: 'x',
            subject_treatment: 'x',
            color_and_tone: 'x',
            lighting_and_shadow: 'x',
            texture_and_material: 'x',
            camera_and_composition: 'x',
            atmosphere_and_mood: 'x',
            rendering_and_quality: 'x',
          },
          avoidRules: [],
          assets: {},
        },
      ],
    );

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual([
      'Missing style preset manifest for pack-a: pack-a/missing.yaml',
      'Pack pack-a preset ref is missing from categories: pack-a/missing.yaml',
      'Orphan style preset manifest: pack-a/orphan.yaml',
    ]);
  });

  it('loads current repo from granular manifests without losing legacy preset count', () => {
    const legacyPresetCount = LEGACY_STYLE_PACKS.reduce(
      (total, pack) => total + pack.presets.length,
      0,
    );
    const composedPresetCount = STYLE_PACKS.reduce((total, pack) => total + pack.presets.length, 0);

    expect(STYLE_MANIFEST_GRAPH.errors).toEqual([]);
    expect(STYLE_PACK_MANIFESTS).toHaveLength(LEGACY_STYLE_PACKS.length);
    expect(STYLE_PRESET_MANIFESTS).toHaveLength(legacyPresetCount);
    expect(composedPresetCount).toBe(legacyPresetCount);
  });
});
