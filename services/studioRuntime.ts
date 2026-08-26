/**
 * Studio Runtime Info — detects whether the frontend runs inside the desktop bridge
 * or a standalone web browser, and resolves the local backend API base URL.
 *
 * This service is a STATIC CONFIG ADAPTER. It does not manage state, sessions,
 * onboarding, readiness, or any runtime lifecycle. It answers "where is the backend?"
 *
 * @file services/studioRuntime.ts
 *
 * DO NOT confuse with hooks/useStudioRuntime.ts, which is a REACT ORCHESTRATOR
 * that wires readiness, diagnostics, onboarding, session verification, storage
 * recovery, and local studio sync into a single consumer API for the UI shell.
 */
const DEFAULT_STUDIO_API_BASE = 'http://127.0.0.1:17223';

function normalizeStudioLoopback(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === 'localhost') {
      url.hostname = '127.0.0.1';
    }
    return url.toString();
  } catch {
    return value;
  }
}

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

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function resolveLoopbackHttpOrigin(value: string | undefined) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (
      url.hostname !== 'localhost' &&
      url.hostname !== '127.0.0.1' &&
      url.hostname !== '[::1]' &&
      url.hostname !== '::1'
    ) {
      return null;
    }
    return trimTrailingSlash(normalizeStudioLoopback(url.origin));
  } catch {
    return null;
  }
}

function resolveApiBase({
  desktopBridge,
  envApiBase,
  pageOrigin,
  productionUi = false,
  fallbackApiBase = DEFAULT_STUDIO_API_BASE,
}: StudioRuntimeSources = {}) {
  const desktopBase = desktopBridge?.apiBase?.trim();
  if (desktopBase) {
    return trimTrailingSlash(normalizeStudioLoopback(desktopBase));
  }

  const envBase = envApiBase?.trim();
  if (envBase) {
    return trimTrailingSlash(normalizeStudioLoopback(envBase));
  }

  if (productionUi) {
    const sameOrigin = resolveLoopbackHttpOrigin(pageOrigin);
    if (sameOrigin) return sameOrigin;
  }

  return trimTrailingSlash(normalizeStudioLoopback(fallbackApiBase));
}

export function resolveStudioRuntimeFromSources({
  desktopBridge,
  envApiBase,
  pageOrigin,
  productionUi = false,
  fallbackApiBase = DEFAULT_STUDIO_API_BASE,
}: StudioRuntimeSources = {}): StudioRuntimeInfo {
  const apiBase = resolveApiBase({
    desktopBridge,
    envApiBase,
    pageOrigin,
    productionUi,
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
    pageOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
    productionUi: import.meta.env.PROD,
  });
}

export function resolveStudioApiBase() {
  return resolveStudioRuntime().apiBase;
}

function isDesktopStudioRuntime() {
  return resolveStudioRuntime().isDesktop;
}
