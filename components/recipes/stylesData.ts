import {
  GENERATED_STYLE_RUNTIME_PACK_SUMMARIES,
  loadGeneratedStyleRuntimePack,
  loadGeneratedStyleRuntimePacks,
} from './styleRuntimeData.generated';
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

function normalizeStyleRuntimePreset(preset: StyleRuntimePreset): StyleRuntimePreset {
  const normalizedStyle = Object.fromEntries(
    STYLE_VISUAL_DNA_KEYS.map((key) => [key, preset.style[key]]),
  ) as StyleRuntimePreset['style'];

  return {
    ...preset,
    style: normalizedStyle,
  };
}

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
  const [{ loadStylePresetCatalog }, { composeStyleRuntimePacksFromManifests }] = await Promise.all(
    [import('./stylePresetCatalogData'), import('./stylePresetManifests')],
  );
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
