import type {
  StylePack,
  StylePackManifest,
  StylePresetDef,
  StylePresetManifest,
} from './styles/types';

export interface StyleManifestGraphValidation {
  valid: boolean;
  errors: string[];
}

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

function parseAvoidRules(negativePrompt?: string) {
  if (!negativePrompt) return [];
  return negativePrompt
    .split(',')
    .map((rule) => rule.trim())
    .filter(Boolean);
}

function toPresetRef(packId: string, presetId: string) {
  return `${packId}/${presetId}.yaml`;
}

function createAttributes(preset: StylePresetDef) {
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

export function createStylePresetManifests(packs: StylePack[]): StylePresetManifest[] {
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
        tags: [slugify(pack.name), slugify(category), preset.domain ? slugify(preset.domain) : null]
          .filter((tag): tag is string => Boolean(tag)),
        visualDna: preset.style,
        avoidRules: parseAvoidRules(preset.negativePrompt),
        assets: {
          defaultImage: `/assets/recipes/styles/defaults/${preset.id}.webp`,
        },
        ...(createAttributes(preset) ? { attributes: createAttributes(preset) } : {}),
      } satisfies StylePresetManifest;
    }),
  );
}

export function createStylePackManifests(packs: StylePack[]): StylePackManifest[] {
  return packs.map((pack) => {
    const refsByCategory = new Map<string, string[]>();

    for (const preset of pack.presets) {
      const category = normalizeCategory(preset.category);
      refsByCategory.set(category, [...(refsByCategory.get(category) ?? []), toPresetRef(pack.id, preset.id)]);
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
  const seenPresetIds = new Set<string>();

  for (const preset of presetManifests) {
    if (seenPresetIds.has(preset.id)) {
      errors.push(`Duplicate style preset manifest id: ${preset.id}`);
    }
    seenPresetIds.add(preset.id);
    presetsByRef.set(toPresetRef(preset.packId, preset.id), preset);
  }

  const referencedRefs = new Set<string>();
  for (const pack of packManifests) {
    for (const ref of pack.presetRefs) {
      referencedRefs.add(ref);
      const preset = presetsByRef.get(ref);
      if (!preset) {
        errors.push(`Missing style preset manifest for ${pack.id}: ${ref}`);
        continue;
      }
      if (preset.packId !== pack.id) {
        errors.push(`Preset ${preset.id} declares pack ${preset.packId} but is referenced by ${pack.id}`);
      }
    }

    const categoryRefs = pack.categories.flatMap((category) => category.presetRefs);
    for (const ref of pack.presetRefs) {
      if (!categoryRefs.includes(ref)) {
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

export function composeStylePacksFromManifests(
  packManifests: StylePackManifest[],
  presetManifests: StylePresetManifest[],
): StylePack[] {
  const presetsByRef = new Map(
    presetManifests.map((preset) => [toPresetRef(preset.packId, preset.id), preset]),
  );

  return packManifests.map((pack) => ({
    id: pack.id,
    name: pack.name,
    description: pack.description,
    presets: pack.presetRefs.flatMap((ref): StylePresetDef[] => {
      const preset = presetsByRef.get(ref);
      if (!preset) return [];

      return [
        {
          id: preset.id,
          name: preset.name,
          category: preset.category,
          ...(preset.domain ? { domain: preset.domain } : {}),
          ...(createNegativePrompt(preset) ? { negativePrompt: createNegativePrompt(preset) } : {}),
          style: preset.visualDna,
          ...(preset.attributes?.camera !== undefined ? { camera: preset.attributes.camera } : {}),
          ...(preset.attributes?.render !== undefined ? { render: preset.attributes.render } : {}),
          ...(preset.attributes?.type !== undefined ? { type: preset.attributes.type } : {}),
          ...(preset.attributes?.ui !== undefined ? { ui: preset.attributes.ui } : {}),
          ...(preset.attributes?.layout !== undefined ? { layout: preset.attributes.layout } : {}),
          ...(preset.attributes?.materials !== undefined ? { materials: preset.attributes.materials } : {}),
          ...(preset.attributes?.print !== undefined ? { print: preset.attributes.print } : {}),
          ...(preset.attributes?.digital !== undefined ? { digital: preset.attributes.digital } : {}),
        },
      ];
    }),
  }));
}
