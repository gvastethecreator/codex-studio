export const STUDIO_SETTINGS_DOMAIN_TABS = [
  { id: 'general', label: 'General' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'providers', label: 'Providers & accounts' },
  { id: 'library', label: 'Library & imports' },
  { id: 'output', label: 'Output' },
  { id: 'extensions', label: 'Extensions' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'help', label: 'Help' },
] as const;

export type StudioSettingsDomainId = (typeof STUDIO_SETTINGS_DOMAIN_TABS)[number]['id'];
