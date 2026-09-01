export const STUDIO_SETTINGS_DOMAIN_TABS = [
  { id: 'providers', label: 'Providers' },
  { id: 'library', label: 'Library' },
  { id: 'output', label: 'Output' },
  { id: 'maintenance', label: 'Maintenance' },
] as const;

export type StudioSettingsDomainId = (typeof STUDIO_SETTINGS_DOMAIN_TABS)[number]['id'];
