import {
  getStyleRuntimePresetDisplayName,
  getStyleRuntimePresetSearchNames,
  type StyleRuntimePreset,
} from './styles/runtimeTypes';

export const DEFAULT_SELECTED_STYLE_STRENGTH = 0.75;
export const DEFAULT_STYLE_DIVERSITY_HINT =
  'Respect the requested content, palette, lighting and framing. Do not introduce unrequested variation.';

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
export type StyleReferenceMode = 'preserve' | 'reinterpret';

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
  presetSourceName: string;
  styleAnchors: string[];
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

export interface SelectedStylesGenerationPlan {
  fallbackPrompt: string;
  negativePrompt: string;
  recipeParams: Record<string, unknown>;
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

export function getStyleNegativePrompt(preset: StyleRuntimePreset, _packId: string) {
  // Pack membership is navigation metadata, not permission to ban other media.
  return preset.negativePrompt || '';
}

function readPresetStyleValue(preset: StyleRuntimePreset, sourceKeys: readonly string[]) {
  for (const key of sourceKeys) {
    const described = describeStyleValue(preset.style[key], '');
    if (described) return described;
  }
  return '';
}

function applyFieldWeightToValue(value: string, weight: number) {
  const cleanValue = value.trim();
  if (!cleanValue) return '';
  if (clampStyleLayerFieldWeight(weight) >= 0.995) return cleanValue;
  return `${cleanValue} (field weight ${formatStyleLayerFieldWeight(weight)})`;
}

function formatStyleLayerPromptName(layer: Pick<SelectedStyleLayer, 'slot'>) {
  return `Style layer ${layer.slot}`;
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
    presetName: getStyleRuntimePresetDisplayName(preset),
    presetSourceName: preset.name,
    styleAnchors: getStyleRuntimePresetSearchNames(preset),
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
        ? [
            `${formatStyleLayerPromptName(layer)} (${formatStyleStrength(layer.strength)}): ${value}`,
          ]
        : [];
    })
    .join(' | ');
}

/** Legacy API retained, but briefs cannot override field masks or reintroduce sample scenes. */
export function joinSelectedStyleCreativeBrief(_slots: SelectedStyleSlot[]): string {
  return '';
}

export function createSelectedStylesPrompt(slots: SelectedStyleSlot[]) {
  const count = slots.map(createSelectedStyleLayer).filter(hasEffectiveFields).length;
  return `Apply ${count} selected visual style layer${count === 1 ? '' : 's'} to the requested subject.`;
}

export function createSelectedStyleEmphasis(slots: SelectedStyleSlot[], diversityHint: string) {
  const layers = slots.map(createSelectedStyleLayer).filter(hasEffectiveFields);
  return [
    `Blend ${layers.length} selected style layer${layers.length === 1 ? '' : 's'} using the active visual fields.`,
    'Influence and field weights are language-level priorities, not calibrated pixel percentages.',
    ...layers.map((layer) => {
      const activeFields = STYLE_LAYER_FIELD_DEFINITIONS.flatMap((field) => {
        const state = layer.fields[field.id];
        if (!state.enabled) return [];
        return [
          state.weight >= 0.995
            ? field.label
            : `${field.label} ${formatStyleLayerFieldWeight(state.weight)}`,
        ];
      });
      return `Slot ${layer.slot}: influence ${formatStyleStrength(layer.strength)}. Active fields: ${activeFields.join(', ')}.`;
    }),
    diversityHint,
  ]
    .filter(Boolean)
    .join('\n');
}

export function mergeSelectedStyleNegativePrompts({
  baseNegativePrompt,
  slots,
}: {
  baseNegativePrompt?: string | null;
  slots: SelectedStyleSlot[];
}) {
  const rules = new Map<
    string,
    {
      text: string;
      strict: boolean;
      order: number;
    }
  >();
  let nextOrder = 0;
  const addRules = (value: string | null | undefined, strict: boolean) => {
    value
      ?.split(',')
      .map((rule) => rule.trim())
      .filter(Boolean)
      .forEach((rule) => {
        const key = rule.toLocaleLowerCase();
        const existing = rules.get(key);
        if (existing) {
          if (strict) existing.strict = true;
          return;
        }
        rules.set(key, { text: rule, strict, order: nextOrder++ });
      });
  };
  addRules(baseNegativePrompt, false);
  slots.forEach((slot, index) => {
    if (!hasEffectiveFields(createSelectedStyleLayer(slot, index))) return;
    const mode = slot.avoidRulesMode ?? 'merge';
    if (mode !== 'ignore')
      addRules(getStyleNegativePrompt(slot.preset, slot.packId), mode === 'strict');
  });
  const groups: Array<{
    strict: boolean;
    rules: string[];
  }> = [];
  [...rules.values()]
    .sort((a, b) => a.order - b.order)
    .forEach((rule) => {
      const group = groups.at(-1);
      if (!group || group.strict !== rule.strict)
        groups.push({ strict: rule.strict, rules: [rule.text] });
      else group.rules.push(rule.text);
    });
  return groups
    .map((group) => `${group.strict ? 'strictly avoid: ' : ''}${group.rules.join(', ')}`)
    .join(', ');
}

export function createSelectedStylesGenerationPlan({
  slots,
  hasReferenceImages,
  baseNegativePrompt,
  diversityHint = DEFAULT_STYLE_DIVERSITY_HINT,
  referenceMode = 'preserve',
}: {
  slots: SelectedStyleSlot[];
  hasReferenceImages: boolean;
  baseNegativePrompt?: string | null;
  diversityHint?: string;
  referenceMode?: StyleReferenceMode;
}): SelectedStylesGenerationPlan | null {
  const preserveReference = hasReferenceImages && referenceMode === 'preserve';
  // A projection, never a mutation of the saved preset, user mask or historical draft.
  const effectiveSlots = preserveReference
    ? slots.map((slot) => ({
        ...slot,
        fieldControls: {
          ...slot.fieldControls,
          cameraComposition: { ...slot.fieldControls?.cameraComposition, enabled: false },
        },
      }))
    : slots;
  const layers = effectiveSlots.map(createSelectedStyleLayer).filter(hasEffectiveFields);
  if (!layers.length) return null;
  const roleInstruction = preserveReference
    ? 'Apply visual treatment to the supplied references. Preserve subject identity, pose, framing, camera and composition. The user prompt supplies requested changes; do not invent props, subjects or a setting.'
    : hasReferenceImages
      ? 'Reinterpret the supplied references only where the user requests changes. Retain subject identity and requested content. Do not introduce unrelated subjects, props or themes.'
      : 'The user prompt supplies subject, action, setting and requested text. Apply the selected visual fields to that content without substituting a sample scene.';
  const compositionRule = preserveReference
    ? 'Preserve the reference layout, pose and camera. The camera/composition style field is suppressed; use reinterpretation for structural changes.'
    : 'Respect explicit framing and composition in the user prompt. Otherwise compose the requested content using the enabled visual fields.';
  const negativePrompt = mergeSelectedStyleNegativePrompts({
    baseNegativePrompt,
    slots: effectiveSlots,
  });
  return {
    fallbackPrompt: createSelectedStylesPrompt(effectiveSlots),
    negativePrompt,
    recipeParams: {
      presetId: layers[0]?.presetId ?? '',
      presetName: layers.map((layer) => layer.presetName).join(' + '),
      selectedStyles: layers,
      mode: preserveReference
        ? 'PRESERVE_REFERENCE'
        : hasReferenceImages
          ? 'CREATIVE_REIMAGINING'
          : 'DIRECT_STYLE_SYNTHESIS',
      ...(hasReferenceImages ? { styleReferenceMode: referenceMode } : {}),
      roleInstruction,
      compositionRule,
      styleEmphasis: createSelectedStyleEmphasis(
        effectiveSlots,
        preserveReference ? DEFAULT_STYLE_DIVERSITY_HINT : diversityHint,
      ),
      aesthetic: joinSelectedStyleLayerValue(effectiveSlots, 'aesthetic'),
      subjectTreatment: joinSelectedStyleLayerValue(effectiveSlots, 'subjectTreatment'),
      colorTone: joinSelectedStyleLayerValue(effectiveSlots, 'colorTone'),
      lightingShadow: joinSelectedStyleLayerValue(effectiveSlots, 'lightingShadow'),
      textureMaterial: joinSelectedStyleLayerValue(effectiveSlots, 'textureMaterial'),
      cameraComposition: joinSelectedStyleLayerValue(effectiveSlots, 'cameraComposition'),
      atmosphereMood: joinSelectedStyleLayerValue(effectiveSlots, 'atmosphereMood'),
      renderingQuality: joinSelectedStyleLayerValue(effectiveSlots, 'renderingQuality'),
      creativeBrief: '',
      negativePrompt,
    },
  };
}

function hasEffectiveFields(layer: SelectedStyleLayer) {
  return (
    layer.enabled &&
    STYLE_LAYER_FIELD_DEFINITIONS.some((field) =>
      Boolean(getSelectedStyleLayerFieldValue(layer, field.id).trim()),
    )
  );
}
