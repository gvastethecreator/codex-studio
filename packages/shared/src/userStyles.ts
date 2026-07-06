import type { GenerationTaskKind } from './generationContracts';

export const USER_STYLE_PRESET_SCHEMA_VERSION = 'user-style-preset/v1' as const;

export const USER_STYLE_VISUAL_DNA_KEYS = [
  'aesthetic',
  'subject_treatment',
  'color_and_tone',
  'lighting_and_shadow',
  'texture_and_material',
  'camera_and_composition',
  'atmosphere_and_mood',
  'rendering_and_quality',
] as const;

export const USER_STYLE_SUPPORTED_TASKS = [
  'image_generate',
  'image_edit',
  'style_preset_card',
  'sprite_sheet',
  'texture_generate',
] as const satisfies readonly GenerationTaskKind[];

export type UserStylePresetTask = (typeof USER_STYLE_SUPPORTED_TASKS)[number];
export type UserStyleVisualDnaKey = (typeof USER_STYLE_VISUAL_DNA_KEYS)[number];

export type UserStyleVisualDna = Record<UserStyleVisualDnaKey, string> & {
  creative_brief?: string;
  [key: string]: unknown;
};

export interface UserStylePresetAssets {
  defaultImage?: string;
  previewImage?: string;
  referenceImage?: string;
  [key: string]: unknown;
}

export interface UserStylePresetSource {
  kind: 'manual' | 'blend' | 'clone' | 'codex_assist';
  presetId?: string;
  packId?: string;
  note?: string;
  data?: unknown;
}

export interface UserStylePreset {
  schemaVersion: typeof USER_STYLE_PRESET_SCHEMA_VERSION;
  id: string;
  name: string;
  category: string;
  domain: string | null;
  tags: string[];
  supportedTasks: UserStylePresetTask[];
  visualDna: UserStyleVisualDna;
  avoidRules: string[];
  attributes: Record<string, unknown>;
  assets: UserStylePresetAssets;
  source: UserStylePresetSource | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserStylePresetInput {
  name: string;
  category?: string;
  domain?: string | null;
  tags?: string[];
  supportedTasks?: UserStylePresetTask[];
  visualDna: UserStyleVisualDna;
  avoidRules?: string[];
  attributes?: Record<string, unknown>;
  assets?: UserStylePresetAssets;
  source?: UserStylePresetSource | null;
}

export interface UpdateUserStylePresetInput {
  name?: string;
  category?: string;
  domain?: string | null;
  tags?: string[];
  supportedTasks?: UserStylePresetTask[];
  visualDna?: Partial<UserStyleVisualDna>;
  avoidRules?: string[];
  attributes?: Record<string, unknown>;
  assets?: UserStylePresetAssets;
  source?: UserStylePresetSource | null;
  isArchived?: boolean;
}

export interface UserStylePresetDraft {
  name: string;
  category: string;
  tags: string[];
  supportedTasks: UserStylePresetTask[];
  visualDna: UserStyleVisualDna;
  avoidRules: string[];
  warnings: string[];
}

export type UserStyleDraftAction =
  | 'draft_from_description'
  | 'improve_draft'
  | 'make_transferable'
  | 'create_variants'
  | 'audit_style_quality';

export interface CodexStyleDraftRequest {
  action: UserStyleDraftAction;
  description?: string;
  currentPrompt?: string;
  draft?: Partial<UserStylePresetDraft>;
  selectedStyleLayers?: unknown[];
}

export interface CodexStyleDraftResponse {
  draft: UserStylePresetDraft;
  warnings: string[];
  source: 'codex' | 'local_fallback';
}

export interface UserStyleValidationResult<T> {
  ok: boolean;
  value: T | null;
  issues: string[];
}

const DEFAULT_STYLE_TASKS: UserStylePresetTask[] = [
  'image_generate',
  'image_edit',
  'style_preset_card',
];

const MAX_TEXT_LENGTH = 900;
const MAX_NAME_LENGTH = 96;
const MAX_CATEGORY_LENGTH = 80;
const MAX_LIST_ITEMS = 32;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function cleanStringList(value: unknown, maxItems = MAX_LIST_ITEMS) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const item of value) {
    const text = cleanString(item, 120);
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(text);
    if (cleaned.length >= maxItems) break;
  }
  return cleaned;
}

function cleanTaskList(value: unknown) {
  if (!Array.isArray(value)) return DEFAULT_STYLE_TASKS;
  const allowed = new Set<UserStylePresetTask>(USER_STYLE_SUPPORTED_TASKS);
  const tasks = value.filter((task): task is UserStylePresetTask => allowed.has(task));
  const unique = tasks.filter((task, index) => tasks.indexOf(task) === index);
  return unique.length > 0 ? unique : DEFAULT_STYLE_TASKS;
}

function cleanRecord(value: unknown) {
  if (!isRecord(value)) return {};
  return value;
}

function cleanSource(value: unknown): UserStylePresetSource | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) return null;
  const kind =
    value.kind === 'manual' ||
    value.kind === 'blend' ||
    value.kind === 'clone' ||
    value.kind === 'codex_assist'
      ? value.kind
      : 'manual';

  return {
    kind,
    ...(cleanString(value.presetId, 120) ? { presetId: cleanString(value.presetId, 120)! } : {}),
    ...(cleanString(value.packId, 120) ? { packId: cleanString(value.packId, 120)! } : {}),
    ...(cleanString(value.note, 240) ? { note: cleanString(value.note, 240)! } : {}),
    ...('data' in value ? { data: value.data } : {}),
  };
}

function cleanVisualDna(value: unknown, issues: string[], partial = false) {
  if (!isRecord(value)) {
    issues.push('visualDna must be an object.');
    return null;
  }

  const visualDna: Partial<UserStyleVisualDna> = {};
  for (const key of USER_STYLE_VISUAL_DNA_KEYS) {
    const text = cleanString(value[key]);
    if (!text) {
      if (!partial) issues.push(`visualDna.${key} is required.`);
      continue;
    }
    visualDna[key] = text;
  }

  const creativeBrief = cleanString(value.creative_brief);
  if (creativeBrief) visualDna.creative_brief = creativeBrief;

  if (!partial && USER_STYLE_VISUAL_DNA_KEYS.some((key) => !visualDna[key])) {
    return null;
  }

  return visualDna as UserStyleVisualDna;
}

export function sanitizeCreateUserStylePresetInput(
  value: unknown,
): UserStyleValidationResult<CreateUserStylePresetInput> {
  const issues: string[] = [];
  if (!isRecord(value)) {
    return {
      ok: false,
      value: null,
      issues: ['User style payload must be an object.'],
    };
  }

  const name = cleanString(value.name, MAX_NAME_LENGTH);
  if (!name) issues.push('name is required.');

  const visualDna = cleanVisualDna(value.visualDna, issues);

  if (!name || !visualDna) {
    return { ok: false, value: null, issues };
  }

  return {
    ok: true,
    value: {
      name,
      category: cleanString(value.category, MAX_CATEGORY_LENGTH) ?? 'Custom Styles',
      domain: cleanString(value.domain, 80),
      tags: cleanStringList(value.tags),
      supportedTasks: cleanTaskList(value.supportedTasks),
      visualDna,
      avoidRules: cleanStringList(value.avoidRules),
      attributes: cleanRecord(value.attributes),
      assets: cleanRecord(value.assets) as UserStylePresetAssets,
      source: cleanSource(value.source),
    },
    issues,
  };
}

export function sanitizeUpdateUserStylePresetInput(
  value: unknown,
): UserStyleValidationResult<UpdateUserStylePresetInput> {
  const issues: string[] = [];
  if (!isRecord(value)) {
    return {
      ok: false,
      value: null,
      issues: ['User style patch must be an object.'],
    };
  }

  const patch: UpdateUserStylePresetInput = {};

  if ('name' in value) {
    const name = cleanString(value.name, MAX_NAME_LENGTH);
    if (!name) issues.push('name cannot be empty.');
    else patch.name = name;
  }
  if ('category' in value) {
    patch.category = cleanString(value.category, MAX_CATEGORY_LENGTH) ?? 'Custom Styles';
  }
  if ('domain' in value) patch.domain = cleanString(value.domain, 80);
  if ('tags' in value) patch.tags = cleanStringList(value.tags);
  if ('supportedTasks' in value) patch.supportedTasks = cleanTaskList(value.supportedTasks);
  if ('visualDna' in value) {
    const visualDna = cleanVisualDna(value.visualDna, issues, true);
    if (visualDna) patch.visualDna = visualDna;
  }
  if ('avoidRules' in value) patch.avoidRules = cleanStringList(value.avoidRules);
  if ('attributes' in value) patch.attributes = cleanRecord(value.attributes);
  if ('assets' in value) patch.assets = cleanRecord(value.assets) as UserStylePresetAssets;
  if ('source' in value) patch.source = cleanSource(value.source);
  if ('isArchived' in value) patch.isArchived = Boolean(value.isArchived);

  if (issues.length > 0) return { ok: false, value: null, issues };
  return { ok: true, value: patch, issues };
}

export function sanitizeCodexStyleDraft(
  value: unknown,
): UserStyleValidationResult<UserStylePresetDraft> {
  const issues: string[] = [];
  if (!isRecord(value)) {
    return {
      ok: false,
      value: null,
      issues: ['Codex style draft must be an object.'],
    };
  }

  const name = cleanString(value.name, MAX_NAME_LENGTH);
  if (!name) issues.push('draft.name is required.');

  const visualDna = cleanVisualDna(value.visualDna, issues);

  if (!name || !visualDna) {
    return { ok: false, value: null, issues };
  }

  return {
    ok: true,
    value: {
      name,
      category: cleanString(value.category, MAX_CATEGORY_LENGTH) ?? 'Custom Styles',
      tags: cleanStringList(value.tags),
      supportedTasks: cleanTaskList(value.supportedTasks),
      visualDna,
      avoidRules: cleanStringList(value.avoidRules),
      warnings: cleanStringList(value.warnings),
    },
    issues,
  };
}
