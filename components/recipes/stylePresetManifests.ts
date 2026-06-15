import type {
  StylePackManifest,
  StylePresetEditorialTaxonomy,
  StylePresetManifest,
} from './styles/manifestTypes';
import type { StyleRuntimePack, StyleRuntimePreset } from './styles/runtimeTypes';
import { getStylePackDisplayName } from './styles/packOrdering';

export interface StyleManifestGraphValidation {
  valid: boolean;
  errors: string[];
}

export interface StylePresetCatalogCategory {
  id: string;
  name: string;
  presetRefs: string[];
  presets: StylePresetManifest[];
}

export interface StylePresetCatalogEntry {
  manifest: StylePresetManifest;
  ref: string;
  taxonomy: StylePresetEditorialTaxonomy;
}

export interface StylePresetCatalogPack {
  manifest: StylePackManifest;
  presets: StylePresetCatalogEntry[];
  categories: StylePresetCatalogCategory[];
}

export interface StylePresetCatalog {
  graph: StyleManifestGraphValidation;
  packs: StylePresetCatalogPack[];
  presets: StylePresetCatalogEntry[];
  presetById: ReadonlyMap<string, StylePresetCatalogEntry>;
  packById: ReadonlyMap<string, StylePresetCatalogPack>;
  packIdByPresetId: ReadonlyMap<string, string>;
}

export interface StylePresetCatalogPackCoverage {
  packId: string;
  packName: string;
  totalPresets: number;
  persistedTaxonomy: number;
  missingTaxonomy: number;
  withDefaultImage: number;
  missingDefaultImage: number;
  categories: number;
}

export interface StylePresetCatalogSearchFilters {
  query?: string;
  packId?: string;
  categoryId?: string;
  categoryName?: string;
  domain?: string;
  tag?: string;
  task?: string;
  limit?: number;
}

export interface StylePresetCatalogSearchResult {
  id: string;
  name: string;
  ref: string;
  packId: string;
  packName: string;
  categoryId: string;
  categoryName: string;
  domain?: string;
  tags: string[];
  supportedTasks: string[];
  defaultImage?: string;
}

export interface StylePresetCatalogSearchPackSummary {
  id: string;
  name: string;
  presetCount: number;
}

export interface StylePresetCatalogSearchIndexPack {
  id: string;
  name: string;
  presetCount: number;
}

export interface StylePresetCatalogSearchIndexEntry extends StylePresetCatalogSearchResult {
  searchableText: string;
}

export interface StylePresetCatalogSearchIndex {
  packs: StylePresetCatalogSearchIndexPack[];
  presets: StylePresetCatalogSearchIndexEntry[];
  totalPresetCount: number;
}

export interface StylePresetCatalogSearchPackPlanInput {
  packSummaries: readonly StylePresetCatalogSearchPackSummary[];
  filters?: StylePresetCatalogSearchFilters;
}

const DEFAULT_STYLE_PRESET_SUPPORTED_TASKS = ['image_generate', 'image_edit', 'style_preset_card'];

function normalizeCategory(category?: string) {
  return category?.trim() || 'General';
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^[0-9]+[.)]\s*/, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeSearchText(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function includesText(value: string | undefined, needle: string) {
  return normalizeSearchText(value).includes(needle);
}

function parseAvoidRules(negativePrompt?: string) {
  if (!negativePrompt) return [];
  return negativePrompt.split(',').flatMap((rule) => {
    const trimmed = rule.trim();
    return trimmed ? [trimmed] : [];
  });
}

function createRuntimePresetSearchTags({
  pack,
  preset,
  categoryName,
}: {
  pack: StyleRuntimePack;
  preset: StyleRuntimePreset;
  categoryName: string;
}) {
  return [
    slugify(pack.name),
    slugify(categoryName),
    preset.domain ? slugify(preset.domain) : null,
  ].filter((tag): tag is string => Boolean(tag));
}

function isNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function sameStringList(a: readonly string[] = [], b: readonly string[] = []) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function hasAnyVisualDnaText(value: Record<string, unknown>) {
  return Object.values(value).some(isNonEmptyString);
}

export function toStylePresetManifestRef(packId: string, presetId: string) {
  return `${packId}/${presetId}.yaml`;
}

function createAttributes(preset: StyleRuntimePreset) {
  const attributes = {
    ...(preset.negativePrompt ? { negativePrompt: preset.negativePrompt } : {}),
    ...(preset.camera !== undefined ? { camera: preset.camera } : {}),
    ...(preset.render !== undefined ? { render: preset.render } : {}),
    ...(preset.type !== undefined ? { type: preset.type } : {}),
    ...(preset.ui !== undefined ? { ui: preset.ui } : {}),
    ...(preset.layout !== undefined ? { layout: preset.layout } : {}),
    ...(preset.materials !== undefined ? { materials: preset.materials } : {}),
    ...(preset.print !== undefined ? { print: preset.print } : {}),
    ...(preset.digital !== undefined ? { digital: preset.digital } : {}),
  };

  return Object.keys(attributes).length > 0 ? attributes : undefined;
}

function createNegativePrompt(preset: StylePresetManifest) {
  if (typeof preset.attributes?.negativePrompt === 'string') {
    return preset.attributes.negativePrompt;
  }
  if (preset.avoidRules.length > 0) {
    return preset.avoidRules.join(', ');
  }
  return undefined;
}

function createEditorialTaxonomy({
  pack,
  category,
  preset,
}: {
  pack: StylePackManifest;
  category?: { id: string; name: string };
  preset: StylePresetManifest;
}): StylePresetEditorialTaxonomy {
  return {
    packId: pack.id,
    packName: pack.name,
    categoryId: preset.taxonomy?.categoryId ?? category?.id ?? slugify(preset.category),
    categoryName: preset.taxonomy?.categoryName ?? category?.name ?? preset.category,
    ...(preset.taxonomy?.domain || preset.domain
      ? { domain: preset.taxonomy?.domain ?? preset.domain }
      : {}),
    tags: preset.taxonomy?.tags ?? preset.tags,
    supportedTasks: preset.taxonomy?.supportedTasks ?? preset.supportedTasks,
    hasDefaultImage: preset.taxonomy?.hasDefaultImage ?? Boolean(preset.assets.defaultImage),
  };
}

export function createStylePresetManifests(packs: StyleRuntimePack[]): StylePresetManifest[] {
  return packs.flatMap((pack) =>
    pack.presets.map((preset) => {
      const category = normalizeCategory(preset.category);
      return {
        schemaVersion: 1,
        id: preset.id,
        packId: pack.id,
        name: preset.name,
        category,
        ...(preset.domain ? { domain: preset.domain } : {}),
        version: 1,
        supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
        tags: [
          slugify(pack.name),
          slugify(category),
          preset.domain ? slugify(preset.domain) : null,
        ].filter((tag): tag is string => Boolean(tag)),
        visualDna: preset.style,
        avoidRules: parseAvoidRules(preset.negativePrompt),
        assets: {
          defaultImage: `/assets/recipes/styles/defaults/${preset.id}.webp`,
        },
        taxonomy: {
          packId: pack.id,
          packName: pack.name,
          categoryId: slugify(category),
          categoryName: category,
          ...(preset.domain ? { domain: preset.domain } : {}),
          tags: [
            slugify(pack.name),
            slugify(category),
            preset.domain ? slugify(preset.domain) : null,
          ].filter((tag): tag is string => Boolean(tag)),
          supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
          hasDefaultImage: true,
        },
        ...(createAttributes(preset) ? { attributes: createAttributes(preset) } : {}),
      } satisfies StylePresetManifest;
    }),
  );
}

export function createStylePackManifests(packs: StyleRuntimePack[]): StylePackManifest[] {
  return packs.map((pack) => {
    const refsByCategory = new Map<string, string[]>();

    for (const preset of pack.presets) {
      const category = normalizeCategory(preset.category);
      refsByCategory.set(category, [
        ...(refsByCategory.get(category) ?? []),
        toStylePresetManifestRef(pack.id, preset.id),
      ]);
    }

    const categories = [...refsByCategory.entries()].map(([category, presetRefs]) => ({
      id: slugify(category),
      name: category,
      presetRefs,
    }));

    return {
      schemaVersion: 1,
      id: pack.id,
      name: pack.name,
      description: pack.description,
      categories,
      presetRefs: categories.flatMap((category) => category.presetRefs),
    };
  });
}

export function validateStyleManifestGraph(
  packManifests: StylePackManifest[],
  presetManifests: StylePresetManifest[],
): StyleManifestGraphValidation {
  const errors: string[] = [];
  const presetsByRef = new Map<string, StylePresetManifest>();
  const packsById = new Map<string, StylePackManifest>();
  const seenPackIds = new Set<string>();
  const seenPresetIds = new Set<string>();

  for (const pack of packManifests) {
    if (seenPackIds.has(pack.id)) {
      errors.push(`Duplicate style pack manifest id: ${pack.id}`);
    }
    seenPackIds.add(pack.id);
    packsById.set(pack.id, pack);

    const schemaVersion = Number(pack.schemaVersion);
    if (schemaVersion !== 1) {
      errors.push(`Style pack ${pack.id} has unsupported schemaVersion: ${schemaVersion}`);
    }
    if (!isNonEmptyString(pack.id)) {
      errors.push('Style pack manifest has empty id');
    }
    if (!isNonEmptyString(pack.name)) {
      errors.push(`Style pack ${pack.id} has empty name`);
    }

    const packPresetRefs = new Set<string>();
    for (const ref of pack.presetRefs) {
      if (!isNonEmptyString(ref)) {
        errors.push(`Pack ${pack.id} has empty preset ref`);
        continue;
      }
      if (packPresetRefs.has(ref)) {
        errors.push(`Pack ${pack.id} references preset more than once: ${ref}`);
      }
      if (!ref.startsWith(`${pack.id}/`)) {
        errors.push(`Pack ${pack.id} references preset outside pack namespace: ${ref}`);
      }
      packPresetRefs.add(ref);
    }

    const categoryRefs = new Set<string>();
    const seenCategoryIds = new Set<string>();
    for (const category of pack.categories) {
      if (seenCategoryIds.has(category.id)) {
        errors.push(`Pack ${pack.id} has duplicate category id: ${category.id}`);
      }
      seenCategoryIds.add(category.id);
      if (!isNonEmptyString(category.name)) {
        errors.push(`Pack ${pack.id} category ${category.id} has empty name`);
      }
      for (const ref of category.presetRefs) {
        if (!isNonEmptyString(ref)) {
          errors.push(`Pack ${pack.id} category ${category.id} has empty preset ref`);
          continue;
        }
        if (categoryRefs.has(ref)) {
          errors.push(`Pack ${pack.id} references preset more than once in categories: ${ref}`);
        }
        if (!packPresetRefs.has(ref)) {
          errors.push(
            `Pack ${pack.id} category ${category.id} references preset absent from pack presetRefs: ${ref}`,
          );
        }
        if (!ref.startsWith(`${pack.id}/`)) {
          errors.push(
            `Pack ${pack.id} category ${category.id} references preset outside pack namespace: ${ref}`,
          );
        }
        categoryRefs.add(ref);
      }
    }
  }

  for (const preset of presetManifests) {
    if (seenPresetIds.has(preset.id)) {
      errors.push(`Duplicate style preset manifest id: ${preset.id}`);
    }
    seenPresetIds.add(preset.id);
    presetsByRef.set(toStylePresetManifestRef(preset.packId, preset.id), preset);

    const schemaVersion = Number(preset.schemaVersion);
    if (schemaVersion !== 1) {
      errors.push(`Style preset ${preset.id} has unsupported schemaVersion: ${schemaVersion}`);
    }
    if (!isNonEmptyString(preset.id)) {
      errors.push('Style preset manifest has empty id');
    }
    if (!isNonEmptyString(preset.packId)) {
      errors.push(`Style preset ${preset.id} has empty packId`);
    }
    if (!packsById.has(preset.packId)) {
      errors.push(`Style preset ${preset.id} declares unknown pack: ${preset.packId}`);
    }
    if (!isNonEmptyString(preset.name)) {
      errors.push(`Style preset ${preset.id} has empty name`);
    }
    if (!isNonEmptyString(preset.category)) {
      errors.push(`Style preset ${preset.id} has empty category`);
    }
    if (!Number.isInteger(preset.version) || preset.version < 1) {
      errors.push(`Style preset ${preset.id} has invalid version: ${preset.version}`);
    }
    if (preset.supportedTasks.length === 0) {
      errors.push(`Style preset ${preset.id} has no supportedTasks`);
    }
    if (!hasAnyVisualDnaText(preset.visualDna)) {
      errors.push(`Style preset ${preset.id} has empty visualDna`);
    }
  }

  const referencedRefs = new Set<string>();
  for (const pack of packManifests) {
    const categoryByRef = new Map<string, { id: string; name: string }>();
    for (const category of pack.categories) {
      for (const ref of category.presetRefs) {
        categoryByRef.set(ref, category);
      }
    }

    for (const ref of pack.presetRefs) {
      referencedRefs.add(ref);
      const preset = presetsByRef.get(ref);
      if (!preset) {
        errors.push(`Missing style preset manifest for ${pack.id}: ${ref}`);
        continue;
      }
      if (preset.packId !== pack.id) {
        errors.push(
          `Preset ${preset.id} declares pack ${preset.packId} but is referenced by ${pack.id}`,
        );
      }
      if (preset.taxonomy) {
        const taxonomy = preset.taxonomy;
        const category = categoryByRef.get(ref);
        if (taxonomy.packId && taxonomy.packId !== pack.id) {
          errors.push(
            `Preset ${preset.id} taxonomy packId ${taxonomy.packId} does not match ${pack.id}`,
          );
        }
        if (taxonomy.packName && taxonomy.packName !== pack.name) {
          errors.push(
            `Preset ${preset.id} taxonomy packName ${taxonomy.packName} does not match ${pack.name}`,
          );
        }
        if (category && taxonomy.categoryId && taxonomy.categoryId !== category.id) {
          errors.push(
            `Preset ${preset.id} taxonomy categoryId ${taxonomy.categoryId} does not match ${category.id}`,
          );
        }
        if (category && taxonomy.categoryName && taxonomy.categoryName !== category.name) {
          errors.push(
            `Preset ${preset.id} taxonomy categoryName ${taxonomy.categoryName} does not match ${category.name}`,
          );
        }
        if (
          taxonomy.supportedTasks &&
          !sameStringList(taxonomy.supportedTasks, preset.supportedTasks)
        ) {
          errors.push(`Preset ${preset.id} taxonomy supportedTasks drift from manifest`);
        }
        if (taxonomy.tags && !sameStringList(taxonomy.tags, preset.tags)) {
          errors.push(`Preset ${preset.id} taxonomy tags drift from manifest`);
        }
        if (taxonomy.domain && preset.domain && taxonomy.domain !== preset.domain) {
          errors.push(
            `Preset ${preset.id} taxonomy domain ${taxonomy.domain} does not match ${preset.domain}`,
          );
        }
      }
    }

    const categoryRefs = new Set(pack.categories.flatMap((category) => category.presetRefs));
    for (const ref of pack.presetRefs) {
      if (!categoryRefs.has(ref)) {
        errors.push(`Pack ${pack.id} preset ref is missing from categories: ${ref}`);
      }
    }
  }

  for (const ref of presetsByRef.keys()) {
    if (!referencedRefs.has(ref)) {
      errors.push(`Orphan style preset manifest: ${ref}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function composeStyleRuntimePacksFromManifests(
  packManifests: StylePackManifest[],
  presetManifests: StylePresetManifest[],
): StyleRuntimePack[] {
  const presetsByRef = new Map(
    presetManifests.map((preset) => [toStylePresetManifestRef(preset.packId, preset.id), preset]),
  );

  return packManifests.map((pack) => {
    const categoryNameByRef = new Map<string, string>();
    for (const category of pack.categories) {
      for (const ref of category.presetRefs) {
        categoryNameByRef.set(ref, category.name);
      }
    }

    return {
      id: pack.id,
      name: getStylePackDisplayName(pack.id, pack.name),
      description: pack.description,
      presets: pack.presetRefs.flatMap((ref): StyleRuntimePreset[] => {
        const preset = presetsByRef.get(ref);
        if (!preset) return [];

        return [
          {
            id: preset.id,
            name: preset.name,
            category:
              categoryNameByRef.get(ref) ?? preset.taxonomy?.categoryName ?? preset.category,
            ...(preset.domain ? { domain: preset.domain } : {}),
            ...(createNegativePrompt(preset)
              ? { negativePrompt: createNegativePrompt(preset) }
              : {}),
            style: preset.visualDna,
            ...(preset.attributes?.camera !== undefined
              ? { camera: preset.attributes.camera }
              : {}),
            ...(preset.attributes?.render !== undefined
              ? { render: preset.attributes.render }
              : {}),
            ...(preset.attributes?.type !== undefined ? { type: preset.attributes.type } : {}),
            ...(preset.attributes?.ui !== undefined ? { ui: preset.attributes.ui } : {}),
            ...(preset.attributes?.layout !== undefined
              ? { layout: preset.attributes.layout }
              : {}),
            ...(preset.attributes?.materials !== undefined
              ? { materials: preset.attributes.materials }
              : {}),
            ...(preset.attributes?.print !== undefined ? { print: preset.attributes.print } : {}),
            ...(preset.attributes?.digital !== undefined
              ? { digital: preset.attributes.digital }
              : {}),
          },
        ];
      }),
    };
  });
}

export function createStylePresetCatalog(
  packManifests: StylePackManifest[],
  presetManifests: StylePresetManifest[],
): StylePresetCatalog {
  const graph = validateStyleManifestGraph(packManifests, presetManifests);
  const presetByRef = new Map(
    presetManifests.map((preset) => [toStylePresetManifestRef(preset.packId, preset.id), preset]),
  );
  const presetById = new Map<string, StylePresetCatalogEntry>();
  const packIdByPresetId = new Map<string, string>();

  const packs = packManifests.map((pack): StylePresetCatalogPack => {
    const categoriesByRef = new Map<string, { id: string; name: string }>();
    for (const category of pack.categories) {
      for (const ref of category.presetRefs) {
        categoriesByRef.set(ref, { id: category.id, name: category.name });
      }
    }

    const toCatalogEntry = (ref: string) => {
      const preset = presetByRef.get(ref);
      if (!preset) return null;
      return {
        manifest: preset,
        ref,
        taxonomy: createEditorialTaxonomy({
          pack,
          category: categoriesByRef.get(ref),
          preset,
        }),
      } satisfies StylePresetCatalogEntry;
    };

    const categories = pack.categories.map(
      (category): StylePresetCatalogCategory => ({
        id: category.id,
        name: category.name,
        presetRefs: category.presetRefs,
        presets: category.presetRefs.flatMap((ref) => {
          const entry = toCatalogEntry(ref);
          return entry ? [entry.manifest] : [];
        }),
      }),
    );

    const presets = pack.presetRefs.flatMap((ref) => {
      const entry = toCatalogEntry(ref);
      if (!entry) return [];
      presetById.set(entry.manifest.id, entry);
      packIdByPresetId.set(entry.manifest.id, entry.taxonomy.packId);
      return [entry];
    });

    return {
      manifest: pack,
      presets,
      categories,
    };
  });

  return {
    graph,
    packs,
    presets: packs.flatMap((pack) => pack.presets),
    presetById,
    packById: new Map(packs.map((pack) => [pack.manifest.id, pack])),
    packIdByPresetId,
  };
}

export function createStylePresetCatalogCoverage(
  catalog: StylePresetCatalog,
): StylePresetCatalogPackCoverage[] {
  return catalog.packs.map((pack) => {
    const persistedTaxonomy = pack.presets.filter((entry) => entry.manifest.taxonomy).length;
    const withDefaultImage = pack.presets.filter((entry) => entry.taxonomy.hasDefaultImage).length;

    return {
      packId: pack.manifest.id,
      packName: pack.manifest.name,
      totalPresets: pack.presets.length,
      persistedTaxonomy,
      missingTaxonomy: pack.presets.length - persistedTaxonomy,
      withDefaultImage,
      missingDefaultImage: pack.presets.length - withDefaultImage,
      categories: pack.categories.length,
    };
  });
}

export function searchStylePresetCatalog(
  catalog: StylePresetCatalog,
  filters: StylePresetCatalogSearchFilters = {},
): StylePresetCatalogSearchResult[] {
  const query = normalizeSearchText(filters.query);
  const packId = normalizeSearchText(filters.packId);
  const categoryId = normalizeSearchText(filters.categoryId);
  const categoryName = normalizeSearchText(filters.categoryName);
  const domain = normalizeSearchText(filters.domain);
  const tag = normalizeSearchText(filters.tag);
  const task = normalizeSearchText(filters.task);
  const limit = filters.limit && filters.limit > 0 ? filters.limit : undefined;
  const results: StylePresetCatalogSearchResult[] = [];

  for (const entry of catalog.presets) {
    const { manifest, taxonomy } = entry;
    const tags = new Set(taxonomy.tags.map((value) => value.toLowerCase()));
    const supportedTasks = new Set(taxonomy.supportedTasks.map((value) => value.toLowerCase()));
    const searchableText = [
      manifest.id,
      manifest.name,
      manifest.category,
      manifest.domain,
      taxonomy.packId,
      taxonomy.packName,
      taxonomy.categoryId,
      taxonomy.categoryName,
      taxonomy.domain,
      ...taxonomy.tags,
      ...manifest.avoidRules,
      ...Object.values(manifest.visualDna).map((value) => String(value)),
    ]
      .filter((value): value is string => Boolean(value))
      .join(' ')
      .toLowerCase();

    if (query && !searchableText.includes(query)) continue;
    if (packId && normalizeSearchText(taxonomy.packId) !== packId) continue;
    if (categoryId && normalizeSearchText(taxonomy.categoryId) !== categoryId) continue;
    if (categoryName && !includesText(taxonomy.categoryName, categoryName)) continue;
    if (domain && !includesText(taxonomy.domain ?? manifest.domain, domain)) continue;
    if (tag && !tags.has(tag)) continue;
    if (task && !supportedTasks.has(task)) continue;

    results.push({
      id: manifest.id,
      name: manifest.name,
      ref: entry.ref,
      packId: taxonomy.packId,
      packName: taxonomy.packName,
      categoryId: taxonomy.categoryId,
      categoryName: taxonomy.categoryName,
      ...(taxonomy.domain ? { domain: taxonomy.domain } : {}),
      tags: taxonomy.tags,
      supportedTasks: taxonomy.supportedTasks,
      ...(manifest.assets.defaultImage ? { defaultImage: manifest.assets.defaultImage } : {}),
    });

    if (limit && results.length >= limit) break;
  }

  return results;
}

export function createStylePresetCatalogSearchIndexFromRuntimePacks(
  packs: StyleRuntimePack[],
  options: { resolveDefaultImage?: (presetId: string) => string | null | undefined } = {},
): StylePresetCatalogSearchIndex {
  return {
    packs: packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      presetCount: pack.presets.length,
    })),
    presets: packs.flatMap((pack) =>
      pack.presets.map((preset): StylePresetCatalogSearchIndexEntry => {
        const categoryName = normalizeCategory(preset.category);
        const categoryId = slugify(categoryName);
        const tags = createRuntimePresetSearchTags({ pack, preset, categoryName });
        const supportedTasks = DEFAULT_STYLE_PRESET_SUPPORTED_TASKS;
        const avoidRules = parseAvoidRules(preset.negativePrompt);
        const searchableText = [
          preset.id,
          preset.name,
          categoryName,
          preset.domain,
          pack.id,
          pack.name,
          categoryId,
          ...tags,
          ...avoidRules,
          ...Object.values(preset.style).map((value) => String(value)),
        ]
          .filter((value): value is string => Boolean(value))
          .join(' ')
          .toLowerCase();
        const defaultImage = options.resolveDefaultImage?.(preset.id);

        return {
          id: preset.id,
          name: preset.name,
          ref: toStylePresetManifestRef(pack.id, preset.id),
          packId: pack.id,
          packName: pack.name,
          categoryId,
          categoryName,
          ...(preset.domain ? { domain: preset.domain } : {}),
          tags,
          supportedTasks,
          ...(defaultImage ? { defaultImage } : {}),
          searchableText,
        };
      }),
    ),
    totalPresetCount: packs.reduce((total, pack) => total + pack.presets.length, 0),
  };
}

export function searchStylePresetCatalogIndex(
  index: StylePresetCatalogSearchIndex,
  filters: StylePresetCatalogSearchFilters = {},
): StylePresetCatalogSearchResult[] {
  const query = normalizeSearchText(filters.query);
  const packId = normalizeSearchText(filters.packId);
  const categoryId = normalizeSearchText(filters.categoryId);
  const categoryName = normalizeSearchText(filters.categoryName);
  const domain = normalizeSearchText(filters.domain);
  const tag = normalizeSearchText(filters.tag);
  const task = normalizeSearchText(filters.task);
  const limit = filters.limit && filters.limit > 0 ? filters.limit : undefined;
  const results: StylePresetCatalogSearchResult[] = [];

  for (const entry of index.presets) {
    const tags = new Set(entry.tags.map((value) => value.toLowerCase()));
    const supportedTasks = new Set(entry.supportedTasks.map((value) => value.toLowerCase()));

    if (query && !entry.searchableText.includes(query)) continue;
    if (packId && normalizeSearchText(entry.packId) !== packId) continue;
    if (categoryId && normalizeSearchText(entry.categoryId) !== categoryId) continue;
    if (categoryName && !includesText(entry.categoryName, categoryName)) continue;
    if (domain && !includesText(entry.domain, domain)) continue;
    if (tag && !tags.has(tag)) continue;
    if (task && !supportedTasks.has(task)) continue;

    const { searchableText: _searchableText, ...result } = entry;
    results.push(result);

    if (limit && results.length >= limit) break;
  }

  return results;
}

export function resolveStylePresetCatalogSearchPackIds({
  packSummaries,
  filters = {},
}: StylePresetCatalogSearchPackPlanInput) {
  const packId = filters.packId?.trim();
  if (packId) return packSummaries.some((pack) => pack.id === packId) ? [packId] : [];

  const needsGlobalSearch = Boolean(filters.query?.trim() || filters.task?.trim());
  if (needsGlobalSearch) return packSummaries.map((pack) => pack.id);

  const limit = filters.limit && filters.limit > 0 ? filters.limit : 80;
  const packIds: string[] = [];
  let plannedPresets = 0;
  for (const pack of packSummaries) {
    packIds.push(pack.id);
    plannedPresets += pack.presetCount;
    if (plannedPresets >= limit) break;
  }

  return packIds;
}
