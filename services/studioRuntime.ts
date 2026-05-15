const DEFAULT_STUDIO_API_BASE = 'http://localhost:4317';

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
  fallbackApiBase?: string;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function resolveApiBase({
  desktopBridge,
  envApiBase,
  fallbackApiBase = DEFAULT_STUDIO_API_BASE,
}: StudioRuntimeSources = {}) {
  const desktopBase = desktopBridge?.apiBase?.trim();
  const envBase = envApiBase?.trim();
  return trimTrailingSlash(desktopBase || envBase || fallbackApiBase);
}

export function resolveStudioRuntimeFromSources({
  desktopBridge,
  envApiBase,
  fallbackApiBase = DEFAULT_STUDIO_API_BASE,
}: StudioRuntimeSources = {}): StudioRuntimeInfo {
  const apiBase = resolveApiBase({
    desktopBridge,
    envApiBase,
    fallbackApiBase,
  });
  const isDesktop = desktopBridge?.desktop === true;

  if (isDesktop) {
    return {
      kind: 'desktop',
      label: 'Desktop runtime',
      apiBase,
      isDesktop: true,
      platform: desktopBridge?.platform ?? null,
      capabilities: {
        desktopBridge: true,
        localBackend: true,
        localCodexSession: true,
      },
    };
  }

  return {
    kind: 'web',
    label: 'Web runtime',
    apiBase,
    isDesktop: false,
    platform: null,
    capabilities: {
      desktopBridge: false,
      localBackend: true,
      localCodexSession: true,
    },
  };
}

export function resolveStudioRuntime(): StudioRuntimeInfo {
  return resolveStudioRuntimeFromSources({
    desktopBridge: typeof window !== 'undefined' ? window.codexStudio : undefined,
    envApiBase: import.meta.env.VITE_STUDIO_API_BASE,
  });
}

export function resolveStudioApiBase() {
  return resolveStudioRuntime().apiBase;
}

export function isDesktopStudioRuntime() {
  return resolveStudioRuntime().isDesktop;
}
