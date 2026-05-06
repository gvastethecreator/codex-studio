const DEFAULT_STUDIO_API_BASE = 'http://localhost:4317';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function resolveStudioApiBase() {
  const desktopBase = typeof window !== 'undefined' ? window.codexStudio?.apiBase : undefined;
  const envBase = import.meta.env.VITE_STUDIO_API_BASE;
  const nextBase = desktopBase || envBase || DEFAULT_STUDIO_API_BASE;
  return trimTrailingSlash(nextBase);
}

export function isDesktopStudioRuntime() {
  return typeof window !== 'undefined' && window.codexStudio?.desktop === true;
}