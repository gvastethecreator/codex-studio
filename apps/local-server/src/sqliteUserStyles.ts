import type { Database } from 'bun:sqlite';
import type {
  UserStylePreset,
  UserStylePresetAssets,
  UserStylePresetSource,
  UserStylePresetTask,
  UserStyleVisualDna,
} from '../../../packages/shared/src';
import { USER_STYLE_PRESET_SCHEMA_VERSION } from '../../../packages/shared/src';
import { getDb } from './db';
import {
  applyUserStylePatch,
  createUserStyleFromInput,
  duplicateUserStyleInput,
  type UserStyleStore,
} from './userStyles';

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function stringifyJson(value: unknown) {
  return JSON.stringify(value ?? null);
}

function mapUserStyle(row: any): UserStylePreset {
  return {
    schemaVersion: USER_STYLE_PRESET_SCHEMA_VERSION,
    id: row.id,
    name: row.name,
    category: row.category,
    domain: row.domain,
    tags: parseJson<string[]>(row.tags_json, []),
    supportedTasks: parseJson<UserStylePresetTask[]>(row.supported_tasks_json, [
      'image_generate',
      'image_edit',
      'style_preset_card',
    ]),
    visualDna: parseJson<UserStyleVisualDna>(row.visual_dna_json, {} as UserStyleVisualDna),
    avoidRules: parseJson<string[]>(row.avoid_rules_json, []),
    attributes: parseJson<Record<string, unknown>>(row.attributes_json, {}),
    assets: parseJson<UserStylePresetAssets>(row.assets_json, {}),
    source: parseJson<UserStylePresetSource | null>(row.source_json, null),
    isArchived: Boolean(row.is_archived),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createSqliteUserStyleStore(database?: Database): UserStyleStore {
  const db = () => getDb(database);

  function getUserStyle(id: string) {
    const row = db().query('SELECT * FROM user_style_presets WHERE id = ?').get(id);
    return row ? mapUserStyle(row) : null;
  }

  return {
    listUserStyles(options = {}) {
      const includeArchived = Boolean(options.includeArchived);
      const rows = includeArchived
        ? db().query('SELECT * FROM user_style_presets ORDER BY updated_at DESC').all()
        : db()
            .query(
              'SELECT * FROM user_style_presets WHERE is_archived = 0 ORDER BY updated_at DESC',
            )
            .all();
      return rows.map(mapUserStyle);
    },
    getUserStyle,
    createUserStyle(input) {
      const style = createUserStyleFromInput(input);
      db()
        .query(
          `INSERT INTO user_style_presets (
            id, name, category, domain, tags_json, supported_tasks_json, visual_dna_json,
            avoid_rules_json, attributes_json, assets_json, source_json, is_archived,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          style.id,
          style.name,
          style.category,
          style.domain,
          stringifyJson(style.tags),
          stringifyJson(style.supportedTasks),
          stringifyJson(style.visualDna),
          stringifyJson(style.avoidRules),
          stringifyJson(style.attributes),
          stringifyJson(style.assets),
          style.source ? stringifyJson(style.source) : null,
          style.isArchived ? 1 : 0,
          style.createdAt,
          style.updatedAt,
        );
      return style;
    },
    updateUserStyle(id, patch) {
      const current = getUserStyle(id);
      if (!current) return null;
      const next = applyUserStylePatch(current, patch);
      db()
        .query(
          `UPDATE user_style_presets
           SET name = ?, category = ?, domain = ?, tags_json = ?, supported_tasks_json = ?,
               visual_dna_json = ?, avoid_rules_json = ?, attributes_json = ?, assets_json = ?,
               source_json = ?, is_archived = ?, updated_at = ?
           WHERE id = ?`,
        )
        .run(
          next.name,
          next.category,
          next.domain,
          stringifyJson(next.tags),
          stringifyJson(next.supportedTasks),
          stringifyJson(next.visualDna),
          stringifyJson(next.avoidRules),
          stringifyJson(next.attributes),
          stringifyJson(next.assets),
          next.source ? stringifyJson(next.source) : null,
          next.isArchived ? 1 : 0,
          next.updatedAt,
          id,
        );
      return next;
    },
    archiveUserStyle(id) {
      return this.updateUserStyle(id, { isArchived: true });
    },
    duplicateUserStyle(id) {
      const current = getUserStyle(id);
      if (!current) return null;
      return this.createUserStyle(duplicateUserStyleInput(current));
    },
  };
}

export function createDefaultUserStyleStore() {
  return createSqliteUserStyleStore();
}
