export interface StyleRuntimePreset {
  id: string;
  name: string;
  displayName?: string;
  styleAnchors?: string[];
  category?: string;
  domain?: string;
  createdAt?: string | number;
  updatedAt?: string | number;
  negativePrompt?: string;
  style: StyleVisualDna;
  camera?: unknown;
  render?: unknown;
  type?: unknown;
  ui?: unknown;
  layout?: unknown;
  materials?: unknown;
  print?: unknown;
  digital?: unknown;
}

export interface StyleVisualDna {
  aesthetic: string;
  subject_treatment: string;
  color_and_tone: string;
  lighting_and_shadow: string;
  texture_and_material: string;
  camera_and_composition: string;
  atmosphere_and_mood: string;
  rendering_and_quality: string;
  creative_brief?: string;
  [key: string]: unknown;
}

export interface StyleRuntimePack {
  id: string;
  name: string;
  description: string;
  presets: StyleRuntimePreset[];
}

export function getStyleRuntimePresetDisplayName(
  preset: Pick<StyleRuntimePreset, 'name' | 'displayName'>,
) {
  return preset.displayName?.trim() || preset.name;
}

export function getStyleRuntimePresetSearchNames(
  preset: Pick<StyleRuntimePreset, 'name' | 'displayName' | 'styleAnchors'>,
) {
  const names = [
    getStyleRuntimePresetDisplayName(preset),
    preset.name,
    ...(preset.styleAnchors ?? []),
  ]
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set(names));
}
