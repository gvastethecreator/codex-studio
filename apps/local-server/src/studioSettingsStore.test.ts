import { describe, expect, it } from 'vite-plus/test';

import {
  EDITABLE_STUDIO_SETTINGS_KEY,
  readEditableStudioSettings,
  updateEditableStudioSettings,
  type StudioSettingsStorage,
} from './studioSettingsStore';

function createMemoryStorage(initial?: Record<string, string>): StudioSettingsStorage {
  const values = new Map(Object.entries(initial ?? {}));

  return {
    getSetting(key) {
      return values.get(key) ?? null;
    },
    setSetting(key, value) {
      values.set(key, value);
    },
  };
}

describe('studioSettingsStore', () => {
  it('returns editable Studio Settings defaults when no persisted value exists', () => {
    const settings = readEditableStudioSettings(createMemoryStorage());

    expect(settings.defaultProviderId).toBe('codex');
    expect(settings.defaultOutputMode).toBe('studio_library');
    expect(settings.updatedAt).toBe(null);
  });

  it('persists sanitized editable settings under one stable key', () => {
    const storage = createMemoryStorage();

    const settings = updateEditableStudioSettings(
      storage,
      {
        defaultProviderId: 'fal',
        apiKey: 'must-not-persist',
        providerDefaults: {
          fal: {
            providerId: 'fal',
            model: 'fal-ai/nano-banana/edit',
            token: 'must-not-persist',
          },
        },
      },
      '2026-05-25T00:00:00.000Z',
    );

    const raw = storage.getSetting(EDITABLE_STUDIO_SETTINGS_KEY);

    expect(settings.defaultProviderId).toBe('fal');
    expect(raw).toContain('fal-ai/nano-banana/edit');
    expect(raw).not.toContain('must-not-persist');
  });

  it('falls back to defaults when the stored payload is corrupt', () => {
    const storage = createMemoryStorage({
      [EDITABLE_STUDIO_SETTINGS_KEY]: '{broken-json',
    });

    expect(readEditableStudioSettings(storage).defaultProviderId).toBe('codex');
  });
});
