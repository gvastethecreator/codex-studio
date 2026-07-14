import {
  GENERATED_STYLE_RUNTIME_PACK_SUMMARIES,
  loadGeneratedStyleRuntimePack,
} from './styleRuntimeData.generated';
import type { StyleRuntimePack, StyleRuntimePreset } from './styles/runtimeTypes';
import { loadStyleThumbnailPack } from '../../lib/styleThumbnailCatalog';

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

export function createStyleRuntimeRegistry({
  packIds,
  loadPack,
  loadThumbnail,
}: {
  packIds: readonly string[];
  loadPack: (packId: string) => Promise<StyleRuntimePack | null>;
  loadThumbnail: (packId: string) => Promise<unknown>;
}) {
  const values = new Map<string, StyleRuntimePack | null>();
  const pending = new Map<string, Promise<StyleRuntimePack | null>>();

  const loadRuntimePack = async (packId: string): Promise<StyleRuntimePack | null> => {
    if (values.has(packId)) return values.get(packId) ?? null;
    const inFlight = pending.get(packId);
    if (inFlight) return inFlight;

    const request = Promise.all([loadPack(packId), loadThumbnail(packId)])
      .then(([pack]) => {
        const normalized = pack ? normalizeStyleRuntimePack(pack) : null;
        values.set(packId, normalized);
        return normalized;
      })
      .finally(() => {
        if (pending.get(packId) === request) pending.delete(packId);
      });
    pending.set(packId, request);
    return request;
  };

  const loadRuntimePacks = async () => {
    const packs = await Promise.all(packIds.map(loadRuntimePack));
    return packs.filter((pack): pack is StyleRuntimePack => pack !== null);
  };

  return {
    loadRuntimePack,
    loadRuntimePacks,
  };
}

const styleRuntimeRegistry = createStyleRuntimeRegistry({
  packIds: STYLE_RUNTIME_PACK_SUMMARIES.map((pack) => pack.id),
  loadPack: loadGeneratedStyleRuntimePack,
  loadThumbnail: loadStyleThumbnailPack,
});

export const loadStyleRuntimePack = styleRuntimeRegistry.loadRuntimePack;
export const loadStyleRuntimePacks = styleRuntimeRegistry.loadRuntimePacks;

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
