import {
  createDefaultEditableStudioSettings,
  mergeEditableStudioSettingsPatch,
  normalizeEditableStudioSettings,
  type EditableStudioSettings,
} from '../../../packages/shared/src/studioSettings';

export const EDITABLE_STUDIO_SETTINGS_KEY = 'editable_studio_settings';

export interface StudioSettingsStorage {
  getSetting(key: string): string | null;
  setSetting(key: string, value: string, updatedAt: string): void;
}

function parseStoredSettings(value: string | null): EditableStudioSettings {
  if (!value) return createDefaultEditableStudioSettings();

  try {
    return normalizeEditableStudioSettings(JSON.parse(value));
  } catch {
    return createDefaultEditableStudioSettings();
  }
}

export function readEditableStudioSettings(storage: StudioSettingsStorage): EditableStudioSettings {
  return parseStoredSettings(storage.getSetting(EDITABLE_STUDIO_SETTINGS_KEY));
}

export function updateEditableStudioSettings(
  storage: StudioSettingsStorage,
  patch: unknown,
  updatedAt = new Date().toISOString(),
): EditableStudioSettings {
  const current = readEditableStudioSettings(storage);
  const next = mergeEditableStudioSettingsPatch(current, patch, updatedAt);
  storage.setSetting(EDITABLE_STUDIO_SETTINGS_KEY, JSON.stringify(next), updatedAt);
  return next;
}
