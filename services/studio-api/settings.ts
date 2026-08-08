import type {
  EditableStudioSettings,
  EditableStudioSettingsPatch,
} from '../../packages/shared/src';
import { request } from './http';

export async function getEditableStudioSettings() {
  return request<EditableStudioSettings>('/api/settings');
}

export async function updateEditableStudioSettings(patch: EditableStudioSettingsPatch) {
  return request<EditableStudioSettings>('/api/settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}
