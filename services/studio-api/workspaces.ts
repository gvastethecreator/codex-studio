import type { StudioWorkspace, StudioWorkspaceSortOrder } from '../../packages/shared/src';
import { request } from './http';

export async function listWorkspaces() {
  return request<StudioWorkspace[]>('/api/workspaces');
}

export async function createWorkspace(input: {
  id?: string;
  name: string;
  libraryId?: string | null;
  filter?: Record<string, unknown>;
  sortOrder?: StudioWorkspaceSortOrder;
}) {
  return request<StudioWorkspace>('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateWorkspace(
  id: string,
  patch: {
    name?: string;
    libraryId?: string | null;
    filter?: Record<string, unknown>;
    sortOrder?: StudioWorkspaceSortOrder;
  },
) {
  return request<StudioWorkspace>(`/api/workspaces/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteWorkspace(id: string) {
  return request<{ ok: boolean }>(`/api/workspaces/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
