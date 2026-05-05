
export interface StylePresetDef {
  id: string;
  name: string;
  category?: string; // New grouping field
  domain?: string;
  negativePrompt?: string; // Explicit negative prompts for this specific style
  style: {
    aesthetic: string;
    subject_treatment: string;
    color_and_tone: string;
    lighting_and_shadow: string;
    texture_and_material: string;
    camera_and_composition: string;
    atmosphere_and_mood: string;
    rendering_and_quality: string;
    [key: string]: unknown;
  };
  camera?: unknown;
  render?: unknown;
  type?: unknown;
  ui?: unknown;
  layout?: unknown;
  materials?: unknown;
  print?: unknown;
  digital?: unknown;
}

export interface StylePack {
  id: string;
  name: string;
  description: string;
  presets: StylePresetDef[];
}
