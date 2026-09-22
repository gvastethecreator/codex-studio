import { FIELDS, type Snapshot, type Policy, type Layer } from './types.js';
import { createLayer } from './composition.js';
import { validateSnapshot, validateLayer } from './validation.js';
/** Structurally compatible with the current UI types; no React/provider dependency. */
export interface LegacyPreset {
  id: string;
  name: string;
  displayName?: string;
  style: Record<string, unknown>;
}
export const LEGACY_FIELD_IDS = {
  aesthetic: 'aesthetic',
  subject_treatment: 'subjectTreatment',
  color_and_tone: 'colorTone',
  lighting_and_shadow: 'lightingShadow',
  texture_and_material: 'textureMaterial',
  camera_and_composition: 'cameraComposition',
  atmosphere_and_mood: 'atmosphereMood',
  rendering_and_quality: 'renderingQuality',
} as const;
export interface LegacySlot {
  preset: LegacyPreset;
  packId: string;
  packName: string;
  strength: number;
  enabled?: boolean;
  fieldControls?: Partial<
    Record<
      (typeof LEGACY_FIELD_IDS)[(typeof FIELDS)[number]],
      Partial<{ enabled: boolean; weight: number }>
    >
  >;
  avoidRulesMode?: 'merge' | 'ignore' | 'strict';
}
export function snapshotFromRuntime(
  preset: LegacyPreset,
  packId: string,
  version: number,
  policy: Policy,
): Snapshot {
  const dna = Object.fromEntries(FIELDS.map((f) => [f, preset.style[f]]));
  const candidate = {
    presetId: preset.id,
    packId,
    version,
    name: preset.displayName?.trim() || preset.name,
    dna,
    policy,
  };
  validateSnapshot(candidate);
  return candidate;
}
/** Preserve existing user masks only when explicitly requested; new selections use reviewed default masks. */
export async function layerFromLegacySlot(
  slot: LegacySlot,
  policy: Policy,
  version: number,
  layerId: string,
  restoreExistingControls = false,
): Promise<Layer> {
  const layer = await createLayer(
    snapshotFromRuntime(slot.preset, slot.packId, version, policy),
    layerId,
  );
  layer.strength = slot.strength;
  layer.enabled = slot.enabled ?? true;
  layer.avoidRulesMode = slot.avoidRulesMode ?? 'merge';
  if (restoreExistingControls)
    for (const field of FIELDS) {
      const old = slot.fieldControls?.[LEGACY_FIELD_IDS[field]];
      if (!old) continue;
      layer.fields[field] = {
        enabled: old.enabled ?? layer.fields[field].enabled,
        weight: old.weight ?? layer.fields[field].weight,
      };
    }
  validateLayer(layer);
  return layer;
}
