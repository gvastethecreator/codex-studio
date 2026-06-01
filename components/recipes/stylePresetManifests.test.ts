import { describe, expect, it } from 'vite-plus/test';

import type { StylePackManifest } from './styles/manifestTypes';
import type { StyleRuntimePack } from './styles/runtimeTypes';
import {
  composeStyleRuntimePacksFromManifests,
  createStylePresetCatalog,
  createStylePresetCatalogCoverage,
  createStylePackManifests,
  createStylePresetManifests,
  searchStylePresetCatalog,
  toStylePresetManifestRef,
  validateStyleManifestGraph,
} from './stylePresetManifests';
import { loadStylePresetCatalog } from './stylePresetCatalogData';
import { loadStylePresetIndex } from './stylesData';

describe('stylePresetManifests', () => {
  it('normalizes legacy style packs into granular preset manifests and lightweight pack manifests', () => {
    const packs: StyleRuntimePack[] = [
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

  it('composes runtime packs from granular manifests', () => {
    const runtimePacks: StyleRuntimePack[] = [
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

    const packManifests = createStylePackManifests(runtimePacks);
    const presetManifests = createStylePresetManifests(runtimePacks);

    expect(composeStyleRuntimePacksFromManifests(packManifests, presetManifests)).toEqual(
      runtimePacks,
    );
  });

  it('composes runtime category names from pack subcategories instead of stale preset fields', () => {
    const packManifests: StylePackManifest[] = [
      {
        schemaVersion: 1,
        id: 'pack-a',
        name: 'Pack A',
        description: 'First pack',
        categories: [
          {
            id: 'manifest-category',
            name: 'Manifest Category',
            presetRefs: ['pack-a/preset-a.yaml'],
          },
        ],
        presetRefs: ['pack-a/preset-a.yaml'],
      },
    ];
    const presetManifests = createStylePresetManifests([
      {
        id: 'pack-a',
        name: 'Pack A',
        description: 'First pack',
        presets: [
          {
            id: 'preset-a',
            name: 'Preset A',
            category: 'Stale Preset Category',
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
    ]);

    expect(
      composeStyleRuntimePacksFromManifests(packManifests, presetManifests)[0].presets[0],
    ).toMatchObject({
      id: 'preset-a',
      category: 'Manifest Category',
    });
  });

  it('creates a granular catalog with direct preset and pack lookups', () => {
    const runtimePacks: StyleRuntimePack[] = [
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

    const packManifests = createStylePackManifests(runtimePacks);
    const presetManifests = createStylePresetManifests(runtimePacks);
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
    const runtimePacks: StyleRuntimePack[] = [
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
      createStylePackManifests(runtimePacks),
      createStylePresetManifests(runtimePacks),
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

  it('reports pack/category reference drift in lightweight pack manifests', () => {
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
              presetRefs: ['pack-a/preset-a.yaml', 'pack-b/preset-b.yaml'],
            },
          ],
          presetRefs: ['pack-a/preset-a.yaml', 'pack-a/preset-a.yaml'],
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
      'Pack pack-a references preset more than once: pack-a/preset-a.yaml',
      'Pack pack-a category cinematic references preset absent from pack presetRefs: pack-b/preset-b.yaml',
      'Pack pack-a category cinematic references preset outside pack namespace: pack-b/preset-b.yaml',
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

  it('loads current repo from granular manifests without legacy runtime data', async () => {
    const catalog = await loadStylePresetCatalog();
    const recomposedPacks = composeStyleRuntimePacksFromManifests(
      catalog.packManifests,
      catalog.presetManifests,
    );
    const runtimeIndex = await loadStylePresetIndex();
    const composedPresetCount = runtimeIndex.packs.reduce(
      (total, pack) => total + pack.presets.length,
      0,
    );

    expect(catalog.graph.errors).toEqual([]);
    expect(catalog.packManifests).toHaveLength(16);
    expect(catalog.presetManifests).toHaveLength(1662);
    expect(composedPresetCount).toBe(catalog.presetManifests.length);
    expect(runtimeIndex.packs).toEqual(recomposedPacks);
    expect(runtimeIndex.presetById.get('SP01-001')?.name).toBeTruthy();
    expect(runtimeIndex.presetPackIdById.get('SP01-001')).toBe('pack_01');
  }, 20_000);
});
