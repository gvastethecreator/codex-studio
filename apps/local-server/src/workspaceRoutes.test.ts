import { describe, expect, it, vi } from 'vite-plus/test';

import { createWorkspaceRoutes, type WorkspaceRoutesDependencies } from './workspaceRoutes';

function createRouteHarness() {
  const createCatalogWorkspace: WorkspaceRoutesDependencies['createCatalogWorkspace'] = vi.fn(
    (input) => ({
      id: input.id ?? 'created-workspace',
      name: input.name,
      libraryId: input.libraryId ?? null,
      filter: input.filter ?? {},
      sortOrder: input.sortOrder ?? 'newest',
      createdAt: '2026-08-08T00:00:00.000Z',
      updatedAt: '2026-08-08T00:00:00.000Z',
    }),
  );
  const routes = createWorkspaceRoutes({
    listCatalogWorkspaces: vi.fn(() => []),
    getCatalogWorkspace: vi.fn(() => null),
    createCatalogWorkspace,
    updateCatalogWorkspace: vi.fn(() => null),
    deleteCatalogWorkspace: vi.fn(() => false),
  });
  return { routes, createCatalogWorkspace };
}

describe('Workspace API shared boundary', () => {
  it('accepts the canonical StudioWorkspace input shape', async () => {
    const { routes, createCatalogWorkspace } = createRouteHarness();
    const response = await routes.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'References',
        filter: { favorite: true },
        sortOrder: 'favorite',
      }),
    });

    expect(response.status).toBe(201);
    expect(createCatalogWorkspace).toHaveBeenCalledWith({
      id: undefined,
      name: 'References',
      libraryId: undefined,
      filter: { favorite: true },
      sortOrder: 'favorite',
    });
  });

  it('rejects values outside the shared Workspace schema', async () => {
    const { routes, createCatalogWorkspace } = createRouteHarness();
    const response = await routes.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Broken', sortOrder: 'manual' }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'invalid_request_body' });
    expect(createCatalogWorkspace).not.toHaveBeenCalled();
  });
});
