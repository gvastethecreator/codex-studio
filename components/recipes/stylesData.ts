import {
  GENERATED_STYLE_RUNTIME_PACK_SUMMARIES,
  loadGeneratedStyleRuntimePack,
  loadGeneratedStyleRuntimePacks,
} from './styleRuntimeData.generated';
import type { StyleRuntimePack, StyleRuntimePreset } from './styles/runtimeTypes';

export const STYLE_RUNTIME_PACK_SUMMARIES = GENERATED_STYLE_RUNTIME_PACK_SUMMARIES;

export const loadStyleRuntimePack = loadGeneratedStyleRuntimePack;
export const loadStyleRuntimePacks = loadGeneratedStyleRuntimePacks;

export async function loadStylePresetIndex(): Promise<{
  packs: StyleRuntimePack[];
  presetById: Map<string, StyleRuntimePreset>;
  presetPackIdById: Map<string, string>;
}> {
  const packs = await loadStyleRuntimePacks();
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
