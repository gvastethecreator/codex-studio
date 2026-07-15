import { describe, expect, it, vi } from 'vite-plus/test';

import { loadStyleRuntimePack, loadStyleRuntimePacks } from '../../stylesData';
import type { StyleRuntimePack, StyleRuntimePreset } from '../runtimeTypes';
import {
  STYLE_COLLECTION_FAMILIES,
  STYLE_COLLECTIONS,
  STYLE_COLLECTIONS_BY_ID,
} from './styleCollectionDefinitions';
import {
  createStyleCollectionRuntimeSummaries,
  createStyleCollectionSourceIndex,
  resolveStyleCollection,
} from './styleCollectionProjection';
import { validateStyleCollections } from './styleCollectionValidation';
import type { StyleCollection } from './styleCollectionTypes';

vi.setConfig({ testTimeout: 60_000 });

function preset(id: string, category: string): StyleRuntimePreset {
  return {
    id,
    name: `Preset ${id}`,
    category,
    style: {
      aesthetic: '',
      subject_treatment: '',
      color_and_tone: '',
      lighting_and_shadow: '',
      texture_and_material: '',
      camera_and_composition: '',
      atmosphere_and_mood: '',
      rendering_and_quality: '',
    },
  };
}

function pack(id: string, presets: StyleRuntimePreset[]): StyleRuntimePack {
  return {
    id,
    name: id,
    description: `${id} description`,
    presets,
  };
}

describe('style collection projection', () => {
  it('keeps user-facing families in the planned order', () => {
    expect(STYLE_COLLECTION_FAMILIES.map((family) => family.title)).toEqual([
      'Personal',
      'Capture & Reality',
      'Screen & Motion',
      'Illustration & Art Media',
      'Design, Assets & Materials',
      'Worlds & Genres',
      'Experimental & Play',
    ]);
  });

  it('resolves pack, category, preset, query, dedupe, and exclude entries', () => {
    const packs = [
      pack('pack_a', [preset('a-1', 'A'), preset('a-2', 'B')]),
      pack('pack_b', [preset('b-1', 'B'), preset('b-2', 'C')]),
    ];
    const index = createStyleCollectionSourceIndex(packs);
    const collection: StyleCollection = {
      id: 'test_collection',
      title: 'Test Collection',
      familyId: 'test',
      description: 'Test collection',
      icon: 'test',
      order: 1,
      sourcePackIds: ['pack_a', 'pack_b'],
      facets: { workflow: ['image'] },
      entries: [
        { id: 'pack-a', kind: 'pack', packId: 'pack_a' },
        { id: 'pack-b-category', kind: 'category', packId: 'pack_b', categoryName: 'B' },
        { id: 'dedupe-a-1', kind: 'preset', packId: 'pack_a', presetId: 'a-1' },
        {
          id: 'query-c',
          kind: 'query',
          query: { packIds: ['pack_b'], categoryNames: ['C'] },
          displayCategory: 'Display C',
          facetOverrides: { medium: ['test-medium'], technique: ['test-technique'] },
          role: 'cross_link',
        },
        {
          id: 'exclude-a-2',
          kind: 'preset',
          packId: 'pack_a',
          presetId: 'a-2',
          includeMode: 'exclude',
        },
      ],
    };

    const resolved = resolveStyleCollection(collection, index);

    expect(resolved.presets.map((item) => item.presetId)).toEqual(['a-1', 'b-1', 'b-2']);
    expect(resolved.presets.map((item) => item.collectionEntryId)).toEqual([
      'pack-a',
      'pack-b-category',
      'query-c',
    ]);
    expect(resolved.presets[2]).toMatchObject({
      displayCategory: 'Display C',
      facetOverrides: { medium: ['test-medium'], technique: ['test-technique'] },
    });
    expect(resolved.summary).toMatchObject({
      id: 'test_collection',
      facets: { workflow: ['image'] },
      presetCount: 3,
      sourcePackIds: ['pack_a', 'pack_b'],
    });

    expect(createStyleCollectionRuntimeSummaries([collection], packs)).toMatchObject([
      {
        id: 'test_collection',
        presetCount: 3,
        sourcePackIds: ['pack_a', 'pack_b'],
      },
    ]);
  });

  it('keeps pack_02 photo eras in analog while sensor imaging goes technical', async () => {
    const pack01 = await loadStyleRuntimePack('pack_01');
    const pack02 = await loadStyleRuntimePack('pack_02');
    expect(pack01).toBeTruthy();
    expect(pack02).toBeTruthy();

    const index = createStyleCollectionSourceIndex([pack01!, pack02!]);
    const analog = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('analog_film_process')!,
      index,
    );
    const cinema = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('cinema_film_genres')!,
      index,
    );
    const technical = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('technical_imaging')!,
      index,
    );

    const analogIds = new Set(analog.presets.map((item) => item.presetId));
    const cinemaIds = new Set(cinema.presets.map((item) => item.presetId));
    const technicalIds = new Set(technical.presets.map((item) => item.presetId));

    expect(analogIds.has('SP02-046')).toBe(true);
    expect(analogIds.has('SP02-060')).toBe(false);
    expect(cinemaIds.has('SP02-046')).toBe(false);
    expect(cinemaIds.has('SP02-001')).toBe(true);
    expect(technicalIds.has('SP02-058')).toBe(true);
    expect(technicalIds.has('SP02-059')).toBe(true);
    expect(technicalIds.has('SP02-060')).toBe(true);
  });

  it('projects first mixed-category override slices for lighting and cartoons', async () => {
    const pack01 = await loadStyleRuntimePack('pack_01');
    const pack02 = await loadStyleRuntimePack('pack_02');
    const pack03 = await loadStyleRuntimePack('pack_03');
    expect(pack01).toBeTruthy();
    expect(pack02).toBeTruthy();
    expect(pack03).toBeTruthy();

    const index = createStyleCollectionSourceIndex([pack01!, pack02!, pack03!]);
    const lighting = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('lighting_optics_atmosphere')!,
      index,
    );
    const cartoons = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('animation_cartoons')!,
      index,
    );

    expect(
      lighting.presets.some(
        (item) =>
          item.collectionEntryId === 'media-lighting-atmosphere' &&
          item.displayCategory === 'Lighting And Atmosphere' &&
          item.facetOverrides?.technique?.includes('atmosphere'),
      ),
    ).toBe(true);
    expect(
      cartoons.presets.some(
        (item) =>
          item.collectionEntryId === 'cartoon-caricature' &&
          item.displayCategory === 'Caricature And Cartoon Styles' &&
          item.facetOverrides?.domain?.includes('caricature'),
      ),
    ).toBe(true);
  });

  it('routes CGI sensor shaders to technical imaging instead of materials', async () => {
    const pack03 = await loadStyleRuntimePack('pack_03');
    expect(pack03).toBeTruthy();

    const index = createStyleCollectionSourceIndex([pack03!]);
    const technical = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('technical_imaging')!,
      index,
    );
    const materials = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('materials_textures_surfaces')!,
      index,
    );

    const technicalIds = new Set(technical.presets.map((item) => item.presetId));
    const materialIds = new Set(materials.presets.map((item) => item.presetId));

    expect(technicalIds.has('SP03-043')).toBe(true);
    expect(technicalIds.has('SP03-044')).toBe(true);
    expect(materialIds.has('SP03-043')).toBe(false);
    expect(materialIds.has('SP03-044')).toBe(false);
  });

  it('routes miscellaneous sensor imaging separately from micro macro scale', async () => {
    const pack11 = await loadStyleRuntimePack('pack_11');
    expect(pack11).toBeTruthy();

    const index = createStyleCollectionSourceIndex([pack11!]);
    const technical = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('technical_imaging')!,
      index,
    );

    const sensorPresets = technical.presets.filter(
      (item) => item.collectionEntryId === 'pack11-sensor-technical',
    );
    const scalePresets = technical.presets.filter(
      (item) => item.collectionEntryId === 'scale-micro-macro',
    );

    expect(sensorPresets.map((item) => item.presetId)).toEqual(['SP11-034', 'SP11-035']);
    expect(scalePresets.some((item) => item.presetId === 'SP11-034')).toBe(false);
    expect(scalePresets.some((item) => item.presetId === 'SP11-056')).toBe(true);
  });

  it('separates pack_07 practical places from speculative and toy architecture', async () => {
    const pack07 = await loadStyleRuntimePack('pack_07');
    expect(pack07).toBeTruthy();

    const index = createStyleCollectionSourceIndex([pack07!]);
    const architecture = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('architecture_interiors_places')!,
      index,
    );
    const speculative = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('speculative_architecture_places')!,
      index,
    );
    const toys = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('toys_craft_food_scale')!,
      index,
    );

    const architectureIds = new Set(architecture.presets.map((item) => item.presetId));
    const speculativeIds = new Set(speculative.presets.map((item) => item.presetId));
    const toyIds = new Set(toys.presets.map((item) => item.presetId));

    expect(architectureIds.has('SP07-001')).toBe(true);
    expect(architectureIds.has('SP07-050')).toBe(true);
    expect(architectureIds.has('SP07-051')).toBe(false);
    expect(architectureIds.has('SP07-065')).toBe(false);
    expect(speculativeIds.has('SP07-051')).toBe(true);
    expect(speculativeIds.has('SP07-075')).toBe(true);
    expect(toyIds.has('SP07-065')).toBe(true);
  });

  it('routes diagrams, blueprints, and technical sheets outside broad art media buckets', async () => {
    const pack02 = await loadStyleRuntimePack('pack_02');
    const pack04 = await loadStyleRuntimePack('pack_04');
    const pack10 = await loadStyleRuntimePack('pack_10');
    const pack11 = await loadStyleRuntimePack('pack_11');
    expect(pack02).toBeTruthy();
    expect(pack04).toBeTruthy();
    expect(pack10).toBeTruthy();
    expect(pack11).toBeTruthy();

    const index = createStyleCollectionSourceIndex([pack02!, pack04!, pack10!, pack11!]);
    const cartoons = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('animation_cartoons')!,
      index,
    );
    const drawing = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('drawing_ink_print')!,
      index,
    );
    const diagrams = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('diagrams_blueprints_technical_sheets')!,
      index,
    );
    const illustration = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('illustration_publishing')!,
      index,
    );
    const concept = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('digital_concept_art')!,
      index,
    );
    const painting = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('painting_traditional')!,
      index,
    );

    const cartoonIds = new Set(cartoons.presets.map((item) => item.presetId));
    const drawingIds = new Set(drawing.presets.map((item) => item.presetId));
    const diagramIds = new Set(diagrams.presets.map((item) => item.presetId));
    const illustrationIds = new Set(illustration.presets.map((item) => item.presetId));
    const conceptIds = new Set(concept.presets.map((item) => item.presetId));
    const paintingIds = new Set(painting.presets.map((item) => item.presetId));

    expect(cartoonIds.has('SP02-098')).toBe(false);
    expect(drawingIds.has('SP02-099')).toBe(true);
    expect(diagramIds.has('SP02-091')).toBe(true);
    expect(diagramIds.has('SP02-098')).toBe(true);
    expect(diagramIds.has('SP04-098')).toBe(true);
    expect([...diagramIds].filter((id) => id.startsWith('SP04-')).sort()).toEqual([
      'SP04-057',
      'SP04-059',
      'SP04-086',
      'SP04-094',
      'SP04-098',
      'SP04-099',
      'SP04-100',
    ]);
    expect(diagramIds.has('SP10-067')).toBe(true);
    expect(diagramIds.has('SP10-068')).toBe(true);
    expect(diagramIds.has('SP10-069')).toBe(true);
    expect(diagramIds.has('SP10-076')).toBe(true);
    expect(diagramIds.has('SP10-077')).toBe(true);
    expect(diagramIds.has('SP10-078')).toBe(false);
    expect(diagramIds.has('SP11-033')).toBe(true);
    expect(illustrationIds.has('SP04-057')).toBe(false);
    expect(conceptIds.has('SP04-086')).toBe(false);
    expect(conceptIds.has('SP04-099')).toBe(false);
    expect(conceptIds.has('SP04-098')).toBe(true);
    expect(paintingIds.has('SP11-033')).toBe(false);
  });

  it('projects split abstract system finishes to the right user-facing collections', async () => {
    const pack10 = await loadStyleRuntimePack('pack_10');
    const pack11 = await loadStyleRuntimePack('pack_11');
    expect(pack10).toBeTruthy();
    expect(pack11).toBeTruthy();

    const index = createStyleCollectionSourceIndex([pack10!, pack11!]);
    const abstract = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('abstract_glitch_systems')!,
      index,
    );
    const lighting = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('lighting_optics_atmosphere')!,
      index,
    );
    const drawing = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('drawing_ink_print')!,
      index,
    );
    const patterns = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('patterns_ornament')!,
      index,
    );
    const toys = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('toys_craft_food_scale')!,
      index,
    );
    const painting = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('painting_traditional')!,
      index,
    );

    const abstractIds = new Set(abstract.presets.map((item) => item.presetId));
    const lightingIds = new Set(lighting.presets.map((item) => item.presetId));
    const drawingIds = new Set(drawing.presets.map((item) => item.presetId));
    const patternIds = new Set(patterns.presets.map((item) => item.presetId));
    const toyIds = new Set(toys.presets.map((item) => item.presetId));
    const paintingIds = new Set(painting.presets.map((item) => item.presetId));

    expect(abstractIds.has('SP10-067')).toBe(true);
    expect(abstractIds.has('SP10-078')).toBe(false);
    expect(abstractIds.has('SP10-079')).toBe(false);
    expect(lightingIds.has('SP10-078')).toBe(true);
    expect(drawingIds.has('SP10-079')).toBe(true);
    expect(drawingIds.has('SP10-080')).toBe(true);
    expect(drawingIds.has('SP11-044')).toBe(true);
    expect(patternIds.has('SP10-072')).toBe(true);
    expect(patternIds.has('SP10-073')).toBe(true);
    expect(patternIds.has('SP10-074')).toBe(true);
    expect(toyIds.has('SP11-032')).toBe(true);
    expect(paintingIds.has('SP11-032')).toBe(false);
  });

  it('adds architecture cross-links without pulling them out of source packs', async () => {
    const pack01 = await loadStyleRuntimePack('pack_01');
    const pack04 = await loadStyleRuntimePack('pack_04');
    const pack07 = await loadStyleRuntimePack('pack_07');
    expect(pack01).toBeTruthy();
    expect(pack04).toBeTruthy();
    expect(pack07).toBeTruthy();

    const index = createStyleCollectionSourceIndex([pack01!, pack04!, pack07!]);
    const architecture = resolveStyleCollection(
      STYLE_COLLECTIONS_BY_ID.get('architecture_interiors_places')!,
      index,
    );

    const architectureIds = new Set(architecture.presets.map((item) => item.presetId));

    expect(architectureIds.has('SP01-056')).toBe(true);
    expect(architectureIds.has('SP01-057')).toBe(true);
    expect(architectureIds.has('SP04-091')).toBe(true);
    expect(architectureIds.has('SP07-001')).toBe(true);
    expect(architectureIds.has('SP07-051')).toBe(false);
  });

  it('keeps anime pack categories in coherent source order', async () => {
    const pack05 = await loadStyleRuntimePack('pack_05');
    const pack13 = await loadStyleRuntimePack('pack_13');
    const pack16 = await loadStyleRuntimePack('pack_16');
    expect(pack05).toBeTruthy();
    expect(pack13).toBeTruthy();
    expect(pack16).toBeTruthy();

    const categoryOrder = (pack: StyleRuntimePack) => [
      ...new Set(pack.presets.map((item) => item.category ?? 'General')),
    ];

    expect(categoryOrder(pack05!)).toEqual([
      '1. Modern Shonen & Action',
      '2. Mecha & Cyberpunk',
      '3. Isekai & High Fantasy',
      '4. Dark Fantasy & Seinen',
      '5. Action Motion Setpieces',
    ]);
    expect(categoryOrder(pack13!)).toEqual([
      '1. Core Anime',
      '2. Slice Of Life, School And Music',
      '3. Shojo, Magical Girl & Visionary Classics',
      '4. Slice Of Life & Moe',
      '5. Anime Style Spectrum',
    ]);
    expect(categoryOrder(pack16!)).toEqual([
      '1. 70s & 80s Retro Anime',
      '2. 90s Golden Era',
      '3. 2000s Classics',
      '4. Studio Masterpieces',
      '5. Sports, Competition & Performance',
      '6. Samurai & Medieval',
      '7. Horror',
    ]);
  });

  it('validates V2 definitions against generated runtime packs', async () => {
    const sourcePacks = await loadStyleRuntimePacks();
    const virtualPacks: StyleRuntimePack[] = [pack('user_styles', []), pack('favorites', [])];
    const sourceIndex = createStyleCollectionSourceIndex([...sourcePacks, ...virtualPacks]);

    expect(
      validateStyleCollections({
        families: STYLE_COLLECTION_FAMILIES,
        collections: STYLE_COLLECTIONS,
        sourceIndex,
      }),
    ).toEqual([]);
  });
});
