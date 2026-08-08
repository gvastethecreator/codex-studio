import type {
  CodexStyleDraftRequest,
  CodexStyleDraftResponse,
  CreateUserStylePresetInput,
  UpdateUserStylePresetInput,
  UserStylePreset,
} from '../../packages/shared/src';
import { request } from './http';

export async function listUserStylePresets(options: { includeArchived?: boolean } = {}) {
  const search = new URLSearchParams();
  if (options.includeArchived) search.set('include_archived', 'true');
  const suffix = search.size > 0 ? `?${search.toString()}` : '';
  return request<{ styles: UserStylePreset[] }>(`/api/styles/user${suffix}`);
}

export async function createUserStylePreset(input: CreateUserStylePresetInput) {
  return request<UserStylePreset>('/api/styles/user', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateUserStylePreset(id: string, patch: UpdateUserStylePresetInput) {
  return request<UserStylePreset>(`/api/styles/user/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function archiveUserStylePreset(id: string) {
  return request<UserStylePreset>(`/api/styles/user/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function duplicateUserStylePreset(id: string) {
  return request<UserStylePreset>(`/api/styles/user/${encodeURIComponent(id)}/duplicate`, {
    method: 'POST',
  });
}

export async function draftUserStylePreset(input: CodexStyleDraftRequest) {
  return request<CodexStyleDraftResponse>('/api/styles/draft', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
