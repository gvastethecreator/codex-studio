import type {
  CreateUserStylePresetInput,
  UserStylePreset,
  UserStylePresetDraft,
  UserStylePresetSource,
  UserStyleVisualDna,
  UserStyleVisualDnaKey,
} from '../../packages/shared/src';
import {
  describeStyleValue,
  formatStyleStrength,
  joinSelectedStyleCreativeBrief,
  mergeSelectedStyleNegativePrompts,
  type SelectedStyleLayer,
  type SelectedStyleSlot,
  type StyleLayerFieldId,
} from './styleLayerComposer';
import { getStyleRuntimePresetDisplayName, type StyleRuntimePreset } from './styles/runtimeTypes';

export const USER_STYLE_DNA_FIELDS: Array<{
  key: UserStyleVisualDnaKey;
  fieldId: StyleLayerFieldId;
  label: string;
}> = [
  { key: 'aesthetic', fieldId: 'aesthetic', label: 'Aesthetic' },
  { key: 'subject_treatment', fieldId: 'subjectTreatment', label: 'Subject' },
  { key: 'color_and_tone', fieldId: 'colorTone', label: 'Color' },
  { key: 'lighting_and_shadow', fieldId: 'lightingShadow', label: 'Lighting' },
  { key: 'texture_and_material', fieldId: 'textureMaterial', label: 'Texture' },
  { key: 'camera_and_composition', fieldId: 'cameraComposition', label: 'Camera' },
  { key: 'atmosphere_and_mood', fieldId: 'atmosphereMood', label: 'Mood' },
  { key: 'rendering_and_quality', fieldId: 'renderingQuality', label: 'Quality' },
];

const DEFAULT_SUPPORTED_TASKS = ['image_generate', 'image_edit', 'style_preset_card'] as const;
const DEFAULT_AVOID_RULES = ['watermark', 'readable text', 'logo', 'signature'];

const DEFAULT_VISUAL_DNA: Record<UserStyleVisualDnaKey, string> = {
  aesthetic: 'Reusable custom art direction with a clear visual thesis.',
  subject_treatment:
    'Transferable subject treatment that adapts across characters, objects, and scenes.',
  color_and_tone: 'Controlled palette logic with readable values and intentional accents.',
  lighting_and_shadow: 'Purposeful lighting, legible shadows, and restrained highlights.',
  texture_and_material: 'Consistent material response and surface texture.',
  camera_and_composition: 'Stable composition with clear focal hierarchy and flexible framing.',
  atmosphere_and_mood: 'Consistent mood without locking the style to one fixed story beat.',
  rendering_and_quality:
    'Polished finish with clean edges, intentional detail density, and no artifacts.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, fallback = '') {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized || fallback;
}

function limitText(value: string, maxLength = 860) {
  const clean = cleanText(value);
  return clean.length > maxLength ? clean.slice(0, maxLength).trim() : clean;
}

function uniqueList(values: string[]) {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const value of values) {
    const clean = cleanText(value);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(clean);
  }
  return unique;
}

function splitList(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) return uniqueList(value);
  return uniqueList((value ?? '').split(/[,;\n]/g));
}

function readPresetTags(preset: StyleRuntimePreset) {
  const ui = preset.ui;
  if (!isRecord(ui) || !Array.isArray(ui.tags)) return [];
  return uniqueList(ui.tags.flatMap((tag) => (typeof tag === 'string' ? [tag] : [])));
}

function readPresetDna(preset: StyleRuntimePreset, key: UserStyleVisualDnaKey, fallback: string) {
  return limitText(describeStyleValue(preset.style[key], fallback));
}

export function createUserStyleVisualDna(
  value: Partial<UserStyleVisualDna> = {},
): UserStyleVisualDna {
  const visualDna = USER_STYLE_DNA_FIELDS.reduce((acc, field) => {
    acc[field.key] = limitText(cleanText(value[field.key], DEFAULT_VISUAL_DNA[field.key]));
    return acc;
  }, {} as UserStyleVisualDna);

  const creativeBrief = cleanText(value.creative_brief);
  if (creativeBrief) visualDna.creative_brief = limitText(creativeBrief);

  return visualDna;
}

export function createEmptyUserStyleDraft(): UserStylePresetDraft {
  return {
    name: 'Custom Style',
    category: 'Custom Styles',
    tags: ['custom-style'],
    supportedTasks: [...DEFAULT_SUPPORTED_TASKS],
    visualDna: createUserStyleVisualDna({
      creative_brief: 'Reusable custom style system.',
    }),
    avoidRules: DEFAULT_AVOID_RULES,
    warnings: [],
  };
}

export function createUserStyleDraftFromRuntimePreset(
  preset: StyleRuntimePreset,
  packId: string,
  packName: string,
): UserStylePresetDraft {
  const presetName = getStyleRuntimePresetDisplayName(preset);
  return {
    name: `${presetName} Remix`,
    category: preset.category || packName || 'Custom Styles',
    tags: uniqueList(['clone', packId, packName, ...readPresetTags(preset)]),
    supportedTasks: [...DEFAULT_SUPPORTED_TASKS],
    visualDna: createUserStyleVisualDna({
      aesthetic: readPresetDna(preset, 'aesthetic', `${presetName} visual language.`),
      subject_treatment: readPresetDna(
        preset,
        'subject_treatment',
        'Transfer the subject treatment across varied image subjects.',
      ),
      color_and_tone: readPresetDna(preset, 'color_and_tone', DEFAULT_VISUAL_DNA.color_and_tone),
      lighting_and_shadow: readPresetDna(
        preset,
        'lighting_and_shadow',
        DEFAULT_VISUAL_DNA.lighting_and_shadow,
      ),
      texture_and_material: readPresetDna(
        preset,
        'texture_and_material',
        DEFAULT_VISUAL_DNA.texture_and_material,
      ),
      camera_and_composition: readPresetDna(
        preset,
        'camera_and_composition',
        DEFAULT_VISUAL_DNA.camera_and_composition,
      ),
      atmosphere_and_mood: readPresetDna(
        preset,
        'atmosphere_and_mood',
        DEFAULT_VISUAL_DNA.atmosphere_and_mood,
      ),
      rendering_and_quality: readPresetDna(
        preset,
        'rendering_and_quality',
        DEFAULT_VISUAL_DNA.rendering_and_quality,
      ),
      creative_brief: describeStyleValue(
        preset.style.creative_brief,
        `Reusable custom version of ${presetName}.`,
      ),
    }),
    avoidRules: splitList(preset.negativePrompt),
    warnings: [],
  };
}

export function createUserStyleDraftFromBlend(
  slots: SelectedStyleSlot[],
  layers: SelectedStyleLayer[],
): UserStylePresetDraft {
  const activeLayers = layers.filter((layer) => layer.enabled);
  const activeSlots = slots.filter((slot) => slot.enabled ?? true);
  const names = activeLayers.map((layer) => layer.presetName);
  const displayNames = names.slice(0, 2).join(' + ');
  const extraCount = Math.max(0, names.length - 2);
  const name =
    displayNames.length > 0
      ? `Blend: ${displayNames}${extraCount > 0 ? ` + ${extraCount}` : ''}`
      : 'Saved Style Blend';

  const visualDna = USER_STYLE_DNA_FIELDS.reduce((acc, field) => {
    const fieldValue = activeLayers
      .flatMap((layer) => {
        const layerField = layer.fields[field.fieldId];
        if (!layerField.enabled) return [];
        const value = cleanText(layerField.value);
        if (!value) return [];
        return [`${layer.presetName} ${formatStyleStrength(layer.strength)}: ${value}`];
      })
      .join(' | ');
    acc[field.key] = limitText(fieldValue || DEFAULT_VISUAL_DNA[field.key]);
    return acc;
  }, {} as UserStyleVisualDna);

  visualDna.creative_brief = limitText(
    joinSelectedStyleCreativeBrief(activeSlots) ||
      `Reusable blend built from ${names.join(', ') || 'selected style layers'}.`,
  );

  return {
    name,
    category: activeLayers[0]?.category || 'Saved Blends',
    tags: uniqueList([
      'blend',
      ...activeLayers.map((layer) => layer.packName),
      ...activeLayers.map((layer) => layer.category),
    ]),
    supportedTasks: [...DEFAULT_SUPPORTED_TASKS],
    visualDna,
    avoidRules: splitList(mergeSelectedStyleNegativePrompts({ slots: activeSlots })),
    warnings: [],
  };
}

export function createUserStyleDraftFromUserStyle(style: UserStylePreset): UserStylePresetDraft {
  return {
    name: style.name,
    category: style.category,
    tags: style.tags,
    supportedTasks: style.supportedTasks,
    visualDna: createUserStyleVisualDna(style.visualDna),
    avoidRules: style.avoidRules,
    warnings: [],
  };
}

export function createUserStyleInputFromDraft(
  draft: UserStylePresetDraft,
  source: UserStylePresetSource | null,
): CreateUserStylePresetInput {
  return {
    name: draft.name,
    category: draft.category,
    tags: draft.tags,
    supportedTasks: draft.supportedTasks,
    visualDna: createUserStyleVisualDna(draft.visualDna),
    avoidRules: draft.avoidRules,
    source,
  };
}

export function createUserStyleInputFromRuntimePreset(
  preset: StyleRuntimePreset,
  packId: string,
  packName: string,
): CreateUserStylePresetInput {
  const presetName = getStyleRuntimePresetDisplayName(preset);
  return createUserStyleInputFromDraft(
    createUserStyleDraftFromRuntimePreset(preset, packId, packName),
    {
      kind: 'clone',
      presetId: preset.id,
      packId,
      note: `Cloned from ${packName}.`,
      data: { presetName, packName },
    },
  );
}

export function createUserStyleInputFromBlend(
  slots: SelectedStyleSlot[],
  layers: SelectedStyleLayer[],
): CreateUserStylePresetInput {
  return createUserStyleInputFromDraft(createUserStyleDraftFromBlend(slots, layers), {
    kind: 'blend',
    note: 'Saved from selected style slots.',
    data: {
      styles: layers
        .filter((layer) => layer.enabled)
        .map((layer) => ({
          presetId: layer.presetId,
          presetName: layer.presetName,
          packId: layer.packId,
          packName: layer.packName,
          strength: layer.strength,
        })),
    },
  });
}
