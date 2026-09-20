export interface StudioRuntimeCapabilities {
  desktopBridge: boolean;
  localBackend: boolean;
  localCodexSession: boolean;
}

export interface StudioRuntimeInfo {
  kind: 'desktop' | 'web';
  label: string;
  apiBase: string;
  isDesktop: boolean;
  platform: string | null;
  capabilities: StudioRuntimeCapabilities;
}

export interface StudioRuntimeSources {
  desktopBridge?: Window['codexStudio'];
  envApiBase?: string;
  pageOrigin?: string;
  productionUi?: boolean;
  fallbackApiBase?: string;
}

const DEMO_RUNTIME: StudioRuntimeInfo = {
  kind: 'web',
  label: 'Review demo (no local backend)',
  apiBase: '',
  isDesktop: false,
  platform: null,
  capabilities: {
    desktopBridge: false,
    localBackend: false,
    localCodexSession: false,
  },
};

export function resolveStudioRuntime(): StudioRuntimeInfo {
  return DEMO_RUNTIME;
}

export function resolveStudioApiBase() {
  return '';
}
