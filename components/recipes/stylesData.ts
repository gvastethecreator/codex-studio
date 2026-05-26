import {
  GENERATED_STYLE_PACK_SUMMARIES,
  loadGeneratedStylePack,
  loadGeneratedStylePacks,
} from './styleRuntimeData.generated';
import type { StyleRuntimePack, StyleRuntimePreset } from './styles/types';

export const STYLE_PACK_SUMMARIES = GENERATED_STYLE_PACK_SUMMARIES;

export const loadStylePack = loadGeneratedStylePack;
export const loadStylePacks = loadGeneratedStylePacks;

export async function loadStylePresetIndex(): Promise<{
  packs: StyleRuntimePack[];
  presetById: Map<string, StyleRuntimePreset>;
  presetPackIdById: Map<string, string>;
}> {
  const packs = await loadStylePacks();
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

export * from './styles/types';
export * from './stylePresetManifests';
