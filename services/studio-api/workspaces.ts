import { request } from './http';

export interface StudioWorkspaceDto {
  id: string;
  name: string;
  libraryId: string | null;
  filterJson?: unknown;
  filter?: Record<string, unknown>;
  sortOrder: string;
  createdAt: string;
  updatedAt?: string;
}

export async function listWorkspaces() {
  return request<StudioWorkspaceDto[]>('/api/workspaces');
}

export async function createWorkspace(input: {
  id?: string;
  name: string;
  libraryId?: string | null;
  filterJson?: unknown;
  sortOrder?: string;
}) {
  return request<StudioWorkspaceDto>('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateWorkspace(
  id: string,
  patch: { name?: string; libraryId?: string | null; filterJson?: unknown; sortOrder?: string },
) {
  return request<StudioWorkspaceDto>(`/api/workspaces/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteWorkspace(id: string) {
  return request<{ ok: boolean }>(`/api/workspaces/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
