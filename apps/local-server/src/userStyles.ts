import { randomUUID } from 'node:crypto';
import {
  USER_STYLE_PRESET_SCHEMA_VERSION,
  sanitizeCreateUserStylePresetInput,
  sanitizeUpdateUserStylePresetInput,
  type CreateUserStylePresetInput,
  type UpdateUserStylePresetInput,
  type UserStylePreset,
} from '../../../packages/shared/src/userStyles';

export interface UserStyleStore {
  listUserStyles(options?: { includeArchived?: boolean }): UserStylePreset[];
  getUserStyle(id: string): UserStylePreset | null;
  createUserStyle(input: CreateUserStylePresetInput): UserStylePreset;
  updateUserStyle(id: string, patch: UpdateUserStylePresetInput): UserStylePreset | null;
  archiveUserStyle(id: string): UserStylePreset | null;
  duplicateUserStyle(id: string): UserStylePreset | null;
}

function now() {
  return new Date().toISOString();
}

function createUserStyleId() {
  return `user-style-${randomUUID()}`;
}

export function createUserStyleFromInput(input: CreateUserStylePresetInput): UserStylePreset {
  const sanitized = sanitizeCreateUserStylePresetInput(input);
  if (!sanitized.ok || !sanitized.value) {
    throw new Error(`Invalid user style: ${sanitized.issues.join('; ')}`);
  }

  const createdAt = now();
  return {
    schemaVersion: USER_STYLE_PRESET_SCHEMA_VERSION,
    id: createUserStyleId(),
    name: sanitized.value.name,
    category: sanitized.value.category ?? 'Custom Styles',
    domain: sanitized.value.domain ?? null,
    tags: sanitized.value.tags ?? [],
    supportedTasks: sanitized.value.supportedTasks ?? [
      'image_generate',
      'image_edit',
      'style_preset_card',
    ],
    visualDna: sanitized.value.visualDna,
    avoidRules: sanitized.value.avoidRules ?? [],
    attributes: sanitized.value.attributes ?? {},
    assets: sanitized.value.assets ?? {},
    source: sanitized.value.source ?? null,
    isArchived: false,
    createdAt,
    updatedAt: createdAt,
  };
}

export function applyUserStylePatch(
  style: UserStylePreset,
  patch: UpdateUserStylePresetInput,
): UserStylePreset {
  const sanitized = sanitizeUpdateUserStylePresetInput(patch);
  if (!sanitized.ok || !sanitized.value) {
    throw new Error(`Invalid user style patch: ${sanitized.issues.join('; ')}`);
  }

  return {
    ...style,
    ...sanitized.value,
    domain: sanitized.value.domain === undefined ? style.domain : sanitized.value.domain,
    visualDna: {
      ...style.visualDna,
      ...(sanitized.value.visualDna ?? {}),
    },
    attributes: sanitized.value.attributes ?? style.attributes,
    assets: sanitized.value.assets ?? style.assets,
    source: sanitized.value.source === undefined ? style.source : sanitized.value.source,
    isArchived: sanitized.value.isArchived ?? style.isArchived,
    updatedAt: now(),
  };
}

export function duplicateUserStyleInput(style: UserStylePreset): CreateUserStylePresetInput {
  return {
    name: `${style.name} Copy`,
    category: style.category,
    domain: style.domain,
    tags: style.tags,
    supportedTasks: style.supportedTasks,
    visualDna: style.visualDna,
    avoidRules: style.avoidRules,
    attributes: style.attributes,
    assets: style.assets,
    source: {
      kind: 'clone',
      presetId: style.id,
      note: 'Duplicated from user style.',
    },
  };
}

export function createMemoryUserStyleStore(seed: UserStylePreset[] = []): UserStyleStore {
  const styles = new Map(seed.map((style) => [style.id, style]));

  const store: UserStyleStore = {
    listUserStyles(options = {}) {
      return [...styles.values()]
        .filter((style) => options.includeArchived || !style.isArchived)
        .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    getUserStyle(id) {
      return styles.get(id) ?? null;
    },
    createUserStyle(input) {
      const style = createUserStyleFromInput(input);
      styles.set(style.id, style);
      return style;
    },
    updateUserStyle(id, patch) {
      const current = styles.get(id);
      if (!current) return null;
      const next = applyUserStylePatch(current, patch);
      styles.set(id, next);
      return next;
    },
    archiveUserStyle(id) {
      return store.updateUserStyle(id, { isArchived: true });
    },
    duplicateUserStyle(id) {
      const current = styles.get(id);
      if (!current) return null;
      return store.createUserStyle(duplicateUserStyleInput(current));
    },
  };

  return store;
}
