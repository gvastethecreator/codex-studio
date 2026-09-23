import { describe, expect, it, vi } from 'vitest';
import type { StudioWorkspace, StudioWorkspaceSortOrder } from '../packages/shared/src';
import { listWorkspaces } from '../services/studio-api/workspaces';
import { get } from '../utils/idb';
import {
  loadDurableWorkspacesFromApi,
  mapStudioWorkspaceToUi,
  migrateIndexedDbWorkspacesToServer,
  WORKSPACE_IDB_MIGRATION_MARKER,
} from './workspaceIdbMigration';

vi.mock('../services/studio-api/workspaces', () => ({ listWorkspaces: vi.fn() }));
vi.mock('../utils/idb', () => ({ get: vi.fn() }));

describe('workspaceIdbMigration', () => {
  it('restores the saved active workspace when migration falls back to the API', async () => {
    vi.mocked(listWorkspaces).mockResolvedValueOnce([
      {
        id: 'current',
        name: 'Current',
        libraryId: null,
        filter: {},
        sortOrder: 'newest',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    vi.mocked(get).mockResolvedValueOnce('current');

    const result = await loadDurableWorkspacesFromApi();

    expect(result.activeWorkspaceId).toBe('current');
    expect(result.workspaces.map((workspace) => workspace.id)).toEqual(['default', 'current']);
  });

  it('maps server workspace DTOs into UI workspace rows', () => {
    const mapped = mapStudioWorkspaceToUi({
      id: 'ws-1',
      name: 'Concept',
      libraryId: 'lib-1',
      filter: {},
      sortOrder: 'newest',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
    expect(mapped).toEqual({
      id: 'ws-1',
      name: 'Concept',
      createdAt: Date.parse('2026-01-02T00:00:00.000Z'),
    });
  });

  it('imports missing IndexedDB workspaces once and preserves active id', async () => {
    const store = new Map<string, unknown>([
      [
        'app-workspaces',
        [
          { id: 'default', name: 'Default', createdAt: 1 },
          { id: 'local-only', name: 'Local Only', createdAt: 2 },
        ],
      ],
      ['app-active-workspace-id', 'local-only'],
    ]);
    const createRemote = vi.fn(
      async (input: {
        id?: string;
        name: string;
        libraryId?: string | null;
        filter?: Record<string, unknown>;
        sortOrder?: StudioWorkspaceSortOrder;
      }): Promise<StudioWorkspace> => ({
        id: input.id ?? 'created',
        name: input.name,
        libraryId: null,
        filter: {},
        sortOrder: 'newest',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    );
    const listRemote = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: 'default',
          name: 'Default',
          libraryId: null,
          filter: {},
          sortOrder: 'newest',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ])
      .mockResolvedValue([
        {
          id: 'default',
          name: 'Default',
          libraryId: null,
          filter: {},
          sortOrder: 'newest',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'local-only',
          name: 'Local Only',
          libraryId: null,
          filter: {},
          sortOrder: 'newest',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ]);

    const first = await migrateIndexedDbWorkspacesToServer({
      getIdb: async (key) => store.get(key) as never,
      setIdb: async (key, value) => {
        store.set(key, value);
      },
      delIdb: async (key) => {
        store.delete(key);
      },
      listRemote,
      createRemote,
    });

    expect(first.migrated).toBe(true);
    expect(createRemote).toHaveBeenCalledWith({
      id: 'local-only',
      name: 'Local Only',
    });
    expect(first.activeWorkspaceId).toBe('local-only');
    expect(store.get(WORKSPACE_IDB_MIGRATION_MARKER)).toBe(true);
    expect(store.has('app-workspaces')).toBe(false);
    expect(store.get('app-active-workspace-id')).toBe('local-only');

    createRemote.mockClear();
    const second = await migrateIndexedDbWorkspacesToServer({
      getIdb: async (key) => store.get(key) as never,
      setIdb: async (key, value) => {
        store.set(key, value);
      },
      delIdb: async (key) => {
        store.delete(key);
      },
      listRemote,
      createRemote,
    });
    expect(second.migrated).toBe(false);
    expect(createRemote).not.toHaveBeenCalled();
    expect(store.has('app-workspaces')).toBe(false);
  });
});
