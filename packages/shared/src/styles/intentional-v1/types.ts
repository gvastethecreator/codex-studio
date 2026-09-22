/** Domain-only contracts. No provider credentials, filesystem paths, prompt or attachments in saved compositions. */
export const FIELDS = [
  'aesthetic',
  'subject_treatment',
  'color_and_tone',
  'lighting_and_shadow',
  'texture_and_material',
  'camera_and_composition',
  'atmosphere_and_mood',
  'rendering_and_quality',
] as const;
export type FieldId = (typeof FIELDS)[number];
export type Dna = Record<FieldId, string>;
export type Kind = 'full_style' | 'modifier' | 'representation_profile' | 'thematic_direction';
export type Permission =
  | 'structure'
  | 'wardrobe'
  | 'design'
  | 'environment'
  | 'materialTarget'
  | 'accent';
export type Mode = 'generate' | 'preserve' | 'reinterpret';
export interface FieldControl {
  enabled: boolean;
  weight: number;
}
export interface AvoidRule {
  text: string;
  field: FieldId | 'global';
}
export interface Constraint {
  field: FieldId;
  group: string;
  value: string;
}
export interface Policy {
  schemaVersion: 1;
  kind: Kind;
  defaultFields: FieldId[];
  requires: Permission | null;
  medium: string;
  constraints: Constraint[];
  avoidRules: AvoidRule[];
}
export interface Snapshot {
  presetId: string;
  packId: string;
  version: number;
  name: string;
  dna: Dna;
  policy: Policy;
}
export interface Layer {
  layerId: string;
  snapshot: Snapshot;
  snapshotHash: string;
  enabled: boolean;
  strength: number;
  fields: Record<FieldId, FieldControl>;
  avoidRulesMode: 'merge' | 'strict' | 'ignore';
}
export interface Locks {
  identity: boolean;
  pose: boolean;
  camera: boolean;
  composition: boolean;
}
export interface Variation {
  enabled: boolean;
  instruction: string;
}
export interface Composition {
  schemaVersion: 1;
  id: string;
  name: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  mode: Mode;
  locks: Locks;
  variation: Variation;
  layers: Layer[];
}
export interface Reference {
  id: string;
  role: 'subject' | 'style' | 'composition' | 'avoid';
  contentHash: string;
}
export interface Permissions {
  structure: boolean;
  wardrobe: boolean;
  design: boolean;
  environment: boolean;
  materialTarget: string;
  accent: string;
}
export interface RequestInput {
  prompt: string;
  layers: Layer[];
  mode: Mode;
  locks: Locks;
  variation: Variation;
  permissions: Permissions;
  references: Reference[];
  baseAvoidRules: string[];
}
export interface Issue {
  severity: 'warning' | 'error';
  code: string;
  message: string;
  layerIds: string[];
}
export interface AppliedField {
  layerId: string;
  field: FieldId;
  text: string;
  strength: number;
  weight: number;
}
export interface EffectiveAvoidRule {
  text: string;
  strict: boolean;
  layerIds: string[];
}
export interface CompiledRequest {
  compilerVersion: string;
  effectivePrompt: string;
  appliedFields: AppliedField[];
  avoidRules: EffectiveAvoidRule[];
  issues: Issue[];
  styleRequestHash: string;
  referencePlan: Reference[];
}
export const NO_PERMISSIONS: Permissions = {
  structure: false,
  wardrobe: false,
  design: false,
  environment: false,
  materialTarget: '',
  accent: '',
};
export const PRESERVE_LOCKS: Locks = {
  identity: true,
  pose: true,
  camera: true,
  composition: true,
};
export const FREE_LAYOUT_LOCKS: Locks = {
  identity: true,
  pose: false,
  camera: false,
  composition: false,
};
export const NO_VARIATION: Variation = { enabled: false, instruction: '' };
export const CORE_VERSION = 'intentional-styles/1.0.0';
