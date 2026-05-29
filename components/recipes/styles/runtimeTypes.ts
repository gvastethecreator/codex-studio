export interface StyleRuntimePreset {
  id: string;
  name: string;
  category?: string;
  domain?: string;
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
