import { describe, expect, it } from 'vite-plus/test';

import { buildSettingsSurfaceModule, shouldHydrateSettingsSurface } from './settingsSurface';

const noop = () => {};
const noopAsync = async () => {};

function createSettingsSurfaceArgs() {
  return {
    close: noop,
    settingsDomain: {
      settings: null,
      error: null,
      isLoading: false,
      isSaving: false,
      refresh: noopAsync,
      update: noopAsync,
    },
    providerDomain: {
      capabilities: null,
      runtimePreflight: null,
    },
    outputSourcesDomain: {
      outputSources: null,
      outputSourceFiles: {},
      isLoadingOutputSources: false,
      loadingOutputSourceFiles: {},
      isRegisteringOutputSource: false,
      importingOutputSources: {},
      registerOutputSource: noopAsync,
      loadOutputSourceFiles: noopAsync,
      importOutputSourceFiles: noopAsync,
    },
    maintenanceDomain: {
      audit: null,
      compactResult: null,
      thumbnailBackfillResult: null,
      toolingLogsPruneResult: null,
      isLoadingAudit: false,
      runningAction: null,
      refreshAudit: noopAsync,
      compactStorage: noopAsync,
      backfillThumbnails: noopAsync,
      pruneToolingLogs: noopAsync,
    },
    libraryDir: null,
    fallbackLibraryDir: 'D:/Studio Library',
    onResetStudio: noopAsync,
    isResettingStudio: false,
  };
}

describe('settingsSurface', () => {
  it('owns open-time hydration intent', () => {
    expect(shouldHydrateSettingsSurface(false)).toBe(false);
    expect(shouldHydrateSettingsSurface(true)).toBe(true);
  });

  it('materializes the settings overlay module with library fallback', () => {
    const args = createSettingsSurfaceArgs();
    const module = buildSettingsSurfaceModule(args);

    expect(module.libraryDir).toBe('D:/Studio Library');
    expect(module.settingsDomain).toBe(args.settingsDomain);
    expect(module.providerDomain).toBe(args.providerDomain);
    expect(module.outputSourcesDomain).toBe(args.outputSourcesDomain);
    expect(module.maintenanceDomain).toBe(args.maintenanceDomain);
  });
});
