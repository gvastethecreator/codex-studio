/** @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { createDefaultEditableStudioSettings } from '../packages/shared/src';
import { useStudioSettings } from './useStudioSettings';

const api = vi.hoisted(() => ({
  settings: vi.fn(),
  update: vi.fn(),
  capabilities: vi.fn(),
  preflight: vi.fn(),
  sources: vi.fn(),
}));
vi.mock('../services/studio-api/settings', () => ({
  getEditableStudioSettings: api.settings,
  updateEditableStudioSettings: api.update,
}));
vi.mock('../services/studio-api/providers', () => ({
  getGenerationProviderCapabilities: api.capabilities,
  getGenerationProviderRuntimePreflight: api.preflight,
  invalidateGenerationProviderReads: vi.fn(),
}));
vi.mock('../services/studio-api/outputSources', () => ({
  getExternalOutputSources: api.sources,
  importExternalOutputSourceFiles: vi.fn(),
  listExternalOutputSourceFiles: vi.fn(),
  registerExternalOutputSource: vi.fn(),
}));
vi.mock('../services/studioEventSource', () => ({
  createStudioEventStream: () => ({ onAuthUpdated: () => () => {}, close: () => {} }),
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it('keeps loaded settings and confirms a saved PATCH when provider diagnostics fail', async () => {
  const settings = createDefaultEditableStudioSettings();
  api.settings.mockResolvedValue(settings);
  api.capabilities.mockResolvedValue({ providers: [] });
  api.preflight.mockRejectedValue(new Error('Diagnostic offline'));
  api.sources.mockResolvedValue({ registry: { sources: [] }, candidates: [] });
  const saved = { ...settings, commandCenterCompactMode: true };
  api.update.mockResolvedValue(saved);
  const addToast = vi.fn();
  const { result } = renderHook(() => useStudioSettings({ addToast }));
  await waitFor(() => expect(result.current.data.settingsDomain.isLoading).toBe(false));
  expect(result.current.data.settingsDomain.settings).toEqual(settings);
  expect(result.current.data.settingsDomain.error).toContain('Diagnostic offline');
  await act(async () => {
    await result.current.data.settingsDomain.update({ commandCenterCompactMode: true });
  });
  expect(result.current.data.settingsDomain.settings).toEqual(saved);
  expect(addToast).toHaveBeenCalledWith('Studio Settings saved', 'success');
  expect(addToast).not.toHaveBeenCalledWith(expect.anything(), 'error');
});

it('does not let an older settings read replace a confirmed save', async () => {
  const settings = createDefaultEditableStudioSettings();
  let resolveOld!: (value: typeof settings) => void;
  api.settings.mockImplementation(
    () =>
      new Promise((done) => {
        resolveOld = done;
      }),
  );
  api.capabilities.mockResolvedValue({ providers: [] });
  api.preflight.mockResolvedValue({ providers: [] });
  api.sources.mockResolvedValue({ registry: { sources: [] }, candidates: [] });
  const saved = { ...settings, commandCenterCompactMode: true };
  api.update.mockResolvedValue(saved);
  const { result } = renderHook(() => useStudioSettings());
  await act(async () => {
    await result.current.data.settingsDomain.update({ commandCenterCompactMode: true });
  });
  await act(async () => {
    resolveOld(settings);
  });
  expect(result.current.data.settingsDomain.settings).toEqual(saved);
});
