import { describe, expect, it } from 'vite-plus/test';
import { createDefaultEditableStudioSettings } from '../../../packages/shared/src';
import { createSettingsRoutes } from './settingsRoutes';
import {
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

describe('settingsRoutes', () => {
  it('returns editable Studio Settings through the route seam', async () => {
    const storage = createMemoryStorage();
    const routes = createSettingsRoutes({
      readSettings: () => readEditableStudioSettings(storage),
      updateSettings: (patch) => updateEditableStudioSettings(storage, patch),
    });

    const response = await routes.request('/');
    expect(response.status).toBe(200);

    const payload = (await response.json()) as ReturnType<
      typeof createDefaultEditableStudioSettings
    >;
    expect(payload.defaultProviderId).toBe('codex');
    expect(payload.defaultOutputMode).toBe('studio_library');
  });

  it('updates editable settings and keeps the new value for subsequent reads', async () => {
    const storage = createMemoryStorage();
    const routes = createSettingsRoutes({
      readSettings: () => readEditableStudioSettings(storage),
      updateSettings: (patch) => updateEditableStudioSettings(storage, patch),
    });

    const patchResponse = await routes.request('/', {
      method: 'PATCH',
      body: JSON.stringify({ commandCenterCompactMode: true }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(patchResponse.status).toBe(200);
    const patched = (await patchResponse.json()) as { commandCenterCompactMode: boolean };
    expect(patched.commandCenterCompactMode).toBe(true);

    const readBack = await routes.request('/');
    const readBackPayload = (await readBack.json()) as { commandCenterCompactMode: boolean };
    expect(readBackPayload.commandCenterCompactMode).toBe(true);
  });

  it('returns 400 for malformed JSON or non-object payload', async () => {
    const storage = createMemoryStorage();
    const routes = createSettingsRoutes({
      readSettings: () => readEditableStudioSettings(storage),
      updateSettings: (patch) => updateEditableStudioSettings(storage, patch),
    });

    const malformed = await routes.request('/', {
      method: 'PATCH',
      body: '{"commandCenterCompactMode":true',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(malformed.status).toBe(400);
    await expect(malformed.json()).resolves.toMatchObject({ code: 'invalid_json' });

    const invalidShape = await routes.request('/', {
      method: 'PATCH',
      body: JSON.stringify(['not', 'an', 'object']),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(invalidShape.status).toBe(400);
    await expect(invalidShape.json()).resolves.toMatchObject({ code: 'invalid_request_body' });
  });
});
