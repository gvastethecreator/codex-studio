import { describe, expect, it } from 'vite-plus/test';

import type { StylePack } from './styles/types';
import {
  composeStylePacksFromManifests,
  createStylePresetCatalog,
  createStylePresetCatalogCoverage,
  createStylePackManifests,
  createStylePresetManifests,
  searchStylePresetCatalog,
  toStylePresetManifestRef,
  validateStyleManifestGraph,
} from './stylePresetManifests';
import { loadStylePresetCatalog } from './stylePresetCatalogData';
import { STYLE_PACKS, STYLE_PRESET_BY_ID, STYLE_PRESET_PACK_ID_BY_ID } from './stylesData';
import { LEGACY_STYLE_PACKS } from './legacyStylesData';

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

  it('creates a granular catalog with direct preset and pack lookups', () => {
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
    const catalog = createStylePresetCatalog(packManifests, presetManifests);

    expect(toStylePresetManifestRef('pack-a', 'preset-a')).toBe('pack-a/preset-a.yaml');
    expect(catalog.graph.errors).toEqual([]);
    expect(catalog.presetById.get('preset-a')?.manifest.name).toBe('Preset A');
    expect(catalog.presetById.get('preset-a')?.taxonomy).toEqual(
      expect.objectContaining({
        packId: 'pack-a',
        packName: 'Pack A',
        categoryId: 'cinematic',
        categoryName: 'Cinematic',
        tags: ['pack-a', 'cinematic'],
        hasDefaultImage: true,
      }),
    );
    expect(catalog.packIdByPresetId.get('preset-a')).toBe('pack-a');
    expect(catalog.packById.get('pack-a')?.categories[0]).toEqual(
      expect.objectContaining({
        id: 'cinematic',
        name: 'Cinematic',
        presets: [expect.objectContaining({ id: 'preset-a' })],
      }),
    );
    expect(createStylePresetCatalogCoverage(catalog)).toEqual([
      {
        packId: 'pack-a',
        packName: 'Pack A',
        totalPresets: 1,
        persistedTaxonomy: 1,
        missingTaxonomy: 0,
        withDefaultImage: 1,
        missingDefaultImage: 0,
        categories: 1,
      },
    ]);
  });

  it('searches the granular catalog with compact agent-friendly filters', () => {
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
            domain: 'film',
            style: {
              aesthetic: 'noir pixel grain',
              subject_treatment: 'sculptural',
              color_and_tone: 'cool',
              lighting_and_shadow: 'hard',
              texture_and_material: 'glass',
              camera_and_composition: 'centered',
              atmosphere_and_mood: 'quiet',
              rendering_and_quality: 'high',
            },
          },
          {
            id: 'preset-b',
            name: 'Preset B',
            category: 'Illustration',
            style: {
              aesthetic: 'watercolor',
              subject_treatment: 'soft',
              color_and_tone: 'warm',
              lighting_and_shadow: 'diffuse',
              texture_and_material: 'paper',
              camera_and_composition: 'wide',
              atmosphere_and_mood: 'bright',
              rendering_and_quality: 'high',
            },
          },
        ],
      },
    ];

    const catalog = createStylePresetCatalog(
      createStylePackManifests(legacyPacks),
      createStylePresetManifests(legacyPacks),
    );

    expect(
      searchStylePresetCatalog(catalog, { query: 'pixel' }).map((result) => result.id),
    ).toEqual(['preset-a']);
    expect(
      searchStylePresetCatalog(catalog, {
        packId: 'pack-a',
        tag: 'cinematic',
        task: 'style_preset_card',
        limit: 1,
      }),
    ).toEqual([
      expect.objectContaining({
        id: 'preset-a',
        ref: 'pack-a/preset-a.yaml',
        categoryId: 'cinematic',
        domain: 'film',
      }),
    ]);
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

  it('reports manifest contract drift beyond graph references', () => {
    const validation = validateStyleManifestGraph(
      [
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
      ],
      [
        {
          schemaVersion: 1,
          id: 'preset-a',
          packId: 'pack-a',
          name: 'Preset A',
          category: 'Cinematic',
          version: 1,
          supportedTasks: ['image_generate'],
          tags: ['pack-a', 'cinematic'],
          visualDna: {} as never,
          avoidRules: [],
          assets: {},
          taxonomy: {
            packId: 'pack-b',
            packName: 'Pack B',
            categoryId: 'illustration',
            categoryName: 'Illustration',
            tags: ['pack-a'],
            supportedTasks: ['image_generate', 'image_edit'],
            hasDefaultImage: false,
          },
        },
      ],
    );

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual([
      'Style preset preset-a has empty visualDna',
      'Preset preset-a taxonomy packId pack-b does not match pack-a',
      'Preset preset-a taxonomy packName Pack B does not match Pack A',
      'Preset preset-a taxonomy categoryId illustration does not match cinematic',
      'Preset preset-a taxonomy categoryName Illustration does not match Cinematic',
      'Preset preset-a taxonomy supportedTasks drift from manifest',
      'Preset preset-a taxonomy tags drift from manifest',
    ]);
  });

  it('loads current repo from granular manifests without losing legacy preset count', async () => {
    const legacyPresetCount = LEGACY_STYLE_PACKS.reduce(
      (total, pack) => total + pack.presets.length,
      0,
    );

    const catalog = await loadStylePresetCatalog();
    const recomposedPacks = composeStylePacksFromManifests(
      catalog.packManifests,
      catalog.presetManifests,
    );
    const composedPresetCount = STYLE_PACKS.reduce((total, pack) => total + pack.presets.length, 0);

    expect(catalog.graph.errors).toEqual([]);
    expect(catalog.packManifests).toHaveLength(LEGACY_STYLE_PACKS.length);
    expect(catalog.presetManifests).toHaveLength(legacyPresetCount);
    expect(composedPresetCount).toBe(legacyPresetCount);
    expect(STYLE_PACKS).toEqual(recomposedPacks);
    expect(STYLE_PRESET_BY_ID.get('SP01-001')?.name).toBeTruthy();
    expect(STYLE_PRESET_PACK_ID_BY_ID.get('SP01-001')).toBe('pack_01');
  });
});
