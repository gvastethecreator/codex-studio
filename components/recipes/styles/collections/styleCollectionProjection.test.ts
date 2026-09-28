import { describe, expect, it } from 'vitest';

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
      'Photography',
      'Screen & Animation',
      'Illustration & Print',
      '3D, Materials & Design',
      'World Directions',
      'Experimental',
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

  it('rejects collection entries whose pack is absent from its load dependencies', () => {
    const sourceIndex = createStyleCollectionSourceIndex([pack('pack_a', []), pack('pack_b', [])]);
    const collection = {
      id: 'mixed',
      title: 'Mixed',
      familyId: 'family',
      description: '',
      icon: 'layers',
      order: 1,
      sourcePackIds: ['pack_a'],
      entries: [
        { id: 'a', kind: 'pack', packId: 'pack_a' },
        {
          id: 'b',
          kind: 'manual_group',
          entries: [{ id: 'nested', kind: 'pack', packId: 'pack_b' }],
        },
      ],
    } satisfies StyleCollection;

    expect(
      validateStyleCollections({
        families: [{ id: 'family', title: 'Family', description: '', order: 1 }],
        collections: [collection],
        sourceIndex,
      }).map((issue) => issue.code),
    ).toContain('collection_missing_source_pack');
  });
});
