import type { StudioSystemOverlaysProps } from '../components/overlays/types';

export type SettingsSurfaceModule = StudioSystemOverlaysProps['settingsModule'];

export interface BuildSettingsSurfaceModuleArgs {
  close: SettingsSurfaceModule['close'];
  open: SettingsSurfaceModule['open'];
  settingsDomain: SettingsSurfaceModule['settingsDomain'];
  providerDomain: SettingsSurfaceModule['providerDomain'];
  outputSourcesDomain: SettingsSurfaceModule['outputSourcesDomain'];
  maintenanceDomain: SettingsSurfaceModule['maintenanceDomain'];
  libraryDir: string | null;
  fallbackLibraryDir?: string | null;
  onResetStudio: SettingsSurfaceModule['onResetStudio'];
  isResettingStudio: boolean;
}

export function shouldHydrateSettingsSurface(isOpen: boolean) {
  return isOpen;
}

export function buildSettingsSurfaceModule({
  close,
  open,
  settingsDomain,
  providerDomain,
  outputSourcesDomain,
  maintenanceDomain,
  libraryDir,
  fallbackLibraryDir = null,
  onResetStudio,
  isResettingStudio,
}: BuildSettingsSurfaceModuleArgs): SettingsSurfaceModule {
  return {
    close,
    open,
    settingsDomain,
    providerDomain,
    outputSourcesDomain,
    maintenanceDomain,
    libraryDir: libraryDir ?? fallbackLibraryDir ?? null,
    onResetStudio,
    isResettingStudio,
  };
}
