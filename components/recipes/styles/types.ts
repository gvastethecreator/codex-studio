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

export type StylePresetManifestTask =
  | 'image_generate'
  | 'image_edit'
  | 'style_preset_card'
  | 'sprite_sheet'
  | 'texture_generate';

export interface StylePresetManifestAssets {
  defaultImage?: string;
  previewImage?: string;
  referenceImage?: string;
}

export interface StylePresetManifestAttributes {
  negativePrompt?: string;
  camera?: unknown;
  render?: unknown;
  type?: unknown;
  ui?: unknown;
  layout?: unknown;
  materials?: unknown;
  print?: unknown;
  digital?: unknown;
  [key: string]: unknown;
}

export interface StylePresetEditorialTaxonomy {
  packId: string;
  packName: string;
  categoryId: string;
  categoryName: string;
  domain?: string;
  tags: string[];
  supportedTasks: StylePresetManifestTask[];
  hasDefaultImage: boolean;
}

export interface StylePresetManifest {
  schemaVersion: 1;
  id: string;
  packId: string;
  name: string;
  category: string;
  domain?: string;
  version: number;
  supportedTasks: StylePresetManifestTask[];
  tags: string[];
  visualDna: StylePresetDef['style'];
  avoidRules: string[];
  assets: StylePresetManifestAssets;
  taxonomy?: Partial<StylePresetEditorialTaxonomy>;
  attributes?: StylePresetManifestAttributes;
}

export interface StylePackManifestCategory {
  id: string;
  name: string;
  presetRefs: string[];
}

export interface StylePackManifest {
  schemaVersion: 1;
  id: string;
  name: string;
  description: string;
  categories: StylePackManifestCategory[];
  presetRefs: string[];
}
