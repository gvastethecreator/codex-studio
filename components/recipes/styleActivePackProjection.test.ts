import { describe, expect, it } from 'vitest';
import {
  createStyleCollectionSourceIndex,
  resolveStyleCollection,
} from './styles/collections/styleCollectionProjection';
import type { StyleCollection } from './styles/collections/styleCollectionTypes';
import type { StyleRuntimePack, StyleRuntimePreset } from './stylesData';
import { projectActiveStylePack, type ActiveStylePackInput } from './styleActivePackProjection';

const preset = { id: 'SP01-001', name: 'One', category: 'Print' } as StyleRuntimePreset;
const pack: StyleRuntimePack = {
  id: 'pack_01',
  name: 'Pack One',
  description: 'First',
  presets: [preset],
};
const userPack: StyleRuntimePack = {
  id: 'user_styles',
  name: 'Mine',
  description: '',
  presets: [],
};
const base: ActiveStylePackInput = {
  currentPackId: 'pack_01',
  isGlobalStyleBrowseTab: false,
  isAllStyleCardsTab: false,
  activeStyleCollectionId: null,
  activeStyleCollection: null,
  collectionProjection: null,
  collectionLoadError: null,
  allRuntimeStylePacksLoaded: true,
  globalStylePresetCount: 1,
  globalStyleCategoryCount: 1,
  globalStylePacks: [userPack, pack],
  userStylePack: userPack,
  loadedStylePacksById: { pack_01: pack },
  runtimePackIds: ['pack_01'],
  summaries: [{ id: 'pack_01', name: 'Pack One', description: 'First' }],
  favoritesPackId: 'favorites',
};

describe('active style pack projection', () => {
  it('keeps loaded packs, favorites and global counts distinct', () => {
    expect(projectActiveStylePack(base)).toBe(pack);
    expect(projectActiveStylePack({ ...base, currentPackId: 'favorites' }).presets).toEqual([]);
    expect(
      projectActiveStylePack({
        ...base,
        currentPackId: 'all_cards',
        isGlobalStyleBrowseTab: true,
        isAllStyleCardsTab: true,
      }),
    ).toMatchObject({ description: '1 cards from every style pack.', presets: [preset] });
  });

  it('waits for a collection source pack before resolving its presets', () => {
    const collection: StyleCollection = {
      id: 'print',
      title: 'Print',
      familyId: 'art',
      description: 'Printed looks',
      icon: 'pen',
      order: 1,
      sourcePackIds: ['pack_01'],
      entries: [{ id: 'source', kind: 'pack', packId: 'pack_01' }],
    };
    const collectionInput: ActiveStylePackInput = {
      ...base,
      currentPackId: 'collection:print',
      activeStyleCollectionId: 'print',
      activeStyleCollection: collection,
      collectionProjection: { createStyleCollectionSourceIndex, resolveStyleCollection },
    };
    expect(
      projectActiveStylePack({ ...collectionInput, loadedStylePacksById: {} }).presets,
    ).toEqual([]);
    expect(projectActiveStylePack(collectionInput).presets).toEqual([preset]);
  });
});
