import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { getDb } from './db';
import { getDefaultLibrary } from './libraries';

export interface CatalogWorkspace {
  id: string;
  name: string;
  libraryId: string | null;
  filterJson: unknown;
  sortOrder: string;
  createdAt: string;
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
  };
}

export function listCatalogWorkspaces() {
  return getDb().query('SELECT * FROM workspaces ORDER BY created_at ASC').all().map(mapWorkspace);
}

export function getCatalogWorkspace(id: string) {
  const row = getDb().query('SELECT * FROM workspaces WHERE id = ?').get(id);
  return row ? mapWorkspace(row) : null;
}

export function createCatalogWorkspace(input: {
  name: string;
  libraryId?: string | null;
  filterJson?: unknown;
  sortOrder?: string;
}) {
  const workspace: CatalogWorkspace = {
    id: randomUUID(),
    name: input.name.trim() || 'Untitled Workspace',
    libraryId: input.libraryId ?? getDefaultLibrary().id,
    filterJson: input.filterJson ?? {},
    sortOrder: input.sortOrder ?? 'newest',
    createdAt: now(),
  };
  getDb()
    .query(
      'INSERT INTO workspaces (id, name, library_id, filter_json, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(
      workspace.id,
      workspace.name,
      workspace.libraryId,
      JSON.stringify(workspace.filterJson),
      workspace.sortOrder,
      workspace.createdAt,
    );
  return workspace;
}

export function updateCatalogWorkspace(
  id: string,
  patch: { name?: string; libraryId?: string | null; filterJson?: unknown; sortOrder?: string },
) {
  const current = getCatalogWorkspace(id);
  if (!current) return null;
  getDb()
    .query(
      'UPDATE workspaces SET name = ?, library_id = ?, filter_json = ?, sort_order = ? WHERE id = ?',
    )
    .run(
      patch.name ?? current.name,
      patch.libraryId === undefined ? current.libraryId : patch.libraryId,
      JSON.stringify(patch.filterJson === undefined ? current.filterJson : patch.filterJson),
      patch.sortOrder ?? current.sortOrder,
      id,
    );
  return getCatalogWorkspace(id);
}

export function deleteCatalogWorkspace(id: string) {
  const current = getCatalogWorkspace(id);
  if (!current) return false;
  getDb().query('DELETE FROM workspaces WHERE id = ?').run(id);
  return true;
}

export interface WorkspaceRoutesDependencies {
  listCatalogWorkspaces: typeof listCatalogWorkspaces;
  getCatalogWorkspace: typeof getCatalogWorkspace;
  createCatalogWorkspace: typeof createCatalogWorkspace;
  updateCatalogWorkspace: typeof updateCatalogWorkspace;
  deleteCatalogWorkspace: typeof deleteCatalogWorkspace;
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
    return c.json(
      createWorkspace({
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
    return deleteWorkspace(c.req.param('id'))
      ? c.json({ ok: true })
      : c.json({ error: 'Workspace not found' }, 404);
  });
  return routes;
}
