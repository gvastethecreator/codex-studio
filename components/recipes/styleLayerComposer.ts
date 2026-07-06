import type { StyleRuntimePreset } from './styles/runtimeTypes';

export const DEFAULT_SELECTED_STYLE_STRENGTH = 0.75;

export const STYLE_LAYER_FIELD_DEFINITIONS = [
  {
    id: 'aesthetic',
    label: 'Aesthetic',
    paramKey: 'aesthetic',
    sourceKeys: ['aesthetic'],
  },
  {
    id: 'subjectTreatment',
    label: 'Subject',
    paramKey: 'subjectTreatment',
    sourceKeys: ['subject_treatment', 'form_and_line'],
  },
  {
    id: 'colorTone',
    label: 'Color',
    paramKey: 'colorTone',
    sourceKeys: ['color_and_tone', 'color_palette'],
  },
  {
    id: 'lightingShadow',
    label: 'Lighting',
    paramKey: 'lightingShadow',
    sourceKeys: ['lighting_and_shadow', 'lighting_setup'],
  },
  {
    id: 'textureMaterial',
    label: 'Texture',
    paramKey: 'textureMaterial',
    sourceKeys: ['texture_and_material', 'material_texture'],
  },
  {
    id: 'cameraComposition',
    label: 'Camera',
    paramKey: 'cameraComposition',
    sourceKeys: ['camera_and_composition', 'spatial_distortion'],
  },
  {
    id: 'atmosphereMood',
    label: 'Mood',
    paramKey: 'atmosphereMood',
    sourceKeys: ['atmosphere_and_mood', 'atmosphere'],
  },
  {
    id: 'renderingQuality',
    label: 'Quality',
    paramKey: 'renderingQuality',
    sourceKeys: ['rendering_and_quality', 'render_quality'],
  },
] as const;

export type StyleLayerFieldId = (typeof STYLE_LAYER_FIELD_DEFINITIONS)[number]['id'];
export type StyleLayerFieldParamKey = (typeof STYLE_LAYER_FIELD_DEFINITIONS)[number]['paramKey'];
export type StyleLayerAvoidRulesMode = 'merge' | 'ignore' | 'strict';

export interface StyleLayerFieldControl {
  enabled: boolean;
  weight: number;
}

export type StyleLayerFieldControls = Record<StyleLayerFieldId, StyleLayerFieldControl>;

export interface SelectedStyleSlot {
  preset: StyleRuntimePreset;
  packId: string;
  packName: string;
  strength: number;
  enabled?: boolean;
  fieldControls?: Partial<Record<StyleLayerFieldId, Partial<StyleLayerFieldControl>>>;
  avoidRulesMode?: StyleLayerAvoidRulesMode;
}

export interface SelectedStyleLayerField {
  id: StyleLayerFieldId;
  label: string;
  paramKey: StyleLayerFieldParamKey;
  value: string;
  enabled: boolean;
  weight: number;
}

export interface SelectedStyleLayer {
  slot: number;
  presetId: string;
  presetName: string;
  packId: string;
  packName: string;
  category: string;
  enabled: boolean;
  strength: number;
  avoidRulesMode: StyleLayerAvoidRulesMode;
  fields: Record<StyleLayerFieldId, SelectedStyleLayerField>;
  aesthetic: string;
  subjectTreatment: string;
  colorTone: string;
  lightingShadow: string;
  textureMaterial: string;
  cameraComposition: string;
  atmosphereMood: string;
  renderingQuality: string;
  creativeBrief: string;
}

export function describeStyleValue(value: unknown, fallback = 'Standard'): string {
  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return `${value}`;
  }

  if (Array.isArray(value)) {
    const flattened = value
      .flatMap((entry) => {
        const described = describeStyleValue(entry, '');
        return described ? [described] : [];
      })
      .join(', ');

    return flattened || fallback;
  }

  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

export function clampStyleStrength(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_SELECTED_STYLE_STRENGTH;
  return Math.max(0.1, Math.min(1, Number(value.toFixed(2))));
}

export function clampStyleLayerFieldWeight(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(0.1, Math.min(1, Number(value.toFixed(2))));
}

export function formatStyleStrength(value: number) {
  return clampStyleStrength(value).toFixed(2);
}

export function formatStyleLayerFieldWeight(value: number) {
  return clampStyleLayerFieldWeight(value).toFixed(2);
}

export function createDefaultStyleLayerFieldControls(): StyleLayerFieldControls {
  return STYLE_LAYER_FIELD_DEFINITIONS.reduce((controls, field) => {
    controls[field.id] = { enabled: true, weight: 1 };
    return controls;
  }, {} as StyleLayerFieldControls);
}

export function normalizeStyleLayerFieldControls(
  controls: SelectedStyleSlot['fieldControls'],
): StyleLayerFieldControls {
  const defaults = createDefaultStyleLayerFieldControls();

  for (const field of STYLE_LAYER_FIELD_DEFINITIONS) {
    const control = controls?.[field.id];
    if (!control) continue;
    defaults[field.id] = {
      enabled: control.enabled ?? defaults[field.id].enabled,
      weight:
        control.weight === undefined
          ? defaults[field.id].weight
          : clampStyleLayerFieldWeight(control.weight),
    };
  }

  return defaults;
}

export function getStyleNegativePrompt(preset: StyleRuntimePreset, packId: string) {
  const isPhotoPackFallback = ['pack_09', 'pack_10', 'pack_11'].includes(packId);
  return (
    preset.negativePrompt ||
    (isPhotoPackFallback
      ? 'illustration, drawing, painting, sketch, cartoon, anime, 2d, graphic, flat, vector, ink'
      : '')
  );
}

function readPresetStyleValue(preset: StyleRuntimePreset, sourceKeys: readonly string[]) {
  for (const key of sourceKeys) {
    const value = preset.style[key];
    const described = describeStyleValue(value, '');
    if (described) return described;
  }
  return 'Standard';
}

function applyFieldWeightToValue(value: string, weight: number) {
  const cleanValue = value.trim();
  if (!cleanValue) return '';
  if (clampStyleLayerFieldWeight(weight) >= 0.995) return cleanValue;
  return `${cleanValue} (field weight ${formatStyleLayerFieldWeight(weight)})`;
}

export function createSelectedStyleLayer(
  slot: SelectedStyleSlot,
  index: number,
): SelectedStyleLayer {
  const { preset } = slot;
  const fieldControls = normalizeStyleLayerFieldControls(slot.fieldControls);
  const enabled = slot.enabled ?? true;
  const fields = STYLE_LAYER_FIELD_DEFINITIONS.reduce(
    (acc, field) => {
      const control = fieldControls[field.id];
      const value = control.enabled
        ? applyFieldWeightToValue(readPresetStyleValue(preset, field.sourceKeys), control.weight)
        : '';
      acc[field.id] = {
        id: field.id,
        label: field.label,
        paramKey: field.paramKey,
        value,
        enabled: enabled && control.enabled,
        weight: control.weight,
      };
      return acc;
    },
    {} as Record<StyleLayerFieldId, SelectedStyleLayerField>,
  );

  return {
    slot: index + 1,
    presetId: preset.id,
    presetName: preset.name,
    packId: slot.packId,
    packName: slot.packName,
    category: preset.category || 'General',
    enabled,
    strength: clampStyleStrength(slot.strength),
    avoidRulesMode: slot.avoidRulesMode ?? 'merge',
    fields,
    aesthetic: fields.aesthetic.value,
    subjectTreatment: fields.subjectTreatment.value,
    colorTone: fields.colorTone.value,
    lightingShadow: fields.lightingShadow.value,
    textureMaterial: fields.textureMaterial.value,
    cameraComposition: fields.cameraComposition.value,
    atmosphereMood: fields.atmosphereMood.value,
    renderingQuality: fields.renderingQuality.value,
    creativeBrief: enabled ? String(preset.style.creative_brief ?? '').trim() : '',
  };
}

export function getSelectedStyleLayerFieldValue(
  layer: SelectedStyleLayer,
  fieldId: StyleLayerFieldId,
) {
  return layer.enabled && layer.fields[fieldId].enabled ? layer.fields[fieldId].value : '';
}

export function joinSelectedStyleLayerValue(
  slots: SelectedStyleSlot[],
  fieldId: StyleLayerFieldId,
) {
  return slots
    .flatMap((slot, index) => {
      const layer = createSelectedStyleLayer(slot, index);
      if (!layer.enabled) return [];
      const value = getSelectedStyleLayerFieldValue(layer, fieldId).trim();
      return value
        ? [`${layer.presetName} (${formatStyleStrength(layer.strength)}): ${value}`]
        : [];
    })
    .join(' | ');
}

export function joinSelectedStyleCreativeBrief(slots: SelectedStyleSlot[]) {
  return slots
    .flatMap((slot, index) => {
      const layer = createSelectedStyleLayer(slot, index);
      if (!layer.enabled) return [];
      const value = layer.creativeBrief.trim();
      return value
        ? [`${layer.presetName} (${formatStyleStrength(layer.strength)}): ${value}`]
        : [];
    })
    .join(' | ');
}

export function createSelectedStylesPrompt(slots: SelectedStyleSlot[]) {
  const names = slots
    .filter((slot) => slot.enabled ?? true)
    .map((slot) => slot.preset.name)
    .join(' + ');
  return `Apply selected style layers: ${names}`;
}

export function createSelectedStyleEmphasis(slots: SelectedStyleSlot[], diversityHint: string) {
  const layers = slots.map(createSelectedStyleLayer).filter((layer) => layer.enabled);
  return [
    `Blend ${layers.length} selected style layer${layers.length === 1 ? '' : 's'}; respect each layer strength as its visual influence.`,
    ...layers.map((layer) => {
      const activeFields = STYLE_LAYER_FIELD_DEFINITIONS.flatMap((field) => {
        const fieldState = layer.fields[field.id];
        if (!fieldState.enabled) return [];
        return fieldState.weight >= 0.995
          ? [field.label]
          : [`${field.label} ${formatStyleLayerFieldWeight(fieldState.weight)}`];
      });
      const fieldSummary = activeFields.length ? ` Active fields: ${activeFields.join(', ')}.` : '';
      return `Slot ${layer.slot}: ${layer.presetName} at ${formatStyleStrength(layer.strength)} strength.${fieldSummary}`;
    }),
    diversityHint,
  ].join('\n');
}

export function mergeSelectedStyleNegativePrompts({
  baseNegativePrompt,
  slots,
}: {
  baseNegativePrompt?: string | null;
  slots: SelectedStyleSlot[];
}) {
  return [
    baseNegativePrompt,
    ...slots.flatMap((slot) => {
      if (!(slot.enabled ?? true)) return [];
      if ((slot.avoidRulesMode ?? 'merge') === 'ignore') return [];
      const prompt = getStyleNegativePrompt(slot.preset, slot.packId).trim();
      if (!prompt) return [];
      return (slot.avoidRulesMode ?? 'merge') === 'strict'
        ? [`strictly avoid: ${prompt}`]
        : [prompt];
    }),
  ]
    .flatMap((value) => {
      const trimmed = value?.trim();
      return trimmed ? [trimmed] : [];
    })
    .join(', ');
}
