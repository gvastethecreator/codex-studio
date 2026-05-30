import {
  GENERATED_STYLE_RUNTIME_PACK_SUMMARIES,
  loadGeneratedStyleRuntimePack,
  loadGeneratedStyleRuntimePacks,
} from './styleRuntimeData.generated';
import { loadStylePresetCatalog } from './stylePresetCatalogData';
import { composeStyleRuntimePacksFromManifests } from './stylePresetManifests';
import type { StyleRuntimePack, StyleRuntimePreset } from './styles/runtimeTypes';

const STYLE_VISUAL_DNA_KEYS = [
  'aesthetic',
  'subject_treatment',
  'color_and_tone',
  'lighting_and_shadow',
  'texture_and_material',
  'camera_and_composition',
  'atmosphere_and_mood',
  'rendering_and_quality',
] as const;

interface StyleDefaultManifestEntry {
  presetId?: unknown;
  category?: unknown;
}

function normalizeStyleRuntimePreset(preset: StyleRuntimePreset): StyleRuntimePreset {
  const normalizedStyle = Object.fromEntries(
    STYLE_VISUAL_DNA_KEYS.map((key) => [key, preset.style[key]]),
  ) as StyleRuntimePreset['style'];

  const normalizedCategory = STYLE_DEFAULT_CATEGORY_BY_PRESET_ID.get(preset.id);

  return {
    ...preset,
    style: normalizedStyle,
    ...(normalizedCategory ? { category: normalizedCategory } : {}),
  };
}

type ImportMetaGlobFn = (
  pattern: string,
  options: { eager: true; import: 'default' },
) => Record<string, unknown>;

function safeImportMetaGlob(pattern: string): Record<string, unknown> {
  const glob = (import.meta as ImportMeta & { glob?: ImportMetaGlobFn }).glob;
  if (typeof glob === 'function') {
    return glob(pattern, {
      eager: true,
      import: 'default',
    });
  }
  return {};
}

const styleDefaultManifestFiles = safeImportMetaGlob(
  '../../assets/recipes/styles/defaults/manifest-pack_*.json',
);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function createStyleDefaultCategoryByPresetId() {
  const categoryByPresetId = new Map<string, string>();

  for (const manifestContent of Object.values(styleDefaultManifestFiles)) {
    if (!Array.isArray(manifestContent)) continue;

    for (const entry of manifestContent as StyleDefaultManifestEntry[]) {
      if (!isNonEmptyString(entry.presetId) || !isNonEmptyString(entry.category)) continue;
      categoryByPresetId.set(entry.presetId, entry.category);
    }
  }

  return categoryByPresetId;
}

const STYLE_DEFAULT_CATEGORY_BY_PRESET_ID = createStyleDefaultCategoryByPresetId();

function normalizeStyleRuntimePack(pack: StyleRuntimePack): StyleRuntimePack {
  return {
    ...pack,
    presets: pack.presets.map(normalizeStyleRuntimePreset),
  };
}

export const STYLE_RUNTIME_PACK_SUMMARIES = GENERATED_STYLE_RUNTIME_PACK_SUMMARIES;

export async function loadStyleRuntimePack(packId: string): Promise<StyleRuntimePack | null> {
  const pack = await loadGeneratedStyleRuntimePack(packId);
  return pack ? normalizeStyleRuntimePack(pack) : null;
}

export async function loadStyleRuntimePacks(): Promise<StyleRuntimePack[]> {
  const packs = await loadGeneratedStyleRuntimePacks();
  return packs.map(normalizeStyleRuntimePack);
}

export async function loadStylePresetIndex(): Promise<{
  packs: StyleRuntimePack[];
  presetById: Map<string, StyleRuntimePreset>;
  presetPackIdById: Map<string, string>;
}> {
  const catalog = await loadStylePresetCatalog();
  const packs = composeStyleRuntimePacksFromManifests(
    catalog.packManifests,
    catalog.presetManifests,
  );

  return {
    packs,
    presetById: new Map(
      packs.flatMap((pack) => pack.presets.map((preset) => [preset.id, preset] as const)),
    ),
    presetPackIdById: new Map(
      packs.flatMap((pack) => pack.presets.map((preset) => [preset.id, pack.id] as const)),
    ),
  };
}

export * from './styles/manifestTypes';
export * from './styles/runtimeTypes';
export * from './stylePresetManifests';
