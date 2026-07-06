import type { StyleRuntimePack, StyleRuntimePreset } from '../runtimeTypes';

export type StyleCollectionEntryKind = 'pack' | 'category' | 'preset' | 'query' | 'manual_group';

export type StyleCollectionRole = 'primary' | 'secondary' | 'cross_link';

export interface StyleCollectionFacets {
  medium?: string[];
  domain?: string[];
  workflow?: string[];
  era?: string[];
  technique?: string[];
  world?: string[];
}

export interface StyleCollectionQuery {
  packIds?: string[];
  categoryNames?: string[];
  presetIds?: string[];
}

export interface StyleCollectionEntry {
  id: string;
  kind: StyleCollectionEntryKind;
  packId?: string;
  categoryName?: string;
  presetId?: string;
  presetIds?: string[];
  query?: StyleCollectionQuery;
  title?: string;
  description?: string;
  displayCategory?: string;
  facetOverrides?: StyleCollectionFacets;
  role?: StyleCollectionRole;
  includeMode?: 'include' | 'exclude';
  entries?: StyleCollectionEntry[];
}

export interface StyleCollectionFamily {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface StyleCollection {
  id: string;
  title: string;
  familyId: string;
  description: string;
  icon: string;
  order: number;
  entries: StyleCollectionEntry[];
  sourcePackIds: string[];
  featuredPresetIds?: string[];
  facets?: StyleCollectionFacets;
}

export interface StyleCollectionRuntimePreset {
  preset: StyleRuntimePreset;
  presetId: string;
  sourcePackId: string;
  sourceCategory: string;
  displayCategory: string;
  collectionId: string;
  collectionEntryId: string;
  collectionRole: StyleCollectionRole;
  facetOverrides?: StyleCollectionFacets;
}

export interface StyleCollectionRuntimeSummary {
  id: string;
  title: string;
  familyId: string;
  description: string;
  icon: string;
  order: number;
  presetCount: number;
  sourcePackIds: string[];
  featuredPresetIds: string[];
  facets?: StyleCollectionFacets;
}

export interface ResolvedStyleCollection {
  collection: StyleCollection;
  summary: StyleCollectionRuntimeSummary;
  presets: StyleCollectionRuntimePreset[];
}

export interface StyleCollectionSourceIndex {
  packsById: Map<string, StyleRuntimePack>;
  presetsById: Map<string, { pack: StyleRuntimePack; preset: StyleRuntimePreset }>;
  categoryNamesByPackId: Map<string, Set<string>>;
}
