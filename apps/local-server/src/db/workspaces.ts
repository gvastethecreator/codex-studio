import type { Database } from 'bun:sqlite';
import { randomUUID } from 'node:crypto';

import {
  DEFAULT_WORKSPACE_ID,
  isDefaultWorkspaceId,
} from '../../../../packages/shared/src/workspaceContracts';
import type {
  StudioWorkspace,
  StudioWorkspaceSortOrder,
} from '../../../../packages/shared/src/workspaceContracts';
import { getDb } from './connection';

export type DeleteWorkspaceResult = { ok: true } | { ok: false; status: 400 | 404; error: string };

function now() {
  return new Date().toISOString();
}

function parseJson(value: string | null) {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function readSortOrder(value: unknown): StudioWorkspaceSortOrder {
  return value === 'oldest' || value === 'favorite' ? value : 'newest';
}

function mapWorkspace(row: Record<string, unknown>): StudioWorkspace {
  return {
    id: String(row.id),
    name: typeof row.name === 'string' && row.name.trim() ? row.name : 'Default',
    libraryId: typeof row.library_id === 'string' ? row.library_id : null,
    filter: parseJson(typeof row.filter_json === 'string' ? row.filter_json : null),
    sortOrder: readSortOrder(row.sort_order),
    createdAt: String(row.created_at),
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : String(row.created_at),
  };
}

export function getWorkspaceFromDb(database: Database, id: string) {
  const row = database.query('SELECT * FROM workspaces WHERE id = ?').get(id);
  return row ? mapWorkspace(row as Record<string, unknown>) : null;
}

export function ensureDefaultWorkspaceRow(database: Database, libraryId: string | null = null) {
  const existing = getWorkspaceFromDb(database, DEFAULT_WORKSPACE_ID);
  const timestamp = now();
  if (existing) {
    database
      .query(
        `UPDATE workspaces
         SET name = COALESCE(NULLIF(name, ''), 'Default'),
             library_id = COALESCE(library_id, ?),
             updated_at = COALESCE(updated_at, created_at, ?)
         WHERE id = ?`,
      )
      .run(libraryId, timestamp, DEFAULT_WORKSPACE_ID);
    return getWorkspaceFromDb(database, DEFAULT_WORKSPACE_ID)!;
  }

  database
    .query(
      `INSERT INTO workspaces
       (id, name, library_id, filter_json, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(DEFAULT_WORKSPACE_ID, 'Default', libraryId, '{}', 'newest', timestamp, timestamp);
  return getWorkspaceFromDb(database, DEFAULT_WORKSPACE_ID)!;
}

export function listWorkspacesFromDb(database: Database, defaultLibraryId: string | null = null) {
  ensureDefaultWorkspaceRow(database, defaultLibraryId);
  return database
    .query('SELECT * FROM workspaces ORDER BY created_at ASC')
    .all()
    .map((row) => mapWorkspace(row as Record<string, unknown>));
}

export function createWorkspaceInDb(
  database: Database,
  input: {
    id?: string;
    name: string;
    libraryId?: string | null;
    filter?: Record<string, unknown>;
    sortOrder?: StudioWorkspaceSortOrder;
  },
  defaultLibraryId: string | null = null,
) {
  const timestamp = now();
  const workspace: StudioWorkspace = {
    id: input.id?.trim() || randomUUID(),
    name: input.name.trim() || 'Untitled Workspace',
    libraryId: input.libraryId ?? defaultLibraryId,
    filter: input.filter ?? {},
    sortOrder: input.sortOrder ?? 'newest',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  database
    .query(
      `INSERT INTO workspaces
       (id, name, library_id, filter_json, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      workspace.id,
      workspace.name,
      workspace.libraryId,
      JSON.stringify(workspace.filter),
      workspace.sortOrder,
      workspace.createdAt,
      workspace.updatedAt,
    );
  return workspace;
}

export function updateWorkspaceInDb(
  database: Database,
  id: string,
  patch: {
    name?: string;
    libraryId?: string | null;
    filter?: Record<string, unknown>;
    sortOrder?: StudioWorkspaceSortOrder;
  },
) {
  const current = getWorkspaceFromDb(database, id);
  if (!current) return null;
  database
    .query(
      `UPDATE workspaces
       SET name = ?, library_id = ?, filter_json = ?, sort_order = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(
      patch.name ?? current.name,
      patch.libraryId === undefined ? current.libraryId : patch.libraryId,
      JSON.stringify(patch.filter === undefined ? current.filter : patch.filter),
      patch.sortOrder ?? current.sortOrder,
      now(),
      id,
    );
  return getWorkspaceFromDb(database, id);
}

export function deleteWorkspaceFromDb(database: Database, id: string): DeleteWorkspaceResult {
  if (isDefaultWorkspaceId(id)) {
    return { ok: false, status: 400, error: 'The default workspace cannot be deleted.' };
  }
  if (!getWorkspaceFromDb(database, id)) {
    return { ok: false, status: 404, error: 'Workspace not found' };
  }
  database.query('DELETE FROM workspaces WHERE id = ?').run(id);
  return { ok: true };
}

export function ensureDefaultWorkspace(db?: Database) {
  const database = getDb(db);
  ensureDefaultWorkspaceRow(database);
  return getWorkspaceFromDb(database, DEFAULT_WORKSPACE_ID);
}

export function getWorkspace(id: string, db?: Database) {
  return getWorkspaceFromDb(getDb(db), id);
}
