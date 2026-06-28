import { useEffect, useMemo } from 'react';

import {
  buildSettingsSurfaceModule,
  shouldHydrateSettingsSurface,
  type BuildSettingsSurfaceModuleArgs,
  type SettingsSurfaceModule,
} from '../lib/settingsSurface';

export interface UseSettingsSurfaceArgs extends BuildSettingsSurfaceModuleArgs {
  isOpen: boolean;
}

export function useSettingsSurface({
  isOpen,
  close,
  settingsDomain,
  providerDomain,
  outputSourcesDomain,
  maintenanceDomain,
  libraryDir,
  fallbackLibraryDir,
  onResetStudio,
  isResettingStudio,
}: UseSettingsSurfaceArgs): SettingsSurfaceModule {
  useEffect(() => {
    if (!shouldHydrateSettingsSurface(isOpen)) return;
    void settingsDomain.refresh();
  }, [isOpen, settingsDomain]);

  return useMemo(
    () =>
      buildSettingsSurfaceModule({
        close,
        settingsDomain,
        providerDomain,
        outputSourcesDomain,
        maintenanceDomain,
        libraryDir,
        fallbackLibraryDir,
        onResetStudio,
        isResettingStudio,
      }),
    [
      close,
      fallbackLibraryDir,
      isResettingStudio,
      libraryDir,
      maintenanceDomain,
      onResetStudio,
      outputSourcesDomain,
      providerDomain,
      settingsDomain,
    ],
  );
}
