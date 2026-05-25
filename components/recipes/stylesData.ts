import { GENERATED_STYLE_PACKS } from './styleRuntimeData.generated';
import type { StylePack, StylePresetDef } from './styles/types';

export const STYLE_PACKS: StylePack[] = GENERATED_STYLE_PACKS;

export const STYLE_PRESET_BY_ID = new Map<string, StylePresetDef>(
  STYLE_PACKS.flatMap((pack) => pack.presets.map((preset) => [preset.id, preset])),
);

export const STYLE_PRESET_PACK_ID_BY_ID = new Map<string, string>(
  STYLE_PACKS.flatMap((pack) => pack.presets.map((preset) => [preset.id, pack.id])),
);

export * from './styles/types';
export * from './stylePresetManifests';
