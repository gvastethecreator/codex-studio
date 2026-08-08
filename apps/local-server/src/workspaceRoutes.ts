import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import {
  DEFAULT_WORKSPACE_ID,
  isDefaultWorkspaceId,
} from '../../../packages/shared/src/workspaceContracts';
import { getDb } from './db';
import { getDefaultLibrary } from './libraries';

export interface CatalogWorkspace {
  id: string;
  name: string;
  libraryId: string | null;
  filterJson: unknown;
  sortOrder: string;
  createdAt: string;
  updatedAt: string;
}

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

function mapWorkspace(row: any): CatalogWorkspace {
  return {
    id: row.id,
    name: row.name,
    libraryId: row.library_id,
    filterJson: parseJson(row.filter_json),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}

function ensureDefaultWorkspace() {
  const existing = getCatalogWorkspace(DEFAULT_WORKSPACE_ID);
  if (existing) return existing;
  const timestamp = now();
  getDb()
    .query(
      'INSERT INTO workspaces (id, name, library_id, filter_json, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(
      DEFAULT_WORKSPACE_ID,
      'Default',
      getDefaultLibrary().id,
      '{}',
      'newest',
      timestamp,
      timestamp,
    );
  return getCatalogWorkspace(DEFAULT_WORKSPACE_ID)!;
}

function listCatalogWorkspaces() {
  ensureDefaultWorkspace();
  return getDb().query('SELECT * FROM workspaces ORDER BY created_at ASC').all().map(mapWorkspace);
}

function getCatalogWorkspace(id: string) {
  const row = getDb().query('SELECT * FROM workspaces WHERE id = ?').get(id);
  return row ? mapWorkspace(row) : null;
}

function createCatalogWorkspace(input: {
  id?: string;
  name: string;
  libraryId?: string | null;
  filterJson?: unknown;
  sortOrder?: string;
}) {
  const timestamp = now();
  const workspace: CatalogWorkspace = {
    id: input.id?.trim() || randomUUID(),
    name: input.name.trim() || 'Untitled Workspace',
    libraryId: input.libraryId ?? getDefaultLibrary().id,
    filterJson: input.filterJson ?? {},
    sortOrder: input.sortOrder ?? 'newest',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  getDb()
    .query(
      'INSERT INTO workspaces (id, name, library_id, filter_json, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(
      workspace.id,
      workspace.name,
      workspace.libraryId,
      JSON.stringify(workspace.filterJson),
      workspace.sortOrder,
      workspace.createdAt,
      workspace.updatedAt,
    );
  return workspace;
}

function updateCatalogWorkspace(
  id: string,
  patch: { name?: string; libraryId?: string | null; filterJson?: unknown; sortOrder?: string },
) {
  const current = getCatalogWorkspace(id);
  if (!current) return null;
  getDb()
    .query(
      'UPDATE workspaces SET name = ?, library_id = ?, filter_json = ?, sort_order = ?, updated_at = ? WHERE id = ?',
    )
    .run(
      patch.name ?? current.name,
      patch.libraryId === undefined ? current.libraryId : patch.libraryId,
      JSON.stringify(patch.filterJson === undefined ? current.filterJson : patch.filterJson),
      patch.sortOrder ?? current.sortOrder,
      now(),
      id,
    );
  return getCatalogWorkspace(id);
}

function deleteCatalogWorkspace(
  id: string,
): { ok: true } | { ok: false; status: 400 | 404; error: string } {
  if (isDefaultWorkspaceId(id)) {
    return { ok: false, status: 400, error: 'The default workspace cannot be deleted.' };
  }
  const current = getCatalogWorkspace(id);
  if (!current) return { ok: false, status: 404, error: 'Workspace not found' };
  getDb().query('DELETE FROM workspaces WHERE id = ?').run(id);
  return { ok: true };
}

export type DeleteWorkspaceResult = { ok: true } | { ok: false; status: 400 | 404; error: string };

export interface WorkspaceRoutesDependencies {
  listCatalogWorkspaces: typeof listCatalogWorkspaces;
  getCatalogWorkspace: typeof getCatalogWorkspace;
  createCatalogWorkspace: typeof createCatalogWorkspace;
  updateCatalogWorkspace: typeof updateCatalogWorkspace;
  deleteCatalogWorkspace: (id: string) => DeleteWorkspaceResult | boolean;
}

export function createWorkspaceRoutes(dependencies: Partial<WorkspaceRoutesDependencies> = {}) {
  const {
    listCatalogWorkspaces: listWorkspaces = listCatalogWorkspaces,
    getCatalogWorkspace: readWorkspace = getCatalogWorkspace,
    createCatalogWorkspace: createWorkspace = createCatalogWorkspace,
    updateCatalogWorkspace: updateWorkspace = updateCatalogWorkspace,
    deleteCatalogWorkspace: deleteWorkspace = deleteCatalogWorkspace,
  } = dependencies;
  const routes = new Hono();
  routes.get('/', (c) => c.json(listWorkspaces()));
  routes.post('/', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const requestedId = typeof body.id === 'string' ? body.id.trim() : '';
    if (requestedId && readWorkspace(requestedId)) {
      return c.json(readWorkspace(requestedId), 200);
    }
    return c.json(
      createWorkspace({
        id: requestedId || undefined,
        name: body.name || 'Untitled Workspace',
        libraryId: body.libraryId ?? body.library_id,
        filterJson: body.filterJson ?? body.filter_json ?? {},
        sortOrder: body.sortOrder ?? body.sort_order ?? 'newest',
      }),
      201,
    );
  });
  routes.get('/:id', (c) => {
    const workspace = readWorkspace(c.req.param('id'));
    return workspace ? c.json(workspace) : c.json({ error: 'Workspace not found' }, 404);
  });
  routes.patch('/:id', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const workspace = updateWorkspace(c.req.param('id'), {
      name: body.name,
      libraryId: body.libraryId ?? body.library_id,
      filterJson: body.filterJson ?? body.filter_json,
      sortOrder: body.sortOrder ?? body.sort_order,
    });
    return workspace ? c.json(workspace) : c.json({ error: 'Workspace not found' }, 404);
  });
  routes.delete('/:id', (c) => {
    const result = deleteWorkspace(c.req.param('id'));
    if (result === true) return c.json({ ok: true });
    if (result && typeof result === 'object' && 'ok' in result) {
      if (result.ok) return c.json({ ok: true });
      return c.json({ error: result.error }, result.status);
    }
    return c.json({ error: 'Workspace not found' }, 404);
  });
  return routes;
}
