export const STUDIO_SETTINGS_DOMAIN_TABS = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'providers', label: 'Providers & accounts' },
  { id: 'library', label: 'Library & imports' },
  { id: 'output', label: 'Output' },
  { id: 'maintenance', label: 'Maintenance' },
] as const;

export type StudioSettingsDomainId = (typeof STUDIO_SETTINGS_DOMAIN_TABS)[number]['id'];
