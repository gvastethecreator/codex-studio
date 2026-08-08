import type { Workspace } from '../types';
import {
  DEFAULT_WORKSPACE_ID,
  normalizeWorkspaceId,
} from '../packages/shared/src/workspaceContracts';
import {
  createWorkspace,
  listWorkspaces,
  type StudioWorkspaceDto,
} from '../services/localStudioService';
import { del, get, set } from '../utils/idb';

export const WORKSPACE_IDB_MIGRATION_MARKER = 'workspace-idb-migrated-v1';

export function mapStudioWorkspaceToUi(workspace: StudioWorkspaceDto): Workspace {
  const createdAtMs = Date.parse(workspace.createdAt);
  return {
    id: workspace.id,
    name: workspace.name,
    createdAt: Number.isFinite(createdAtMs) ? createdAtMs : Date.now(),
  };
}

export async function loadDurableWorkspacesFromApi(): Promise<{
  workspaces: Workspace[];
  activeWorkspaceId: string;
}> {
  const remote = await listWorkspaces();
  const workspaces = remote.map(mapStudioWorkspaceToUi);
  if (!workspaces.some((workspace) => workspace.id === DEFAULT_WORKSPACE_ID)) {
    workspaces.unshift({ id: DEFAULT_WORKSPACE_ID, name: 'Default', createdAt: Date.now() });
  }
  return {
    workspaces,
    activeWorkspaceId: DEFAULT_WORKSPACE_ID,
  };
}

/**
 * One-shot import of browser-owned workspaces into SQLite.
 * Idempotent via IDB migration marker.
 */
export async function migrateIndexedDbWorkspacesToServer(options?: {
  getIdb?: <T>(key: string) => Promise<T | undefined>;
  setIdb?: (key: string, value: unknown) => Promise<void>;
  delIdb?: (key: string) => Promise<void>;
  listRemote?: typeof listWorkspaces;
  createRemote?: typeof createWorkspace;
}): Promise<{
  workspaces: Workspace[];
  activeWorkspaceId: string;
  migrated: boolean;
}> {
  const getIdb = options?.getIdb ?? ((key: string) => get(key));
  const setIdb = options?.setIdb ?? ((key: string, value: unknown) => set(key, value));
  const delIdb = options?.delIdb ?? ((key: string) => del(key));
  const listRemote = options?.listRemote ?? listWorkspaces;
  const createRemote = options?.createRemote ?? createWorkspace;

  const marker = await getIdb<boolean>(WORKSPACE_IDB_MIGRATION_MARKER).catch(() => undefined);
  const localWorkspaces =
    (await getIdb<Workspace[]>('app-workspaces').catch(() => undefined)) ?? [];
  const localActive =
    (await getIdb<string>('app-active-workspace-id').catch(() => undefined)) ??
    DEFAULT_WORKSPACE_ID;

  let remote = await listRemote();
  const remoteIds = new Set(remote.map((workspace) => workspace.id));

  if (!marker) {
    for (const local of localWorkspaces) {
      const id = normalizeWorkspaceId(local.id);
      if (remoteIds.has(id)) continue;
      const created = await createRemote({
        id,
        name: local.name?.trim() || (id === DEFAULT_WORKSPACE_ID ? 'Default' : 'Workspace'),
      });
      remoteIds.add(created.id);
      remote = [...remote, created];
    }
    await setIdb(WORKSPACE_IDB_MIGRATION_MARKER, true);
  }

  const workspaces = remote.map(mapStudioWorkspaceToUi);
  if (!workspaces.some((workspace) => workspace.id === DEFAULT_WORKSPACE_ID)) {
    workspaces.unshift({ id: DEFAULT_WORKSPACE_ID, name: 'Default', createdAt: Date.now() });
  }

  const activeWorkspaceId = workspaces.some((workspace) => workspace.id === localActive)
    ? localActive
    : DEFAULT_WORKSPACE_ID;

  // Durable ownership leaves IndexedDB: clear workspace list key; keep only
  // active preference + migration marker.
  await delIdb('app-workspaces');
  await setIdb('app-active-workspace-id', activeWorkspaceId);

  return {
    workspaces,
    activeWorkspaceId,
    migrated: !marker,
  };
}
